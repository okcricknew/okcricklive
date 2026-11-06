import { useEffect, useState } from "react";
import { useOverlay } from "../../core/OverlayProvider";
import LowerThirdLayout from "./LowerThirdLayout";
import BattingPanel from "./BattingPanel";
import MatchCenter from "./MatchCenter";
import BowlingPanel from "./BowlingPanel";
import { preloadAndDecodeWcplArtwork } from "./wcplArtwork";
import styles from "./WCPL.module.css";

export default function MatchOverlay() {
  const match = useOverlay();
  const [artworkReady, setArtworkReady] = useState(false);

  useEffect(() => {
    let active = true;

    // Do not reveal text/data until all three WCPL artwork files are loaded
    // and decoded. This prevents the transparent-data-first flash in OBS/WebView.
    // Keep the entire composition hidden on a failed artwork request. Revealing
    // the text without its background is the exact flash this gate prevents.
    preloadAndDecodeWcplArtwork()
      .then(() => new Promise((resolve) => {
        // Two paint frames let Chromium/WebView commit decoded image textures
        // before the text and artwork become visible in the same composition.
        window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
      }))
      .then(() => {
        if (active) setArtworkReady(true);
      })
      .catch((error) => {
        console.error("[WCPL] Artwork is not ready; keeping the overlay hidden:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!match) return null;

  // Team panels intentionally wait for their SSR/Firestore team documents too.
  const overlayReady = artworkReady && match.teamColorsReady !== false;

  return (
    <div
      className={overlayReady ? styles.overlayReady : styles.overlayLoading}
      aria-hidden={!overlayReady}
      aria-busy={!overlayReady}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 99999,
        // Inline visibility prevents a first-paint flash before CSS modules hydrate.
        visibility: overlayReady ? "visible" : "hidden",
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
