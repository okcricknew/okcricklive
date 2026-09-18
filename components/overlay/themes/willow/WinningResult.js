"use client"

import styles from "./winningResult.module.css"
import { useOverlay } from "../../core/OverlayProvider"

export default function WinningResult() {
  const match = useOverlay()

  // ❌ Agar match complete nahi hai toh kuch nahi dikhana
  if (!match || match.status !== "completed") return null

  const winner = match.winner || ""
  const result = match.resultSummary || ""

  return (
    <div className={styles.overlayRoot}>
      <div className={styles.eliteBar}>
        
        {/* LEFT: WINNER */}
        <div className={styles.teamIdentity}>
          <div className={styles.label}>WINNER</div>
          <div className={styles.teamName}>{winner}</div>
        </div>

        {/* CENTER: RESULT */}
        <div className={styles.chaseEquation}>
          <div className={styles.numberBox}>
            <div className={styles.bigNumber}>
  {result.toUpperCase()}
</div>
          </div>
        </div>

        {/* RIGHT: TARGET / SCORE */}
        <div className={styles.targetBox}>
          <div className={styles.targetLabel}>FINAL SCORE</div>
          <div className={styles.targetValue}>
            {match.totalRuns}/{match.totalWickets}
          </div>
        </div>

      </div>
    </div>
  )
          }
