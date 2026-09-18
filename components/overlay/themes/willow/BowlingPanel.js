"use client"

import OverBall from "../../shared/OverBall";
import styles from "./willow.module.css";
import { useOverlay } from "../../core/OverlayProvider";

export default function BowlingPanel({ team: propsTeam }) {
  const match = useOverlay();
  if (!match) return null;

  // 1. DATA EXTRACT
  const inningsNum = Number(match.innings || 1);
  const bowlerName = match.bowler || "Selecting...";
  const bowlingStats = match.bowlingStats || {};
  const bowlerData = bowlingStats[bowlerName] || {};

  // ✅ FIXED BOWLING TEAM LOGIC (ULTRA SAFE)
  const getBowlingTeamName = () => {
    // 1. Prop override (manual control)
    if (propsTeam) return propsTeam;

    // 2. DB value (BEST & MOST ACCURATE)
    if (match.bowlingTeam) return match.bowlingTeam;

    // 3. Safe fallback (works for both innings)
    const tA = match.teamA || "";
    const tB = match.teamB || "";
    const currentBatting = match.battingTeam || "";

    if (!tA || !tB) return "";

    return currentBatting === tA ? tB : tA;
  };

  // 3. OVERS & BALLS CALCULATION
  const bowlerBalls = (match.ballHistory || []).filter(b =>
    b.bowler === bowlerName && Number(b.innings) === inningsNum
  );

  const legalBalls = bowlerBalls.filter(b => !['WD', 'NB'].includes(b.type));
  const overPart = Math.floor(legalBalls.length / 6);
  const ballPart = legalBalls.length % 6;

  const bowlerStatsStr = `${bowlerData.wickets || 0}-${bowlerData.runs || 0} (${overPart}.${ballPart})`;

  // CURRENT OVER BALLS
  const balls = (match.ballHistory || [])
    .filter(b => b.over === (match.currentOver || 0) && Number(b.innings) === inningsNum)
    .slice(-6)
    .map((b) => {
      if (!b) return "";

      if (b.type === "OUT") return "W";

      if (b.type === "WD") {
  const runs = b.runs ?? 1;
  const subCat = (b.subCategory || "").toUpperCase();

  // 🔴 WICKET on WIDE
  if (!!b.wicketInfo || b.isWicket || subCat.includes("WICKET") || subCat.includes("OUT") || subCat.includes("RUN")) {
  return `W\nWD${runs}`;
}
        

  // 🟢 NORMAL WIDE
  return `${runs}\nWD`;
      }

      if (b.type === "NB") {
  const runs = b.runs ?? 1;
  const subCat = (b.subCategory || "").toUpperCase();

  // 🔴 WICKET on NO BALL
 if (!!b.wicketInfo || b.isWicket || subCat.includes("WICKET") || subCat.includes("OUT") || subCat.includes("RUN")) {
  return `W\nNB${runs}`;
 }
        

  // 🟡 LEG BYE
  if (subCat === "LEG BYE" || subCat === "LB") {
    return `${runs}\nNB+L`;
  }

  // ⚪ BYE
  if (subCat === "BYE" || subCat === "B") {
    return `${runs}\nNB+B`;
  }

  // 🟢 NORMAL NB (runs like 1,2,4,6)
  return `${runs}\nNB`;
      }

      if (b.type === "LB") return `L${b.runs || 0}`;
      if (b.type === "BYE") return `B${b.runs || 0}`;

      return b.runs === 0 ? "•" : b.runs;
    });

  return (
    <>
    <div className={styles.bowlingWrapper}>
      <div className={styles.bowlingPanel}>
        <div className={styles.bowlerInfo}>
          <span className={styles.bowlerName}>{bowlerName}</span>
          <span className={styles.bowlerStats}>{bowlerStatsStr}</span>
        </div>

        <div className={styles.overBalls}>
          {balls.map((b, i) => (
            <OverBall key={i} value={b} 
            styles={styles} />
          ))}
        </div>
      </div>

          <div className={styles.teamName}>
  {(getBowlingTeamName() || "")
    .split(" ")
    .map((word, i) => (
      <div key={i}>{word}</div>
    ))}
</div>
  </div>
  </>
  );
    }
