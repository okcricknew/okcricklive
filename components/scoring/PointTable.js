import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function PointsTable({ tId }) {

  const [teams, setTeams] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
const teamsPerPage = 8;

  useEffect(() => {

    const loadTable = async () => {

      const matchesSnap = await getDocs(
        collection(db, "tournaments", tId, "matches")
      );

      let table = {};

      matchesSnap.forEach((doc) => {

        const m = doc.data();

        if (m.status !== "completed") return;

        const teamA = m.teamA;
        const teamB = m.teamB;

        if (!table[teamA]) {
          table[teamA] = createTeam(teamA);
        }

        if (!table[teamB]) {
          table[teamB] = createTeam(teamB);
        }

        table[teamA].played += 1;
        table[teamB].played += 1;

        if (m.firstBattingTeam === teamA) {

  table[teamA].runsFor += m.firstInningsScore || 0;
  table[teamA].runsAgainst += m.secondInningsScore || 0;

  table[teamB].runsFor += m.secondInningsScore || 0;
  table[teamB].runsAgainst += m.firstInningsScore || 0;

} else {

  table[teamB].runsFor += m.firstInningsScore || 0;
  table[teamB].runsAgainst += m.secondInningsScore || 0;

  table[teamA].runsFor += m.secondInningsScore || 0;
  table[teamA].runsAgainst += m.firstInningsScore || 0;

        }

        // BallHistory se balls count karo
const balls1 = (m.ballHistory || []).filter(
  b => b.innings === 1 && b.type !== "WD" && b.type !== "NB"
).length;

const balls2 = (m.ballHistory || []).filter(
  b => b.innings === 2 && b.type !== "WD" && b.type !== "NB"
).length;

// Overs calculate karo
let firstOvers = parseFloat((balls1 / 6).toFixed(4));
let secondOvers = parseFloat((balls2 / 6).toFixed(4));


        if (m.firstBattingTeam === teamA) {

  table[teamA].oversFaced += firstOvers;
  table[teamA].oversBowled += secondOvers;

  table[teamB].oversFaced += secondOvers;
  table[teamB].oversBowled += firstOvers;

} else {

  table[teamB].oversFaced += firstOvers;
  table[teamB].oversBowled += secondOvers;

  table[teamA].oversFaced += secondOvers;
  table[teamA].oversBowled += firstOvers;

        }

        if (m.result === "tie") {

          table[teamA].tie += 1;
          table[teamB].tie += 1;

          table[teamA].points += 1;
          table[teamB].points += 1;

        } else if (m.winner === teamA) {

          table[teamA].win += 1;
          table[teamB].loss += 1;

          table[teamA].points += 2;

        } else if (m.winner === teamB) {

          table[teamB].win += 1;
          table[teamA].loss += 1;

          table[teamB].points += 2;

        }

      });

      Object.values(table).forEach((team) => {

        const runRateFor =
          team.oversFaced > 0
            ? team.runsFor / team.oversFaced
            : 0;

        const runRateAgainst =
          team.oversBowled > 0
            ? team.runsAgainst / team.oversBowled
            : 0;

        team.nrr = (runRateFor - runRateAgainst).toFixed(3);

      });

      let list = Object.values(table);

      list.sort((a, b) => {

        if (b.points !== a.points) {
          return b.points - a.points;
        }

        return parseFloat(b.nrr) - parseFloat(a.nrr);

      });

      setTeams(list);

    };

    loadTable();

  }, [tId]);

  const createTeam = (name) => ({
    teamName: name,
    played: 0,
    win: 0,
    loss: 0,
    tie: 0,
    points: 0,
    runsFor: 0,
    runsAgainst: 0,
    oversFaced: 0,
    oversBowled: 0,
    nrr: 0
  });

  const indexOfLast = currentPage * teamsPerPage;
const indexOfFirst = indexOfLast - teamsPerPage;
const currentTeams = teams.slice(indexOfFirst, indexOfLast);

const totalPages = Math.ceil(teams.length / teamsPerPage);

  return (

    <div className="bg-white rounded-xl shadow-lg border border-[#F472B6]/30 overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-[#D946EF] to-[#F472B6] p-3 shadow-inner">
        <h2 className="text-white text-center font-black uppercase italic tracking-widest text-sm flex items-center justify-center gap-2">
          🏆 Tournament Points Table
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
                Team
              </th>

              <th className="p-3 font-black uppercase text-center border-r border-white">
                P
              </th>

              <th className="p-3 font-black uppercase text-center border-r border-white">
                W
              </th>

              <th className="p-3 font-black uppercase text-center border-r border-white">
                L
              </th>

              <th className="p-3 font-black uppercase text-center border-r border-white">
                T
              </th>

              <th className="p-3 font-black uppercase text-center border-r border-white text-[#DB2777]">
                Pts
              </th>

              <th className="p-3 font-black uppercase text-center">
                NRR
              </th>

            </tr>
          </thead>

          <tbody>

            {currentTeams.map((team, i) => (

              <tr
                key={i}
                className={`border-b border-[#F9A8D4]/20 text-center transition-all
                ${i === 0 ? 'bg-pink-100/50' : (i % 2 === 0 ? 'bg-[#FDF2F8]' : 'bg-white')}`}
              >

                <td className={`p-3 font-black border-r border-white/60 ${i === 0 ? 'text-amber-600' : 'text-[#BE185D]'}`}>
                  {indexOfFirst + i + 1}
                </td>

                <td className="p-3 text-left font-black text-[#431407] uppercase border-r border-white/60 tracking-tight">
                  {team.teamName}
                </td>

                <td className="p-3 text-[#9D174D] font-bold">
                  {team.played}
                </td>

                <td className="p-3 text-green-600 font-bold">
                  {team.win}
                </td>

                <td className="p-3 text-red-500 font-bold">
                  {team.loss}
                </td>

                <td className="p-3 text-[#9D174D] font-bold">
                  {team.tie}
                </td>

                <td className="p-3 font-black text-[#DB2777]">
                  {team.points}
                </td>

                <td
                  className={`p-3 font-bold ${
                    team.nrr >= 0
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {team.nrr > 0 ? "+" : ""}
                  {team.nrr}
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

      </div>

    </div>

  );
    }
