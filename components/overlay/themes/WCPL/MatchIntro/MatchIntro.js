import { useEffect, useMemo, useState } from "react";
import { useOverlay } from "../../../core/OverlayProvider";
import {
  getTeamPanelColor,
  getReadableTextColor,
} from "../teamColor";
import { preloadAndDecodeWcplMatchIntroArtwork } from "./matchIntroArtwork";
import styles from "./MatchIntro.module.css";

const DEFAULT_TEAM_A_COLOR = "#183B8C";
const DEFAULT_TEAM_B_COLOR = "#B52B42";

const INTRO_DELAY = 1800;
const EVENT_DELAY = 3000;

export default function MatchIntro({
  onComplete,
  canComplete = true,
}) {
  const match = useOverlay();

  const [artworkReady, setArtworkReady] = useState(false);
  const [eventIndex, setEventIndex] = useState(-1);

  // Animation lifecycle
  const [introPhase, setIntroPhase] = useState("waiting");

  // Preload all four artworks together.
  useEffect(() => {
    let active = true;

    preloadAndDecodeWcplMatchIntroArtwork()
      .then(() => {
        if (active) setArtworkReady(true);
      })
      .catch((error) => {
        console.error("WCPL Match Intro artwork failed:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  const teamAColor = getTeamPanelColor(
    match?.teamAColorDocument,
    DEFAULT_TEAM_A_COLOR
  );

  const teamBColor = getTeamPanelColor(
    match?.teamBColorDocument,
    DEFAULT_TEAM_B_COLOR
  );

  const teamAName = match?.teamA || "TEAM A";
  const teamBName = match?.teamB || "TEAM B";

  const introReady = Boolean(
    match && artworkReady && match.teamColorsReady
  );

  const eventList = useMemo(() => {
    if (!match) return [];

    const list = [];

    if (
      match.overs !== undefined &&
      match.overs !== null &&
      match.overs !== ""
    ) {
      list.push(`${match.overs} OVERS MATCH`);
    }

    const matchNumber = match.matchNo || match.matchNumber;

    if (
      matchNumber !== undefined &&
      matchNumber !== null &&
      matchNumber !== ""
    ) {
      list.push(`MATCH NO: ${matchNumber}`);
    }

    if (match.tossCompleted && match.tossWinner) {
      const decision = (
        match.tossDecision ||
        match.tossChoice ||
        "BAT"
      ).toUpperCase();

      list.push(
        `${String(match.tossWinner).toUpperCase()} WON THE TOSS — ELECTED TO ${decision}`
      );
    } else {
      list.push("TOSS PENDING");
    }

    return list;
  }, [match]);

  // Reset animation for a new match.
  useEffect(() => {
    setIntroPhase("waiting");
    setEventIndex(-1);
  }, [match?.id]);

  // Start flipInY after artwork becomes ready.
  useEffect(() => {
    if (!introReady || eventList.length === 0) return;

    setIntroPhase("entering");
    setEventIndex(-1);

    const timeout = setTimeout(() => {
      setEventIndex(0);
    }, INTRO_DELAY);

    return () => clearTimeout(timeout);
  }, [match?.id, introReady, eventList]);

  // Preserve sequential event timing.
// Hold the final event until all required players are selected.
useEffect(() => {
  if (
    !introReady ||
    introPhase === "waiting" ||
    introPhase === "exiting" ||
    eventIndex < 0 ||
    eventIndex >= eventList.length
  ) {
    return;
  }

  // Move to the next event normally.
  if (eventIndex < eventList.length - 1) {
    const timeout = setTimeout(() => {
      setEventIndex((previous) => previous + 1);
    }, EVENT_DELAY);

    return () => clearTimeout(timeout);
  }

  // Final event: wait until parent confirms player selection.
  if (!canComplete) {
    return;
  }

  const timeout = setTimeout(() => {
    setIntroPhase("exiting");
  }, EVENT_DELAY);

  return () => clearTimeout(timeout);
}, [
  introReady,
  introPhase,
  eventIndex,
  eventList.length,
  canComplete,
]);

  // Complete only after the exit animation finishes.
  
const handleAnimationEnd = (event) => {
  // Ignore animations bubbling from child elements.
  if (event.target !== event.currentTarget) return;

  // CSS Modules can rename animation keyframes.
  // Therefore, use lifecycle state instead of animationName.
  if (introPhase === "exiting") {
    if (typeof onComplete === "function") {
      onComplete();
    }
  }

  if (introPhase === "entering") {
    setIntroPhase("entered");
  }
};
  

  if (!match) return null;

  const teamAStyle = {
    color: getReadableTextColor(teamAColor),
  };

  const teamBStyle = {
    color: getReadableTextColor(teamBColor),
  };

  const animationClass =
    introPhase === "entering"
      ? styles.flipInY
      : introPhase === "exiting"
      ? styles.flipOutY
      : "";

  return (
    <div
      className={`${styles.stage} ${animationClass}`}
      onAnimationEnd={handleAnimationEnd}
      style={{
        "--team-a-color": teamAColor,
        "--team-b-color": teamBColor,
        visibility: introReady ? "visible" : "hidden",
      }}
      aria-label="WCPL Match Introduction"
      aria-hidden={!introReady}
    >
      {/* All four WebP layers mount together */}

      <div className={`${styles.artwork} ${styles.introArt}`} />

      <div className={`${styles.artwork} ${styles.teamAArt}`} />

      <div className={`${styles.artwork} ${styles.teamBArt}`} />

      <div className={`${styles.artwork} ${styles.tourNameArt}`} />

      {/* Team A */}

      <div className={styles.teamAName} style={teamAStyle}>
        {teamAName}
      </div>

      {/* Team B */}

      <div className={styles.teamBName} style={teamBStyle}>
        {teamBName}
      </div>

      {/* Tournament */}

      <div className={styles.tournamentName}>
        {match.tournamentName || "WCPL"}
      </div>

      {/* Match information */}

      <div className={styles.eventText} aria-live="polite">
        {eventIndex >= 0 ? eventList[eventIndex] : ""}
      </div>
    </div>
  );
    }
        
