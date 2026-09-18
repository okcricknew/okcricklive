import React, { useState, useEffect, useRef } from "react";
import styles from "./Stats.module.css";

const BowlerStats = ({ match, showBatsmanStats, onShow, onHide }) => {
  
  const bowler =
    match?.bowlingStats && match?.bowler && match.bowlingStats[match.bowler]
      ? match.bowlingStats[match.bowler]
      : {};

  // 🔥 INTERNAL CONTROL (auto show/hide) - (Unchanged)
  const [visible, setVisible] = useState(false);
  const prevBowlerRef = useRef(null);
  const prevOverRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      onShow && onShow();
    } else {
      onHide && onHide();
    }
  }, [visible, onShow, onHide]);

  useEffect(() => {
    if (!match?.bowler) return;

    // 👉 First load skip
    if (!prevBowlerRef.current) {
      prevBowlerRef.current = match.bowler;
      prevOverRef.current = match.currentOver;
      return;
    }

        // 🔥 Agar batsman stats chal raha hai, toh bowler stats ko trigger mat hone do
    if (showBatsmanStats) {
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

      // clear old timer
      if (timerRef.current) clearTimeout(timerRef.current);

      // auto hide
      timerRef.current = setTimeout(() => {
        setVisible(false);
      }, 8000);
    }

    // update refs
    prevBowlerRef.current = match.bowler;
    prevOverRef.current = match.currentOver;
    }, [match?.bowler, match?.currentOver, showBatsmanStats]);
  

  // 🔥 cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // 🛠️ Mapping data for the new UI from your existing match/bowler objects
  const playerName = match?.bowler || "Unknown";
  const tournamentName = match?.tournamentName || "LIVE MATCH"; // Agar data me na mile toh fallback lagaya hai
  const overs = bowler.overs || 0;
  const wickets = bowler.wickets || 0;
  const runs = bowler.runs || 0;
  const maidens = bowler.maidens || 0;
  const dotBalls = bowler.dotBalls || 0;
  const economy = bowler.overs > 0 ? (bowler.runs / bowler.overs).toFixed(1) : "0.0";

  // 🚀 New Integrated UI Return
  return (
    <div
      className={`${styles.overlayContainer} ${
        visible ? styles.show : styles.hide
      }`}
    >
      <div className={styles.purpleBaseFrame}></div>
      <div className={styles.whiteBaseFrame}></div>

      {/* Top White Bar Elements */}
      <div className={styles.playerHeaderBar}>
        <div className={styles.flagBox}></div>
        <div className={styles.playerInfoText}>
          <span className={styles.pName}>{playerName}</span>
          <span className={styles.tName}>{tournamentName}</span>
        </div>
        <div className={styles.iccLogoSpace}>🌍</div>
      </div>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <div className={styles.label}>OVERS</div>
          <div className={styles.value}>{overs}</div>
        </div>

        <div className={styles.stat}>
          <div className={styles.label}>WICKETS</div>
          <div className={styles.hexagon}>{wickets}</div>
        </div>

        <div className={styles.stat}>
          <div className={styles.label}>RUNS</div>
          <div className={styles.value}>{runs}</div>
        </div>

        <div className={styles.stat}>
          <div className={styles.label}>ECONOMY</div>
          <div className={styles.pinkBadge}>{economy}</div>
        </div>

        <div className={styles.stat}>
          <div className={styles.label}>MAIDENS</div>
          <div className={styles.value}>{maidens}</div>
        </div>

        <div className={styles.stat}>
          <div className={styles.label}>DOT BALLS</div>
          <div className={styles.value}>{dotBalls}</div>
        </div>
      </div>

      {/* Side Decorative Dots */}
      <div className={`${styles.dotsWrapper} ${styles.left}`}>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
      </div>

      <div className={`${styles.dotsWrapper} ${styles.right}`}>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
      </div>
    </div>
  );
};

export default BowlerStats;
        
