"use client"

import { useState, useEffect } from "react"
import styles from "./cwc.module.css"
import { useOverlay } from "../../core/OverlayProvider"
import { motion } from "framer-motion"

export default function BattingPanel({ team }) {
  const match = useOverlay()
  
  const [slots, setSlots] = useState({
    player1: null,
    player2: null
  })

  const striker = match?.striker
  const nonStriker = match?.nonStriker
  const battingStats = match?.battingStats || {}

  useEffect(() => {
    if (!striker && !nonStriker) return;

    setSlots(prev => {
      let { player1, player2 } = { ...prev };
      const activePlayers = [striker, nonStriker].filter(Boolean);

      const p1StillPlaying = activePlayers.includes(player1);
      const p2StillPlaying = activePlayers.includes(player2);

      if (!p1StillPlaying) {
        player1 = activePlayers.find(p => p !== player2) || null;
      }

      if (!p2StillPlaying) {
        player2 = activePlayers.find(p => p !== player1) || null;
      }

      if (!player1 && striker) player1 = striker;
      if (!player2 && nonStriker && nonStriker !== player1) player2 = nonStriker;
      if (!player2 && striker && striker !== player1) player2 = striker;

      if (player1 !== prev.player1 || player2 !== prev.player2) {
        return { player1, player2 };
      }
      return prev;
    });
  }, [striker, nonStriker]);

  if (!match) return null;

  const batsmen = [
    {
      name: slots.player1 || "-",
      runs: battingStats[slots.player1]?.runs || 0,
      balls: battingStats[slots.player1]?.balls || 0,
      isStriker: striker === slots.player1
    },
    {
      name: slots.player2 || "-",
      runs: battingStats[slots.player2]?.runs || 0,
      balls: battingStats[slots.player2]?.balls || 0,
      isStriker: striker === slots.player2
    }
  ];

  return (
    <motion.div 
      className={styles.battingWrapper}
      initial={{ x: "-100%", y: "50%", opacity: 0, skewX: -10 }}
      animate={{ x: 0, y: 0, opacity: 1, skewX: 0 }}
      exit={{ x: "-100%", y: "50%", opacity: 0, skewX: -10 }}
      transition={{ type: "spring", stiffness: 50, damping: 15 }}
    >
      <div className={styles.pngLayerFix}>
        {/* TEAM BG */}
        <div className={styles.layer}>
          <img src="/themes/OkCrick/batting-team.png" className={`${styles.img} ${styles.teamBg}`} alt="" />
          <span className={`${styles.overlay} ${styles.teamText}`}>
            {team || match.battingTeam}
          </span>
        </div>

        {/* BATSMAN LAYER */}
        <div className={styles.layer}>
          <img src="/themes/OkCrick/batsman.png" className={`${styles.img} ${styles.batsman}`} alt="" />
          <div className={styles.playersContainer}>
            {batsmen.map((b, i) => (
              <div key={i} className={styles.playerRow}>
                <span className={`${styles.overlay} ${styles.striker}`}>
                  {b.isStriker ? "★" : ""}
                </span>
                <span className={`${styles.overlay} ${styles.playerName}`}>
                  {b.name}
                </span>
                <span className={`${styles.overlay} ${styles.playerRuns}`}>
                  {b.runs}
                </span>
                <span className={`${styles.overlay} ${styles.playerBalls}`}>
                  ({b.balls})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* STRIP */}
        <div className={styles.layer}>
          <img src="/themes/OkCrick/strip-left.png" className={`${styles.img} ${styles.stripLeft}`} alt="" />
        </div>
      </div>
    </motion.div>
  )
            }
