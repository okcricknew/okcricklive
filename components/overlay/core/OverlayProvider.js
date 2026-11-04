import { createContext, useContext, useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

const OverlayContext = createContext(null);

export function OverlayProvider({
  children,
  tId,
  matchId,
  initialMatch = null,
}) {
  // Server se mila match pehle render hoga.
  const [match, setMatch] = useState(initialMatch);
  const [teamColors, setTeamColors] = useState({ teamA: null, teamB: null });

  useEffect(() => {
    if (!tId) return;

    let unsub;

    // CASE 1: Specific match ID
    if (matchId && matchId !== "undefined" && matchId !== "null") {
      const refDoc = doc(
        db,
        "tournaments",
        tId,
        "matches",
        matchId
      );

      unsub = onSnapshot(
        refDoc,
        (snap) => {
          if (snap.exists()) {
            setMatch({
              id: snap.id,
              ...snap.data(),
            });
          } else {
            setMatch(null);
          }
        },
        (error) => {
          console.error("Firebase Doc Error:", error);
        }
      );
    } else {
      // CASE 2: Automatically find the active overlay match
      const q = query(
        collection(db, "tournaments", tId, "matches"),
        where("isOverlayActive", "in", [true, "true"])
      );

      unsub = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const activeMatchDoc = snapshot.docs[0];

            setMatch({
              id: activeMatchDoc.id,
              ...activeMatchDoc.data(),
            });

            console.log("Match Data Connected! ✅");
          } else {
            console.log("No Active Match Found in DB ❌");
            setMatch(null);
          }
        },
        (error) => {
          console.error("Firebase Query Error:", error);
        }
      );
    }

    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, [tId, matchId]);

  // Team colors are read from the existing team documents only.
  // No color fields are copied into or written to the match document.
  useEffect(() => {
    if (!tId || !match?.teamAId || !match?.teamBId) {
      setTeamColors({ teamA: null, teamB: null });
      return;
    }

    const readColor = (data) => {
      // Team documents normally store colorHex. Accept older supported formats
      // too, but never pass an invalid value through to CSS.
      const isValidHex = (value) =>
        typeof value === "string" && /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value.trim());
      const isValidRgb = (value) =>
        typeof value === "string" && /^rgba?\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i.test(value.trim()) &&
        [...value.matchAll(/\d+(?:\.\d+)?/g)].slice(0, 3).every((match) => Number(match[0]) <= 255);
      const candidates = [data?.colorHex, data?.teamColor, data?.color];
      for (const candidate of candidates) {
        if (isValidHex(candidate) || isValidRgb(candidate)) return candidate.trim();
      }

      const rgb = data?.color;
      if (rgb && [rgb.r, rgb.g, rgb.b].every((value) => Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 255)) {
        return `rgb(${Number(rgb.r)}, ${Number(rgb.g)}, ${Number(rgb.b)})`;
      }
      return null;
    };

    const teamARef = doc(db, "tournaments", tId, "teams", match.teamAId);
    const teamBRef = doc(db, "tournaments", tId, "teams", match.teamBId);
    const unsubA = onSnapshot(teamARef, (snap) => {
      setTeamColors((previous) => ({ ...previous, teamA: snap.exists() ? readColor(snap.data()) : null }));
    }, (error) => console.error("Team A color listener failed:", error));
    const unsubB = onSnapshot(teamBRef, (snap) => {
      setTeamColors((previous) => ({ ...previous, teamB: snap.exists() ? readColor(snap.data()) : null }));
    }, (error) => console.error("Team B color listener failed:", error));

    return () => { unsubA(); unsubB(); };
  }, [tId, match?.teamAId, match?.teamBId]);

  const matchWithTeamColors = match ? { ...match, teamColors } : match;

  return (
    <OverlayContext.Provider value={matchWithTeamColors}>
      {children}
    </OverlayContext.Provider>
  );
}

export function useOverlay() {
  return useContext(OverlayContext);
}
