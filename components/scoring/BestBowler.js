import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function BestBowler({ tId }) {
  const [players, setPlayers] = useState([]);
  const [page, setPage] = useState(1);
  const playersPerPage = 5;

  useEffect(() => {
    // onSnapshot hi instant update ke liye best hai
    const unsubscribe = onSnapshot(
      collection(db, "tournaments", tId, "matches"),
      (snapshot) => {
        let stats = {};

        snapshot.forEach((doc) => {
          const data = doc.data();
          // Current live innings data
          const currentBowling = data.bowlingStats || {};
          // Saved first innings data
          const firstInningsBowling = data.firstInningsStatsBackup?.bowling || {};

          // In dono sources ko merge karenge
          const allBowlingData = [currentBowling, firstInningsBowling];
          let playersInThisMatch = new Set();

          allBowlingData.forEach((source) => {
            Object.keys(source).forEach((playerName) => {
              const p = source[playerName];
              playersInThisMatch.add(playerName);

              if (!stats[playerName]) {
                stats[playerName] = {
                  name: playerName,
                  wickets: 0,
                  runs: 0,
                  balls: 0,
                  matches: 0,
                };
              }

              // Stats update: Direct summary fields se data uthayein (Fastest)
              stats[playerName].wickets += p.wickets || 0;
              stats[playerName].runs += p.runs || 0;
              
              // Overs to balls conversion (e.g. 2.4 overs -> 16 balls)
              const oversVal = p.overs || 0;
              const wholeOvers = Math.floor(oversVal);
              const extraBalls = Math.round((oversVal - wholeOvers) * 10);
              stats[playerName].balls += (wholeOvers * 6) + extraBalls;
            });
          });

          // Match count increment
          playersInThisMatch.forEach((pName) => {
            stats[pName].matches += 1;
          });
        });

        const list = Object.values(stats).sort((a, b) => {
          if (b.wickets !== a.wickets) return b.wickets - a.wickets;
          return (a.runs / (a.balls || 1)) - (b.runs / (b.balls || 1)); // Tie-breaker: Better Economy
        });

        setPlayers(list);
      },
      (error) => console.error("Snapshot Error:", error)
    );

    return () => unsubscribe();
  }, [tId]);

  // Pagination Logic
  const totalPages = Math.ceil(players.length / playersPerPage) || 1;
  const currentPlayers = useMemo(() => {
    const start = (page - 1) * playersPerPage;
    return players.slice(start, start + playersPerPage);
  }, [players, page]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-pink-200 overflow-hidden">
      <div className="bg-gradient-to-r from-[#D946EF] to-[#F472B6] p-3">
        <h2 className="text-white text-center font-black uppercase italic tracking-widest text-sm">
          🎯 Tournament Best Bowler
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-pink-50 text-pink-900 border-b-2 border-pink-200">
              <th className="p-3 uppercase text-center">Pos</th>
              <th className="p-3 text-left uppercase">Player</th>
              <th className="p-3 uppercase">M</th>
              <th className="p-3 uppercase text-pink-600">Wkts</th>
              <th className="p-3 uppercase">Overs</th>
              <th className="p-3 uppercase">Econ</th>
            </tr>
          </thead>
          <tbody>
            {currentPlayers.map((p, i) => {
              const overs = `${Math.floor(p.balls / 6)}.${p.balls % 6}`;
              const econ = p.balls > 0 ? ((p.runs / p.balls) * 6).toFixed(2) : "0.00";

              return (
                <tr key={p.name} className="border-b border-pink-100 hover:bg-pink-50 transition-colors">
                  <td className="p-3 font-black text-center text-pink-700">{(page - 1) * playersPerPage + i + 1}</td>
                  <td className="p-3 font-bold text-gray-800 uppercase">{p.name}</td>
                  <td className="p-3 text-center">{p.matches}</td>
                  <td className="p-3 text-center font-black text-pink-600 bg-pink-50/50">{p.wickets}</td>
                  <td className="p-3 text-center">{overs}</td>
                  <td className="p-3 text-center font-bold italic">{econ}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Improved Pagination UI */}
      <div className="flex justify-between items-center p-3 bg-gray-50">
        <button 
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
          className="px-4 py-1 bg-white border border-pink-300 rounded-lg text-xs font-bold disabled:opacity-50"
        >
          PREV
        </button>
        <span className="text-[10px] font-bold text-pink-600">PAGE {page} OF {totalPages}</span>
        <button 
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-1 bg-white border border-pink-300 rounded-lg text-xs font-bold disabled:opacity-50"
        >
          NEXT
        </button>
      </div>
    </div>
  );
}
