import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function BestBatsman({ tId }) {

  const [players, setPlayers] = useState([]);
  const [page, setPage] = useState(1);

  const perPage = 5;

  // ✅ SAFE pagination (empty bug fix)
  const totalPages = Math.max(1, Math.ceil(players.length / perPage));

  const start = (page - 1) * perPage;
  const end = start + perPage;

  const currentPlayers = players.slice(start, end);

  useEffect(() => {
    if (!tId) return;

    const q = collection(db, "tournaments", tId, "matches");

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true }, // 🔥 cache + realtime
      (matchesSnap) => {

        let stats = {};

        matchesSnap.forEach((doc) => {
          const data = doc.data();
          const history = data.ballHistory || [];
          let playersInMatch = new Set();

          history.forEach((ball) => {
            const player = ball.striker;
            if (!player) return;

            if (!stats[player]) {
              stats[player] = {
                name: player,
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
                matches: 0
              };
            }

            const isBallFaced = ball.type !== "WD";
            const runsFromBat =
              ball.type === "NORMAL" ||
              (ball.type === "NB" && ball.subCategory === "From Bat");

            if (isBallFaced) stats[player].balls += 1;

            if (runsFromBat) {
              const runValue = Number(ball.runs || 0);
              stats[player].runs += runValue;

              if (runValue === 4) stats[player].fours += 1;
              if (runValue === 6) stats[player].sixes += 1;
            }

            playersInMatch.add(player);
          });

          playersInMatch.forEach((player) => {
            stats[player].matches += 1;
          });
        });

        // 🔥 instant sorted result (no delay)
        const list = Object.values(stats).sort((a, b) => b.runs - a.runs);

        setPlayers(list); // ⚡ instant UI update (cache se bhi aayega)
      }
    );

    return () => unsubscribe();
  }, [tId]);

  // ✅ page reset jab data change ho
  useEffect(() => {
    setPage(1);
  }, [players]);

  return (

    <div className="bg-white rounded-xl shadow-lg border border-[#F472B6]/30 overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-[#D946EF] to-[#F472B6] p-3 shadow-inner">
        <h2 className="text-white text-center font-black uppercase italic tracking-widest text-sm flex items-center justify-center gap-2">
          🏏 Tournament Best Batsman
        </h2>
      </div>

      <div className="max-h-[500px] overflow-y-auto">

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
                Runs
              </th>

              <th className="p-3 font-black uppercase text-center border-r border-white">
                SR
              </th>

              <th className="p-3 font-black uppercase text-center border-r border-white">
                4s
              </th>

              <th className="p-3 font-black uppercase text-center">
                6s
              </th>

            </tr>

          </thead>

          <tbody>

            {currentPlayers.map((p, i) => {

              const sr =
                p.balls > 0
                  ? ((p.runs / p.balls) * 100).toFixed(1)
                  : "0";

              return (

                <tr
                  key={i}
                  className={`border-b border-[#F9A8D4]/20 text-center transition-all
                  ${i === 0 ? 'bg-pink-100/50' : (i % 2 === 0 ? 'bg-[#FDF2F8]' : 'bg-white')}`}
                >

                  <td className={`p-3 font-black border-r border-white/60 ${i === 0 ? 'text-amber-600' : 'text-[#BE185D]'}`}>
                    {start + i + 1}
                  </td>

                  <td className="p-3 text-left font-black text-[#431407] uppercase border-r border-white/60 tracking-tight">
                    {p.name}
                  </td>

                  <td className="p-3 text-[#701A75] font-bold border-r border-white/60">
                    {p.matches}
                  </td>

                  <td className="p-3 font-black text-[#DB2777] text-sm border-r border-white/60 bg-[#FDF2F8]/40">
                    {p.runs}
                  </td>

                  <td className="p-3 text-[#9D174D] font-bold">
                    {sr}
                  </td>

                  <td className="p-3 text-[#9D174D] font-bold">
                    {p.fours}
                  </td>

                  <td className="p-3 text-[#9D174D] font-bold italic">
                    {p.sixes}
                  </td>

                </tr>

              )

            })}

          </tbody>

        </table>

        <div className="flex justify-center items-center gap-3 p-3">

          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            className="px-3 py-1 bg-pink-200 rounded"
          >
            Prev
          </button>

          <span className="font-bold text-sm">
            Page {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            className="px-3 py-1 bg-pink-200 rounded"
          >
            Next
          </button>

        </div>

      </div>

    </div>

  );
              }
