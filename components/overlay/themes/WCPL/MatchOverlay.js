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

// WCPL-specific persistent intro state.
// Does not modify OverlayProvider or any other theme.
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

  // null means match-specific storage is still being checked.
  const [introState, setIntroState] = useState({
    matchId: null,
    ready: false,
    complete: false,
  });

  const [showBatsmanStats, setShowBatsmanStats] = useState(false);
  const [showBowlerStats, setShowBowlerStats] = useState(false);

  const wcplReady = artworkReady && match?.teamColorsReady;

  // Required player selection.
  const hasAllPlayers = Boolean(
    hasSelectedPlayer(match?.striker) &&
    hasSelectedPlayer(match?.nonStriker) &&
    hasSelectedPlayer(match?.bowler)
  );

  // First innings only.
  const inningsNumber = Number(match?.innings || 1);
  const isFirstInnings = inningsNumber === 1;
  const isSecondInnings = inningsNumber >= 2;

  // Preload existing WCPL artwork.
  useEffect(() => {
    let active = true;

    preloadAndDecodeWcplArtwork()
      .then(() => {
        if (active) setArtworkReady(true);
      })
      .catch((error) => {
        console.error("WCPL artwork preload failed:", error);

        // Keep the existing failure behavior.
      });

    return () => {
      active = false;
    };
  }, []);

  // Resolve intro state for the current match.
  // A completed intro remains completed after page refresh.
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

  // Reset only stats when the match changes.
  // Do not reset a previously completed intro.
  useEffect(() => {
    setShowBatsmanStats(false);
    setShowBowlerStats(false);
  }, [match?.id]);

  // Persist completion after the MatchIntro exit animation.
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

  // Intro can only run in the first innings.
  const showMatchIntro =
    introStateReady &&
    isFirstInnings &&
    !introComplete;

  const showStats =
    showBatsmanStats || showBowlerStats;

  const showLowerThird =
    introComplete && !showStats;

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
      {/* LOWER THIRD - PERMANENTLY MOUNTED */}
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
          <MatchCenter />
          <BowlingPanel team={match.bowlingTeam} />
        </LowerThirdLayout>
      </div>

      {/* MATCH INTRO - PERMANENTLY MOUNTED */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: showMatchIntro ? 1 : 0,
          visibility: showMatchIntro ? "visible" : "hidden",
          pointerEvents: "none",
        }}
      >
        <MatchIntro
          canComplete={hasAllPlayers}
          onComplete={handleIntroComplete}
        />
      </div>

      {/* BATSMAN STATS - PERMANENTLY MOUNTED */}
      <BatsmanStats
        match={match}
        onShow={handleBatsmanShow}
        onHide={handleBatsmanHide}
      />

      {/* BOWLER STATS - PERMANENTLY MOUNTED */}
      <BowlerStats
        match={match}
        showBatsmanStats={showBatsmanStats}
        onShow={handleBowlerShow}
        onHide={handleBowlerHide}
      />
    </div>
  );
}
