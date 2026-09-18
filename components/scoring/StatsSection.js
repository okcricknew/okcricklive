import { User } from 'lucide-react';

export default function StatsSection({ match, currentBatters, getBatStats, bowlerStats, isOverComplete, handleManualStrikeSwap }) {
  
  // --- Overs Display Logic ---
  const displayOvers = () => {
    // bBalls ko number mein convert karna zaroori hai
    const completedOvers = Number(bowlerStats.overs || 0);
    const currentBalls = Number(match.bowlerBalls || 0);

    // Agar over complete ho gaya hai (6 balls), toh over+1.0 dikhana logic ke hisaab se sahi hai
    // Par display hamesha match object ke backend status par depend hona chahiye
    if (currentBalls === 6 || isOverComplete) {
      return completedOvers + ".0";
    }
    return completedOvers + "." + currentBalls;
  };

  // --- Economy Calculation (Precise Logic) ---
  const calculateEconomy = () => {
    const overs = Number(bowlerStats.overs || 0);
    const balls = Number(match.bowlerBalls || 0);
    const runs = Number(bowlerStats.runs || 0);
    
    // Total overs in decimal (e.g., 1.3 becomes 1.5 overs for math)
    const totalOversInDecimal = overs + (balls / 6);
    
    if (totalOversInDecimal > 0) {
      return (runs / totalOversInDecimal).toFixed(1);
    }
    return '0.0';
  };

  const economy = calculateEconomy();

  // --- FIX: Stable Display Order ---
  const stableBatters = [...currentBatters].sort();

  return (
    <div className="bg-white text-[11px] flex-shrink-0 shadow-sm">
      {/* Batter Header */}
      <div className="grid grid-cols-12 bg-slate-900 text-white/50 py-2 px-3 font-black uppercase tracking-widest text-[9px]">
        <div className="col-span-6">Batter</div>
        <div className="col-span-1 text-center">R</div>
        <div className="col-span-1 text-center">B</div>
        <div className="col-span-1 text-center">4s</div>
        <div className="col-span-1 text-center">6s</div>
        <div className="col-span-2 text-right">SR</div>
      </div>
      
      {stableBatters.map((playerName) => {
        const stats = getBatStats(playerName);
        const isStriker = playerName === match.striker;
        const strikeRate = stats.balls > 0 
          ? ((stats.runs / stats.balls) * 100).toFixed(1) 
          : '0.0';

        return (
          <div 
            key={playerName} 
            onClick={() => handleManualStrikeSwap(playerName)}
            className={`grid grid-cols-12 border-b border-gray-100 py-3 px-3 transition-all cursor-pointer active:bg-orange-50 ${
              isStriker ? 'bg-orange-50/40' : ''
            }`}
          >
            <div className={`col-span-6 flex items-center gap-2 truncate ${
              isStriker ? 'text-slate-900 font-black' : 'text-gray-500 font-bold'
            }`}>
              <div className="w-1.5 h-1.5 shrink-0 flex items-center justify-center">
                {isStriker && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />}
              </div>
              <span className="truncate uppercase tracking-tight">
                {playerName} {isStriker && <span className="text-orange-600 ml-1"></span>}
              </span>
            </div>
            
            <div className={`col-span-1 text-center ${isStriker ? 'text-slate-900 font-black' : 'text-gray-600 font-bold'}`}>
              {stats.runs}
            </div>
            <div className="col-span-1 text-center text-gray-400 font-medium">{stats.balls}</div>
            <div className="col-span-1 text-center text-gray-300">{stats.fours}</div>
            <div className="col-span-1 text-center text-gray-300">{stats.sixes}</div>
            <div className="col-span-2 text-right text-emerald-600 font-black tabular-nums">
              {strikeRate}
            </div>
          </div>
        );
      })}

      {/* Bowler Header */}
      <div className="grid grid-cols-12 bg-blue-900 text-white/50 py-2 px-3 font-black uppercase tracking-widest text-[9px]">
        <div className="col-span-6">Bowler</div>
        <div className="col-span-1 text-center">O</div>
        <div className="col-span-1 text-center">M</div>
        <div className="col-span-1 text-center">R</div>
        <div className="col-span-1 text-center">W</div>
        <div className="col-span-2 text-right">ECO</div>
      </div>

      {/* Bowler Row */}
      <div className="grid grid-cols-12 border-b border-gray-100 py-3 px-3 font-black text-slate-800 bg-blue-50/30">
        <div className="col-span-6 flex items-center gap-2 truncate text-blue-700">
          <User size={12} strokeWidth={3} className="shrink-0 opacity-70" />
          <span className="truncate uppercase tracking-tight">
            {match.bowler || 'NOT ASSIGNED'}
          </span>
        </div>
        
        <div className="col-span-1 text-center tabular-nums">
          {displayOvers()}
        </div>
        {/* MAIDEN DISPLAY: Yeh part bilkul sahi hai */}
        <div className="col-span-1 text-center text-gray-400 tabular-nums">
          {Number(bowlerStats.maidens || 0)}
        </div>
        <div className="col-span-1 text-center text-gray-600 tabular-nums">
          {bowlerStats.runs || 0}
        </div>
        <div className="col-span-1 text-center text-red-600 tabular-nums">
          {bowlerStats.wickets || 0}
        </div>
        <div className="col-span-2 text-right text-blue-800 tabular-nums">
          {economy}
        </div>
      </div>
    </div>
  );
        }
