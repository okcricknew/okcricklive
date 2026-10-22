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

  return (
    <OverlayContext.Provider value={match}>
      {children}
    </OverlayContext.Provider>
  );
}

export function useOverlay() {
  return useContext(OverlayContext);
}
