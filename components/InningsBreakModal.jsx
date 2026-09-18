import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronRight } from 'lucide-react';
import OverlayControlModal from "./overlay/themes/OverlayControlModal";

export default function InningsBreakModal({ isOpen, onClose, match, onStartNextInnings }) {
  const [isStarting, setIsStarting] = useState(false);
  const [openOverlay, setOpenOverlay] = useState(false);

  if (!isOpen || !match || match.innings !== 1) return null;

  const firstInningsRuns = match?.totalRuns || 0;
  const firstInningsWickets = match?.totalWickets || 0;
  const targetRuns = firstInningsRuns + 1;
  const fieldingTeam = match?.battingTeam === match?.teamA ? match?.teamB : match?.teamA;

  const getFinalOvers = () => {
    const overs = parseInt(match?.currentOver || 0);
    const balls = parseInt(match?.ballsInOver || 0);
    if (balls === 6) return `${overs + 1}.0`;
    return `${overs}.${balls}`;
  };

    const handleStartAction = async () => {
    if (isStarting) return;
    try {
      setIsStarting(true);
      const finalOversValue = getFinalOvers();
      
      // 1. Firebase aur parent me next innings trigger karein
      await onStartNextInnings(finalOversValue);
      
      // 2. 200ms ka delay taaki PlayerSelectionModal pehle piche render ho jaye,
      // uske baad hi InningsBreakModal band ho. Isse beech me scoreboard nahi dikhega.
      setTimeout(() => {
        onClose();
        setIsStarting(false);
      }, 200);

    } catch (error) {
      console.error("Error starting second innings:", error);
      setIsStarting(false);
    }
  };
  

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10001] flex items-center justify-center px-4">

        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={!isStarting ? onClose : undefined}
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative bg-[#F8F9FA] rounded-3xl w-full max-w-md overflow-hidden flex flex-col items-center py-6 px-5 shadow-2xl"
        >

          <div className="bg-slate-900 text-white text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-[0.25em] mb-3">
            Innings Complete
          </div>

          <h2 className="text-slate-900 text-xl font-black mb-4 italic uppercase tracking-tight">
            1st Innings Summary
          </h2>

          {/* Score Card Section */}
          <div className="w-full bg-white rounded-xl p-4 shadow-sm border border-slate-100 mb-3 relative overflow-hidden">
            
            <div className="absolute top-0 right-0 bg-[#C10E44] text-white text-[8px] font-bold px-3 py-1 rounded-bl-lg uppercase">
              Final
            </div>
            
            <h3 className="text-[#C10E44] font-black text-lg uppercase mb-1 truncate pr-12">
              {match?.battingTeam || "Team"}
            </h3>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tabular-nums">
                {firstInningsRuns}/{firstInningsWickets}
              </span>
              <span className="text-slate-400 font-bold text-sm italic">
                ({getFinalOvers()}/{match?.overs || 0})
              </span>
            </div>

          </div>

          {/* Divider */}
          <div className="flex items-center w-full gap-3 my-3">
            <div className="h-[1px] flex-1 bg-slate-200"></div>
            <span className="text-slate-400 font-black text-[8px] uppercase tracking-widest">
              Requirement
            </span>
            <div className="h-[1px] flex-1 bg-slate-200"></div>
          </div>

          {/* Target Section */}
          <div className="w-full bg-white rounded-xl p-4 shadow-sm border border-slate-100 mb-5">
            
            <h3 className="text-slate-900 font-black text-[11px] uppercase mb-3">
              <span className="text-slate-400">Target for:</span> {fieldingTeam || "Team"}
            </h3>
            
            <div className="flex justify-between items-center">

              <div>
                <div className="text-3xl font-black text-slate-900 tabular-nums">
                  {targetRuns}
                  <span className="text-sm text-slate-400 italic font-bold ml-1">
                    Runs
                  </span>
                </div>

                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                  {(match?.overs || 0) * 6} Balls
                </p>
              </div>

              <div className="bg-slate-50 px-3 py-2 rounded-lg text-center">
                <span className="block text-[8px] font-black text-slate-400 uppercase">
                  RRR
                </span>
                <span className="text-lg font-black text-slate-900">
                  {(targetRuns / (match?.overs || 1)).toFixed(2)}
                </span>
              </div>

            </div>

          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">

            {/* Premium Scorecard Button */}
            <button 
              disabled={isStarting}
              className="bg-gradient-to-r from-slate-100 to-slate-200 
              border border-slate-300 
              text-slate-700 
              py-3 
              rounded-xl 
              font-black 
              text-[11px] 
              uppercase 
              shadow-sm 
              hover:shadow-md 
              transition-all 
              active:scale-95"
              onClick={onClose}
            >
              Scorecard
            </button>
            
            <button 
              onClick={handleStartAction}
              disabled={isStarting}
              className="bg-[#C10E44] text-white py-3 rounded-xl font-black text-[11px] uppercase flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 shadow-lg shadow-red-100"
            >
              {isStarting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Start 2nd <ChevronRight size={18} strokeWidth={3} />
                </>
              )}
            </button>

          </div>

          <button
  onClick={() => setOpenOverlay(true)}
  className="w-full mt-3 bg-slate-900 text-white py-3 rounded-xl font-black text-[11px] uppercase"
>
  Overlay Control
</button>

        </motion.div>
      </div>

      <OverlayControlModal
  isOpen={openOverlay}
  onClose={() => setOpenOverlay(false)}
  tId={match?.tournamentId}
  matchId={match?.id}
  match={match}
/>
      
    </AnimatePresence>
  );
}
