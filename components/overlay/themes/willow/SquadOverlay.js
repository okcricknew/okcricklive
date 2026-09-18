"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import styles from "./squadOverlay.module.css";

export default function SquadOverlay({ tId, teamId, teamName = "TEAM", onClose }) {
  const [players, setPlayers] = useState([]);
  const [hide, setHide] = useState(false);
  const [isReady, setIsReady] = useState(false); // New state to track if data is loaded

  useEffect(() => {
    if (!tId || !teamId) return;
    const q = query(collection(db, "tournaments", tId, "teams", teamId, "players"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPlayers(data);
      if (data.length > 0) setIsReady(true); // Data aane par ready mark karo
    });
    return () => unsub();
  }, [tId, teamId]);

  useEffect(() => {
    // Timer tabhi chalega jab players ready honge
    if (!isReady) return;

    const timer = setTimeout(() => {
      setHide(true);
      setTimeout(() => { onClose && onClose(); }, 700);
    }, 12000); // Ab ye pure 8 seconds dikhega list dikhne ke baad

    return () => clearTimeout(timer);
  }, [isReady, onClose]); // isReady par depend karta hai

  const isTwoColumn = players.length > 10;

  if (!isReady) return null; // Jab tak data nahi, tab tak kuch mat dikhao

  return (
    <div className={styles.overlay}>
      <div className={`${styles.container} ${hide ? styles.hide : ""} ${isTwoColumn ? styles.wide : ""}`}>
        <div className={styles.header}>{teamName} - SQUAD'S</div>

        <div className={styles.tableHeader}>
          <span>Player Name</span>
          <span>No.</span>
          {isTwoColumn && (
            <>
              <span>Player Name</span>
              <span>No.</span>
            </>
          )}
        </div>

        <div className={`${styles.playerList} ${isTwoColumn ? styles.grid2 : ""}`}>
          {players.map((p, i) => (
            <div 
              key={p.id} 
              className={styles.row}
              style={{ animationDelay: `${0.2 + (i * 0.05)}s` }} // Delay thoda kam kiya starting ka
            >
              <span className={styles.name}>{p.name}</span>
              <span className={styles.sr}>{i + 1}</span>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <span>OFFICIAL SQUAD</span>
          <span>{players.length} PLAYERS</span>
        </div>
      </div>
    </div>
  );
}
