import { useOverlay } from "../../core/OverlayProvider";
import OverBall from "../../shared/OverBall";
import styles from "./WCPL.module.css";

const DEFAULT_LOGO = "/themes/WCPL/default-team.png";
const DEFAULT_BOWLING_COLOR = "#16A34A";

export default function BowlingPanel({ team }) {
  const match = useOverlay();
  if (!match) return null;

  const teamName = team || match.bowlingTeam || "";
  const norm = (value) => String(value || "").trim().toLowerCase();
  let logo = DEFAULT_LOGO;
  if (norm(teamName) && norm(teamName) === norm(match.teamA)) logo = match.teamALogoUrl || DEFAULT_LOGO;
  else if (norm(teamName) && norm(teamName) === norm(match.teamB)) logo = match.teamBLogoUrl || DEFAULT_LOGO;

  const teamColor = norm(teamName) === norm(match.teamA)
    ? match.teamColors?.teamA
    : norm(teamName) === norm(match.teamB)
      ? match.teamColors?.teamB
      : null;

  const bowlerName = match.bowler || "Selecting...";
  const bowler = (match.bowlingStats || {})[bowlerName] || {};
  const innings = Number(match.innings || 1);
  const bowlerBalls = (match.ballHistory || []).filter(
    (ball) => ball.bowler === bowlerName && Number(ball.innings) === innings && !["WD", "NB"].includes(ball.type)
  );
  const overs = `${Math.floor(bowlerBalls.length / 6)}.${bowlerBalls.length % 6}`;

  const overBalls = (match.ballHistory || []).filter(
    (ball) => ball.over === (match.currentOver || 0) && Number(ball.innings) === innings
  );
  const display = [];
  let legal = 0;
  overBalls.forEach((ball) => {
    if (!ball) return;
    if (ball.type === "OUT") { display.push("W"); legal++; }
    else if (ball.type === "WD") display.push(`${ball.runs ?? 1}\nWD`);
    else if (ball.type === "NB") display.push(`${ball.runs ?? 1}\nNB`);
    else if (ball.type === "LB") { display.push(`${ball.runs ?? 1}\nLB`); legal++; }
    else if (ball.type === "BYE") { display.push(`${ball.runs ?? 1}\nB`); legal++; }
    else { display.push(ball.runs === 0 ? "•" : String(ball.runs)); legal++; }
  });
  for (let i = legal; i < 6; i++) display.push("");

  const ballStyles = {
    ball: styles.ball, wicket: styles.wicket, four: styles.four, six: styles.six,
    wide: styles.extraBall, noBall: styles.extraBall, lb: styles.extraBall, bye: styles.extraBall,
  };

  return (
    <div className={styles.bowlingPanel}>
      <div className={styles.bowlingArt} style={{ backgroundColor: teamColor || DEFAULT_BOWLING_COLOR }} aria-hidden="true" />
      <img className={styles.bowlingLogo} src={logo} alt="" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = "none"; }} />
      <div className={styles.bowlingTeam}>{teamName}</div>
      <div className={styles.bowlerInfo}>
        <strong>{bowlerName}</strong>
        <span>{bowler.wickets || 0}-{bowler.runs || 0} ({overs})</span>
      </div>
      <div className={styles.ballHistory}>
        {display.slice(-8).map((value, index) => <OverBall key={index} value={value} styles={ballStyles} />)}
      </div>
    </div>
  );
}
