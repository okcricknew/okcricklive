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

export default function MatchIntro({ onComplete }) {
  const match = useOverlay();

  const [artworkReady, setArtworkReady] = useState(false);
  const [eventIndex, setEventIndex] = useState(-1);

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

  const eventList = useMemo(() => {
    if (!match) return [];

    const list = [];

    if (match.overs !== undefined && match.overs !== null && match.overs !== "") {
      list.push(`${match.overs} OVERS MATCH`);
    }

    const matchNumber = match.matchNo || match.matchNumber;

    if (matchNumber !== undefined && matchNumber !== null && matchNumber !== "") {
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

  useEffect(() => {
    if (!match || !artworkReady || eventList.length === 0) return;

    let timeout;
    let active = true;

    setEventIndex(-1);

    timeout = setTimeout(() => {
      if (active) setEventIndex(0);
    }, INTRO_DELAY);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [match?.id, artworkReady, eventList]);

  useEffect(() => {
    if (eventIndex < 0 || eventIndex >= eventList.length) return;

    const timeout = setTimeout(() => {
      if (eventIndex < eventList.length - 1) {
        setEventIndex((previous) => previous + 1);
      } else if (typeof onComplete === "function") {
        onComplete();
      }
    }, EVENT_DELAY);

    return () => clearTimeout(timeout);
  }, [eventIndex, eventList.length, onComplete]);

  if (!match || !artworkReady || !match.teamColorsReady) {
    return null;
  }

  const teamAStyle = {
    color: getReadableTextColor(teamAColor),
  };

  const teamBStyle = {
    color: getReadableTextColor(teamBColor),
  };

  return (
    <div
      className={styles.stage}
      style={{
        "--team-a-color": teamAColor,
        "--team-b-color": teamBColor,
      }}
      aria-label="WCPL Match Introduction"
    >
      {/* All four artwork layers appear together */}

      <div className={`${styles.artwork} ${styles.introArt}`} />

      <div className={`${styles.artwork} ${styles.teamAArt}`} />

      <div className={`${styles.artwork} ${styles.teamBArt}`} />

      <div className={`${styles.artwork} ${styles.tourNameArt}`} />

      {/* Dynamic Team A name */}

      <div className={styles.teamAName} style={teamAStyle}>
        {teamAName}
      </div>

      {/* Dynamic Team B name */}

      <div className={styles.teamBName} style={teamBStyle}>
        {teamBName}
      </div>

      {/* Dynamic tournament name */}

      <div className={styles.tournamentName}>
        {match.tournamentName || "WCPL"}
      </div>

      {/* Sequential match information */}

      <div className={styles.eventText} aria-live="polite">
        {eventIndex >= 0 ? eventList[eventIndex] : ""}
      </div>
    </div>
  );
        }
