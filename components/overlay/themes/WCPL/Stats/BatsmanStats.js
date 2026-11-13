
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import styles from "./Stats.module.css";

const DEFAULT_LOGO = "/themes/OkCrick/default-team.png";

const BatsmanStats = ({ match, onShow, onHide }) => {
  const [displayData, setDisplayData] = useState(null);
  const [visible, setVisible] = useState(false);

  const prevMatchRef = useRef(null);
  const queueRef = useRef([]);

  const startDelayRef = useRef(null);
  const timerRef = useRef(null);
  const gapTimerRef = useRef(null);
  const transitionTimerRef = useRef(null);

  const queueRunningRef = useRef(false);

  const onShowRef = useRef(onShow);
  const onHideRef = useRef(onHide);
  const previousVisibleRef = useRef(false);

  const tournamentName =
    match?.tournamentName || "ICC Men's CWC 2023";

  const strikeRate = displayData?.balls
    ? (
        (Number(displayData.runs || 0) /
          Number(displayData.balls)) *
        100
      ).toFixed(1)
    : "0.0";

  // Team logo selection using existing WCPL match data.
  const normalizeTeam = (value) =>
    String(value || "").trim().toLowerCase();

  const battingIsTeamA =
    normalizeTeam(match?.battingTeam) ===
    normalizeTeam(match?.teamA);

  const battingIsTeamB =
    normalizeTeam(match?.battingTeam) ===
    normalizeTeam(match?.teamB);

  let teamLogo = DEFAULT_LOGO;

  if (battingIsTeamA) {
    teamLogo =
      match?.teamALogoUrl ||
      match?.teamAColorDocument?.logoUrl ||
      DEFAULT_LOGO;
  } else if (battingIsTeamB) {
    teamLogo =
      match?.teamBLogoUrl ||
      match?.teamBColorDocument?.logoUrl ||
      DEFAULT_LOGO;
  }

  useEffect(() => {
    onShowRef.current = onShow;
    onHideRef.current = onHide;
  }, [onShow, onHide]);

  // Notify parent only when visibility changes.
  useEffect(() => {
    if (previousVisibleRef.current === visible) return;

    previousVisibleRef.current = visible;

    if (visible) {
      onShowRef.current?.();
    } else {
      onHideRef.current?.();
    }
  }, [visible]);

  // Original OKCRICK queue logic.
  const showNextInQueue = useCallback(() => {
    if (timerRef.current || gapTimerRef.current) return;

    const nextPlayer = queueRef.current.shift();

    if (!nextPlayer) {
      queueRunningRef.current = false;
      return;
    }

    if (nextPlayer === "GAP") {
      gapTimerRef.current = setTimeout(() => {
        gapTimerRef.current = null;
        showNextInQueue();
      }, 8000);

      return;
    }

    setDisplayData(nextPlayer);
    setVisible(true);

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setVisible(false);

      transitionTimerRef.current = setTimeout(() => {
        transitionTimerRef.current = null;
        showNextInQueue();
      }, 600);
    }, nextPlayer.isOutView ? 8000 : 5000);
  }, []);

  // Original wicket and new batsman detection.
  useEffect(() => {
    if (!match) return;

    if (!prevMatchRef.current) {
      prevMatchRef.current = JSON.parse(
        JSON.stringify(match)
      );
      return;
    }

    const prevMatch = prevMatchRef.current;
    const playersToShow = [];

    // WICKET CHECK
    if (
      Number(match.totalWickets || 0) >
      Number(prevMatch.totalWickets || 0)
    ) {
      const p1 = prevMatch.striker;
      const p2 = prevMatch.nonStriker;

      if (p1 && match.battingStats?.[p1]?.isOut) {
        playersToShow.push({
          name: p1,
          ...match.battingStats[p1],
          isOutView: true,
          outType: match.battingStats[p1]?.outType || "",
          fielderName:
            match.battingStats[p1]?.fielderName || "",
          bowlerName:
            match.battingStats[p1]?.bowlerName || "",
        });
      }

      if (p2 && match.battingStats?.[p2]?.isOut) {
        playersToShow.push({
          name: p2,
          ...match.battingStats[p2],
          isOutView: true,
          outType: match.battingStats[p2]?.outType || "",
          fielderName:
            match.battingStats[p2]?.fielderName || "",
          bowlerName:
            match.battingStats[p2]?.bowlerName || "",
        });
      }
    }

    // NEW PLAYER CHECK
    const oldNames = [
      prevMatch.striker,
      prevMatch.nonStriker,
    ].filter(Boolean);

    if (
      match.striker &&
      !oldNames.includes(match.striker)
    ) {
      playersToShow.push({
        name: match.striker,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        isOutView: false,
      });
    }

    if (
      match.nonStriker &&
      !oldNames.includes(match.nonStriker)
    ) {
      playersToShow.push({
        name: match.nonStriker,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        isOutView: false,
      });
    }

    // QUEUE UPDATE
    if (playersToShow.length > 0) {
      playersToShow.forEach((player, index) => {
        queueRef.current.push(player);

        if (
          index === 0 &&
          playersToShow.length > 1
        ) {
          queueRef.current.push("GAP");
        }
      });

      const isTimerActive =
        startDelayRef.current ||
        timerRef.current ||
        gapTimerRef.current ||
        transitionTimerRef.current;

      if (!queueRunningRef.current && !isTimerActive) {
        queueRunningRef.current = true;

        startDelayRef.current = setTimeout(() => {
          startDelayRef.current = null;
          showNextInQueue();
        }, 5000);
      }
    }

    prevMatchRef.current = JSON.parse(
      JSON.stringify(match)
    );
  }, [match, showNextInQueue]);

  // CLEANUP ALL TIMERS
  useEffect(() => {
    return () => {
      if (startDelayRef.current) {
        clearTimeout(startDelayRef.current);
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (gapTimerRef.current) {
        clearTimeout(gapTimerRef.current);
      }

      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }

      startDelayRef.current = null;
      timerRef.current = null;
      gapTimerRef.current = null;
      transitionTimerRef.current = null;

      queueRef.current = [];
      queueRunningRef.current = false;
    };
  }, []);

  const getDismissalText = (data) => {
    const type = data.outType?.toUpperCase();

    if (type === "CAUGHT") {
      return `c ${data.fielderName} b ${data.bowlerName}`;
    }

    if (type === "BOWLED") {
      return `b ${data.bowlerName}`;
    }

    if (type === "LBW") {
      return `lbw b ${data.bowlerName}`;
    }

    if (type === "RUN OUT") {
      return `run out (${data.fielderName})`;
    }

    if (type === "STUMPED") {
      return `st ${data.fielderName} b ${data.bowlerName}`;
    }

    if (type === "HIT WICKET") {
      return `hit wicket b ${data.bowlerName}`;
    }

    return data.outType || "";
  };

  // Keep the component mounted even before the first event.
  const data = displayData || {
    name: "",
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    isOutView: false,
  };

  return (
    <div
      className={`${styles.overlayContainer} ${
        visible ? styles.show : styles.hide
      }`}
      aria-hidden={!visible}
    >
      <div className={styles.purpleBaseFrame}></div>
      <div className={styles.whiteBaseFrame}></div>

      {/* ACTUAL BATTING TEAM LOGO */}
      <img
        className={styles.teamLogo}
        src={teamLogo}
        alt=""
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = DEFAULT_LOGO;
        }}
      />

      {/* PLAYER HEADER */}
      <div className={styles.playerHeaderBar}>
        <div className={styles.flagBox}></div>

        <div className={styles.playerInfoText}>
          <span className={styles.pName}>
            {data.name}
          </span>

          <span className={styles.tName}>
            {data.isOutView
              ? getDismissalText(data)
              : data.isBowler
              ? "BOWLER"
              : tournamentName}
          </span>
        </div>

        <div className={styles.iccLogoSpace}></div>
      </div>

      {/* ORIGINAL OKCRICK BATTING STATS */}
      <div className={styles.statsBar}>
        {data.isBowler ? (
          <div
            style={{
              gridColumn: "span 6",
              color: "#fff",
              textAlign: "center",
              fontWeight: "700",
              fontSize: "16px",
              letterSpacing: "1px",
            }}
          >
            OPENING SPELL FROM THE{" "}
            {match?.bowlingTeam?.toUpperCase() ||
              "BOWLING TEAM"}
          </div>
        ) : (
          <>
            <div className={styles.stat}>
              <div className={styles.label}>RUNS</div>
              <div className={styles.hexagon}>
                {data.runs || 0}
              </div>
            </div>

            <div className={styles.stat}>
              <div className={styles.label}>BALLS</div>
              <div className={styles.value}>
                {data.balls || 0}
              </div>
            </div>

            <div className={styles.stat}>
              <div className={styles.label}>4s</div>
              <div className={styles.value}>
                {data.fours || 0}
              </div>
            </div>

            <div className={styles.stat}>
              <div className={styles.label}>6s</div>
              <div className={styles.value}>
                {data.sixes || 0}
              </div>
            </div>

            <div className={styles.stat}>
              <div className={styles.label}>S/R</div>
              <div className={styles.pinkBadge}>
                {strikeRate}
              </div>
            </div>

            <div className={styles.stat}>
              <div className={styles.label}>
                {match?.battingTeam
                  ?.substring(0, 3)
                  .toUpperCase() || "LIVE"}
              </div>

              <div
                className={styles.value}
                style={{
                  fontSize: "15px",
                  fontWeight: "900",
                }}
              >
                {match?.totalRuns || 0}-
                {match?.totalWickets || 0}
              </div>
            </div>
          </>
        )}
      </div>

      <div
        className={`${styles.dotsWrapper} ${styles.left}`}
      >
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
      </div>

      <div
        className={`${styles.dotsWrapper} ${styles.right}`}
      >
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
      </div>
    </div>
  );
};

export default BatsmanStats;
        
