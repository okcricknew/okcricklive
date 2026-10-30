import React, { useState, useEffect, useRef } from "react";
import styles from "./Stats.module.css";

const BowlerStats = ({ match, showBatsmanStats, onShow, onHide }) => {
  const bowler =
    match?.bowlingStats && match?.bowler && match.bowlingStats[match.bowler]
      ? match.bowlingStats[match.bowler]
      : {};

  const [visible, setVisible] = useState(false);

  const prevBowlerRef = useRef(null);
  const prevOverRef = useRef(null);
  const timerRef = useRef(null);

  const onShowRef = useRef(onShow);
  const onHideRef = useRef(onHide);
  const previousVisibleRef = useRef(false);

  // Always keep the latest callbacks without retriggering visibility effects.
  useEffect(() => {
    onShowRef.current = onShow;
    onHideRef.current = onHide;
  }, [onShow, onHide]);

  // Notify the parent only when visibility actually changes.
  useEffect(() => {
    if (previousVisibleRef.current === visible) return;

    previousVisibleRef.current = visible;

    if (visible) {
      onShowRef.current?.();
    } else {
      onHideRef.current?.();
    }
  }, [visible]);

  // Coordinate bowler stats with batsman stats.
  useEffect(() => {
    if (!match?.bowler) return;

    // First load: don't show an automatic stats panel.
    if (prevBowlerRef.current === null) {
      prevBowlerRef.current = match.bowler;
      prevOverRef.current = match.currentOver;
      return;
    }

    // Batsman stats get priority. Hide bowler stats and cancel its timer.
    if (showBatsmanStats) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      prevBowlerRef.current = match.bowler;
      prevOverRef.current = match.currentOver;

      setVisible(false);
      return;
    }

    const bowlerChanged = match.bowler !== prevBowlerRef.current;
    const overChanged = match.currentOver !== prevOverRef.current;

    if (bowlerChanged || overChanged) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setVisible(true);

      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setVisible(false);
      }, 8000);
    }

    prevBowlerRef.current = match.bowler;
    prevOverRef.current = match.currentOver;
  }, [match?.bowler, match?.currentOver, showBatsmanStats]);

  // Cleanup all pending timers.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const playerName = match?.bowler || "Unknown";
  const tournamentName = match?.tournamentName || "LIVE MATCH";

  const overs = bowler.overs || 0;
  const wickets = bowler.wickets || 0;
  const runs = bowler.runs || 0;
  const maidens = bowler.maidens || 0;
  const dotBalls = bowler.dotBalls || 0;

  const economy =
    Number(bowler.overs || 0) > 0
      ? (Number(bowler.runs || 0) / Number(bowler.overs)).toFixed(1)
      : "0.0";

  return (
    <div
      className={`${styles.overlayContainer} ${
        visible && !showBatsmanStats ? styles.show : styles.hide
      }`}
    >
      <div className={styles.purpleBaseFrame}></div>
      <div className={styles.whiteBaseFrame}></div>

      <div className={styles.playerHeaderBar}>
        <div className={styles.flagBox}></div>

        <div className={styles.playerInfoText}>
          <span className={styles.pName}>{playerName}</span>
          <span className={styles.tName}>{tournamentName}</span>
        </div>

        <div className={styles.iccLogoSpace}>🌍</div>
      </div>

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
  
