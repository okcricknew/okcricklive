// ✅ TOP BATTERS
export const getTopBatters = (battingStats = {}) => {
  return Object.entries(battingStats || {})
    .sort((a, b) => (b[1].runs || 0) - (a[1].runs || 0))
    .slice(0, 4)
    .map(([name, s]) => ({
      name,
      runs: s.runs || 0,
      balls: s.balls || 0
    }));
};

// ✅ TOP BOWLERS
export const getTopBowlers = (
  bowlingStats = {},
  match = {}
) => {
  if (!bowlingStats) return [];
  return Object.entries(bowlingStats || {})

    .filter(([_, s]) => (s.wickets > 0 || s.runs > 0 || s.balls > 0 || s.overs > 0))

    .sort((a, b) => (b[1].wickets || 0) - (a[1].wickets || 0) || (a[1].runs || 0) - (b[1].runs || 0))
    
    .slice(0, 4)
    .map(([name, s]) => ({
      name,
      wickets: s.wickets || 0,
      runs: s.runs || 0,

      // ✅ ADD THIS LINE
  overs: (() => {

  const legalBalls = (match?.ballHistory || []).filter(ball => {

    const isSameBowler =
      ball.bowler?.trim().toLowerCase() ===
      name.trim().toLowerCase()

    const isLegal =
      !["WD", "NB"].includes(ball.type)

    return isSameBowler && isLegal

  }).length

  const over = Math.floor(legalBalls / 6)
const balls = legalBalls % 6

return balls === 0
  ? `${over}`
  : `${over}.${balls}`

})()
    }));
};

// ✅ INNINGS DATA (FULL FIX)
export const getInningsData = (match, inningsNum) => {
  const currentMatchInnings = match.innings || 1; 
  const isTargetInningsFirst = inningsNum === 1;

  // Determine which team batted first
  const firstBattingTeam = match.firstInningsBattingTeam || (
  match.tossDecision?.toLowerCase() === 'bat' 
    ? match.tossWinner 
    : (match.tossWinner === match.teamA ? match.teamB : match.teamA)
) || match.teamA;
  
  const secondBattingTeam = firstBattingTeam === match.teamA ? match.teamB : match.teamA;

    // Over calculation handle karne ke liye (0.6 -> 1.0)
  const formatOvers = (over, balls) => {
    let o = Number(over || 0);
    let b = Number(balls || 0);
    if (b >= 6) {
      o += Math.floor(b / 6);
      b = b % 6;
    }
    return `${o}.${b}`;
  };
  

  return {
    team: isTargetInningsFirst ? firstBattingTeam : secondBattingTeam,
    
    // Runs/Wickets logic based on current live state
    runs: isTargetInningsFirst
  ? (currentMatchInnings === 1 ? (match.totalRuns || 0) : (match.firstInningsScore || 0))
  : (currentMatchInnings >= 2 ? (match.totalRuns || 0) : 0),
    
    
    wickets: isTargetInningsFirst
      ? (currentMatchInnings === 1 ? match.totalWickets : match.firstInningsWickets || 0)
      : (currentMatchInnings === 2 ? match.totalWickets : 0),
    
        overs: isTargetInningsFirst
      ? (currentMatchInnings === 1 ? formatOvers(match.currentOver, match.ballsInOver) : match.overs)
      : (currentMatchInnings === 2 ? formatOvers(match.currentOver, match.ballsInOver) : "0.0"),
    
    
    // Batting Stats Fix
batting: isTargetInningsFirst
  ? (currentMatchInnings === 1 ? match.battingStats : (match.firstInningsStatsBackup?.batting || {}))
  : (currentMatchInnings >= 2 ? match.battingStats : {}),

// Bowling Stats Fix
bowling: isTargetInningsFirst
  ? (currentMatchInnings === 1 ? match.bowlingStats : (match.firstInningsStatsBackup?.bowling || {}))
  : (currentMatchInnings >= 2 ? match.bowlingStats : {}),
    
  };
};
