import React from 'react';
import styles from './Bowling.module.css';

const FirstInningsBowling = ({ match }) => {
  if (!match) return <p>Loading First Innings Scorecard...</p>;

  // --- 1. FIRST INNINGS LOGIC HANDLERS ---
  const isSecondInningsLive = match.innings === 2;
  const firstInningsBackup = match.firstInningsStatsBackup || {};

  // Bowlers Stats Data Filter
  const rawBowlingStats = isSecondInningsLive 
    ? (firstInningsBackup.bowling || {}) 
    : (match.bowlingStats || {});

  const bowlersList = Object.keys(rawBowlingStats).map((name) => {
    const stats = rawBowlingStats[name] || {};
    {/* const overs = stats.overs || 0; */}
    const legalBalls = (match.ballHistory || []).filter(ball => {
  const isSameInnings = Number(ball.innings) === 1;
  const isSameBowler =
    (ball.bowlerId && stats.playerId && ball.bowlerId === stats.playerId) ||
    (ball.bowler?.trim().toLowerCase() === name.trim().toLowerCase());

  return isSameInnings && isSameBowler && !["WD", "NB"].includes(ball.type);
}).length;

    {/* const overs = `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`; */}
    const completedOvers = Math.floor(legalBalls / 6);
const remainingBalls = legalBalls % 6;

const overs =
  remainingBalls === 0
    ? String(completedOvers)
    : `${completedOvers}.${remainingBalls}`;
    
    const maidens = stats.maidens || 0;
    const runs = stats.runs || 0;
    const wickets = stats.wickets || 0;
    
    // Total Balls calculation decimal overs handle karne ke liye (jaise 9.2 overs)
    const totalBalls = typeof overs === 'string' && overs.includes('.') 
      ? parseInt(overs.split('.')[0]) * 6 + parseInt(overs.split('.')[1])
      : Number(overs) * 6;
      
    const economy = totalBalls > 0 ? ((runs / totalBalls) * 6).toFixed(2) : "0.00";

    return { name, overs, maidens, runs, wickets, economy };
  });

  // Fall of Wickets (FOW) Matrix Generation
  const activeFowList = isSecondInningsLive 
    ? (firstInningsBackup.fow || []) 
    : (match.ballHistory || [])
        .filter(ball => ball.innings === 1 && (ball.type === 'OUT' || ball.wicketInfo))
        .map((ball, index) => ({
          num: index + 1,
          score: ball.runsAtMoment || 0
        }));

  // Create 10 blocks list for layout grid alignment
  const fowMatrix = Array.from({ length: 10 }, (_, i) => {
    const targetWicket = activeFowList.find(w => w.num === i + 1);
    return targetWicket ? targetWicket.score : ""; 
  });

  // Extras calculation
  const rawExtras = isSecondInningsLive
    ? (firstInningsBackup.extras || {})
    : (match.extras?.innings1 || match.extras || {});

  const totalExtras = 
    (rawExtras.wd || 0) + 
    (rawExtras.nb || 0) + 
    (rawExtras.byes || 0) + 
    (rawExtras.legByes || 0) + 
    (rawExtras.penalty || 0);

  // Total Score aur Summary Strings
  const totalRuns = isSecondInningsLive ? (firstInningsBackup.totalRuns || 0) : (match.totalRuns || 0);
  {/* const totalOvers = isSecondInningsLive 
    ? (firstInningsBackup.overs || "0.0") 
    : `${match.currentOver || 0}.${match.ballsInOver || 0}`; */}

  const completedOvers =
  (match.currentOver || 0) + (match.ballsInOver === 6 ? 1 : 0);

const totalOvers = isSecondInningsLive
  ? (firstInningsBackup.overs || "0.0")
  : (
      match.ballsInOver === 6
        ? String(completedOvers)
        : `${match.currentOver || 0}.${match.ballsInOver || 0}`
    );

  return (
    <div className={styles.bodyWrapper}>
      <div className={styles.scorecard}>
        
        {/* TOP BAR */}
        <div className={styles.topbar}>
          <div className={styles.matchBox}>
            {match.matchOrderSummary || `MATCH ${match.matchNo || 1}`} - 1ST INNINGS BOWLING
          </div>
        </div>

        {/* HEADER */}
        <div className={styles.header}>
          <div className={`${styles.team} ${styles.teamLeft}`}>
            {match.teamA || "INDIA"}
          </div>
          <div className={styles.centerLogo}>🏆</div>
          <div className={`${styles.team} ${styles.teamRight}`}>
            {match.teamB || "NEW ZEALAND"}
          </div>
        </div>

        {/* VENUE */}
        <div className={styles.venue}>
          {match.location?.toUpperCase() || "okcrick.in"}
        </div>

        {/* CONTENT LAYOUT */}
        <div className={styles.layout}>
          <div className={styles.side}></div>

          <div className={styles.table}>
            {/* Table Headings */}
            <div className={styles.heading}>
              <div>BOWLER</div>
              <div>OVERS</div>
              <div>MAIDENS</div>
              <div>RUNS</div>
              <div>WICKETS</div>
              <div>ECONOMY</div>
            </div>

            {/* Bowler Rows */}
            {bowlersList.length > 0 ? (
              bowlersList.map((bowler, index) => (
                <div className={styles.row} key={index}>
                  <div className={styles.player}>{bowler.name}</div>
                  <div className={styles.stat}>{bowler.overs}</div>
                  <div className={styles.stat}>{bowler.maidens}</div>
                  <div className={styles.stat}>{bowler.runs}</div>
                  <div className={styles.stat}>{bowler.wickets}</div>
                  <div className={styles.stat}>{bowler.economy}</div>
                </div>
              ))
            ) : (
              <div className={styles.row} style={{ justifyContent: 'center', fontSize: '16px', color: '#888' }}>
                No bowling data available for 1st Innings.
              </div>
            )}

            {/* FALL OF WICKETS SECTION */}
            <div className={styles.fowContainer}>
              <div className={`${styles.fowRow} ${styles.headerRow}`}>
  <div className={styles.fowLabel}>Fall of Wickets</div>

  {Array.from({ length: 10 }).map((_, idx) => (
    <div key={idx} className={styles.fowVal}>
      {fowMatrix[idx] !== "" ? idx + 1 : ""}
    </div>
  ))}
</div>
              <div className={`${styles.fowRow} ${styles.scoreRow}`}>
                <div className={styles.fowLabel}>Score</div>
                {fowMatrix.map((score, idx) => (
                  <div key={idx} className={styles.fowVal}>{score}</div>
                ))}
              </div>
            </div>

            {/* SUMMARY FOOTER BAR */}
            <div className={styles.summary}>
              <div className={styles.tournamentName}>
  {(match.tournamentName || match.tournamentTag || match.tournament || "").toUpperCase()}
</div>
              <div>{totalExtras} EXTRAS</div>
              <div>{totalOvers} OVERS</div>
              <div className={styles.total}>{totalRuns}</div>
            </div>

          </div>{/* table */}

          <div className={styles.side}></div>
        </div>{/* layout */}

      </div>{/* scorecard */}
    </div>
  );
};

export default FirstInningsBowling;
         
