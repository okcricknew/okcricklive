import { useEffect, useMemo, useState } from "react";

export default function BestSixer({ matches = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 8;

  const players = useMemo(() => {
    const stats = {};

    matches.forEach((match) => {
      const data = match.data || match;
      const ballHistory = data.ballHistory || [];

      const currentBatting = data.battingStats || {};
      const firstInningsBatting =
        data.firstInningsStatsBackup?.batting || {};

      const combinedSources = [currentBatting, firstInningsBatting];
      const playersInThisMatch = new Set();

      combinedSources.forEach((source) => {
        Object.keys(source).forEach((playerName) => {
          const playerData = source[playerName];

          if (!stats[playerName]) {
            stats[playerName] = {
              name: playerName,
              sixes: 0,
              runs: 0,
              matches: 0,
            };
          }

          stats[playerName].runs += Number(playerData.runs || 0);
          playersInThisMatch.add(playerName);
        });
      });

      ballHistory.forEach((ball) => {
        if (
          Number(ball.runs) === 6 &&
          ball.striker
        ) {
          const playerName = ball.striker;

          if (!stats[playerName]) {
            stats[playerName] = {
              name: playerName,
              sixes: 0,
              runs: 0,
              matches: 0,
            };
          }

          stats[playerName].sixes += 1;
          playersInThisMatch.add(playerName);
        }
      });

      playersInThisMatch.forEach((playerName) => {
        stats[playerName].matches += 1;
      });
    });

    return Object.values(stats)
      .filter((player) => player.sixes > 0)
      .sort((a, b) => b.sixes - a.sixes);
  }, [matches]);

  useEffect(() => {
    setCurrentPage(1);
  }, [matches]);

  const totalPages = Math.max(
    1,
    Math.ceil(players.length / playersPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);
  const indexOfLast = safePage * playersPerPage;
  const indexOfFirst = indexOfLast - playersPerPage;
  const currentPlayers = players.slice(indexOfFirst, indexOfLast);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-[#F472B6]/30 overflow-hidden">
      <div className="bg-gradient-to-r from-[#D946EF] to-[#F472B6] p-3 shadow-inner">
        <h2 className="text-white text-center font-black uppercase italic tracking-widest text-sm flex items-center justify-center gap-2">
          🏆 Tournament Sixer King
        </h2>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        {players.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold uppercase text-[10px]">
            No Stats Recorded Yet
          </div>
        ) : (
          <>
            <table className="w-full text-[11px] border-collapse">
              <thead className="sticky top-0 z-20">
                <tr className="bg-[#FDF2F8] text-[#9D174D] border-b-2 border-[#F9A8D4]">
                  <th className="p-3 font-black uppercase text-center border-r border-white w-12">
                    Pos
                  </th>
                  <th className="p-3 text-left font-black uppercase border-r border-white">
                    Player Name
                  </th>
                  <th className="p-3 font-black uppercase text-center border-r border-white">
                    M
                  </th>
                  <th className="p-3 font-black uppercase text-center border-r border-white text-[#DB2777]">
                    6s
                  </th>
                  <th className="p-3 font-black uppercase text-center">
                    Runs
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentPlayers.map((player, index) => (
                  <tr
                    key={player.name}
                    className={`border-b border-[#F9A8D4]/20 text-center transition-all
                      ${
                        index === 0
                          ? "bg-pink-100/50"
                          : index % 2 === 0
                            ? "bg-[#FDF2F8]"
                            : "bg-white"
                      }`}
                  >
                    <td
                      className={`p-3 font-black border-r border-white/60 ${
                        index === 0
                          ? "text-amber-600"
                          : "text-[#BE185D]"
                      }`}
                    >
                      {indexOfFirst + index + 1}
                    </td>

                    <td className="p-3 text-left font-black text-[#431407] uppercase border-r border-white/60 tracking-tight">
                      {player.name}
                    </td>

                    <td className="p-3 text-[#701A75] font-bold border-r border-white/60">
                      {player.matches}
                    </td>

                    <td className="p-3 font-black text-[#DB2777] text-sm border-r border-white/60 bg-[#FDF2F8]/40">
                      {player.sixes}
                    </td>

                    <td className="p-3 text-[#9D174D] font-bold italic">
                      {player.runs}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex flex-wrap justify-center items-center gap-2 p-4 bg-[#FDF2F8]">
              <button
                disabled={safePage === 1}
                onClick={() =>
                  setCurrentPage((page) => Math.max(page - 1, 1))
                }
                className="px-3 py-1 bg-pink-200 rounded text-xs font-bold disabled:opacity-50"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-1 rounded text-xs font-bold ${
                    safePage === index + 1
                      ? "bg-pink-500 text-white"
                      : "bg-pink-100 text-pink-700"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                disabled={safePage === totalPages}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(page + 1, totalPages)
                  )
                }
                className="px-3 py-1 bg-pink-200 rounded text-xs font-bold disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
          }
                    
