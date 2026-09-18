"use client"

import styles from "./willow.module.css"
import { useOverlay } from "../../core/OverlayProvider"

export default function MatchCenter(){

  const match = useOverlay()

  if(!match) return null

  // Firestore se data fetch kar rahe hain
  const runs = match.totalRuns || 0
  const wickets = match.totalWickets || 0
  
  // In names ko neeche function mein use karenge
  const currentOver = Number(match.currentOver || 0)
  const ballsInOver = Number(match.ballsInOver || 0)
  const totalMatchOvers = match.overs || 0

  // Sahi logic: Agar 6 balls ho gayi toh next over dikhao, warna current
  const displayOver = () => {
    if (ballsInOver === 6) {
      return `${currentOver + 1}.0`;
    }
    return `${currentOver}.${ballsInOver}`;
  };

  return(
    <div className={styles.scoreCenter}>

      <div className={styles.scoreNumber}>
        {runs}/{wickets}
      </div>

      <div className={styles.overs}>
        {/* Function ko () ke saath call karein */}
        Ovs {displayOver()} ({totalMatchOvers})
      </div>

    </div>
  )
}
