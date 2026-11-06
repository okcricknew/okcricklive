import { useEffect, useState } from "react";
import { useOverlay } from "../../core/OverlayProvider";
import { preloadAndDecodeWcplArtwork } from "./wcplArtwork";
import LowerThirdLayout from "./LowerThirdLayout";
import BattingPanel from "./BattingPanel";
import MatchCenter from "./MatchCenter";
import BowlingPanel from "./BowlingPanel";

export default function MatchOverlay() {
  const match = useOverlay();
  const [artworkReady, setArtworkReady] = useState(false);
  const wcplReady = artworkReady && match?.teamColorsReady;

  useEffect(() => {
    let active = true;

    preloadAndDecodeWcplArtwork()
      .then(() => {
        if (active) setArtworkReady(true);
      })
      .catch((error) => {
        // Keep the composition hidden rather than showing a partially loaded
        // WCPL graphic. A later mount can retry because the loader resets cache.
        console.error("WCPL artwork preload failed:", error);
      });

    return () => {
      active = false;
    };
  }, []);

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
      <LowerThirdLayout>
        <BattingPanel team={match.battingTeam} />
        <MatchCenter />
        <BowlingPanel team={match.bowlingTeam} />
      </LowerThirdLayout>
    </div>
  );
}
