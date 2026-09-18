"use client"

import styles from "./cwc.module.css"
import { useOverlay } from "../../core/OverlayProvider"
import { motion } from "framer-motion"

export default function MatchCenter() {
  const match = useOverlay()

  if (!match) return null

  const runs = match.totalRuns || 0
  const wickets = match.totalWickets || 0
  const currentOver = Number(match.currentOver || 0)
  const ballsInOver = Number(match.ballsInOver || 0)

  const battingTeam = (match.battingTeam || "").toUpperCase().substring(0, 3)
  const bowlingTeam = (match.bowlingTeam || (match.battingTeam === match.teamA ? match.teamB : match.teamA) || "").toUpperCase().substring(0, 3)

  const displayOver = () => {
    if (ballsInOver === 6) return `${currentOver + 1}.0`
    return `${currentOver}.${ballsInOver}`
  }

  return (
    <motion.div 
      className={styles.centerWrapper}
      initial={{ y: "150%", opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: "150%", opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 60, damping: 14, delay: 0.1 }}
    >
      {/* MAIN SCORE */}
      <div className={styles.layer}>
        <img src="/themes/OkCrick/main-score.png" className={styles.img} />
        <span className={`${styles.txtOvers} ${styles.totalOversStyle}`}>
          {displayOver()}
        </span>
        <span className={`${styles.txt} ${styles.teamVsStyle}`}>
          <span className={styles.bowlingTeamStyle}>{bowlingTeam}</span>
          <span className={styles.vsStyle}> v </span>
          <span className={styles.battingTeamStyle}>{battingTeam}</span>
        </span>
      </div>

      {/* OVERS BAR */}
      <div className={styles.layer}>
        <img src="/themes/OkCrick/overs-bar.png" className={styles.img} />
        <span className={`${styles.txtov} ${styles.oversStyle}`}>Ov</span>
      </div>

      {/* SCORE BAR */}
      <div className={styles.layer}>
        <img src="/themes/OkCrick/score-bar.png" className={styles.img} />
        <span className={`${styles.txt} ${styles.scoreStyle}`}>
          {runs}-{wickets}
        </span>
      </div>
    </motion.div>
  )
}
