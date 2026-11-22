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

const formatMatchType = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  const types = {
    league: "LEAGUE MATCH",
    "league match": "LEAGUE MATCH",
    "quarter final": "QUARTER FINAL",
    quarterfinal: "QUARTER FINAL",
    "semi final": "SEMI FINAL",
    semifinal: "SEMI FINAL",
    final: "FINAL",
  };

  return types[normalized] || normalized.toUpperCase();
};

export default function MatchIntro({
  onComplete,
  canComplete = true,
}) {
  const match = useOverlay();

  const [artworkReady, setArtworkReady] = useState(false);
  const [eventIndex, setEventIndex] = useState(-1);
  const [introPhase, setIntroPhase] = useState("waiting");

  // Preload all four artworks together.
  useEffect(() => {
    let active = true;

    preloadAndDecodeWcplMatchIntroArtwork()
      .then(() => {
        if (active) setArtworkReady(true);
      })
      .catch((error) => {
        console.error(
          "WCPL Match Intro artwork failed:",
          error
        );
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

  // Prepare match information and toss information.
  const eventList = useMemo(() => {
    if (!match) return [];

    const list = [];

    // 1. Tournament name
    if (match.tournamentName) {
      list.push({
        id: "tournament",
        type: "normal",
        text: String(match.tournamentName).toUpperCase(),
      });
    }

    // 2. Match type
    if (match.matchType) {
      list.push({
        id: "match-type",
        type: "normal",
        text: formatMatchType(match.matchType),
      });
    }

    // 3. Match number
    const matchNumber =
      match.matchNo ?? match.matchNumber;

    if (
      matchNumber !== undefined &&
      matchNumber !== null &&
      String(matchNumber).trim() !== ""
    ) {
      list.push({
        id: "match-number",
        type: "normal",
        text: `MATCH NO: ${matchNumber}`,
      });
    }

    // 4. Overs
    if (
      match.overs !== undefined &&
      match.overs !== null &&
      match.overs !== ""
    ) {
      list.push({
        id: "overs",
        type: "normal",
        text: `${match.overs} OVERS MATCH`,
      });
    }

    // 5. Toss information
    if (match.tossCompleted && match.tossWinner) {
      const decision = String(
        match.tossDecision ||
        match.tossChoice ||
        "BAT"
      ).toUpperCase();

      list.push({
        id: "toss",
        type: "toss",
        line1: `${String(
          match.tossWinner
        ).toUpperCase()} WON THE TOSS`,
        line2: `& ELECTED TO ${decision}`,
      });
    } else {
      list.push({
        id: "toss-pending",
        type: "normal",
        text: "TOSS PENDING",
      });
    }

    return list;
  }, [
    match?.tournamentName,
    match?.matchType,
    match?.matchNo,
    match?.matchNumber,
    match?.overs,
    match?.tossCompleted,
    match?.tossWinner,
    match?.tossDecision,
    match?.tossChoice,
  ]);

  // Reset only for a new match.
  useEffect(() => {
    setIntroPhase("waiting");
    setEventIndex(-1);
  }, [match?.id]);

  // Start animation when artwork is ready.
  // Toss/Firebase updates must not restart this animation.
  useEffect(() => {
    if (!introReady || eventList.length === 0) {
      return;
    }

    setIntroPhase("entering");
    setEventIndex(-1);

    const timeout = setTimeout(() => {
      setEventIndex(0);
    }, INTRO_DELAY);

    return () => clearTimeout(timeout);
  }, [match?.id, introReady]);

  // Keep the active index valid when information changes.
  useEffect(() => {
    if (eventList.length === 0) return;

    if (eventIndex >= eventList.length) {
      setEventIndex(0);
    }
  }, [eventIndex, eventList.length]);

  // Repeat information until player selection is complete.
  // Once canComplete is true, finish after the final item.
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

    const isLastEvent =
      eventIndex === eventList.length - 1;

    const timeout = setTimeout(() => {
      if (isLastEvent && canComplete) {
        setIntroPhase("exiting");
        return;
      }

      setEventIndex((previous) =>
        (previous + 1) % eventList.length
      );
    }, EVENT_DELAY);

    return () => clearTimeout(timeout);
  }, [
    introReady,
    introPhase,
    eventIndex,
    eventList.length,
    canComplete,
  ]);

  // Complete only after exit animation finishes.
  const handleAnimationEnd = (event) => {
    if (event.target !== event.currentTarget) {
      return;
    }

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

  const currentEvent =
    eventIndex >= 0
      ? eventList[eventIndex]
      : null;

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
      {/* All four WebP layers remain mounted */}

      <div
        className={`${styles.artwork} ${styles.introArt}`}
      />

      <div
        className={`${styles.artwork} ${styles.teamAArt}`}
      />

      <div
        className={`${styles.artwork} ${styles.teamBArt}`}
      />

      <div
        className={`${styles.artwork} ${styles.tourNameArt}`}
      />

      {/* Team A */}
      <div
        className={styles.teamAName}
        style={teamAStyle}
      >
        {teamAName}
      </div>

      {/* Team B */}
      <div
        className={styles.teamBName}
        style={teamBStyle}
      >
        {teamBName}
      </div>

      {/* Tournament */}
      <div className={styles.tournamentName}>
        {match.tournamentName || "WCPL"}
      </div>

      {/* Match information and toss result */}
      <div
        className={styles.eventText}
        aria-live="polite"
        aria-atomic="true"
      >
        {currentEvent?.type === "toss" ? (
          <>
            <span className={styles.eventLine}>
              {currentEvent.line1}
            </span>

            <span className={styles.eventLine}>
              {currentEvent.line2}
            </span>
          </>
        ) : (
          currentEvent?.text || ""
        )}
      </div>
    </div>
  );
    }
        
