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

  // Prevent duplicate automatic summary for the same over.
  const lastSummaryKeyRef = useRef(null);

  const inningsNumber = Number(match?.innings || 1);

  const isFirstInnings = inningsNumber === 1;
  const isSecondInnings = inningsNumber >= 2;

  const isSummaryActive =
    match?.overlayType === "matchSummary";

  const wcplReady =
    artworkReady && match?.teamColorsReady;

  const hasAllPlayers = Boolean(
    hasSelectedPlayer(match?.striker) &&
    hasSelectedPlayer(match?.nonStriker) &&
    hasSelectedPlayer(match?.bowler)
  );

  // Preload existing WCPL artwork.
  useEffect(() => {
    let active = true;

    preloadAndDecodeWcplArtwork()
      .then(() => {
        if (active) setArtworkReady(true);
      })
      .catch((error) => {
        console.error(
          "WCPL artwork preload failed:",
          error
        );
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

  // AUTOMATIC SUMMARY:
  // Only after 3, 6, 9, 12... completed overs.
  
useEffect(() => {
  if (!match?.tournamentId || !match?.id) return;

  const currentOver = Number(match.currentOver || 0);
  const ballsInOver = Number(match.ballsInOver || 0);

  // WCPL MatchCenter logic:
  // When ballsInOver is 6, the displayed completed over is currentOver + 1.
  const completedOver =
    ballsInOver === 6
      ? currentOver + 1
      : currentOver;

  const isThreeOverMilestone =
    ballsInOver === 6 &&
    completedOver > 0 &&
    completedOver % 3 === 0;

  if (
    !isThreeOverMilestone ||
    match.overlayType !== "main" ||
    match.status === "completed"
  ) {
    return;
  }

  const summaryKey = [
    match.id,
    match.innings || 1,
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
    lastSummaryKeyRef.current = null;

    console.error(
      "WCPL automatic Match Summary update failed:",
      error
    );
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
  

  // MANUAL + AUTOMATIC SUMMARY:
  // Return to main after 10 seconds.
  useEffect(() => {
    if (
      !match?.tournamentId ||
      !match?.id ||
      !isSummaryActive
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
    match?.tournamentId,
    match?.id,
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

  const showLowerThird =
    introComplete &&
    !showBatsmanStats &&
    !showBowlerStats &&
    !isSummaryActive;

  const showIntroLayer =
    showMatchIntro && !isSummaryActive;

  const showBatsmanLayer =
    showBatsmanStats && !isSummaryActive;

  const showBowlerLayer =
    showBowlerStats &&
    !showBatsmanStats &&
    !isSummaryActive;

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
          opacity: showBatsmanLayer ? 1 : 0,
          visibility: showBatsmanLayer ? "visible" : "hidden",
          pointerEvents: showBatsmanLayer ? "auto" : "none",
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
          opacity: showBowlerLayer ? 1 : 0,
          visibility: showBowlerLayer ? "visible" : "hidden",
          pointerEvents: showBowlerLayer ? "auto" : "none",
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
