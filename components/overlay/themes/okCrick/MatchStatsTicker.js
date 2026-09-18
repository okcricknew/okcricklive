"use client"

import { useEffect, useState, useMemo } from "react"
import { useOverlay } from "../../core/OverlayProvider"
import styles from "./cwc.module.css"
import { motion } from "framer-motion"

export default function MatchStatsTicker() {
  const match = useOverlay()
  const [index, setIndex] = useState(0)

  if (!match) return null

  const tournamentName = match.tournamentName || match.tournament || "Unknown Tournament"
  const location = match.location || ""
  const matchType = match.matchType || match.type || match.stage || ""
  const matchNumber = match.matchNumber || match.matchNo || match.gameNumber || ""

  const innings = Number(match.innings || 1)
  const totalRuns = Number(match.totalRuns || 0)
  const currentOver = Number(match.currentOver || 0)
  const ballsInOver = Number(match.ballsInOver || 0)
  const totalBalls = (currentOver * 6) + ballsInOver
  const totalOvers = Number(match.overs || 0)

  const runRate = totalBalls > 0 ? ((totalRuns / totalBalls) * 6).toFixed(2) : "0.00"
  const projectedScore = totalBalls > 0 ? Math.round((totalRuns / totalBalls) * (totalOvers * 6)) : 0

  const extras =
    (match.extras?.innings1?.wd || 0) +
    (match.extras?.innings1?.nb || 0) +
    (match.extras?.innings1?.byes || 0) +
    (match.extras?.innings2?.legByes || 0) +
    (match.extras?.innings2?.wd || 0) +
    (match.extras?.innings2?.nb || 0) +
    (match.extras?.innings2?.byes || 0) +
    (match.extras?.innings2?.legByes || 0)

  const ballHistory = match.ballHistory || []

  let foursCount = 0
  let sixesCount = 0

  ballHistory.forEach(ball => {
    if (ball.type === "NORMAL" || (ball.type === "NB" && ball.subCategory === "From Bat")) {
      if (Number(ball.runs) === 4) foursCount++
      if (Number(ball.runs) === 6) sixesCount++
    }
  })

  const statsList = useMemo(() => {
    const list = []
    list.push(`${tournamentName}`)
    if (location) {
      list.push(`VENUE: ${location.toUpperCase()}`)
    }
    list.push("OKCRICK.IN")
    list.push(`MATCH NO: ${matchNumber}`)
    list.push(`MATCH: ${matchType}`)
    list.push(`RR: ${runRate}`)

    if (innings === 1) {
      list.push(`Projected: ${projectedScore}`)
    } else {
      const target = match.target || (Number(match.firstInningsScore || 0) + 1)
      const runsNeeded = target - totalRuns
      const ballsLeft = (totalOvers * 6) - totalBalls
      const rrr = ballsLeft > 0 ? ((runsNeeded / ballsLeft) * 6).toFixed(2) : "0.00"
      list.push(`REQ RR: ${rrr}`, `TARGET: ${target}`)
    }

    list.push(`Extras: ${extras}`, `THIS MATCH: ${foursCount} Fours • ${sixesCount} Sixs`)

    if (match.currentPartnership) {
      const pRuns = match.currentPartnership.runs || 0
      const pBalls = match.currentPartnership.balls || 0
      if (pRuns > 0 || pBalls > 0) list.push(`Partnership: ${pRuns}(${pBalls})`)
    }

    return list
  }, [innings, tournamentName, runRate, projectedScore, totalRuns, totalBalls, totalOvers, extras, foursCount, sixesCount, match, location, matchNumber, matchType])

  useEffect(() => {
    if (statsList.length === 0) return
    const timer = setTimeout(() => {
      setIndex(prev => (prev + 1) % statsList.length)
    }, 5500)
    return () => clearTimeout(timer)
  }, [index, statsList])

  const current = statsList[index]
  if (!current) return null

  return (
    <motion.div 
      className={styles.tickerContainer}
      initial={{ y: "200%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "200%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.2 }}
    >
      <div className={styles.partnershipStyle}>{current}</div>
    </motion.div>
  )
}
