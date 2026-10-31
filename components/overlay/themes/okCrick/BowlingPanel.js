
"use client"

import OverBall from "../../shared/OverBall";
import styles from "./cwc.module.css";
import { useOverlay } from "../../core/OverlayProvider";
import { motion } from "framer-motion";

const BASE_PATH = "/themes/OkCrick";
const DEFAULT_TEAM_LOGO = `${BASE_PATH}/default-team.png`;

export default function BowlingPanel({ team: propsTeam }) {
  const match = useOverlay();

  if (!match) return null;

  const inningsNum = Number(match.innings || 1);
  const bowlerName = match.bowler || "Selecting...";
  const bowlingStats = match.bowlingStats || {};
  const bowlerData = bowlingStats[bowlerName] || {};

  const getBowlingTeamName = () => {
    if (propsTeam) return propsTeam;
    if (match.bowlingTeam) return match.bowlingTeam;

    const tA = match.teamA || "";
    const tB = match.teamB || "";
    const currentBatting = match.battingTeam || "";

    return currentBatting === tA ? tB : tA;
  };

  const bowlingTeamName = getBowlingTeamName();

  const normalizeTeamName = (name) =>
    String(name || "").trim().toLowerCase();

  let bowlingTeamLogo = DEFAULT_TEAM_LOGO;

  if (
    normalizeTeamName(bowlingTeamName) &&
    normalizeTeamName(bowlingTeamName) === normalizeTeamName(match.teamA)
  ) {
    bowlingTeamLogo = match.teamALogoUrl || DEFAULT_TEAM_LOGO;
  } else if (
    normalizeTeamName(bowlingTeamName) &&
    normalizeTeamName(bowlingTeamName) === normalizeTeamName(match.teamB)
  ) {
    bowlingTeamLogo = match.teamBLogoUrl || DEFAULT_TEAM_LOGO;
  }

  const bowlerBalls = (match.ballHistory || []).filter(
    b => b.bowler === bowlerName && Number(b.innings) === inningsNum
  );

  const legalBalls = bowlerBalls.filter(b => !['WD', 'NB'].includes(b.type));
  const overPart = Math.floor(legalBalls.length / 6);
  const ballPart = legalBalls.length % 6;

  const wickets = bowlerData.wickets || 0;
  const runs = bowlerData.runs || 0;
  const overs = `${overPart}.${ballPart}`;

  const currentOverBalls = (match.ballHistory || [])
    .filter(b => b.over === (match.currentOver || 0) && Number(b.innings) === inningsNum);

  const balls = [];
  let legalCount = 0;

  currentOverBalls.forEach((b) => {
    if (!b) return;
    if (b.type === "OUT") { balls.push("W"); legalCount++; }
    else if (b.type === "WD") { balls.push(`${b.runs ?? 1}\nWD`); }
    else if (b.type === "NB") { balls.push(`${b.runs ?? 1}\nNB`); }
    else if (b.type === "LB") { balls.push(`${b.runs ?? 1}\nLB`); legalCount++; }
    else if (b.type === "BYE") { balls.push(`${b.runs ?? 1}\nB`); legalCount++; }
    else { balls.push(b.runs === 0 ? "•" : b.runs); legalCount++; }
  });

  for (let i = legalCount; i < 6; i++) { balls.push(""); }
  const displayBalls = balls.slice(-8);

  return (
    <motion.div
      className={styles.bowlingWrapper}
      initial={{ x: "100%", y: "50%", opacity: 0, skewX: 10 }}
      animate={{ x: 0, y: 0, opacity: 1, skewX: 0 }}
      exit={{ x: "100%", y: "50%", opacity: 0, skewX: 10 }}
      transition={{ type: "spring", stiffness: 50, damping: 15 }}
    >
      <div className={styles.pngLayerFix}>
        {/* TEAM BG + TEAM LOGO */}
        <div className={styles.layer}>
          <img
            src={`${BASE_PATH}/bowling-team.png`}
            className={`${styles.img} ${styles.teamBgRight}`}
            alt=""
          />

          <img
            src={bowlingTeamLogo}
            className={styles.teamLogoRight}
            alt={`${bowlingTeamName || "Bowling team"} logo`}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_TEAM_LOGO;
            }}
          />
        </div>

        {/* BOWLER */}
        <div className={styles.layer}>
          <img
            src={`${BASE_PATH}/bowler.png`}
            className={`${styles.img} ${styles.bowlerImg}`}
            alt=""
          />

          <span className={`${styles.overlay} ${styles.bowlerName}`}>
            {bowlerName}
          </span>

          <span className={`${styles.overlay} ${styles.bowlerStats}`}>
            <span className={styles.wicketRuns}>{wickets}-{runs}</span>
            <span className={styles.bowlerOvers}>({overs})</span>
          </span>
        </div>

        {/* BALLS */}
        <div className={styles.layer}>
          <div className={styles.BallHistory}>
            {displayBalls.map((b, i) => (
              <OverBall key={i} value={b} styles={styles} />
            ))}
          </div>
        </div>

        {/* STRIP */}
        <div className={styles.layer}>
          <img
            src={`${BASE_PATH}/strip-right.png`}
            className={`${styles.img} ${styles.stripRight}`}
            alt=""
          />
        </div>
      </div>
    </motion.div>
  );
}
