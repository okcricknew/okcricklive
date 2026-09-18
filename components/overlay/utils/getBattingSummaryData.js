export const getBattingSummaryData = (match) => {

  const inningsKey = `innings${match?.innings || 1}`;
const ex = match?.extras?.[inningsKey] || {};
  
  return {
    teamName: match?.battingTeam,

    data: Object.entries(match?.battingStats || {}).map(([playerName, p]) => ({
      name: p.name || playerName || "Unknown",
      
      r: p.runs || 0,
      b: p.balls || 0,
      fours: p.fours || 0,
      sixes: p.sixes || 0,
      sr: p.balls ? ((p.runs / p.balls) * 100).toFixed(1) : "0.0",
      notOut: !p.isOut
    })),


extras: {
  total:
    (ex.wd || 0) +
    (ex.nb || 0) +
    (ex.legByes || 0) +
    (ex.byes || 0),

  w: ex.wd || 0,
  nb: ex.nb || 0,
  lb: ex.legByes || 0
},

    total: `${match?.totalRuns || 0}/${match?.totalWickets || 0}`,
    overs: (() => {
  const o = Number(match?.currentOver || 0);
  const b = Number(match?.ballsInOver || 0);

  if (b === 6) {
    return `${o + 1}.0`;
  }

  return `${o}.${b}`;
})()
  }
}
