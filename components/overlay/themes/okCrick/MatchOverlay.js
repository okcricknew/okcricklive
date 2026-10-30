"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";

import { useOverlay } from "../../core/OverlayProvider";
import MatchStatsTicker from "./MatchStatsTicker";
import EventOverlay from "./EventOverlay";

import LowerThirdLayout from "./LowerThirdLayout";
import BattingPanel from "./BattingPanel";
import MatchCenter from "./MatchCenter";
import BowlingPanel from "./BowlingPanel";
import CwcMatchSummary from "./cwcMatchSummary";
import FirstInningsScorecard from "./firstInningsScorecard";
import FirstInningsBowling from "./firstInningsBowling";
import SecondInningsScorecard from "./secondInningsScorecard";
import SecondInningsBowling from "./secondInningsBowling";
import BowlerStats from "./BowlerStats";
import BatsmanStats from "./BatsmanStats";
import MatchIntroCwc from "./MatchIntroCwc";
import TossResultCwc from "./TossResultCwc";
import InningsBreakCwc from "./InningsBreakCwc";
import WinningResultCwc from "./WinningResultCwc";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

export default function MatchOverlay() {
  const match = useOverlay();

  const [showBowlerStats, setShowBowlerStats] = useState(false);
  const [showBatsmanStats, setShowBatsmanStats] = useState(false);

  // Prevent the same completed over from reopening its summary.
  const lastSummaryKeyRef = useRef(null);

  const handleBatsmanShow = useCallback(() => {
    setShowBowlerStats(false);
    setShowBatsmanStats(true);
  }, []);

  const handleBatsmanHide = useCallback(() => {
    setShowBatsmanStats(false);
  }, []);

  const handleBowlerShow = useCallback(() => {
    setShowBowlerStats(true);
  }, []);

  const handleBowlerHide = useCallback(() => {
    setShowBowlerStats(false);
  }, []);

  // Preload overlay images without blocking the initial render.
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
      "/themes/OkCrick/event-right.png",
    ];

    images.forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  // Automatically show summary once for each completed over.
  useEffect(() => {
    if (!match?.tournamentId || !match?.id) return;

    const isOverComplete = Number(match.ballsInOver) === 6;

    if (
      !isOverComplete ||
      match.overlayType !== "main" ||
      match.status === "completed"
    ) {
      return;
    }

    const summaryKey = [
      match.id,
      match.innings || 1,
      match.currentOver || 0,
    ].join("-");

    if (lastSummaryKeyRef.current === summaryKey) return;

    lastSummaryKeyRef.current = summaryKey;

    const matchRef = doc(
      db,
      "tournaments",
      match.tournamentId,
      "matches",
      match.id
    );

    updateDoc(matchRef, {
      overlayType: "matchSummary",
    }).catch((error) => {
      if (lastSummaryKeyRef.current === summaryKey) {
        lastSummaryKeyRef.current = null;
      }

      console.error("Failed to update match summary overlay:", error);
    });
  }, [
    match?.tournamentId,
    match?.id,
    match?.innings,
    match?.currentOver,
    match?.ballsInOver,
    match?.overlayType,
    match?.status,
  ]);

  // Return timed overlay screens to main after 10 seconds.
  useEffect(() => {
    if (!match?.tournamentId || !match?.id) return;

    const timedOverlayTypes = [
      "matchSummary",
      "firstInningsScorecard",
      "firstInningsBowling",
      "secondInningsScorecard",
      "secondInningsBowling",
    ];

    if (!timedOverlayTypes.includes(match.overlayType)) return;

    const matchRef = doc(
      db,
      "tournaments",
      match.tournamentId,
      "matches",
      match.id
    );

    const timer = setTimeout(() => {
      updateDoc(matchRef, {
        overlayType: "main",
      }).catch((error) => {
        console.error("Failed to reset match overlay:", error);
      });
    }, 10000);

    return () => clearTimeout(timer);
  }, [
    match?.tournamentId,
    match?.id,
    match?.overlayType,
  ]);

  if (!match) return null;

  const isPreMatch =
    Number(match.innings || 0) === 1 &&
    !match.striker &&
    !match.nonStriker &&
    !match.bowler &&
    !match.totalRuns &&
    !match.currentOver;

  const hasSecondInningsData =
    Number(match.innings) === 2 ||
    !!match.secondInningsStatsBackup;

  const hasTossData =
    match.tossCompleted &&
    match.tossWinner &&
    (match.tossDecision || match.tossChoice);

  const isAllOut = Number(match.totalWickets || 0) >= 10;

  const isOversComplete =
    Number(match.currentOver || 0) >= Number(match.overs || 0) ||
    (
      Number(match.currentOver || 0) ===
        Number(match.overs || 0) - 1 &&
      Number(match.ballsInOver || 0) === 6
    );

  const isInningsBreak =
    Number(match.innings) === 1 &&
    (isAllOut || isOversComplete);

  const isMatchCompleted = match.status === "completed";

  if (match.overlayType === "matchSummary") {
    return <CwcMatchSummary match={match} />;
  }

  if (match.overlayType === "firstInningsScorecard") {
    return <FirstInningsScorecard match={match} />;
  }

  if (match.overlayType === "firstInningsBowling") {
    return <FirstInningsBowling match={match} />;
  }

  if (
    match.overlayType === "secondInningsScorecard" &&
    hasSecondInningsData
  ) {
    return <SecondInningsScorecard match={match} />;
  }

  if (
    match.overlayType === "secondInningsBowling" &&
    hasSecondInningsData
  ) {
    return <SecondInningsBowling match={match} />;
  }

  if (match.overlayType === "tossResult" && hasTossData) {
    return <TossResultCwc />;
  }

  if (isInningsBreak) return <InningsBreakCwc />;
  if (isMatchCompleted) return <WinningResultCwc />;

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
        pointerEvents: "none",
      }}
    >
      <EventOverlay />

      <BatsmanStats
        match={match}
        onShow={handleBatsmanShow}
        onHide={handleBatsmanHide}
      />

      <BowlerStats
        match={match}
        showBatsmanStats={showBatsmanStats}
        onShow={handleBowlerShow}
        onHide={handleBowlerHide}
      />

      <AnimatePresence mode="wait">
        {showBowlerStats || showBatsmanStats ? null : isPreMatch ? (
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
  );
          }
