import { useEffect, useMemo, useState } from "react";
import { useOverlay } from "../../core/OverlayProvider";
import styles from "./MatchStats.module.css";

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

export default function MatchStats({ eventActive = false }) {
  const match = useOverlay();

  const [activeIndex, setActiveIndex] = useState(0);

  // =====================================
  // 1. PREPARE MATCH INFORMATION
  // =====================================

  const stats = useMemo(() => {
    if (!match) return [];

    const list = [];

    const innings = Number(match.innings || 1);
    const currentOver = Number(match.currentOver || 0);
    const ballsInOver = Number(match.ballsInOver || 0);

    const totalRuns = Number(match.totalRuns || 0);

    const totalBalls =
      currentOver * 6 + ballsInOver;

    const maxOvers = Number(match.overs || 0);

    // MATCH NUMBER
    const matchNumber =
      match.matchNo ?? match.matchNumber;

    if (
      matchNumber !== undefined &&
      matchNumber !== null &&
      String(matchNumber).trim() !== ""
    ) {
      list.push({
        id: "match-number",
        label: "MATCH NO",
        value: String(matchNumber),
      });
    }

    // MATCH TYPE
    if (match.matchType) {
      list.push({
        id: "match-type",
        label: "MATCH TYPE",
        value: formatMatchType(match.matchType),
      });
    }

    // TOURNAMENT NAME
    if (match.tournamentName) {
      list.push({
        id: "tournament",
        label: "TOURNAMENT",
        value: String(match.tournamentName),
      });
    }

    list.push({
  id: "scoring-partner",
  label: "SCORING PARTNER",
  value: "OKCRICK.IN",
});

    // FIRST INNINGS RUN RATE
    if (innings === 1) {
      const runRate =
        totalBalls > 0
          ? ((totalRuns / totalBalls) * 6).toFixed(2)
          : "0.00";

      list.push({
        id: "run-rate",
        label: "RUN RATE",
        value: runRate,
      });
    }

    if (innings === 1 && totalBalls > 0 && maxOvers > 0) {
  const projectedScore = Math.round(
    (totalRuns / totalBalls) * 6 * maxOvers
  );

  list.push({
    id: "projected-score",
    label: "PROJECTED SCORE",
    value: String(projectedScore),
  });
    }

    // TOSS WINNER: FIRST 4 OVERS
    if (
      innings === 1 &&
      totalBalls < 24 &&
      match.tossWinner
    ) {
      const decision = String(
        match.tossDecision ||
        match.tossChoice ||
        "BAT"
      ).toUpperCase();

      list.push({
        id: "toss",
        label: "TOSS",
        value: `${match.tossWinner} WON & ELECTED TO ${decision}`,
      });
    }

    // SECOND INNINGS REQUIRED RUN RATE AND TARGET
    if (innings >= 2) {
      const target = Number(
        match.target ??
        (Number(match.firstInningsScore || 0) + 1)
      );

      const runsNeeded = Math.max(
        0,
        target - totalRuns
      );

      const ballsLeft = Math.max(
        0,
        (maxOvers * 6) - totalBalls
      );

      const requiredRunRate =
        runsNeeded === 0
          ? "0.00"
          : ballsLeft > 0
            ? ((runsNeeded / ballsLeft) * 6).toFixed(2)
            : "—";

      list.push({
        id: "required-run-rate",
        label: "REQUIRED RUN RATE",
        value: requiredRunRate,
      });

      list.push({
        id: "target",
        label: "TARGET",
        value: String(target),
      });
    }

    return list;
  }, [match]);

  // =====================================
  // 2. CURRENT DISPLAY ITEM
  // =====================================

  const currentStat =
    stats[activeIndex] || stats[0];

  const displayText = currentStat
    ? `${currentStat.label}: ${currentStat.value}`
    : "";

  const isLongText = displayText.length > 17;

  // =====================================
  // 3. RESET WHEN MATCH CHANGES
  // =====================================

  useEffect(() => {
    setActiveIndex(0);
  }, [match?.id]);

  // =====================================
  // 4. KEEP ACTIVE INDEX VALID
  // =====================================

  useEffect(() => {
    if (activeIndex >= stats.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, stats.length]);

  // =====================================
  // 5. AUTOMATIC ROTATION
  // SHORT TEXT: 4 SECONDS
  // LONG TEXT: 13 SECONDS
  // =====================================

  useEffect(() => {
    if (stats.length <= 1 || !currentStat) {
      return;
    }

    const timer = setTimeout(() => {
      setActiveIndex((previous) =>
        (previous + 1) % stats.length
      );
    }, isLongText ? 13000 : 4000);

    return () => clearTimeout(timer);
  }, [
    activeIndex,
    stats.length,
    currentStat?.id,
    currentStat?.value,
    isLongText,
  ]);

  // =====================================
  // 6. EMPTY STATE
  // =====================================

  if (!match || !currentStat) {
    return null;
  }

  // =====================================
  // 7. RENDER MATCH STATS
  // =====================================

  return (
    <div
  className={styles.statsContainer}
  style={{
    opacity: eventActive ? 0 : 1,
    visibility: eventActive ? "hidden" : "visible",
    pointerEvents: "none",
  }}
  aria-live="polite"
  aria-atomic="true"
  aria-hidden={eventActive}
>
      <div
        key={currentStat.id}
        className={`${styles.statItem} ${
          isLongText ? styles.longText : ""
        }`}
      >
        {isLongText ? (
          <div className={styles.marqueeViewport}>
            <span className={styles.marqueeText}>
              {displayText}
            </span>
          </div>
        ) : (
          <span className={styles.statText}>
            <span className={styles.statLabel}>
              {currentStat.label}:
            </span>{" "}
            <span className={styles.statValue}>
              {currentStat.value}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
