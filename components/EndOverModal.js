import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, RotateCcw, X } from 'lucide-react';

export default function EndOverModal({ isOpen, match, onContinue, onNextOver, onClose }) {
  if (!match) return null;

  // --- FAST ANIMATION CONFIG ---
  const fastTransition = { duration: 0.15, ease: [0.4, 0, 0.2, 1] };

  const currentOverNumber = match.currentOver || 0;
  const lastCompletedOver = match.ballsInOver === 0 ? currentOverNumber - 1 : currentOverNumber;
  const lastOverBalls = match.ballHistory?.filter(ball => ball.over === lastCompletedOver) || [];
  
  const runsInOver = lastOverBalls.reduce((acc, ball) => {
    const isExtra = ['WD', 'NB'].includes(ball.type);
    const penalty = isExtra ? 1 : 0;
    return acc + (parseInt(ball.runs) || 0) + penalty;
  }, 0);

  const wicketsInOver = lastOverBalls.filter(ball => ball.type === 'OUT' || ball.wicketInfo).length;
  const displayOver = lastCompletedOver + 1;

  const handleEditLastBall = () => {
  onContinue();
  onClose && onClose();
};

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10005] flex items-end sm:items-center justify-center p-0 sm:p-5 overflow-hidden">
          {/* Snappy Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" 
            onClick={handleEditLastBall} 
          />

          {/* Snappy Content Card */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 50, opacity: 0 }}
            transition={fastTransition}
            className="w-full max-w-sm bg-white rounded-t-[30px] sm:rounded-[24px] overflow-hidden shadow-2xl relative z-10"
          >
            {/* Header: Fast & Bold */}
            <div className="bg-emerald-500 p-6 text-white text-center relative">
              <button 
                onClick={handleEditLastBall}
                className="absolute top-3 right-3 p-2 bg-black/10 hover:bg-black/20 rounded-lg active:scale-90 transition-transform"
              >
                <X size={18} />
              </button>

              <div className="absolute top-0 left-2 opacity-5 pointer-events-none">
                <CheckCircle2 size={80} />
              </div>
              
              <p className="text-emerald-100 text-[9px] font-black uppercase tracking-widest mb-1">Over Summary</p>
              <h3 className="text-2xl font-black italic uppercase leading-none tracking-tight">
                OVER {displayOver} COMPLETE
              </h3>
              <p className="text-[10px] font-bold text-emerald-50 opacity-80 mt-2 uppercase">
                BY {lastOverBalls[0]?.bowler || match.bowler || 'BOWLER'}
              </p>
            </div>

            {/* Stats: Organized Grid */}
            <div className="p-5 bg-white flex justify-around border-b border-slate-50">
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase">Runs</p>
                <p className="text-xl font-black text-slate-800">{runsInOver}</p>
              </div>
              <div className="w-[1px] bg-slate-100 h-6 my-auto" />
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase">Wickets</p>
                <p className="text-xl font-black text-red-500">{wicketsInOver}</p>
              </div>
              <div className="w-[1px] bg-slate-100 h-6 my-auto" />
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase">Score</p>
                <p className="text-xl font-black text-slate-800">{match.totalRuns}/{match.totalWickets}</p>
              </div>
            </div>

            {/* Action Buttons: High Response */}
            <div className="p-5 space-y-3">
              <button 
                onClick={onNextOver}
                className="w-full bg-slate-900 active:bg-black text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 transition-colors active:scale-[0.98]"
              >
                Next Over
                <ArrowRight size={16} className="text-emerald-400" />
              </button>

              <button 
                onClick={handleEditLastBall}
                className="w-full bg-white border border-slate-200 text-slate-400 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:bg-slate-50 active:scale-[0.98] transition-all"
              >
                <RotateCcw size={14} />
                Edit Last Ball
              </button>
            </div>

            {/* Sub-Footer */}
            <div className="bg-slate-50 py-2.5 text-center border-t border-slate-100">
               <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em]">
                {match.target ? `Target: ${match.target}` : `Innings ${match.innings || 1}`}
               </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
              }
