import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, CheckCircle2, Circle } from 'lucide-react';

export default function TossModal({ isOpen, onClose, match, onComplete }) {
  const [winner, setWinner] = useState(null); 
  const [decision, setDecision] = useState(null); 

  if (!isOpen || !match) return null;

  const handleFinalSubmit = () => {
    if (winner && decision) {
      const isWinnerTeamA = winner === match.teamA;
      let battingTeam, battingTeamId, bowlingTeam, bowlingTeamId;

      if (decision === 'Bat') {
        battingTeam = isWinnerTeamA ? match.teamA : match.teamB;
        battingTeamId = isWinnerTeamA ? match.teamAId : match.teamBId;
        bowlingTeam = isWinnerTeamA ? match.teamB : match.teamA;
        bowlingTeamId = isWinnerTeamA ? match.teamBId : match.teamAId;
      } else {
        battingTeam = isWinnerTeamA ? match.teamB : match.teamA;
        battingTeamId = isWinnerTeamA ? match.teamBId : match.teamAId;
        bowlingTeam = isWinnerTeamA ? match.teamA : match.teamB;
        bowlingTeamId = isWinnerTeamA ? match.teamAId : match.teamBId;
      }

      onComplete(winner, decision, {
        battingTeam,
        battingTeamId,
        bowlingTeam,
        bowlingTeamId,
        battingPlayers: [], 
        bowlingPlayers: [], 
        tossCompleted: true,
        status: 'lineup'
      });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Backdrop with Blur */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#000814]/90 backdrop-blur-md" 
          onClick={onClose} 
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-[#001d3d] border border-blue-500/20 w-full max-w-sm p-8 rounded-[32px] relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center"
        >
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
              <Trophy className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" size={32} />
            </div>
            <h2 className="text-2xl font-black italic uppercase text-white tracking-tight">Match Toss</h2>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.3em] mt-1">Tournament Official</p>
          </div>

          <div className="w-full space-y-8">
            {/* STEP 1: Toss Winner */}
            <section>
              <div className="flex items-center gap-2 mb-4 justify-center">
                <span className="h-[1px] w-8 bg-blue-500/30"></span>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Toss Winner</p>
                <span className="h-[1px] w-8 bg-blue-500/30"></span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[match.teamA, match.teamB].map((team) => (
                  <button 
                    key={team}
                    onClick={() => { setWinner(team); setDecision(null); }}
                    className={`relative py-4 rounded-2xl font-black italic uppercase text-xs transition-all border-2 overflow-hidden ${
                      winner === team 
                      ? 'bg-blue-600 border-blue-400 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)]' 
                      : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                    }`}
                  >
                    {team}
                    {winner === team && <motion.div layoutId="glow" className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />}
                  </button>
                ))}
              </div>
            </section>

            {/* STEP 2: Decision */}
            <motion.section 
              animate={{ opacity: winner ? 1 : 0.2, y: winner ? 0 : 10 }}
              className={!winner ? 'pointer-events-none' : ''}
            >
              <div className="flex items-center gap-2 mb-4 justify-center">
                <span className="h-[1px] w-8 bg-blue-500/30"></span>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Decision</p>
                <span className="h-[1px] w-8 bg-blue-500/30"></span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['Bat', 'Bowl'].map((opt) => (
                  <button 
                    key={opt}
                    onClick={() => setDecision(opt)}
                    className={`py-4 rounded-2xl font-black italic uppercase text-xs transition-all border-2 ${
                      decision === opt 
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_10px_20px_rgba(16,185,129,0.3)]' 
                      : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                    }`}
                  >
                    {opt === 'Bat' ? 'Batting' : 'Bowling'}
                  </button>
                ))}
              </div>
            </motion.section>

            {/* Summary Tag */}
            {winner && decision && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center"
              >
                <p className="text-white font-black italic uppercase text-[11px] tracking-tight">
                  {winner} won the toss & elected to {decision} first
                </p>
              </motion.div>
            )}

            {/* STEP 3: Submit */}
            <button 
              disabled={!winner || !decision}
              onClick={handleFinalSubmit}
              className={`group w-full py-5 rounded-2xl font-black italic uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-3 ${
                winner && decision 
                ? 'bg-white text-[#001d3d] hover:bg-blue-400 hover:text-white shadow-xl active:scale-95' 
                : 'bg-white/5 text-gray-700 cursor-not-allowed border border-white/5'
              }`}
            >
              Start Lineups <CheckCircle2 size={18} className={winner && decision ? 'animate-bounce' : ''} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
