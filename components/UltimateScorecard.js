import React, { useMemo } from 'react';
import { Trophy, MapPin, Calendar, User, BarChart3, Target } from 'lucide-react';

export default function UltimateScorecard({ match, tournamentName: propTournamentName }) {
  if (!match) return null;

  const displayTournamentName = propTournamentName || match.tournamentName || "Unnamed Tournament";
  const displayLocation = match.location || "Local Ground";
  const displayDate = match.startDate || "N/A";
  const maxOvers = match.overs || 0;

  const formatOversDisplay = (oversVal, isBallCount = false) => {
    if (oversVal === undefined || oversVal === null || oversVal === 0) return "0.0";
    
    if (isBallCount) {
      const b = Number(oversVal) || 0;
      return `${Math.floor(b / 6)}.${b % 6}`;
    }
    
    const val = String(oversVal);
    if (val.includes('.')) {
      let [ov, bl] = val.split('.').map(Number);
      if (bl >= 6) { ov += Math.floor(bl / 6); bl = bl % 6; }
      return `${ov}.${bl || 0}`;
    }
    return `${val}.0`;
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-8 font-sans selection:bg-[#FACC15] selection:text-[#1D2939]">
      {/* Header Section */}
      <div className="bg-[#1D2939] text-white p-8 rounded-b-[3.5rem] shadow-2xl border-b-4 border-[#FACC15] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-[#FACC15] mb-1 drop-shadow-md">
            {displayTournamentName}
          </h1>
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 text-white">
              {match.matchType || "League"} • {maxOvers} Overs
            </span>
            <div className="bg-[#FACC15] text-[#1D2939] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
              {match.status === 'completed' ? 'Final Result' : 'Live Match'}
            </div>
          </div>
          <div className="flex items-center gap-4 text-white/60 text-[11px] font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1"><MapPin size={12} className="text-[#FACC15]"/> {displayLocation}</span>
            <span className="flex items-center gap-1"><Calendar size={12} className="text-[#FACC15]"/> {displayDate}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-10 px-4 md:px-20 relative z-10">
          <TeamEmblem name={match.teamA} />
          <div className="text-[#FACC15] font-black italic text-2xl tracking-tighter opacity-50">VS</div>
          <TeamEmblem name={match.teamB} />
        </div>
      </div>

      {/* Result / Toss Summary */}
      <div className="mx-6 -mt-8 space-y-3 relative z-20">
        {match.status === 'completed' && match.resultSummary && (
          <div className="bg-white p-5 rounded-3xl shadow-xl flex items-center gap-4 border border-slate-100 transform transition-all hover:scale-[1.02]">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
              <Trophy size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Match Winner</p>
              <h2 className="text-lg font-black text-[#1D2939] italic uppercase leading-none">{match.resultSummary}</h2>
            </div>
          </div>
        )}
        <div className="bg-slate-800 text-white/80 p-3 rounded-2xl text-center text-[10px] font-bold uppercase tracking-[0.2em] border border-white/5 shadow-lg">
          Toss: <span className="text-[#FACC15]">{match.tossWinner}</span> elected to {match.tossDecision}
        </div>
      </div>

      {/* Innings Reports */}
      <div className="w-full space-y-10 md:px-0">
        <InningsReport 
          inningsNum={1}
          match={match}
          maxOvers={maxOvers}
          formatOversDisplay={formatOversDisplay}
        />

        {match.innings === 2 && (
          <div className="bg-blue-600 p-4 rounded-2xl flex justify-between items-center shadow-lg transform transition-all">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg"><Target size={20} className="text-white" /></div>
              <span className="text-xs font-black uppercase text-white tracking-widest">Target Score</span>
            </div>
            <span className="text-2xl font-black text-white italic">{(match.firstInningsScore || 0) + 1}</span>
          </div>
        )}

        {(match.innings === 2 || match.status === 'completed') && (
          <InningsReport 
            inningsNum={2}
            match={match}
            maxOvers={maxOvers}
            formatOversDisplay={formatOversDisplay}
          />
        )}
      </div>

      {/* Man of the Match */}
      {match.mvp && (
        <div className="mx-0 mt-10 bg-[#1D2939] p-2 shadow-2xl text-white flex items-center justify-between border border-white/5 md:mx-12 mb-10 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#FACC15]/10 to-transparent" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-[#FACC15] rounded-2xl flex items-center justify-center text-[#1D2939] shadow-lg">
              <User size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#FACC15] uppercase tracking-widest mb-1">Man of the Match</p>
              <h3 className="text-xl font-black italic uppercase tracking-tight">{match.mvp}</h3>
            </div>
          </div>
          <BarChart3 size={40} className="opacity-10 relative z-10" />
        </div>
      )}
    </div>
  );
}

// Small Sub-component for Team Logos
const TeamEmblem = ({ name }) => (
  <div className="text-center w-1/3 group">
    <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center text-2xl font-black border border-white/20 mb-2 group-hover:bg-white/20 transition-all duration-300 shadow-inner">
      {name ? name[0].toUpperCase() : "?"}
    </div>
    <p className="text-[10px] font-black uppercase italic tracking-tighter truncate px-2">{name || "TBD"}</p>
  </div>
);

function InningsReport({ inningsNum, match, maxOvers, formatOversDisplay }) {
  const isI1 = Number(inningsNum) === 1;
  const backup = match.firstInningsStatsBackup;

  // ✅ PERFORMANCE: Memoize calculations
  const data = useMemo(() => {
    const batting = isI1 ? (backup?.batting || match.battingStats) : match.battingStats;
    const bowling = isI1 ? (backup?.bowling || match.bowlingStats) : match.bowlingStats;
    const score = isI1 ? (match.firstInningsScore || (match.innings === 1 ? match.totalRuns : 0)) : match.totalRuns;
    const wickets = isI1 ? (match.firstInningsWickets || (match.innings === 1 ? match.totalWickets : 0)) : match.totalWickets;
    const teamName = isI1 
      ? (match.innings === 2 ? (match.battingTeam === match.teamA ? match.teamB : match.teamA) : (match.innings === 1 ? match.battingTeam : match.teamA))
      : match.battingTeam;
    
    // --- FIXED BALL LOGIC START ---
    const bowlingWithFix = Object.fromEntries(
      Object.entries(bowling || {}).map(([name, stats]) => {
        // Har bowler ki individual legal balls count karein (Innings lock ke saath)
        const historyBalls = (match.ballHistory || []).filter(ball => {
          const isSameInnings = Number(ball.innings) === Number(inningsNum);
          const isSameBowler = (ball.bowlerId && stats.playerId && ball.bowlerId === stats.playerId) || 
                               (ball.bowler?.trim().toLowerCase() === name.trim().toLowerCase());
          const isLegal = !['WD', 'NB'].includes(ball.type);
          return isSameInnings && isSameBowler && isLegal;
        }).length;

        // Agar ballHistory mein data hai (Live match ya 1st innings back), toh wahi dikhao
        // Warna stats se default value lo (jaise completed matches ke liye)
        const finalVal = historyBalls > 0 ? historyBalls : (stats.balls || stats.bowlerBalls || stats.overs || 0);
        
        // Agar historyBalls hai toh true, taaki formatOversDisplay use "Ball Count" ki tarah handle kare
        const isBall = historyBalls > 0;

        return [name, { ...stats, calculatedVal: finalVal, isBallCount: isBall }];
      })
    );
    // --- FIXED BALL LOGIC END ---

    // Extras logic
    const extrasObj = isI1 ? (match.extras?.innings1 || match.extras) : (match.extras?.innings2 || match.extras);
    const wd = parseInt(extrasObj?.wide || extrasObj?.wd || 0);
    const nb = parseInt(extrasObj?.noBall || extrasObj?.nb || 0);
    const b = parseInt(extrasObj?.bye || extrasObj?.byes || extrasObj?.b || 0);
    const lb = parseInt(extrasObj?.legBye || extrasObj?.legByes || extrasObj?.lb || 0);
    const totalExtras = (parseInt(extrasObj?.total) > 0) ? extrasObj.total : (wd + nb + b + lb);

    // FOW Logic
    let fow = [];
    if (isI1 && backup?.fow) {
      fow = backup.fow;
    } else if (match.ballHistory) {
      fow = match.ballHistory
        .filter(ball => Number(ball.innings) === Number(inningsNum) && (ball.type === 'OUT' || ball.wicketInfo))
        .map((ball, idx) => ({ num: idx + 1, score: ball.runsAtMoment || 0 }));
    }

    return { teamName, score, wickets, batting, bowling: bowlingWithFix, wd, nb, b, lb, totalExtras, fow };
  }, [match, inningsNum, isI1, backup]);

  const getHeaderOvers = () => {
    let rawOvers = "0.0";
    if (isI1 && (match.innings > 1 || match.status === 'completed')) {
      rawOvers = backup?.overs || match.firstInningsOvers || maxOvers;
    } else if (inningsNum === match.innings) {
      rawOvers = `${match.currentOver || 0}.${match.ballsInOver || 0}`;
    }
    return formatOversDisplay(rawOvers);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end border-b-2 border-slate-200 pb-2 pl-2">
        <div>
          <h3 className="font-black italic uppercase text-slate-400 text-[10px] tracking-[0.2em] mb-1">
            {isI1 ? "First Innings" : "Second Innings"}
          </h3>
          <p className="font-black text-[#1D2939] uppercase text-xl leading-none tracking-tighter">{data.teamName || "TBD"}</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-[#1D2939] tabular-nums tracking-tighter">
            {data.score || 0}/{data.wickets || 0}
          </span>
          <p className="text-[10px] font-bold text-slate-400">({getHeaderOvers()}/{maxOvers} Ov)</p>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 overflow-hidden">
        {/* Batting Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead className="bg-slate-50 text-slate-400 uppercase font-black text-[9px] border-b border-slate-100">
              <tr>
                <th className="p-4 text-left">Batter</th>
                <th className="p-4 text-center">R</th>
                <th className="p-4 text-center">B</th>
                <th className="p-4 text-center">4s</th>
                <th className="p-4 text-center">6s</th>
                <th className="p-4 text-right">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
              {Object.entries(data.batting || {}).filter(([_, s]) => s.balls > 0 || s.isOut).map(([name, s]) => (
                <tr key={name} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 uppercase italic leading-tight">
                    <span className="block font-black text-slate-900">{name}</span>
                    <span className={`text-[8px] font-bold ${s.isOut ? 'text-red-400' : 'text-emerald-500'}`}>
                      {s.isOut ? (s.outType || 'Out') : 'Not Out'}
                    </span>
                  </td>
                  <td className="p-4 text-center font-black text-slate-900 text-sm">{s.runs || 0}</td>
                  <td className="p-4 text-center opacity-60 tabular-nums">{s.balls || 0}</td>
                  <td className="p-4 text-center opacity-60 tabular-nums">{s.fours || 0}</td>
                  <td className="p-4 text-center opacity-60 tabular-nums">{s.sixes || 0}</td>
                  <td className="p-4 text-right opacity-60 tabular-nums">
                    {s.balls > 0 ? ((s.runs / s.balls) * 100).toFixed(1) : '0.0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOW Row */}
        <div className="border-t border-slate-100 overflow-x-auto bg-slate-50/30">
          <div className="flex min-w-max p-2 items-center">
            <div className="px-3 py-1 bg-slate-200 rounded-lg text-[8px] font-black uppercase text-slate-500 mr-2">FOW</div>
            {Array.from({ length: 10 }).map((_, i) => {
              const wicket = data.fow.find(f => Number(f.num) === i + 1);
              return (
                <div key={i} className="px-4 border-r border-slate-200 last:border-0 flex flex-col items-center">
                  <span className="text-[7px] text-slate-400 font-bold">{i + 1}w</span>
                  <span className={`text-[10px] font-black ${wicket ? 'text-slate-900' : 'text-slate-300'}`}>
                    {wicket ? wicket.score : "-"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Extras Footer */}
        <div className="bg-[#1D2939] text-white p-4 flex justify-between items-center text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-black uppercase text-[#FACC15] text-[9px] tracking-widest">Extras</span>
            <span className="text-xl font-black tabular-nums">{data.totalExtras}</span>
          </div>
          <div className="flex gap-4 font-black text-white/40 uppercase text-[9px]">
            <span>Wd <span className="text-white ml-1">{data.wd}</span></span>
            <span>Nb <span className="text-white ml-1">{data.nb}</span></span>
            <span>By <span className="text-white ml-1">{data.b}</span></span>
            <span>Lb <span className="text-white ml-1">{data.lb}</span></span>
          </div>
        </div>
      </div>

      {/* Bowling Table */}
      <div className="bg-white shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-[11px]">
          <thead className="bg-slate-800 text-white/50 uppercase font-black text-[9px]">
            <tr>
              <th className="p-4 text-left text-white">Bowler</th>
              <th className="p-4 text-center">O</th>
              <th className="p-4 text-center">M</th>
              <th className="p-4 text-center">R</th>
              <th className="p-4 text-center text-[#FACC15]">W</th>
              <th className="p-4 text-right">ECO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
            {Object.entries(data.bowling || {}).map(([name, s]) => {
               // Use the calculated value for display
               const dispOver = formatOversDisplay(s.calculatedVal || 0, s.isBallCount);
               
               // Economy Calculation
               let tBalls = 0;
               if (s.isBallCount) {
                 tBalls = Number(s.calculatedVal);
               } else {
                 const p = String(s.calculatedVal).split('.');
                 tBalls = (parseInt(p[0]) * 6) + parseInt(p[1] || 0);
               }
               const economy = tBalls > 0 ? (s.runs / (tBalls / 6)).toFixed(2) : '0.00';

               return (
                <tr key={name} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 uppercase italic font-black text-slate-900">{name}</td>
                  <td className="p-4 text-center font-black tabular-nums">{dispOver}</td>
                  <td className="p-4 text-center opacity-60 tabular-nums">{s.maidens || 0}</td>
                  <td className="p-4 text-center font-black tabular-nums">{s.runs || 0}</td>
                  <td className="p-4 text-center text-blue-600 font-black text-sm tabular-nums">{s.wickets || 0}</td>
                  <td className="p-4 text-right opacity-60 tabular-nums">{economy}</td>
                </tr>
               );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
        }
