import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { Trophy, User, Medal, CheckCircle2, ChevronRight } from 'lucide-react';

export default function MatchCompletedModal({ isOpen, match, onClose, onFinishMatch, players = [] }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // --- 1. WINNER & RESULT LOGIC ---
  const matchResult = useMemo(() => {
    if (!match || !match.teamA) return { winnerTeam: "", text: "MATCH FINISHED" };

    const firstInningsScore = match?.firstInningsScore || 0;
    const secondInningsScore = match?.totalRuns || 0;
    const target = firstInningsScore + 1;
    const matchOvers = match?.overs || 0;
    
    const currentBallsBowled = (match?.currentOver || 0) * 6 + (match?.ballsInOver || 0);
    const totalMatchBalls = matchOvers * 6;

    if (secondInningsScore >= target) {
      const winner = match?.battingTeam || "Batting Team";
      const wicketsLeft = 10 - (match?.totalWickets || 0);
      return {
        winnerTeam: winner,
        text: `${String(winner).toUpperCase()} WON BY ${wicketsLeft} WICKETS`
      };
    }

    const isAllOut = (match?.totalWickets || 0) >= 10;
    const isOversFinished = currentBallsBowled >= totalMatchBalls;

    if (isAllOut || isOversFinished) {
      if (secondInningsScore === firstInningsScore) {
        return { winnerTeam: "TIE", text: "MATCH TIED" };
      } else {
        const winner = match?.battingTeam === match?.teamA ? match?.teamB : match?.teamA;
        const runsMargin = firstInningsScore - secondInningsScore;
        return {
          winnerTeam: winner,
          text: `${String(winner).toUpperCase()} WON BY ${runsMargin} RUNS`
        };
      }
    }

    return { winnerTeam: "", text: "MATCH COMPLETED" };
  }, [match]);

    // --- 2. MVP LOGIC (FIXED TO READ BOTH INNINGS) ---
  const playersWithLiveStats = useMemo(() => {
    const playerList = Array.isArray(players) ? players : [];
    
    // Dono innings ke stats ko merge karo taaki MVP dhoondhna asaan ho
    const allBatting = { 
      ...(match?.firstInningsStatsBackup?.batting || {}), 
      ...(match?.battingStats || {}) 
    };
    const allBowling = { 
      ...(match?.firstInningsStatsBackup?.bowling || {}), 
      ...(match?.bowlingStats || {}) 
    };

    return playerList.map(p => {
      // Player ke stats ya toh Innings 1 mein honge ya current innings mein
      const bStats = allBatting[p.name] || {};
      const bowlStats = allBowling[p.name] || {};
      
      const runs = bStats.runs || 0;
      const wkts = bowlStats.wickets || 0;
      const runsGiven = bowlStats.runs || 0;
      
      // Performance score calculation
      const perfScore = runs + (wkts * 25) - (runsGiven * 0.5); 
      
      return {
        ...p,
        runsScored: runs,
        wicketsTaken: wkts,
        ballsFaced: bStats.balls || 0,
        perfScore
      };
    }).sort((a, b) => (b.perfScore || 0) - (a.perfScore || 0));
  }, [players, match]);
  
  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[10005] flex items-end justify-center">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" 
            onClick={onClose} 
          />
          
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            className="relative bg-[#F8F9FA] rounded-t-[40px] w-full max-w-lg overflow-hidden flex flex-col pt-3 pb-8 px-4 max-h-[92vh] shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-slate-300 rounded-full self-center mb-6 shrink-0" />
            
            <div className="flex flex-col items-center mb-6 text-center shrink-0">
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }}
                className="bg-yellow-400 p-4 rounded-[2rem] mb-4 shadow-xl"
              >
                <Trophy size={40} className="text-slate-900" />
              </motion.div>
              
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Match Result</h2>
              <div className="px-4 py-3 rounded-2xl bg-white border-2 border-slate-100 shadow-sm">
                <span className="text-xl font-black italic text-slate-900 uppercase tracking-tighter">
                  {matchResult.text}
                </span>
              </div>
            </div>

            {/* Score Comparison - Fixed Dynamic Logic */}
