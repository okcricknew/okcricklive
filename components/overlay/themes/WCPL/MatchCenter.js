import { useEffect, useRef, useState } from "react";
import { useOverlay } from "../../core/OverlayProvider";
import styles from "./WCPL.module.css";

export default function MatchCenter() {
  const match = useOverlay();
  const wickets = Number(match?.totalWickets || 0);
  const previousWickets = useRef(Number(wickets));
  const [showWicketFlash, setShowWicketFlash] = useState(false);

  useEffect(() => {
    const currentWickets = Number(wickets);
    if (currentWickets > previousWickets.current) {
      setShowWicketFlash(true);
      const timeoutId = window.setTimeout(() => setShowWicketFlash(false), 550);
      previousWickets.current = currentWickets;
      return () => window.clearTimeout(timeoutId);
    }
    previousWickets.current = currentWickets;
  }, [wickets]);

  if (!match) return null;

  const runs = match.totalRuns || 0;
  const over = Number(match.currentOver || 0);
  const balls = Number(match.ballsInOver || 0);
  const displayOver = balls === 6 ? `${over + 1}.0` : `${over}.${balls}`;
  const batting = String(match.battingTeam || "").toUpperCase().slice(0, 3);
  const bowling = String(
    match.bowlingTeam || (match.battingTeam === match.teamA ? match.teamB : match.teamA) || ""
  ).toUpperCase().slice(0, 3);

  return (
    <div className={styles.centerPanel}>
      <img className={styles.centerArt} src="/themes/WCPL/match-center.webp" alt="" width="3264" height="1836" loading="eager" decoding="async" fetchPriority="high" />
      <div className={styles.score} key={`${runs}-${wickets}`}>{runs}-{wickets}</div>
      {showWicketFlash && <div className={styles.wicketFlash} key={wickets} aria-hidden="true" />}
      <div className={styles.teams}>{bowling} <span>v</span> {batting}</div>
      <div className={styles.overs}>OV {displayOver}</div>
    </div>
  );
}
