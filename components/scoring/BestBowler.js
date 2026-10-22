import { useEffect, useMemo, useState } from "react";

export default function BestBowler({ matches = [] }) {
  const [page, setPage] = useState(1);
  const playersPerPage = 5;

  const players = useMemo(() => {
    const stats = {};

    matches.forEach((match) => {
      const data = match.data || match;

      const currentBowling = data.bowlingStats || {};
      const firstInningsBowling =
        data.firstInningsStatsBackup?.bowling || {};

      const allBowlingData = [
        currentBowling,
        firstInningsBowling,
      ];

      const playersInThisMatch = new Set();

      allBowlingData.forEach((source) => {
        Object.keys(source).forEach((playerName) => {
          const player = source[playerName];

          if (!stats[playerName]) {
            stats[playerName] = {
              name: playerName,
              wickets: 0,
              runs: 0,
              balls: 0,
              matches: 0,
            };
          }

          stats[playerName].wickets += Number(player.wickets || 0);
          stats[playerName].runs += Number(player.runs || 0);

          const oversValue = Number(player.overs || 0);
          const wholeOvers = Math.floor(oversValue);
          const extraBalls = Math.round(
            (oversValue - wholeOvers) * 10
          );

          stats[playerName].balls +=
            wholeOvers * 6 + extraBalls;

          playersInThisMatch.add(playerName);
        });
      });

      playersInThisMatch.forEach((playerName) => {
        stats[playerName].matches += 1;
      });
    });

    return Object.values(stats).sort((a, b) => {
      if (b.wickets !== a.wickets) {
        return b.wickets - a.wickets;
      }

      const economyA = a.balls > 0 ? a.runs / a.balls : 0;
      const economyB = b.balls > 0 ? b.runs / b.balls : 0;

      return economyA - economyB;
    });
  }, [matches]);

  useEffect(() => {
    setPage(1);
  }, [matches]);

  const totalPages = Math.max(
    1,
    Math.ceil(players.length / playersPerPage)
  );

  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * playersPerPage;
  const currentPlayers = players.slice(
    start,
    start + playersPerPage
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-pink-200 overflow-hidden">
      <div className="bg-gradient-to-r from-[#D946EF] to-[#F472B6] p-3">
        <h2 className="text-white text-center font-black uppercase italic tracking-widest text-sm">
          🎯 Tournament Best Bowler
        </h2>
      </div>

      <div className="overflow-x-auto">
        {players.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold uppercase text-[10px]">
            No Stats Recorded Yet
          </div>
        ) : (
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
              {currentPlayers.map((player, index) => {
                const overs = `${Math.floor(player.balls / 6)}.${
                  player.balls % 6
                }`;

                const economy =
                  player.balls > 0
                    ? ((player.runs / player.balls) * 6).toFixed(2)
                    : "0.00";

                return (
                  <tr
                    key={player.name}
                    className="border-b border-pink-100 hover:bg-pink-50 transition-colors"
                  >
                    <td className="p-3 font-black text-center text-pink-700">
                      {start + index + 1}
                    </td>

                    <td className="p-3 font-bold text-gray-800 uppercase">
                      {player.name}
                    </td>

                    <td className="p-3 text-center">
                      {player.matches}
                    </td>

                    <td className="p-3 text-center font-black text-pink-600 bg-pink-50/50">
                      {player.wickets}
                    </td>

                    <td className="p-3 text-center">
                      {overs}
                    </td>

                    <td className="p-3 text-center font-bold italic">
                      {economy}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-between items-center p-3 bg-gray-50">
        <button
          disabled={safePage === 1}
          onClick={() =>
            setPage((current) => Math.max(current - 1, 1))
          }
          className="px-4 py-1 bg-white border border-pink-300 rounded-lg text-xs font-bold disabled:opacity-50"
        >
          PREV
        </button>

        <span className="text-[10px] font-bold text-pink-600">
          PAGE {safePage} OF {totalPages}
        </span>

        <button
          disabled={safePage === totalPages}
          onClick={() =>
            setPage((current) =>
              Math.min(current + 1, totalPages)
            )
          }
          className="px-4 py-1 bg-white border border-pink-300 rounded-lg text-xs font-bold disabled:opacity-50"
        >
          NEXT
        </button>
      </div>
    </div>
  );
}
