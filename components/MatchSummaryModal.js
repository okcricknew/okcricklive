import React, { useMemo, useState, useEffect } from 'react'; // Added useEffect
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Home, Trophy, BarChart2, User, Medal, FileText } from 'lucide-react';
import UltimateScorecard from './UltimateScorecard'; 
import OverlayControlModal from "./overlay/themes/OverlayControlModal";

export default function MatchSummaryModal({ isOpen, match: initialMatch, onClose, tournamentName, tId }) {
  const [showFullScorecard, setShowFullScorecard] = useState(false);
  const [openOverlay, setOpenOverlay] = useState(false);
  
  // --- SYNC UPDATE (Bina Refresh Data Update Karega) ---
  const [match, setMatch] = useState(initialMatch);

  useEffect(() => {
    if (initialMatch) {
      setMatch(initialMatch);
    }
  }, [initialMatch]);

  if (!isOpen || !match) return null;

  // --- 1. SMART FORMATTER (Accuracy Fix) ---
  const formatOversDisplay = (oversVal, isBallCount = false) => {
    if (oversVal === undefined || oversVal === null) return "0.0";
    
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

  const formatToOvers = (totalBalls) => {
  if (!totalBalls) return "0.0";
  const overs = Math.floor(Number(totalBalls) / 6);
  const balls = Number(totalBalls) % 6;
  return `${overs}.${balls}`;
};
  
  const maxOvers = match?.overs || 0;

  // --- 2. HEADER OVER CALCULATION (Innings 1 vs Innings 2 Fix) ---
  const getHeaderOvers = (inningsNum) => {
    const isCompleted = match.status === 'completed' || match.matchStatus === 'completed';

    if (inningsNum === match.innings && !isCompleted) {
      return `${match.currentOver || 0}.${match.ballsInOver || 0}`;
    }
    
    if (inningsNum === 1 && (match.innings > 1 || isCompleted)) {
      if (match.firstInningsStatsBackup?.overs) return match.firstInningsStatsBackup.overs;
      
      const i1Balls = (match.ballHistory || []).filter(b => b.innings === 1 && !['WD', 'NB'].includes(b.type)).length;
      return i1Balls > 0 ? formatOversDisplay(i1Balls, true) : (match.firstInningsOvers || maxOvers);
    }

    if (isCompleted && inningsNum === 2) {
      const i2Balls = (match.ballHistory || []).filter(b => b.innings === 2 && !['WD', 'NB'].includes(b.type)).length;
      if (i2Balls > 0) return formatOversDisplay(i2Balls, true);
      return match.totalOversUsed || `${match.currentOver || 0}.${match.ballsInOver || 0}`;
    }

    return "0.0";
  };

              // --- 3. BOWLER/BATTER STATS (Multi-Innings History Fix) ---
  const getInningsStats = (inningsNum, type = 'bat') => {
  const targetInnings = Number(inningsNum);
  const isFirst = targetInnings === 1;
  
  let source = {};
  if (isFirst) {
    source = type === 'bat' 
      ? (match.firstInningsStatsBackup?.batting || match.battingStats || {}) 
      : (match.firstInningsStatsBackup?.bowling || match.bowlingStats || {});
  } else {
    source = type === 'bat' ? (match.battingStats || {}) : (match.bowlingStats || {});
  }
  
  return Object.entries(source)
    .filter(([key]) => !['isOut', 'playerId', 'dismissal', 'fielder'].includes(key))
    .sort((a, b) => type === 'bat' ? (b[1].runs || 0) - (a[1].runs || 0) : (b[1].wickets || 0) - (a[1].wickets || 0))
    .map(([name, stats]) => {
      if (type === 'bowl') {
        // --- FIXED LOGIC: Sirf is specific bowler ki legal balls count karein ---
        const bowlerLegalBalls = (match.ballHistory || []).filter(ball => {
          const isSameInnings = Number(ball.innings) === targetInnings;
          // Player ID priority hai, fir Name matching
          const isSameBowler = (ball.bowlerId && stats.playerId && ball.bowlerId === stats.playerId) || 
                               (ball.bowler?.trim().toLowerCase() === name.trim().toLowerCase());
          const isLegal = !['WD', 'NB'].includes(ball.type);
          return isSameInnings && isSameBowler && isLegal;
        }).length;

        return [name, { ...stats, calculatedBalls: bowlerLegalBalls }];
      }
      return [name, stats];
    }).slice(0, 3);
};
  
  
  // --- 4. MVP LOGIC (SARAT Stats Fix) ---
  const mvpData = useMemo(() => {
    const mvpId = match.mvpPlayerId;
    const mvpName = match.mvp;
    if (!mvpId && !mvpName) return null;

    const allBatting = { ...(match.firstInningsStatsBackup?.batting || {}), ...(match.battingStats || {}) };
    const allBowling = { ...(match.firstInningsStatsBackup?.bowling || {}), ...(match.bowlingStats || {}) };

    const nameKey = Object.keys(allBatting).find(n => allBatting[n].playerId === mvpId) || 
                    Object.keys(allBowling).find(n => allBowling[n].playerId === mvpId) || 
                    mvpName;

    const bS = allBatting[nameKey] || {};
    const wS = allBowling[nameKey] || {};

    return { name: nameKey, runs: bS.runs || 0, wickets: wS.wickets || 0 };
  }, [match]);

  const renderInningsCard = (inningsNum) => {
    const isFirst = inningsNum === 1;
    let teamName, score, wkt;

    if (isFirst) {
      teamName = match.innings === 1 ? match.battingTeam : (match.battingTeam === match.teamA ? match.teamB : match.teamA);
      score = match.innings === 1 ? (match.totalRuns || 0) : (match.firstInningsScore || 0);
      wkt = match.innings === 1 ? (match.totalWickets || 0) : (match.firstInningsWickets || 0);
    } else {
      teamName = match.innings === 2 ? match.battingTeam : (match.battingTeam === match.teamA ? match.teamB : match.teamA);
      score = match.totalRuns || 0;
      wkt = match.totalWickets || 0;
    }

    const displayOvers = formatOversDisplay(getHeaderOvers(inningsNum));
    const topBatters = getInningsStats(inningsNum, 'bat');
    const topBowlers = getInningsStats(inningsNum, 'bowl');

    return (
      <div key={inningsNum} className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden mb-4">
        <div className={`px-5 py-3 flex justify-between items-center ${!isFirst ? 'bg-blue-600' : 'bg-slate-900'} text-white`}>
          <div>
            <p className="text-[9px] font-black opacity-60 uppercase">Innings {inningsNum}</p>
            <p className="font-black uppercase text-sm truncate w-32">{teamName}</p>
          </div>
          <div className="text-right">
            <p className="font-black text-xl tabular-nums">{score}/{wkt}</p>
            <p className="text-[10px] font-bold opacity-70">({displayOvers}/{maxOvers} Ov)</p>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-slate-100 p-3">
          <div className="pr-1">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Batting</p>
            {topBatters.map(([name, s]) => (
              <div key={name} className="flex justify-between text-[11px] mb-1">
                <span className="font-bold text-slate-700 truncate w-20 uppercase">{name}</span>
                <span className="font-black tabular-nums">{s.runs || 0}({s.balls || 0})</span>
              </div>
            ))}
          </div>
          <div className="pl-3">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Bowling</p>
            {topBowlers.map(([name, s]) => (
  <div key={name} className="flex justify-between text-[11px] mb-1">
    <span className="font-bold text-slate-600 truncate w-20 uppercase">{name}</span>
    <span className="font-black text-red-600 tabular-nums text-right flex gap-1.5 items-center">
      {(s.wickets || 0)}-{(s.runs || 0)}
      <span className="text-[9px] text-slate-400 font-bold">
        {/* YAHAN TABDEELI KAREIN */}
        {formatToOvers(s.calculatedBalls)}
      </span>
    </span>
  </div>
))}
  
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10005] bg-[#F4F4F4] flex flex-col overflow-hidden text-slate-900">
        <div className="bg-white border-b p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={showFullScorecard ? () => setShowFullScorecard(false) : onClose}><ChevronLeft size={24} /></button>
            <h2 className="font-black uppercase text-xs tracking-widest">{showFullScorecard ? "Full Scorecard" : "Match Summary"}</h2>
          </div>
          <button onClick={() => setShowFullScorecard(!showFullScorecard)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${showFullScorecard ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <FileText size={16} /><span className="text-[10px] font-black uppercase">{showFullScorecard ? "Summary" : "Details"}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-24 px-4">
          {showFullScorecard ? (
            <UltimateScorecard match={match} tournamentName={tournamentName} />
          ) : (
            <>
              <div className="bg-[#0A0A0A] text-white p-6 my-4 rounded-[28px] shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-center relative z-10 mb-4">
                  <div className="text-center flex-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase truncate">{match.teamA}</p>
                    <p className="text-2xl font-black tabular-nums">
                      {match.innings === 1 ? (match.totalRuns || 0) : (match.battingTeam === match.teamA ? (match.totalRuns || 0) : (match.firstInningsScore || 0))}/
                      {match.innings === 1 ? (match.totalWickets || 0) : (match.battingTeam === match.teamA ? (match.totalWickets || 0) : (match.firstInningsWickets || 0))}
                    </p>
                  </div>
                  <div className="font-black italic text-slate-700 mx-2 text-xs">VS</div>
                  <div className="text-center flex-1">
                    <p className="text-[9px] font-black text-blue-400 uppercase truncate">{match.teamB}</p>
                    <p className="text-2xl font-black text-blue-400 tabular-nums">
                      {match.innings === 1 ? 0 : (match.battingTeam === match.teamB ? (match.totalRuns || 0) : (match.firstInningsScore || 0))}/
                      {match.innings === 1 ? 0 : (match.battingTeam === match.teamB ? (match.totalWickets || 0) : (match.firstInningsWickets || 0))}
                    </p>
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl py-2 text-center text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-4">
                  {match.resultSummary || "Match Finished"}
                </div>
                {mvpData && (
                  <div className="bg-yellow-500 rounded-2xl p-3 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-2 max-w-[65%]">
                      <div className="bg-black/20 p-1.5 rounded-lg text-white shrink-0"><Medal size={18}/></div>
                      <div className="overflow-hidden">
                        <p className="text-[8px] font-black text-black/60 uppercase">Player of the Match</p>
                        <p className="text-xs font-black text-black uppercase truncate">{mvpData.name}</p>
                      </div>
                    </div>
                    <div className="text-right text-black font-black border-l border-black/10 pl-3 shrink-0">
                      <p className="text-xs tabular-nums">{mvpData.runs} runs</p>
                      <p className="text-[9px] text-black/50 tabular-nums">{mvpData.wickets} wickets</p>
                    </div>
                  </div>
                )}
              </div>
              
              {renderInningsCard(1)}
              {(match.innings >= 2 || match.status === 'completed') && renderInningsCard(2)}
            </>
          )}
        </div>

        <div className="w-full h-14 flex items-center justify-center bg-slate-900 shrink-0 border-t border-white/5 absolute bottom-0">
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={() => setOpenOverlay(true)}
    className="text-white text-[15px] font-black uppercase tracking-[0.2em]"
  >
    Overlay Control
  </motion.button>
</div>
      </motion.div>

            <OverlayControlModal
        isOpen={openOverlay}
        onClose={() => setOpenOverlay(false)}
        tId={tId || match?.tournamentId || match?.tId || initialMatch?.tournamentId}
        matchId={match?.id || match?.matchId || initialMatch?.id || initialMatch?.matchId}
        match={match}
      />
          
    </AnimatePresence>
  );
}

function NavItem({ icon, label, active = false }) {
  return (
    <div className={`flex flex-col items-center gap-0.5 ${active ? 'text-blue-600' : 'text-slate-400'}`}>
      {icon}
      <span className="text-[8px] font-black uppercase tracking-tight">{label}</span>
    </div>
  );
      }
