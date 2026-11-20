import { useOverlay } from "../../core/OverlayProvider";
import styles from "./WCPL.module.css";
import MatchEventAnimation from "./MatchEventAnimation";

export default function MatchCenter({
  eventActive,
  onEventActiveChange,
}) {
  const match = useOverlay();

  if (!match) return null;

  const runs = Number(match.totalRuns || 0);
  const wickets = Number(match.totalWickets || 0);

  const over = Number(match.currentOver || 0);
  const balls = Number(match.ballsInOver || 0);

  const displayOver =
    balls === 6
      ? `${over + 1}.0`
      : `${over}.${balls}`;

  const batting = String(
    match.battingTeam || ""
  ).toUpperCase().slice(0, 3);

  const bowling = String(
    match.bowlingTeam ||
      (
        match.battingTeam === match.teamA
          ? match.teamB
          : match.teamA
      ) ||
      ""
  ).toUpperCase().slice(0, 3);

  return (
    <div className={styles.centerPanel}>
      <div
        className={styles.centerArt}
        aria-hidden="true"
      />

      <MatchEventAnimation
        onActiveChange={onEventActiveChange}
      />

      <div
        className={styles.centerInfo}
        style={{
          opacity: eventActive ? 0 : 1,
          visibility: eventActive ? "hidden" : "visible",
          pointerEvents: "none",
        }}
      >
        <div className={styles.teams}>
          <span className={styles.battingTeamName}>
            {batting}
          </span>

          <span className={styles.vs}>
            v
          </span>

          <span className={styles.bowlingTeamName}>
            {bowling}
          </span>
        </div>

        <div className={styles.score}>
          {runs}-{wickets}
        </div>

        <div className={styles.overs}>
          {displayOver} OVERS
        </div>
      </div>
    </div>
  );
}
