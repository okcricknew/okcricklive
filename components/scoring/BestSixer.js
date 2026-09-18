import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function BestSixer({ tId }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
const playersPerPage = 8;

  useEffect(() => {
    const loadStats = async () => {
      if (!tId) return;
      try {
        setLoading(true);
        const matchesSnap = await getDocs(
          collection(db, "tournaments", tId, "matches")
        );

        let stats = {};

        matchesSnap.forEach((doc) => {
          const data = doc.data();
          const ballHistory = data.ballHistory || [];
          
          // --- TOURNAMENT TOTAL LOGIC ---
          // 1. Innings 2 ka data (Jo current battingStats mein hai)
          const currentBatting = data.battingStats || {};
          
          // 2. Innings 1 ka data (Jo aapke backup field mein hai)
          const firstInningsBatting = data.firstInningsStatsBackup?.batting || {};

          // Dono innings ko combine karke check karna
          const combinedSources = [currentBatting, firstInningsBatting];

          combinedSources.forEach((source) => {
            Object.keys(source).forEach((playerName) => {
              const p = source[playerName];

              if (!stats[playerName]) {
                stats[playerName] = {
                  name: playerName,
                  sixes: 0,
                  runs: 0,
                  matches: 0
                };
              }

              // Data ko plus (+) karna
              stats[playerName].runs += Number(p.runs || 0);
            });
          });
          // Extra safety: ballHistory se six count (last ball / winning six fix)
ballHistory.forEach((ball) => {
  if (Number(ball.runs) === 6) {
    const playerName = ball.striker;

    if (!stats[playerName]) {
      stats[playerName] = {
        name: playerName,
        sixes: 0,
        runs: 0,
        matches: 0
      };
    }

    stats[playerName].sixes += 1;
  }
});

          // Match count calculation (Unique players in this match)
          const playersInThisMatch = new Set([
            ...Object.keys(currentBatting),
            ...Object.keys(firstInningsBatting)
          ]);

          playersInThisMatch.forEach((name) => {
            if (stats[name]) stats[name].matches += 1;
          });
        });

        // Array mein badalna aur sorting
        let list = Object.values(stats);
        list = list.filter(p => p.sixes > 0);
        list.sort((a, b) => b.sixes - a.sixes);

        // Tournament ke saare players (Top 20 dikha rahe hain scrollable list mein)
        setPlayers(list);
        setLoading(false);
      } catch (error) {
        console.error("Tournament Stats Error:", error);
        setLoading(false);
      }
    };

    loadStats();
  }, [tId]);

  const indexOfLast = currentPage * playersPerPage;
const indexOfFirst = indexOfLast - playersPerPage;
const currentPlayers = players.slice(indexOfFirst, indexOfLast);

const totalPages = Math.ceil(players.length / playersPerPage);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-[#F472B6]/30 overflow-hidden">
      {/* Header - Group B Style */}
      <div className="bg-gradient-to-r from-[#D946EF] to-[#F472B6] p-3 shadow-inner">
        <h2 className="text-white text-center font-black uppercase italic tracking-widest text-sm flex items-center justify-center gap-2">
          🏆 Tournament Sixer King
        </h2>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead className="sticky top-0 z-20">
            <tr className="bg-[#FDF2F8] text-[#9D174D] border-b-2 border-[#F9A8D4]">
              <th className="p-3 font-black uppercase text-center border-r border-white w-12">Pos</th>
              <th className="p-3 text-left font-black uppercase border-r border-white">Player Name</th>
              <th className="p-3 font-black uppercase text-center border-r border-white">M</th>
              <th className="p-3 font-black uppercase text-center border-r border-white text-[#DB2777]">6s</th>
              <th className="p-3 font-black uppercase text-center">Runs</th>
            </tr>
          </thead>

          <tbody>
            {currentPlayers.map((p, i) => (
              <tr 
                key={i} 
                className={`border-b border-[#F9A8D4]/20 text-center transition-all
                  ${i === 0 ? 'bg-pink-100/50' : (i % 2 === 0 ? 'bg-[#FDF2F8]' : 'bg-white')}`}
              >
                {/* Position */}
                <td className={`p-3 font-black border-r border-white/60 ${i === 0 ? 'text-amber-600' : 'text-[#BE185D]'}`}>
                  {indexOfFirst + i + 1}
                </td>

                {/* Player Name */}
                <td className="p-3 text-left font-black text-[#431407] uppercase border-r border-white/60 tracking-tight">
                  {p.name}
                </td>

                {/* Total Matches */}
                <td className="p-3 text-[#701A75] font-bold border-r border-white/60">
                  {p.matches}
                </td>

                {/* Total Sixes */}
                <td className="p-3 font-black text-[#DB2777] text-sm border-r border-white/60 bg-[#FDF2F8]/40">
                  {p.sixes}
                </td>

                {/* Total Runs */}
                <td className="p-3 text-[#9D174D] font-bold italic">
                  {p.runs}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
<div className="flex justify-center gap-2 p-4 bg-[#FDF2F8]">
  <button
    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
    className="px-3 py-1 bg-pink-200 rounded text-xs font-bold"
  >
    Prev
  </button>

  {Array.from({ length: totalPages }, (_, i) => (
    <button
      key={i}
      onClick={() => setCurrentPage(i + 1)}
      className={`px-3 py-1 rounded text-xs font-bold ${
        currentPage === i + 1
          ? "bg-pink-500 text-white"
          : "bg-pink-100 text-pink-700"
      }`}
    >
      {i + 1}
    </button>
  ))}

  <button
    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
    className="px-3 py-1 bg-pink-200 rounded text-xs font-bold"
  >
    Next
  </button>
</div>

        {loading && (
          <div className="p-12 text-center text-pink-500 font-black uppercase italic text-[10px] animate-pulse">
            Crunching Tournament Data...
          </div>
        )}

        {!loading && players.length === 0 && (
          <div className="p-12 text-center text-slate-400 font-bold uppercase text-[10px]">
            No Stats Recorded Yet
          </div>
        )}
      </div>
    </div>
  );
}
