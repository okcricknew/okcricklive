import React, { useState, useEffect, useRef } from 'react';
import styles from './Stats.module.css';

const BatsmanStats = ({ match, onShow, onHide }) => {
  const [displayData, setDisplayData] = useState(null);
  const [visible, setVisible] = useState(false);
  const prevMatchRef = useRef(null);
  const queueRef = useRef([]); // Players queue
  const timerRef = useRef(null);

  const tournamentName = match?.tournamentName || "ICC Men's CWC 2023";

  // 👉 Strike Rate Calculation (Fixed the missing variable issue)
  const strikeRate = displayData?.balls 
    ? ((Number(displayData.runs) / Number(displayData.balls)) * 100).toFixed(1) 
    : "0.0";

  useEffect(() => {
    if (!match) return;

    // Pehli baar load ho raha hai
    if (!prevMatchRef.current) {
      prevMatchRef.current = JSON.parse(JSON.stringify(match));
      return;
    }

    const prevMatch = prevMatchRef.current;
    let playersToShow = [];

    // 1️⃣ WICKET CHECK
    if (Number(match.totalWickets) > Number(prevMatch.totalWickets)) {
      const p1 = prevMatch.striker;
      const p2 = prevMatch.nonStriker;

      if (p1 && match.battingStats?.[p1]?.isOut) {
        playersToShow.push({ 
          name: p1, 
          ...match.battingStats[p1], 
          isOutView: true,
          outType: match.battingStats[p1]?.outType || "",
          fielderName: match.battingStats[p1]?.fielderName || "",
          bowlerName: match.battingStats[p1]?.bowlerName || ""
        });
      }

      if (p2 && match.battingStats?.[p2]?.isOut) {
        playersToShow.push({ 
          name: p2, 
          ...match.battingStats[p2], 
          isOutView: true,
          outType: match.battingStats[p2]?.outType || "",
          fielderName: match.battingStats[p2]?.fielderName || "",
          bowlerName: match.battingStats[p2]?.bowlerName || ""
        });
      }
    }

    // 2️⃣ NEW PLAYER CHECK
    const oldNames = [prevMatch.striker, prevMatch.nonStriker].filter(Boolean);
    if (match.striker && !oldNames.includes(match.striker)) {
      playersToShow.push({ name: match.striker, runs: 0, balls: 0, fours: 0, sixes: 0, isOutView: false });
    }
    if (match.nonStriker && !oldNames.includes(match.nonStriker)) {
      playersToShow.push({ name: match.nonStriker, runs: 0, balls: 0, fours: 0, sixes: 0, isOutView: false });
    }

    // Agar queue me kuch hai, push kare
    if (playersToShow.length > 0) {
      playersToShow.forEach((player, index) => {
        queueRef.current.push(player);

        // 👉 striker ke baad gap add karo
        if (index === 0 && playersToShow.length > 1) {
          queueRef.current.push("GAP");
        }
      });

      if (!timerRef.current && !visible) {
        setTimeout(() => {
          showNextInQueue();
        }, 5000); // small delay so striker properly mount ho
      }
    }

    // Ref update
    prevMatchRef.current = JSON.parse(JSON.stringify(match));
  }, [match]);

  // Function to show next player in queue
  const showNextInQueue = () => {
    if (timerRef.current) return;

    const nextPlayer = queueRef.current.shift();
    // 👉 GAP handle karo
    if (nextPlayer === "GAP") {
      setTimeout(() => {
        showNextInQueue();
      }, 8000); // gap time
      return;
    }
    if (!nextPlayer) return;

    // 🔥 OUT CASE → 5 sec delay
    if (nextPlayer.isOutView) {
      setDisplayData(nextPlayer);
      setVisible(true);
      onShow && onShow();

      timerRef.current = setTimeout(() => {
        setVisible(false);
        onHide && onHide();

        setTimeout(() => {
          timerRef.current = null;
          showNextInQueue();
        }, 600);
      }, 8000);

    } else {
      // ✅ NORMAL CASE
      setDisplayData(nextPlayer);
      setVisible(true);
      onShow && onShow();

      timerRef.current = setTimeout(() => {
        setVisible(false);
        onHide && onHide();

        setTimeout(() => {
          timerRef.current = null;
          showNextInQueue();
        }, 600);
      }, 5000);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!displayData) return null;

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

  return (
    <div className={`${styles.overlayContainer} ${visible ? styles.show : styles.hide}`}>
      <div className={styles.purpleBaseFrame}></div>
      <div className={styles.whiteBaseFrame}></div>

      {/* Top Header */}
      <div className={styles.playerHeaderBar}>
        <div className={styles.flagBox}></div>

        <div className={styles.playerInfoText}>
          <span className={styles.pName}>
            {displayData.name}
          </span>

          <span className={styles.tName}>
            {displayData.isOutView
              ? getDismissalText(displayData)
              : displayData.isBowler
              ? "BOWLER"
              : tournamentName}
          </span>
        </div>

        <div className={styles.iccLogoSpace}>🌍</div>
      </div>

      {/* Stats */}
      <div className={styles.statsBar}>
        {displayData.isBowler ? (
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
            {match?.bowlingTeam?.toUpperCase() || "BOWLING TEAM"}
          </div>
        ) : (
          <>
            <div className={styles.stat}>
              <div className={styles.label}>RUNS</div>
              <div className={styles.hexagon}>{displayData.runs || 0}</div>
            </div>

            <div className={styles.stat}>
              <div className={styles.label}>BALLS</div>
              <div className={styles.value}>{displayData.balls || 0}</div>
            </div>

            <div className={styles.stat}>
              <div className={styles.label}>4s</div>
              <div className={styles.value}>{displayData.fours || 0}</div>
            </div>

            <div className={styles.stat}>
              <div className={styles.label}>6s</div>
              <div className={styles.value}>{displayData.sixes || 0}</div>
            </div>

            <div className={styles.stat}>
              <div className={styles.label}>S/R</div>
              <div className={styles.pinkBadge}>{strikeRate}</div>
            </div>

            <div className={styles.stat}>
              <div className={styles.label}>
                {match?.battingTeam?.substring(0, 3).toUpperCase() || "LIVE"}
              </div>
              <div
                className={styles.value}
                style={{ fontSize: "15px", fontWeight: "900" }}
              >
                {match?.totalRuns || 0}-{match?.totalWickets || 0}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Decorative Dots */}
      <div className={`${styles.dotsWrapper} ${styles.left}`}>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
      </div>

      <div className={`${styles.dotsWrapper} ${styles.right}`}>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
      </div>
    </div>
  );
};

export default BatsmanStats;
          
