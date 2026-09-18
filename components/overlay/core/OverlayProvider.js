import { createContext, useContext, useEffect, useState } from "react"
import { doc, onSnapshot, collection, query, where } from "firebase/firestore"
import { db } from "../../../lib/firebase"

const OverlayContext = createContext()

export function OverlayProvider({ children, tId, matchId }) {
  const [match, setMatch] = useState(null)

  useEffect(() => {
    if (!tId) return;

    let unsub;

    // ✅ CASE 1: Specific matchId (Direct link)
    if (matchId && matchId !== "undefined" && matchId !== "null") {
      const refDoc = doc(db, "tournaments", tId, "matches", matchId)
      unsub = onSnapshot(refDoc, (snap) => {
        if (snap.exists()) {
          setMatch({ id: snap.id, ...snap.data() })
        } else {
          setMatch(null)
        }
      }, (error) => console.error("Firebase Doc Error:", error));
    } 
    // ✅ CASE 2: Automatic "Active" match (OBS/Overlay link)
    else {
      const q = query(
        collection(db, "tournaments", tId, "matches"),
        where("isOverlayActive", "in", [true, "true"])
      );

      unsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          // Sabse pehla active match uthao
          const activeMatchDoc = snapshot.docs[0];
          setMatch({ id: activeMatchDoc.id, ...activeMatchDoc.data() });
          console.log("Match Data Connected! ✅");
        } else {
          console.log("No Active Match Found in DB ❌");
          setMatch(null); 
        }
      }, (error) => console.error("Firebase Query Error:", error));
    }

    return () => {
      if (unsub) unsub();
    };
  }, [tId, matchId])

  return (
    <OverlayContext.Provider value={match}>
    
      {children}
    </OverlayContext.Provider>
  )
}

export function useOverlay(){
  return useContext(OverlayContext)
}
