import { useOverlay } from "../../core/OverlayProvider";
import styles from "./WCPL.module.css";

const DEFAULT_LOGO = "/themes/WCPL/default-team.png";

export default function BattingPanel({ team }) {
  const match = useOverlay();
  if (!match) return null;

  const teamName = team || match.battingTeam || "";
  const norm = (value) => String(value || "").trim().toLowerCase();
  let logo = DEFAULT_LOGO;
  if (norm(teamName) && norm(teamName) === norm(match.teamA)) logo = match.teamALogoUrl || DEFAULT_LOGO;
  else if (norm(teamName) && norm(teamName) === norm(match.teamB)) logo = match.teamBLogoUrl || DEFAULT_LOGO;

  const stats = match.battingStats || {};
  const players = [match.striker, match.nonStriker].filter(Boolean);
  const orderedPlayers = [...new Set(players)];

  return (
    <div className={styles.battingPanel}>
      <img className={styles.battingArt} src="/themes/WCPL/batting-panel.webp" alt="" />
      <img className={styles.battingLogo} src={logo} alt="" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = "none"; }} />
      <div className={styles.battingTeam}>{teamName}</div>
      <div className={styles.batsmen}>
        {orderedPlayers.map((name) => {
          const data = stats[name] || {};
          return (
            <div className={styles.batsmanRow} key={name}>
              <span className={styles.strikerMark}>{match.striker === name ? "★" : ""}</span>
              <span className={styles.batsmanName}>{name}</span>
              <strong>{data.runs || 0}</strong>
              <span>({data.balls || 0})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
  }
