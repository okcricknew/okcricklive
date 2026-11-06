\
import { useEffect, useState } from "react";
import { useOverlay } from "../../core/OverlayProvider";
import LowerThirdLayout from "./LowerThirdLayout";
import BattingPanel from "./BattingPanel";
import MatchCenter from "./MatchCenter";
import BowlingPanel from "./BowlingPanel";
import { preloadAndDecodeWcplArtwork } from "./wcplArtwork";

export default function MatchOverlay() {
  const match = useOverlay();
  const [artworkReady, setArtworkReady] = useState(false);

  useEffect(() => {
    let active = true;

    preloadAndDecodeWcplArtwork()
      .then(() => {
        if (active) setArtworkReady(true);
      })
      .catch((error) => {
        // Do not reveal a partially assembled overlay. A later remount can
        // retry because failed requests are removed from the shared cache.
        console.error("WCPL artwork could not be prepared:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  // One gate controls the entire WCPL composition. No panel can appear
  // before the three WebP files and the current teams' color data are ready.
  if (!match || !match.teamColorsReady || !artworkReady) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 99999,
      }}
    >
      <LowerThirdLayout>
        <BattingPanel team={match.battingTeam} />
        <MatchCenter />
        <BowlingPanel team={match.bowlingTeam} />
      </LowerThirdLayout>
    </div>
  );
}
