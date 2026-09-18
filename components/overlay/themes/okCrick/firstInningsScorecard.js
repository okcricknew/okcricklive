import React, { useState, useEffect } from 'react';
import styles from './ScoreCard.module.css';

const FirstInningsScorecard = ({ match }) => {
  if (!match) return <div style={{ color: 'white', textAlign: 'center' }}>Loading Match Data...</div>;

  const isFirstInningsSaved = match.firstInningsStatsBackup;
  const battingStats = isFirstInningsSaved ? match.firstInningsStatsBackup.batting : match.battingStats || {};
  const totalRuns = isFirstInningsSaved ? match.firstInningsStatsBackup.totalRuns : match.totalRuns || 0;
  const totalWickets = isFirstInningsSaved ? match.firstInningsStatsBackup.totalWickets : match.totalWickets || 0;
{/* const oversBowled = isFirstInningsSaved ? match.firstInningsStatsBackup.overs : `${match.currentOver || 0}.${match.ballsInOver || 0}`; */}

const completedOvers =
  (match.currentOver || 0) + (match.ballsInOver === 6 ? 1 : 0);

const oversBowled = isFirstInningsSaved
  ? match.firstInningsStatsBackup.overs
  : (
      match.ballsInOver === 6
        ? String(completedOvers)
        : `${match.currentOver || 0}.${match.ballsInOver || 0}`
    );
  
  const extrasData = isFirstInningsSaved ? match.firstInningsStatsBackup.extras : (match.extras?.innings1 || {});
  const totalExtras = Object.values(extrasData).reduce((sum, val) => sum + (Number(val) || 0), 0);

  // --- REAL-TIME RE-RENDER LOGIC ---
  const [battingArray, setBattingArray] = useState([]);

  useEffect(() => {
    if (!battingStats) return;

    const rawArray = Object.entries(battingStats).map(([name, stats]) => ({
      name: name.trim().toUpperCase(),
      ...stats,
    }));

    const rawBattingPlayers = isFirstInningsSaved 
      ? (match.firstInningsStatsBackup.battingPlayers || []) 
      : (match.battingPlayers || []);

    const battingPlayersOrder = rawBattingPlayers.map(name => name.trim().toUpperCase());

    const sorted = rawArray.sort((a, b) => {
      const indexA = battingPlayersOrder.indexOf(a.name);
      const indexB = battingPlayersOrder.indexOf(b.name);
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA === -1 && indexB !== -1) return 1;
      if (indexB === -1 && indexA !== -1) return -1;
      return 0;
    });

    setBattingArray([...sorted]);

  }, [match?.battingStats, match?.battingPlayers, isFirstInningsSaved]);

  const renderDismissal = (player) => {
    if (!player.isOut) {
      if (player.retiredHurt) return { part1: 'Retired Hurt', part2: '' };
      return { part1: 'not out', part2: '' };
    }

    const type = player.outType?.toUpperCase() || '';
    const fielder = player.fielderName ? ` ${player.fielderName}` : '';
    const bowler = player.bowlerName ? ` b ${player.bowlerName}` : '';

    if (type === 'CAUGHT') return { part1: `c${fielder}`, part2: bowler };
    if (type === 'BOWLED') return { part1: '', part2: `b ${player.bowlerName}` };
    if (type === 'LBW') return { part1: 'lbw', part2: bowler };
    if (type === 'STUMPED') return { part1: `st${fielder}`, part2: bowler };
    if (type === 'RUN OUT') return { part1: `run out (${player.fielderName || 'Fielder'})`, part2: '' };
    
    return { part1: player.outType || 'out', part2: '' };
  };

  return (
    <div className={styles.bodyWrapper}>
      <div className={styles.scorecardContainer}>
        
        <div className={styles.matchStatusBar}>
          <div className={styles.matchStatusText}>
            {match.matchNumberSummary || "MATCH 1ST INNINGS"}
          </div>
        </div>

        <div className={styles.teamsHeader}>
          <div className={`${styles.teamBox} ${styles.teamLeft}`}>
            {match.teamA?.toUpperCase() || "TEAM A"}
          </div>
{/* <div className={styles.vsLogo}>🏆</div> */}

<div className={styles.vsLogo}>
  {match.logoUrl ? (
    <img 
      src={match.logoUrl} 
      alt="Tournament Logo" 
      style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
    />
  ) : (
    "🏆"
  )}
</div>
    
    
          <div className={`${styles.teamBox} ${styles.teamRight}`}>
            {match.teamB?.toUpperCase() || "TEAM B"}
          </div>
        </div>

        <div className={styles.venueBar}> LIVE FROM: 
          {match.location?.toUpperCase() || "okcrick.in"}
        </div>

        <div className={styles.lowerScorecardLayout}>
          <div className={styles.sidePatternContainer}></div>

          <div className={styles.mainContent}>
            {battingArray.map((player) => {
              const dismissal = renderDismissal(player);
              
              const currentStrikerName = match.striker ? match.striker.trim().toUpperCase() : '';
              const isCurrentStriker = currentStrikerName === player.name && match.status === 'live';

              const activeRowStyle = isCurrentStriker ? styles.highlightRow : styles.playerRow;

              return (
                <div key={player.name} className={activeRowStyle}>
                  <div className={styles.batter}>{player.name?.toUpperCase()}</div>
                  <div className={styles.dismissal}>{dismissal.part1}</div>
                  <div className={styles.dismissal2}>{dismissal.part2}</div>
                  <div className={styles.runs}>{player.runs || 0}</div>
                  <div className={styles.balls}>{player.balls || 0}</div>
                </div>
              );
            })}

            <div className={styles.summaryBar}>
              <div className={styles.tournamentName}>
  {(match.tournamentName || match.tournamentTag || match.tournament || "").toUpperCase()}
</div>
              <div>{totalExtras} EXTRAS</div>
              <div>{oversBowled} OVERS</div>
              <div className={styles.totalScore}>
                {totalRuns}/{totalWickets}
              </div>
            </div>

          </div>

          <div className={styles.sidePatternContainer}></div>
        </div>

      </div>
    </div>
  );
};

export default FirstInningsScorecard;
          
