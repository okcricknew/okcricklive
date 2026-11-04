import { createContext, useContext, useEffect, useMemo, useState } from "react";
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
  const [match, setMatch] = useState(initialMatch);
  const [teamDocs, setTeamDocs] = useState({
    teamAId: null,
    teamBId: null,
    teamA: null,
    teamB: null,
    loadedA: false,
    loadedB: false,
  });

  useEffect(() => {
    if (!tId) return;

    let unsub;

    if (matchId && matchId !== "undefined" && matchId !== "null") {
      const refDoc = doc(db, "tournaments", tId, "matches", matchId);

      unsub = onSnapshot(
        refDoc,
        (snap) => {
          setMatch(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        },
        (error) => console.error("Firebase Doc Error:", error)
      );
    } else {
      const q = query(
        collection(db, "tournaments", tId, "matches"),
        where("isOverlayActive", "in", [true, "true"])
      );

      unsub = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const activeMatchDoc = snapshot.docs[0];
            setMatch({ id: activeMatchDoc.id, ...activeMatchDoc.data() });
          } else {
            setMatch(null);
          }
        },
        (error) => console.error("Firebase Query Error:", error)
      );
    }

    return () => unsub?.();
  }, [tId, matchId]);

  // Read the existing team documents only. No color is copied into the match document.
  useEffect(() => {
    const teamAId = match?.teamAId || null;
    const teamBId = match?.teamBId || null;

    setTeamDocs({
      teamAId,
      teamBId,
      teamA: null,
      teamB: null,
      loadedA: !teamAId,
      loadedB: !teamBId,
    });

    if (!tId || (!teamAId && !teamBId)) return;

    const unsubscribers = [];

    const listenToTeam = (teamId, key, loadedKey) => {
      if (!teamId) return;

      const teamRef = doc(db, "tournaments", tId, "teams", teamId);
      const unsubscribe = onSnapshot(
        teamRef,
        (snap) => {
          setTeamDocs((previous) => {
            // Ignore late callbacks belonging to a previous match.
            if (previous.teamAId !== teamAId || previous.teamBId !== teamBId) {
              return previous;
            }
            return {
              ...previous,
              [key]: snap.exists() ? { id: snap.id, ...snap.data() } : null,
              [loadedKey]: true,
            };
          });
        },
        (error) => {
          console.error(`Firebase ${key} Error:`, error);
          setTeamDocs((previous) => {
            if (previous.teamAId !== teamAId || previous.teamBId !== teamBId) {
              return previous;
            }
            return { ...previous, [loadedKey]: true };
          });
        }
      );
      unsubscribers.push(unsubscribe);
    };

    listenToTeam(teamAId, "teamA", "loadedA");
    listenToTeam(teamBId, "teamB", "loadedB");

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [tId, match?.teamAId, match?.teamBId]);

  const contextValue = useMemo(() => {
    if (!match) return null;

    const docsMatchCurrentTeams =
      teamDocs.teamAId === (match.teamAId || null) &&
      teamDocs.teamBId === (match.teamBId || null);

    return {
      ...match,
      teamAColorDocument: docsMatchCurrentTeams ? teamDocs.teamA : null,
      teamBColorDocument: docsMatchCurrentTeams ? teamDocs.teamB : null,
      teamColorsReady: docsMatchCurrentTeams
        ? teamDocs.loadedA && teamDocs.loadedB
        : !(match.teamAId || match.teamBId),
    };
  }, [match, teamDocs]);

  return (
    <OverlayContext.Provider value={contextValue}>
      {children}
    </OverlayContext.Provider>
  );
}

export function useOverlay() {
  return useContext(OverlayContext);
}
