import React, { useState, useEffect, useRef } from "react";
import styles from "./bowlerStats.module.css";

// ✅ 1. parent se onShow aur onHide props receive karein
const BowlerStats = ({ match, onShow, onHide }) => {
  const bowler =
  (match?.bowlingStats && match?.bowler && match.bowlingStats[match.bowler]) 
  ? match.bowlingStats[match.bowler] 
  : {};

  // 🔥 INTERNAL CONTROL (auto show/hide)
  const [visible, setVisible] = useState(false);
  const prevBowlerRef = useRef(null);
  const prevOverRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!match?.bowler) return;

    // 👉 First load skip
    if (!prevBowlerRef.current) {
      prevBowlerRef.current = match.bowler;
      prevOverRef.current = match.currentOver;
      return;
    }

    // 🔥 CONDITION: new bowler OR new over
    if (
      match.bowler !== prevBowlerRef.current ||
      match.currentOver !== prevOverRef.current
    ) {
      setVisible(true);
      if (onShow) onShow(); // ✅ 2. Parent ko bolo ki scoreboard hide kare

      // clear old timer
      if (timerRef.current) clearTimeout(timerRef.current);

      // auto hide
      timerRef.current = setTimeout(() => {
        setVisible(false);
        if (onHide) onHide(); // ✅ 3. Parent ko bolo ki scoreboard wapas dikhaye
      }, 8000);
    }

    // update refs
    prevBowlerRef.current = match.bowler;
    prevOverRef.current = match.currentOver;

  }, [match?.bowler, match?.currentOver, onShow, onHide]); // ✅ dependency array me add kiya

  // 🔥 cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className={`${styles.container} ${visible ? styles.show : styles.hide}`}>
      
      {/* 🔥 Bowler Info */}
      <div className={styles.statsBar}>
        <div className={styles.nameSection}>
          {match?.bowler}
        </div>

        <div className={styles.dataSection}>
          <div className={styles.box}>O <span className={styles.val}>{bowler.overs || 0}</span></div>
          <div className={styles.box}>R <span className={styles.val}>{bowler.runs || 0}</span></div>
          <div className={styles.box}>W <span className={styles.val}>{bowler.wickets || 0}</span></div>

          <div className={`${styles.box} ${styles.econ}`}>
            ECO <span className={styles.val}>
              {bowler.overs > 0 ? (bowler.runs / bowler.overs).toFixed(1) : "0.0"}
            </span>
          </div>
        </div>
      </div>

      {/* 🔥 Score Bar */}
      <div className={styles.scoreBar}>
        <div className={styles.teamName}>
          {match.bowlingTeam?.substring(0, 3).toUpperCase()}
        </div>
        <div className={styles.liveScore}>
          {match.totalRuns}-{match.totalWickets}
        </div>
        <div className={styles.oversInfo}>
          {match.currentOver}.{match.ballsInOver} OV
        </div>
      </div>

    </div>
  );
};

export default BowlerStats;
          
