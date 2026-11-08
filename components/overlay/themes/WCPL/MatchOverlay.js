import { useEffect, useState } from "react";
import { useOverlay } from "../../core/OverlayProvider";
import { preloadAndDecodeWcplArtwork } from "./wcplArtwork";
import LowerThirdLayout from "./LowerThirdLayout";
import BattingPanel from "./BattingPanel";
import MatchCenter from "./MatchCenter";
import BowlingPanel from "./BowlingPanel";
import MatchIntro from "./MatchIntro/MatchIntro";

export default function MatchOverlay() {
  const match = useOverlay();

  const [artworkReady, setArtworkReady] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  const wcplReady = artworkReady && match?.teamColorsReady;

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

  useEffect(() => {
    setIntroComplete(false);
  }, [match?.id]);

  if (!match) return null;

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
      {!introComplete ? (
        <MatchIntro onComplete={() => setIntroComplete(true)} />
      ) : (
        <LowerThirdLayout>
          <BattingPanel team={match.battingTeam} />
          <MatchCenter />
          <BowlingPanel team={match.bowlingTeam} />
        </LowerThirdLayout>
      )}
    </div>
  );
}
