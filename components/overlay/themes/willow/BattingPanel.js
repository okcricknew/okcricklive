"use client"

import { useRef, useEffect } from "react"
import PlayerRow from "../../shared/PlayerRow"
import styles from "./willow.module.css"
import { useOverlay } from "../../core/OverlayProvider"

// ✅ Bat Icon
const BatIcon = ({ size = 12, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M21 2l-1-1-6 6-2 2-9 9v3h3l9-9 2-2 6-6zM5 19l10-10 1 1-10 10H5v-1z"/>
  </svg>
)

export default function BattingPanel({ team }){

  const match = useOverlay()
  if(!match) return null

  const striker = match.striker
  const nonStriker = match.nonStriker
  const battingStats = match.battingStats || {}

  // ✅ LOCK SYSTEM (NO SWAP EVER)
  const lockedPlayersRef = useRef({
    player1: null,
    player2: null
  })

  // ✅ INITIAL LOCK
  if (!lockedPlayersRef.current.player1 && striker) {
    lockedPlayersRef.current.player1 = striker
  }

  if (!lockedPlayersRef.current.player2 && nonStriker) {
    lockedPlayersRef.current.player2 = nonStriker
  }

  // ✅ AUTO RESET ON WICKET / NEW BATSMAN
  useEffect(() => {
    const p1 = lockedPlayersRef.current.player1
    const p2 = lockedPlayersRef.current.player2

    // Agar koi player replace ho gaya hai → reset lock
    if (
      (p1 && ![striker, nonStriker].includes(p1)) ||
      (p2 && ![striker, nonStriker].includes(p2))
    ) {
      lockedPlayersRef.current.player1 = striker || null
      lockedPlayersRef.current.player2 = nonStriker || null
    }
  }, [striker, nonStriker])

  const player1 = lockedPlayersRef.current.player1
  const player2 = lockedPlayersRef.current.player2

  // ✅ FINAL UI DATA (FIXED SLOTS)
  const batsmen = [
    {
      name: player1 || "-",
      runs: battingStats[player1]?.runs || 0,
      balls: battingStats[player1]?.balls || 0,
      isStriker: striker === player1
    },
    {
      name: player2 || "-",
      runs: battingStats[player2]?.runs || 0,
      balls: battingStats[player2]?.balls || 0,
      isStriker: striker === player2
    }
  ]

  return(
    <div className={styles.battingPanel}>
      
      {/* Team Name */}
      <div className={styles.teamName}>
  {(team || match.battingTeam)
    ?.split(" ")
    .map((word, i) => (
      <div key={i}>{word}</div>
    ))}
</div>

      {/* Players */}
      <div className={styles.playersContainer}>
        {batsmen.map((b, index) => (
          
          <div key={index} className="relative">

            {/* ✅ Indicator moves only */}
            {b.isStriker && b.name !== "-" && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 pointer-events-none">
                <BatIcon size={12} className="text-green-500" />
              </div>
            )}

            <PlayerRow
              name={b.name}
              runs={b.runs}
              balls={b.balls}
styles={styles}
            />

          </div>

        ))}
      </div>

    </div>
  )
}
