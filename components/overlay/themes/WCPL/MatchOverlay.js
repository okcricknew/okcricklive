import {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

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

import MatchSummary from "./MatchSummary/MatchSummary";

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

  // Prevent the same completed over from opening summary repeatedly.
  const lastSummaryKeyRef = useRef(null);

  const wcplReady = artworkReady && match?.teamColorsReady;

  const hasAllPlayers = Boolean(
    hasSelectedPlayer(match?.striker) &&
    hasSelectedPlayer(match?.nonStriker) &&
    hasSelectedPlayer(match?.bowler)
  );

  const inningsNumber = Number(match?.innings || 1);
  const isFirstInnings = inningsNumber === 1;
  const isSecondInnings = inningsNumber >= 2;

  const isSummaryActive = match?.overlayType === "matchSummary";

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
      console.warn("WCPL intro persistence unavailable:", error);
    }

    const shouldComplete =
      alreadyCompleted ||
      isSecondInnings ||
      hasAllPlayers;

    if (shouldComplete && !alreadyCompleted) {
      try {
        window.localStorage.setItem(storageKey, "true");
      } catch (error) {
        console.warn("WCPL intro state could not be saved:", error);
      }
    }

    setIntroState({
      matchId,
      ready: true,
      complete: shouldComplete,
    });
  }, [match?.id, isSecondInnings, hasAllPlayers]);

  // Reset match-specific UI state when match changes.
  useEffect(() => {
    setShowBatsmanStats(false);
    setShowBowlerStats(false);
    setEventActive(false);
    lastSummaryKeyRef.current = null;
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
      console.warn("WCPL intro completion could not be saved:", error);
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

  // Automatic Match Summary after every 3 completed overs.
  useEffect(() => {
    if (!match?.id || !match?.tournamentId) return;

    const completedOver = Number(match.currentOver || 0);
    const completedBalls = Number(match.ballsInOver || 0);

    const isThreeOverMilestone =
      completedBalls === 6 &&
      completedOver > 0 &&
      completedOver % 3 === 0;

    const overlayIsMain =
      !match.overlayType || match.overlayType === "main";

    if (
      !isThreeOverMilestone ||
      !overlayIsMain ||
      match.status === "completed"
    ) {
      return;
    }

    const summaryKey = [
      match.id,
      inningsNumber,
      completedOver,
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

      console.error(
        "WCPL automatic Match Summary update failed:",
        error
      );
    });
  }, [
    match?.id,
    match?.tournamentId,
    match?.currentOver,
    match?.ballsInOver,
    match?.overlayType,
    match?.status,
    inningsNumber,
  ]);

  // Return Match Summary to main overlay after 10 seconds.
  // Works for both automatic and manual summary.
  useEffect(() => {
    if (
      !isSummaryActive ||
      !match?.id ||
      !match?.tournamentId
    ) {
      return;
    }

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
        console.error(
          "WCPL Match Summary reset failed:",
          error
        );
      });
    }, 10000);

    return () => clearTimeout(timer);
  }, [
    isSummaryActive,
    match?.id,
    match?.tournamentId,
  ]);

  if (!match) return null;

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

  const showMatchIntro =
    introStateReady &&
    isFirstInnings &&
    !introComplete;

  const showStats =
    showBatsmanStats || showBowlerStats;

  const showLowerThird =
    introComplete && !showStats && !isSummaryActive;

  const showIntroLayer =
    showMatchIntro && !isSummaryActive;

  // Summary takes priority over every other WCPL layer.
  const hideOtherLayers = isSummaryActive;

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

          <MatchCenter
            eventActive={eventActive}
            onEventActiveChange={setEventActive}
          />

          <MatchStats eventActive={eventActive} />

          <BowlingPanel team={match.bowlingTeam} />
        </LowerThirdLayout>
      </div>

      {/* MATCH INTRO - PERMANENTLY MOUNTED */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: showIntroLayer ? 1 : 0,
          visibility: showIntroLayer ? "visible" : "hidden",
          pointerEvents: "none",
        }}
      >
        <MatchIntro
          canComplete={hasAllPlayers}
          onComplete={handleIntroComplete}
        />
      </div>

      {/* BATSMAN STATS - PERMANENTLY MOUNTED */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity:
            showBatsmanStats && !hideOtherLayers ? 1 : 0,
          visibility:
            showBatsmanStats && !hideOtherLayers
              ? "visible"
              : "hidden",
          pointerEvents:
            showBatsmanStats && !hideOtherLayers
              ? "auto"
              : "none",
        }}
      >
        <BatsmanStats
          match={match}
          onShow={handleBatsmanShow}
          onHide={handleBatsmanHide}
        />
      </div>

      {/* BOWLER STATS - PERMANENTLY MOUNTED */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity:
            showBowlerStats && !showBatsmanStats && !hideOtherLayers
              ? 1
              : 0,
          visibility:
            showBowlerStats && !showBatsmanStats && !hideOtherLayers
              ? "visible"
              : "hidden",
          pointerEvents:
            showBowlerStats && !showBatsmanStats && !hideOtherLayers
              ? "auto"
              : "none",
        }}
      >
        <BowlerStats
          match={match}
          showBatsmanStats={showBatsmanStats}
          onShow={handleBowlerShow}
          onHide={handleBowlerHide}
        />
      </div>

      {/* MATCH SUMMARY - PERMANENTLY MOUNTED */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: isSummaryActive ? 1 : 0,
          visibility: isSummaryActive ? "visible" : "hidden",
          pointerEvents: isSummaryActive ? "auto" : "none",
          zIndex: 100000,
        }}
      >
        <MatchSummary match={match} />
      </div>
    </div>
  );
        }
        
