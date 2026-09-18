"use client"

import { useState, useEffect } from "react"
import styles from "./matchIntro.module.css"
import { useOverlay } from "../../core/OverlayProvider"

export default function MatchIntro() {
  const match = useOverlay()

  if (!match) return null

  // Switch between Toss Result or Tournament Name
  const [infoIndex, setInfoIndex] = useState(0)

const infoList = []

// Toss (sirf jab completed ho)
if (match.tossCompleted && match.tossWinner) {
  infoList.push(
    `${match.tossWinner} WON THE TOSS & ELECTED TO ${match.tossDecision || match.tossChoice || "BAT"}`
  )
}

// Tournament
if (match.tournamentName) {
  infoList.push(match.tournamentName.toUpperCase())
}

// Match Type
if (match.matchType) {
  infoList.push(match.matchType.toUpperCase())
}

// Overs
if (match.overs) {
  infoList.push(`${match.overs} OVERS MATCH`)
}

// Match Number
if (match.matchNo) {
  infoList.push(`MATCH ${match.matchNo}`)
}

// Rotation
useEffect(() => {
  if (infoList.length <= 1) return

  const interval = setInterval(() => {
    setInfoIndex(prev => (prev + 1) % infoList.length)
  }, 5000)

  return () => clearInterval(interval)
}, [infoList.length])

const bottomMessage = infoList[infoIndex] || ""

  return (
    <div className={styles.container}>
      <div className={styles.broadcastContainer}>
        
        {/* TOP: TEAM SECTION */}
        <div className={styles.teamsBar}>
          <div className={styles.teamName}>{match.teamA}</div>
          <div className={styles.vsCircle}>VS</div>
          <div className={styles.teamName}>{match.teamB}</div>
        </div>

        {/* BOTTOM: TOSS/INFO SECTION */}
        <div className={styles.infoBar}>
  <div className={styles.statusWrapper}>
    <div key={bottomMessage} className={styles.statusText}>
      {bottomMessage}
    </div>
  </div>
</div>

      </div>
    </div>
  )
                                            }
