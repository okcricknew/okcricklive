"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import styles from "./willow.module.css"
import { useOverlay } from "../../core/OverlayProvider"

export default function MatchStats() {
  const match = useOverlay()
  const [index, setIndex] = useState(0)
  const [showEvent, setShowEvent] = useState(null)
  const lastBallRef = useRef(null)

  // ✅ BALL EVENT LOGIC FIXED FOR FIRST BALL
  useEffect(() => {
    const ballHistory = match?.ballHistory || []
    if (ballHistory.length === 0) return

    const lastBall = ballHistory[ballHistory.length - 1]
    // Unique ID for last ball
    const ballId = `${lastBall.over}-${lastBall.ball}-${lastBall.runs}-${lastBall.type}-${!!lastBall.wicketInfo}-${ballHistory.length}`;

    if (!lastBallRef.current) {
  lastBallRef.current = ballId
  return
    }

    // Agar new ball aaya hai (first ball bhi chalega)
    if (lastBallRef.current !== ballId) {
      lastBallRef.current = ballId

      let eventType = null
      if (lastBall.type === 'OUT' || lastBall.wicketInfo) {
        eventType = "WICKET"
      } else if (lastBall.type === "NB") {
        eventType = "FREE HIT"
      } else if (lastBall.type === "NORMAL") {
        if (Number(lastBall.runs) === 4) eventType = "FOUR"
        if (Number(lastBall.runs) === 6) eventType = "SIX"
      }

      if (eventType) {
        setShowEvent(eventType)
        // Event 4.5 seconds ke liye dikhe
        setTimeout(() => setShowEvent(null), 4500)
      }
    }
  }, [match?.ballHistory])

  if (!match) return null

  const innings = Number(match.innings || 1)
  const totalRuns = Number(match.totalRuns || 0)
  const currentOver = Number(match.currentOver || 0)
  const ballsInOver = Number(match.ballsInOver || 0)
  const totalBalls = (currentOver * 6) + ballsInOver
  const totalOvers = Number(match.overs || 0)

  // 🔥 CALCULATIONS
  const runRate = totalBalls > 0 ? ((totalRuns / totalBalls) * 6).toFixed(2) : "0.00"
  const projectedScore = totalBalls > 0 ? Math.round((totalRuns / totalBalls) * (totalOvers * 6)) : 0

  const extras = (match.extras?.innings1?.wd || 0) + (match.extras?.innings1?.nb || 0) + (match.extras?.innings1?.byes || 0) + (match.extras?.innings1?.legByes || 0) + (match.extras?.innings2?.wd || 0) + (match.extras?.innings2?.nb || 0) + (match.extras?.innings2?.byes || 0) + (match.extras?.innings2?.legByes || 0)

  let foursCount = 0; let sixesCount = 0
  match.ballHistory?.forEach(ball => {
    if (ball.type === "NORMAL" || (ball.type === "NB" && ball.subCategory === "From Bat")) {
      if (Number(ball.runs) === 4) foursCount++
      if (Number(ball.runs) === 6) sixesCount++
    }
  })

  // ✅ DYNAMIC STATS LIST LOGIC
  const statsList = useMemo(() => {
    const list = []

    if (innings === 1 && currentOver < 5 && match.tossWinner) {

  const decisionRaw =
    match.tossDecision ||
    match.tossChoice ||
    "BAT";

  const decision = decisionRaw.toString().toUpperCase();

  list.push({
    label: "Toss",
    value: `${match.tossWinner?.toUpperCase()} WON & ELECTED TO ${decision}`
  });
    }

    if (match.tournamentName) list.push({ label: "Tournament", value: match.tournamentName?.toUpperCase() });
    list.push({ label: "Scoring From", value: "OKCRICK.IN" })
    if (match.matchNo) list.push({ label: "Match", value: `MATCH ${match.matchNo}` })
    if (match.matchType) list.push({ label: "Match Type", value: match.matchType.toUpperCase() })
    list.push({ label: "Run Rate", value: runRate })

    if (innings === 1) {
      list.push({ label: "Projected", value: projectedScore })
    } else {
      const target = (match.target || (Number(match.firstInningsScore || 0) + 1))
      const runsNeeded = target - totalRuns
      const ballsLeft = (totalOvers * 6) - totalBalls
      const rrr = ballsLeft > 0 ? ((runsNeeded / ballsLeft) * 6).toFixed(2) : "0.00"
      list.push({ label: "Req. Rate", value: rrr })
      list.push({ label: "Target", value: target })
    }

    list.push({ label: "Extras", value: extras })
    list.push({ label: "Boundaries", value: `${foursCount} FOURS • ${sixesCount} SIXES` })

    if (match.currentPartnership) {
      const pRuns = match.currentPartnership.runs || 0
      const pBalls = match.currentPartnership.balls || 0
      if (pBalls > 0 || pRuns > 0) list.push({ label: "Partnership", value: `${pRuns} RUNS • ${pBalls} BALLS` })
    }

    if (innings === 2) {
      const target = (match.target || (Number(match.firstInningsScore || 0) + 1))
      const runsNeeded = target - totalRuns
      const ballsLeft = (totalOvers * 6) - totalBalls
      const runsNeededValue = `${runsNeeded} RUNS FROM ${ballsLeft} BALLS`
      list.push({ label: "Required", value: runsNeededValue, team: match.battingTeam || "TEAM" })
    }

    return list
  }, [match, runRate, projectedScore, extras, foursCount, sixesCount, innings, currentOver, totalBalls, totalOvers, totalRuns])

  // ✅ STABLE ROTATION
  useEffect(() => {
    if (showEvent || statsList.length === 0) return;
    const currentLabel = statsList[index]?.label;
    const delay =
      currentLabel === "Required" ? 10000
      : currentLabel === "Scoring From" ? 8000
      : 3500;

    const timeout = setTimeout(() => {
      setIndex(prev => (prev + 1) % statsList.length)
    }, delay)
    return () => clearTimeout(timeout)
  }, [index, statsList.length, showEvent])

  const currentStat = statsList[index] || statsList[0]
  if (!currentStat) return null;

  const isLongText = currentStat.value.toString().length > 18;
  const eventColorClass = showEvent ? styles[showEvent.toLowerCase().replace(" ", "")] : "";

  return (
    <div className={`${styles.statsContainer} ${showEvent ? styles.activeEvent : ""}`}>
      {showEvent && (
        <div className={`${styles.eventOverlay} ${eventColorClass}`}>
          <div className={styles.ghostText}>{showEvent}</div>
          <div className={styles.mainEventText}>{showEvent}</div>
        </div>
      )}

      {!showEvent && (
        currentStat.label === "Required" ? (
          <div className={styles.requiredStatBox}>
            <span className={styles.requiredLabel}>{currentStat.team} NEED</span>
            <div key={index} className={styles.slideWrapper}>
              <span className={`${styles.requiredValue} ${styles.marquee}`}>
                {currentStat.value}
              </span>
            </div>
          </div>
        ) : (
          <div className={styles.statBox}>
            <span className={styles.statLabel}>{currentStat.label}</span>
            <div key={index} className={styles.slideWrapper}>
              <span className={`${styles.statValue} ${isLongText ? styles.marquee : styles.slideAnim}`}>
                {currentStat.value}
              </span>
            </div>
          </div>
        )
      )}
    </div>
  )
}
