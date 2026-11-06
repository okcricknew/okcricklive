import { useOverlay } from "../../core/OverlayProvider";
import { getTeamPanelColor, getReadableTextColor } from "./teamColor";
import styles from "./WCPL.module.css";

const DEFAULT_LOGO = "/themes/OkCrick/default-team.png";
const DEFAULT_BATTING_COLOR = "#2563EB";

export default function BattingPanel({ team }) {
  const match = useOverlay();

  if (!match || !match.teamColorsReady) return null;

  const teamName = team || match.battingTeam || "";
  const norm = (value) => String(value || "").trim().toLowerCase();
  const battingIsTeamA = norm(teamName) === norm(match.teamA);
  const battingIsTeamB = norm(teamName) === norm(match.teamB);
  const teamDocument = battingIsTeamA
    ? match.teamAColorDocument
    : battingIsTeamB
      ? match.teamBColorDocument
      : null;
  const panelColor = getTeamPanelColor(teamDocument, DEFAULT_BATTING_COLOR);
  const textColor = getReadableTextColor(panelColor);

  let logo = DEFAULT_LOGO;
  if (battingIsTeamA) logo = match.teamALogoUrl || teamDocument?.logoUrl || DEFAULT_LOGO;
  else if (battingIsTeamB) logo = match.teamBLogoUrl || teamDocument?.logoUrl || DEFAULT_LOGO;

  const stats = match.battingStats || {};
  const players = [match.striker, match.nonStriker].filter(Boolean);
  const orderedPlayers = [...new Set(players)];

  return (
    <div className={styles.battingPanel} style={{ color: textColor }}>
      <img className={styles.artworkSource} src="/themes/WCPL/batting-panel.webp" alt="" aria-hidden="true" width="3264" height="1836" loading="eager" fetchPriority="high" decoding="async" />
      <div
        className={styles.battingArt}
        style={{ backgroundColor: panelColor }}
        aria-hidden="true"
      />
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
