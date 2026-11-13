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

export default function MatchOverlay() {
  const match = useOverlay();

  const [artworkReady, setArtworkReady] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  const [showBatsmanStats, setShowBatsmanStats] = useState(false);
  const [showBowlerStats, setShowBowlerStats] = useState(false);

  const wcplReady = artworkReady && match?.teamColorsReady;

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

  // Reset intro and stats visibility when the match changes.
  useEffect(() => {
    setIntroComplete(false);
    setShowBatsmanStats(false);
    setShowBowlerStats(false);
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

  const showStats = showBatsmanStats || showBowlerStats;

  const showLowerThird = introComplete && !showStats;

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
          opacity: introComplete ? 0 : 1,
          visibility: introComplete ? "hidden" : "visible",
          pointerEvents: introComplete ? "none" : "auto",
        }}
      >
        <MatchIntro
          onComplete={() => setIntroComplete(true)}
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
