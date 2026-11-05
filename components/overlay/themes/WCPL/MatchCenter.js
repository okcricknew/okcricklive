import { useOverlay } from "../../core/OverlayProvider";
import styles from "./WCPL.module.css";

export default function MatchCenter() {
  const match = useOverlay();
  if (!match) return null;

  const runs = match.totalRuns || 0;
  const wickets = match.totalWickets || 0;
  const over = Number(match.currentOver || 0);
  const balls = Number(match.ballsInOver || 0);
  const displayOver = balls === 6 ? `${over + 1}.0` : `${over}.${balls}`;
  const batting = String(match.battingTeam || "").toUpperCase().slice(0, 3);
  const bowling = String(
    match.bowlingTeam || (match.battingTeam === match.teamA ? match.teamB : match.teamA) || ""
  ).toUpperCase().slice(0, 3);

  return (
    <div className={styles.centerPanel}>
      <img className={styles.centerArt} src="/themes/WCPL/match-center.webp" alt="" decoding="async" fetchPriority="high" />
      <div className={styles.score}>{runs}-{wickets}</div>
      <div className={styles.teams}>{bowling} <span>v</span> {batting}</div>
      <div className={styles.overs}>OV {displayOver}</div>
    </div>
  );
}