<div className="grid grid-cols-2 gap-3 mb-6 shrink-0">
  
  {/* LEFT SIDE: Team A Box */}
  <div className={`p-4 rounded-3xl border-2 bg-white transition-all ${matchResult.winnerTeam === match?.teamA ? 'border-yellow-500 shadow-lg' : 'border-slate-100 opacity-60'}`}>
    <p className="text-[9px] font-black text-slate-400 uppercase mb-1 truncate">{match?.teamA || 'Team A'}</p>
    <p className="font-black text-2xl text-slate-900 tabular-nums">
      {/* Logic: Check karo current batting team kaunsi hai */}
      {match?.battingTeam === match?.teamA 
        ? `${match?.totalRuns || 0}/${match?.totalWickets || 0}`
        : `${match?.firstInningsScore || 0}/${match?.firstInningsWickets ?? 0}`
      }
    </p>
  </div>

  {/* RIGHT SIDE: Team B Box */}
  <div className={`p-4 rounded-3xl border-2 bg-white transition-all ${matchResult.winnerTeam === match?.teamB ? 'border-yellow-500 shadow-lg' : 'border-slate-100 opacity-60'}`}>
    <p className="text-[9px] font-black text-slate-400 uppercase mb-1 truncate">{match?.teamB || 'Team B'}</p>
    <p className="font-black text-2xl text-slate-900 tabular-nums">
      {match?.battingTeam === match?.teamB 
        ? `${match?.totalRuns || 0}/${match?.totalWickets || 0}`
        : `${match?.firstInningsScore || 0}/${match?.firstInningsWickets ?? 0}`
      }
    </p>
  </div>
</div>
      

            <h3 className="font-black uppercase text-[10px] text-slate-500 tracking-widest flex items-center gap-2 mb-3 shrink-0 px-2">
              <Medal size={14} className="text-yellow-500" /> Select MVP
            </h3>
            
            <div className="overflow-y-auto flex-1 mb-6 space-y-2 no-scrollbar px-1 min-h-0">
               {playersWithLiveStats.map((p, idx) => (
                  <div 
                    key={p.id || `player-${idx}`} 
                    onClick={() => setSelectedPlayer(p.id)}
                    className={`flex items-center justify-between p-4 rounded-[1.5rem] border-2 transition-all cursor-pointer ${
                      selectedPlayer === p.id 
                        ? 'bg-slate-900 border-slate-900 shadow-md' 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                         selectedPlayer === p.id ? 'bg-yellow-400 text-slate-900' : 'bg-slate-100 text-slate-400'
                       }`}>
                          <User size={20} />
                       </div>
                       <div className="flex flex-col">
                          <p className={`font-black uppercase text-xs ${selectedPlayer === p.id ? 'text-white' : 'text-slate-800'}`}>
                            {p.name}
                          </p>
                          <span className={`text-[8px] font-bold uppercase ${selectedPlayer === p.id ? 'text-yellow-400' : 'text-slate-400'}`}>
                            {p.team}
                          </span>
                       </div>
                    </div>

                    <div className="text-right">
                       <p className={`font-black text-sm tabular-nums ${selectedPlayer === p.id ? 'text-white' : 'text-slate-900'}`}>
                         {p.runsScored} <span className="text-[9px] opacity-50">R</span>
                       </p>
                       <p className={`font-black text-[9px] uppercase ${selectedPlayer === p.id ? 'text-yellow-400' : 'text-red-500'}`}>
                         {p.wicketsTaken} W
                       </p>
                    </div>
                  </div>
               ))}
            </div>

            <div className="grid grid-cols-2 gap-3 shrink-0">
               <button 
                  type="button"
                  onClick={onClose} 
                  className="py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 bg-white border-2 border-slate-100 active:scale-95 transition-transform"
               >
                  Cancel
               </button>
               
<button 
  type="button"
  disabled={!selectedPlayer}
  onClick={() => {
    // Selected ID se pura player object dhoondo
    const p = playersWithLiveStats.find(player => player.id === selectedPlayer);
    if (p) {
      // Name aur ID dono bhejo useScoringLogic ko
      onFinishMatch({ id: p.id, name: p.name });
    }
  }}
  className="py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest disabled:opacity-20 active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
>
  Finalize <ChevronRight size={16} strokeWidth={3} />
</button>
    
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
              }
                    
