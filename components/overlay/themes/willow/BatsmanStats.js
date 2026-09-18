import React, { useState, useEffect, useRef } from 'react';
import styles from './batsmanStats.module.css';

const BatsmanStats = ({ match, onShow, onHide }) => {
  const [displayData, setDisplayData] = useState(null);
  const [visible, setVisible] = useState(false);
  const prevMatchRef = useRef(null);
  const queueRef = useRef([]); // Players queue
  const timerRef = useRef(null);

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
  }, 300); // small delay so striker properly mount ho
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
  }, 800); // gap time
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
    <div className={`${styles.container} ${visible ? styles.show : styles.hide}`}>
      <div className={`${styles.statsBar} ${displayData.isOutView ? styles.outMode : ''}`}>
        <div className={styles.nameSection}>
          {displayData.isOutView && <span className={styles.outTag}>OUT</span>}
          {displayData.name}
        </div>
          
        <div className={styles.dataSection}>
          <div className={styles.box}>R <span className={styles.val}>{displayData.runs || 0}</span></div>
          <div className={styles.box}>B <span className={styles.val}>{displayData.balls || 0}</span></div>
          <div className={styles.box}>4s <span className={styles.val}>{displayData.fours || 0}</span></div>
          <div className={styles.box}>6s <span className={styles.val}>{displayData.sixes || 0}</span></div>
          <div className={styles.srBox}>SR <span className={styles.val}>
            {displayData.balls > 0 ? ((displayData.runs / displayData.balls) * 100).toFixed(1) : '0.0'}
          </span></div>
        </div>

            {displayData.isOutView && displayData.outType && (
  <div className={styles.dismissal}>
    {getDismissalText(displayData)}
  </div>
)}

      </div>
      <div className={styles.scoreBar}>
        <div className={styles.teamName}>{match.battingTeam?.substring(0, 3).toUpperCase()}</div>
        <div className={styles.liveScore}>{match.totalRuns}-{match.totalWickets}</div>
        <div className={styles.oversInfo}>{match.currentOver}.{match.ballsInOver} OV</div>
      </div>
    </div>
  );
};

export default BatsmanStats;
