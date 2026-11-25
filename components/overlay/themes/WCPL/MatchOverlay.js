import { useEffect, useState, useCallback } from "react";

import { useOverlay } from "../../core/OverlayProvider";
import { preloadAndDecodeWcplArtwork } from "./wcplArtwork";

import LowerThirdLayout from "./LowerThirdLayout";
import BattingPanel from "./BattingPanel";
import MatchCenter from "./MatchCenter";
import BowlingPanel from "./BowlingPanel";
import MatchIntro from "./MatchIntro/MatchIntro";

import BatsmanStats from "./Stats/BatsmanStats";
import BowlerStats from "./Stats/BowlerStats";
import MatchStats from "./MatchStats";

// NEW: Independent WCPL Match Summary
import MatchSummary from "./MatchSummary/MatchSummary";

// WCPL-specific persistent intro state.
const getIntroStorageKey = (matchId) =>
  `wcpl_intro_completed_${matchId}`;

const hasSelectedPlayer = (value) => {
  if (typeof value !== "string") return false;

  const name = value.trim().toLowerCase();

  return Boolean(
    name &&
      name !== "selecting..." &&
      name !== "selecting" &&
      name !== "unknown" &&
      name !== "none"
  );
};

export default function MatchOverlay() {
  const match = useOverlay();

  const [artworkReady, setArtworkReady] = useState(false);

  const [introState, setIntroState] = useState({
    matchId: null,
    ready: false,
    complete: false,
  });

  const [showBatsmanStats, setShowBatsmanStats] = useState(false);
  const [showBowlerStats, setShowBowlerStats] = useState(false);
  const [eventActive, setEventActive] = useState(false);

  const wcplReady = artworkReady && match?.teamColorsReady;

  // Required player selection.
  const hasAllPlayers = Boolean(
    hasSelectedPlayer(match?.striker) &&
      hasSelectedPlayer(match?.nonStriker) &&
      hasSelectedPlayer(match?.bowler)
  );

  // Innings information.
  const inningsNumber = Number(match?.innings || 1);
  const isFirstInnings = inningsNumber === 1;
  const isSecondInnings = inningsNumber >= 2;

  // =====================================================
  // MATCH SUMMARY VISIBILITY
  // =====================================================

  // auto = Automatically show after match completion.
  // show = Manually force Match Summary ON.
  // hide = Manually force Match Summary OFF.

  const summaryMode = match?.wcplMatchSummaryMode || "auto";

  const isMatchCompleted =
    match?.status === "completed" ||
    match?.matchStatus === "completed";

  const showMatchSummary =
    summaryMode === "show" ||
    (summaryMode === "auto" && isMatchCompleted);

  // Preload existing WCPL artwork.
  useEffect(() => {
    let active = true;

    preloadAndDecodeWcplArtwork()
      .then(() => {
        if (active) setArtworkReady(true);
      })
      .catch((error) => {
        console.error("WCPL artwork preload failed:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  // Resolve intro state for the current match.
  useEffect(() => {
    if (!match?.id) return;

    const matchId = String(match.id);
    const storageKey = getIntroStorageKey(matchId);

    let alreadyCompleted = false;

    try {
      alreadyCompleted =
        window.localStorage.getItem(storageKey) === "true";
    } catch (error) {
      console.warn(
        "WCPL intro persistence unavailable:",
        error
      );
    }

    const shouldComplete =
      alreadyCompleted ||
      isSecondInnings ||
      hasAllPlayers;

    if (shouldComplete && !alreadyCompleted) {
      try {
        window.localStorage.setItem(storageKey, "true");
      } catch (error) {
        console.warn(
          "WCPL intro state could not be saved:",
          error
        );
      }
    }

    setIntroState({
      matchId,
      ready: true,
      complete: shouldComplete,
    });
  }, [
    match?.id,
    isSecondInnings,
    hasAllPlayers,
  ]);

  // Reset stats when the match changes.
  useEffect(() => {
    setShowBatsmanStats(false);
    setShowBowlerStats(false);
    setEventActive(false);
  }, [match?.id]);

  // Persist intro completion.
  const handleIntroComplete = useCallback(() => {
    if (!match?.id) return;

    const matchId = String(match.id);

    try {
      window.localStorage.setItem(
        getIntroStorageKey(matchId),
        "true"
      );
    } catch (error) {
      console.warn(
        "WCPL intro completion could not be saved:",
        error
      );
    }

    setIntroState({
      matchId,
      ready: true,
      complete: true,
    });
  }, [match?.id]);

  // Batsman stats have priority over bowler stats.
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

  if (!match) return null;

  // Prevent intro/lower-third flash while checking saved state.
  const introStateReady =
    introState.ready &&
    introState.matchId === String(match.id);

  const introComplete =
    introStateReady &&
    (
      introState.complete ||
      isSecondInnings ||
      !isFirstInnings
    );

  // Intro can only run in first innings.
  const showMatchIntro =
    introStateReady &&
    isFirstInnings &&
    !introComplete;

  const showStats =
    showBatsmanStats || showBowlerStats;

  const showLowerThird =
    introComplete && !showStats && !showMatchSummary;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 99999,
        visibility: wcplReady ? "visible" : "hidden",
      }}
      aria-hidden={!wcplReady}
    >
      {/* LOWER THIRD */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: showLowerThird ? 1 : 0,
          visibility: showLowerThird ? "visible" : "hidden",
          pointerEvents: showLowerThird ? "auto" : "none",
        }}
      >
        <LowerThirdLayout animate={introComplete}>
          <BattingPanel team={match.battingTeam} />

          <MatchCenter
            eventActive={eventActive}
            onEventActiveChange={setEventActive}
          />

          <MatchStats eventActive={eventActive} />

          <BowlingPanel team={match.bowlingTeam} />
        </LowerThirdLayout>
      </div>

      {/* MATCH INTRO */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: showMatchIntro && !showMatchSummary ? 1 : 0,
          visibility:
            showMatchIntro && !showMatchSummary
              ? "visible"
              : "hidden",
          pointerEvents: "none",
        }}
      >
        <MatchIntro
          canComplete={hasAllPlayers}
          onComplete={handleIntroComplete}
        />
      </div>

      {/* BATSMAN STATS */}
      <div
        style={{
          visibility: showMatchSummary ? "hidden" : "visible",
        }}
      >
        <BatsmanStats
          match={match}
          onShow={handleBatsmanShow}
          onHide={handleBatsmanHide}
        />

        {/* BOWLER STATS */}
        <BowlerStats
          match={match}
          showBatsmanStats={showBatsmanStats}
          onShow={handleBowlerShow}
          onHide={handleBowlerHide}
        />
      </div>

      {/* ================================================
          WCPL MATCH SUMMARY
          Independent component and independent CSS.
          Automatically shown after match completion.
          Manual visibility controlled by Firebase mode.
         ================================================ */}

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 100000,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: showMatchSummary ? 1 : 0,
          visibility: showMatchSummary ? "visible" : "hidden",
          pointerEvents: "none",
        }}
        aria-hidden={!showMatchSummary}
      >
        <MatchSummary />
      </div>
    </div>
  );
    }
            
