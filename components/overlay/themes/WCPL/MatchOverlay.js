import { useEffect, useRef, useState } from "react";
import { useOverlay } from "../../core/OverlayProvider";
import { preloadAndDecodeWcplArtwork } from "./wcplArtwork";
import LowerThirdLayout from "./LowerThirdLayout";
import BattingPanel from "./BattingPanel";
import MatchCenter from "./MatchCenter";
import BowlingPanel from "./BowlingPanel";
import MatchIntro from "./MatchIntro/MatchIntro";
import styles from "./WCPL.module.css";

export default function MatchOverlay() {
  const match = useOverlay();

  const [artworkReady, setArtworkReady] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);
  const [lowerThirdPhase, setLowerThirdPhase] = useState("hidden");
  const lowerThirdPhaseRef = useRef("hidden");
  const previousMatchId = useRef(null);
  lowerThirdPhaseRef.current = lowerThirdPhase;

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
    const nextMatchId = match?.id ?? null;
    const previousId = previousMatchId.current;
    previousMatchId.current = nextMatchId;

    // First mount starts hidden. On a match change, contract the currently
    // visible lower third before it is removed from view.
    if (previousId !== null && previousId !== nextMatchId) {
      if (lowerThirdPhaseRef.current === "visible" || lowerThirdPhaseRef.current === "entering") {
        setIntroVisible(false);
        setLowerThirdPhase("exiting");
      } else {
        setIntroVisible(true);
        setLowerThirdPhase("hidden");
      }
    } else {
      setIntroVisible(true);
    }
  }, [match?.id]);

  const handleLowerThirdAnimationEnd = (event) => {
    if (event.target !== event.currentTarget) return;

    // CSS Modules may scope keyframe names, so identify the active phase
    // through its generated class instead of comparing animationName.
    if (event.currentTarget.classList.contains(styles.lowerThirdEntering)) {
      setLowerThirdPhase("visible");
    } else if (event.currentTarget.classList.contains(styles.lowerThirdExiting)) {
      setLowerThirdPhase("hidden");
      setIntroVisible(true);
    }
  };

  const handleIntroComplete = () => {
    setIntroVisible(false);
    setLowerThirdPhase("entering");
  };

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
      {/* Keep the complete lower-third tree mounted; animate only its visual wrapper. */}
      <div
        className={`${styles.lowerThirdStage} ${
          lowerThirdPhase === "entering"
            ? styles.lowerThirdEntering
            : lowerThirdPhase === "exiting"
              ? styles.lowerThirdExiting
              : lowerThirdPhase === "visible"
                ? styles.lowerThirdVisible
                : styles.lowerThirdHidden
        }`}
        onAnimationEnd={handleLowerThirdAnimationEnd}
        style={{ pointerEvents: "none" }}
        aria-hidden={lowerThirdPhase === "hidden"}
      >
        <LowerThirdLayout>
          <BattingPanel team={match.battingTeam} />
          <MatchCenter />
          <BowlingPanel team={match.bowlingTeam} />
        </LowerThirdLayout>
      </div>

      {/* MatchIntro remains mounted and becomes visible after the lower-third exit. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: introVisible ? 1 : 0,
          pointerEvents: introVisible ? "auto" : "none",
          visibility: introVisible ? "visible" : "hidden",
        }}
      >
        <MatchIntro onComplete={handleIntroComplete} />
      </div>
    </div>
  );
          }
