"use client"

import { useEffect, useState, useRef } from "react"
import { AnimatePresence } from "framer-motion"

import { useOverlay } from "../../core/OverlayProvider"
import MatchStatsTicker from "./MatchStatsTicker"
import EventOverlay from "./EventOverlay" // 👈 STEP 1: Import EventOverlay

// UI Components
import LowerThirdLayout from "./LowerThirdLayout"
import BattingPanel from "./BattingPanel"
import MatchCenter from "./MatchCenter"
import BowlingPanel from "./BowlingPanel"
import CwcMatchSummary from "./cwcMatchSummary"
import FirstInningsScorecard from "./firstInningsScorecard"
import FirstInningsBowling from "./firstInningsBowling"
import SecondInningsScorecard from "./secondInningsScorecard"
import SecondInningsBowling from "./secondInningsBowling"
import BowlerStats from "./BowlerStats"
import BatsmanStats from "./BatsmanStats"
import MatchIntroCwc from "./MatchIntroCwc"
import TossResultCwc from "./TossResultCwc"
import InningsBreakCwc from "./InningsBreakCwc"
import WinningResultCwc from "./WinningResultCwc"

// Firebase
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../../../../lib/firebase"

export default function MatchOverlay() {
  const match = useOverlay()
  const [showBowlerStats, setShowBowlerStats] = useState(false)
  const [showBatsmanStats, setShowBatsmanStats] = useState(false) 
  const [loaded, setLoaded] = useState(false)

  // Transparency handling
  useEffect(() => {
    const root = document.getElementById("__next") || document.body
    const forceTransparency = () => {
      if (!root) return
      root.style.background = "transparent"
    }
    forceTransparency()
    const interval = setInterval(forceTransparency, 1000)
    return () => clearInterval(interval)
  }, [])

  // Image Preloading
  useEffect(() => {
    const images = [
      "/themes/OkCrick/batting-team.png",
      "/themes/OkCrick/batsman.png",
      "/themes/OkCrick/strip-left.png",
      "/themes/OkCrick/main-score.png",
      "/themes/OkCrick/overs-bar.png",
      "/themes/OkCrick/score-bar.png",
      "/themes/OkCrick/bowling-team.png",
      "/themes/OkCrick/bowler.png",
      "/themes/OkCrick/strip-right.png",
      "/themes/OkCrick/main-event-bg.png",
      "/themes/OkCrick/event-left.png",
      "/themes/OkCrick/event-right.png"
    ]
    let loadedCount = 0
    images.forEach(src => {
      const img = new Image()
      const handleLoad = () => {
        loadedCount++
        if (loadedCount >= images.length) setLoaded(true)
      }
      img.onload = handleLoad
      img.onerror = handleLoad
      img.src = src
    })
  }, [])

  // AUTO MATCH SUMMARY LOGIC (Over complete hone par automated screen)
  useEffect(() => {
    if (!match) return
    const isOverComplete = Number(match.ballsInOver) === 6
    if (isOverComplete && match.overlayType === "main" && match.status !== "completed") {
      const ref = doc(db, "tournaments", match.tournamentId, "matches", match.id)
      updateDoc(ref, { overlayType: "matchSummary" })
    }
  }, [match?.ballsInOver])

  // Firebase overlays timers
  useEffect(() => {
    if (
      match?.overlayType === "matchSummary" || 
      match?.overlayType === "firstInningsScorecard" || 
      match?.overlayType === "firstInningsBowling" ||
      match?.overlayType === "secondInningsScorecard" || 
      match?.overlayType === "secondInningsBowling"      
    ) {
      const timer = setTimeout(() => {
        const ref = doc(db, "tournaments", match.tournamentId, "matches", match.id)
        updateDoc(ref, { overlayType: "main" })
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [match?.overlayType])

  if (!match || !loaded) return null

  const isPreMatch =
  Number(match.innings || 0) === 1 &&
  !match.striker &&
  !match.nonStriker &&
  !match.bowler &&
  !match.totalRuns &&
  !match.currentOver

  const hasSecondInningsData = Number(match.innings) === 2 || !!match.secondInningsStatsBackup;

  const hasTossData =
  match.tossCompleted &&
  match.tossWinner &&
  (match.tossDecision || match.tossChoice);

  const isAllOut = Number(match.totalWickets || 0) >= 10;

  const isOversComplete =
    Number(match.currentOver || 0) >= Number(match.overs || 0) ||
    (
      Number(match.currentOver || 0) === Number(match.overs || 0) - 1 &&
      Number(match.ballsInOver || 0) === 6
    );

  const isInningsBreak =
    Number(match.innings) === 1 &&
    (isAllOut || isOversComplete);

  const isMatchCompleted = match.status === "completed";

  if (match?.overlayType === "matchSummary") return <CwcMatchSummary match={match} />
  if (match?.overlayType === "firstInningsScorecard") return <FirstInningsScorecard match={match} />
  if (match?.overlayType === "firstInningsBowling") return <FirstInningsBowling match={match} />
  
  if (match?.overlayType === "secondInningsScorecard" && hasSecondInningsData) return <SecondInningsScorecard match={match} />
  if (match?.overlayType === "secondInningsBowling" && hasSecondInningsData) return <SecondInningsBowling match={match} />
  if (match?.overlayType === "tossResult" && hasTossData) return <TossResultCwc />

  if (isInningsBreak) return <InningsBreakCwc />
  if (isMatchCompleted) return <WinningResultCwc />

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "250px",
        background: "transparent",
        zIndex: 99999,
        pointerEvents: "none"
      }}
    >
      {/* 🟢 STEP 2: Render EventOverlay Component */}
      {/* Target event trigger ke samay ye overlay auto show aur hide ho jaayega */}
      <EventOverlay />

      {/* BatsmanStats aur BowlerStats direct render */}
      <BatsmanStats 
        match={match}
        onShow={() => setShowBatsmanStats(true)}
        onHide={() => setShowBatsmanStats(false)}
      />

      <BowlerStats 
        match={match} 
        showBatsmanStats={showBatsmanStats}
        onShow={() => setShowBowlerStats(true)}
        onHide={() => setShowBowlerStats(false)}
      />

      {/* AUTOMATIC MOVEMENT ZONE */}
      <AnimatePresence mode="wait">
        {showBowlerStats ? null : showBatsmanStats ? null : isPreMatch ? (
          <MatchIntroCwc />
        ) : (
          <LowerThirdLayout>
            <BattingPanel team={match?.battingTeam} />
            <MatchCenter />
            <MatchStatsTicker />
            <BowlingPanel team={match?.bowlingTeam} />
          </LowerThirdLayout>
        )}
      </AnimatePresence>
    </div>
  )
        }
