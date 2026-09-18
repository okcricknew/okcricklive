"use client"

import styles from "./inningsBreak.module.css"

export default function InningsBreak({ match }) {

  // 🔥 SAFETY FALLBACKS
  if (!match) return null

  // ✅ REFINED LOGIC (EXTRA SAFE)
  const currentRuns = Number(match.totalRuns || 0);
  const totalWickets = Number(match.totalWickets || 0);
  const totalOversLimit = Number(match.overs || 0);
  const currentOver = Number(match.currentOver || 0);
  const ballsInOver = Number(match.ballsInOver || 0);

  // Condition 1: All Out (Standard 10 wickets)
  const isAllOut = totalWickets >= 10;

  // Condition 2: Overs Complete (Handles 19.6 and 20.0 cases)
  const isOversComplete = 
    currentOver >= totalOversLimit || 
    (currentOver === totalOversLimit - 1 && ballsInOver === 6);

  // Show only during 1st innings transition
  const showBreak = Number(match.innings) === 1 && (isAllOut || isOversComplete);

  if (!showBreak) return null

  // ✅ CALCULATIONS
  const target = currentRuns + 1;
  const totalBalls = totalOversLimit * 6;

  // 🔥 CHASING TEAM NAME LOGIC
  // Agar 1st innings break hai, toh chasing team hamesha 'bowlingTeam' hogi
  const chasingTeam = match.innings === 1 
    ? (match.bowlingTeam || (match.battingTeam === match.teamA ? match.teamB : match.teamA)) 
    : (match.battingTeam || "TBC");

  return (
    <div className={styles.overlayRoot}>
      <div className={styles.eliteBar}>

        {/* LEFT: TEAM */}
        <div className={styles.teamIdentity}>
          <div className={styles.label}>CHASING</div>
          <div className={styles.teamName}>
            {chasingTeam}
          </div>
        </div>

        {/* CENTER: NEED TEXT */}
        <div className={styles.chaseEquation}>
          <span className={styles.text}>NEED</span>

          <div className={styles.numberBox}>
            <div className={styles.bigNumber}>
              {target}
            </div>
            <div className={styles.subText}>RUNS</div>
          </div>

          <span className={styles.text}>FROM</span>

          <div className={styles.numberBox}>
            <div className={styles.bigNumber}>
              {totalBalls}
            </div>
            <div className={styles.subText}>BALLS</div>
          </div>

          <span className={styles.text}>TO WIN</span>
        </div>

        {/* RIGHT: TARGET */}
        <div className={styles.targetBox}>
          <div className={styles.targetLabel}>TARGET</div>
          <div className={styles.targetValue}>
            {target}
          </div>
        </div>

      </div>
    </div>
  )
}
