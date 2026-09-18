"use client";
import { Settings } from 'lucide-react';

export default function ScoreHeader({ match, router, isOverComplete, onOpenEngine }) {


    // --- Calculations (Manual Edits & Overlay Safe Sync) ---
  const activeInningsKey = `innings${match?.innings || 1}`;
  
  // Dynamic overs calculation (Support for direct overs edit e.g., 4.2)
  const rawOvers = Number(
    match?.currentOver !== undefined && match?.ballsInOver !== undefined
      ? `${match.currentOver}.${match.ballsInOver}`
      : (match?.overs ?? match?.[activeInningsKey]?.overs ?? 0)
  );
  const currentOver = Math.floor(rawOvers);
  const ballsInOver = Math.round((rawOvers - currentOver) * 10);

  // Scores & Wickets
  const totalRuns = Number(match?.totalRuns ?? match?.runs ?? match?.[activeInningsKey]?.runs ?? 0);
  const totalWickets = Number(match?.totalWickets ?? match?.wickets ?? match?.[activeInningsKey]?.wickets ?? 0);
  
  // Total Match Overs (Fallback chain)
  const maxOvers = Number(match?.maxOvers ?? match?.totalOvers ?? match?.oversLimit ?? match?.overs ?? 20);
  
  // Ball level accurate calculation for CRR & RRR
  const totalBallsBowled = (currentOver * 6) + (ballsInOver >= 6 ? 6 : ballsInOver);
  const currentRR = totalBallsBowled > 0 ? ((totalRuns / totalBallsBowled) * 6).toFixed(2) : "0.00";

  // Extras & Partnerships
  const currentInningsExtras = match?.extras?.[activeInningsKey] || {};
  const extras = Object.values(currentInningsExtras).reduce((acc, val) => acc + Number(val || 0), 0);
  const partnershipRuns = Number(match?.currentPartnership?.runs || 0);
  const partnershipBalls = Number(match?.currentPartnership?.balls || 0);

  // Second Innings Target & RRR Logic
  const isSecondInnings = Number(match?.innings) === 2;
  const firstInningsRuns = Number(match?.firstInningsScore ?? match?.innings1?.runs ?? 0);
  const target = Number(match?.target ?? match?.innings2?.target ?? (firstInningsRuns + 1));
  
  const runsNeeded = target - totalRuns;
  const totalBallsAvailable = maxOvers * 6;
  const ballsRemaining = Math.max(0, totalBallsAvailable - totalBallsBowled);
  const requiredRR = isSecondInnings 
    ? (runsNeeded <= 0 ? "0.00" : (ballsRemaining > 0 ? (runsNeeded / (ballsRemaining / 6)).toFixed(2) : "∞")) 
    : "0.00";
  

    const displayOver = () => {
    if (ballsInOver >= 6) return `${currentOver + 1}.0`;
    return `${currentOver}.${ballsInOver}`;
  };
    

  return (
    <div
      // UPDATE: pt-2 (top shift) aur pb-6 (height increase)
      className="relative bg-[#000] text-white p-4 pt-2 pb-6 text-center bg-cover bg-center shadow-2xl shrink-0"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.98)), url('https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80')",
      }}
    >
      {/* UPDATE: items-start aur mb-6 (buttons ko ekdum upar shift kiya) */}
      <div className="flex justify-between items-start mb-6 px-1">
        <button
          onClick={() => router.back()}
          className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg active:scale-95 transition-all mt-1"
        >
          Exit
        </button>

        <div className="flex flex-col mt-2">
          <span className="text-[10px] font-black italic uppercase tracking-widest text-gray-400">
            {match?.teamA || 'Team A'}{" "}
            <span className="text-blue-500 font-black px-1 text-xs">V</span>{" "}
            {match?.teamB || 'Team B'}
          </span>
        </div>

        <button 
  onClick={onOpenEngine}
  className="p-2 hover:bg-white/10 rounded-full transition-colors mt-1 active:scale-90 cursor-pointer"
  title="Match Settings Engine"
>
  <Settings size={22} className="text-gray-300 hover:text-white transition-colors" />
</button>
    
      </div>

      {/* UPDATE: mb-6 aur text-5xl (Score bada kiya aur gap badhaya) */}
      <div className="flex justify-between items-center px-6 mb-6">
        <div className="text-left flex-1">
          <h2 className="text-[13px] font-black text-blue-400 uppercase tracking-tight mb-1 truncate max-w-[180px]">
            {match?.battingTeam || 'Batting Team'}
          </h2>

          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tabular-nums tracking-tighter leading-none">
              {totalRuns}/{totalWickets}
            </span>

            <span className="text-sm font-bold text-gray-400 italic">
              ({displayOver()}/{maxOvers})
            </span>
          </div>
        </div>

        {/* Stats Grid - Spacing badha di */}
        <div className="grid grid-cols-3 gap-4 border-l border-white/20 pl-6 min-w-[150px]">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">CRR</span>
            <span className="text-sm font-black tabular-nums">{currentRR}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
              {isSecondInnings ? 'TGT' : 'PROJ'}
            </span>
            <span className="text-sm font-black tabular-nums">
              {isSecondInnings ? target : Math.round(Number(currentRR) * maxOvers)}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">EXT</span>
            <span className="text-sm font-black tabular-nums">{extras}</span>
          </div>
        </div>
      </div>

      {/* UPDATE: mt-4 aur pt-4 (Bottom height badhane ke liye) */}
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 px-1">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
          P'ship:{" "}
          <span className="text-white font-black">
            {partnershipRuns}{" "} 
            <span className="text-[10px] font-medium text-gray-500">
              ({partnershipBalls}b)
            </span>
          </span>
        </div>

        {isSecondInnings ? (
          <div className="text-right leading-tight">
            <div className={`text-[12px] font-black uppercase tracking-tight ${runsNeeded <= 0 ? 'text-green-400' : 'text-orange-400'}`}>
              {runsNeeded <= 0 ? 'Target Achieved' : `Need ${runsNeeded} off ${ballsRemaining}`}
            </div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
              RRR: <span className="text-white">{requiredRR}</span>
            </div>
          </div>
        ) : (
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
            Innings {match?.innings || 1}
          </div>
        )}
      </div>
    </div>
  );
            }
