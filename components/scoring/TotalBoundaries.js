import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function TotalBoundaries({ tId }) {
  const [stats, setStats] = useState({
    fours: 0,
    sixes: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const matchesSnap = await getDocs(
          collection(db, "tournaments", tId, "matches")
        );

        let total4 = 0;
        let total6 = 0;

        matchesSnap.forEach((doc) => {
          const data = doc.data();
          const history = data.ballHistory || [];

          history.forEach((ball) => {
            const isRunsOffBat =
              ball.type === "NORMAL" ||
              (ball.type === "NB" && ball.subCategory === "From Bat");

            if (isRunsOffBat) {
              if (Number(ball.runs) === 4) total4++;
              if (Number(ball.runs) === 6) total6++;
            }
          });
        });

        setStats({
          fours: total4,
          sixes: total6,
        });
      } catch (error) {
        console.error("Error calculating boundaries:", error);
      }
    };

    if (tId) loadStats();
  }, [tId]);

  return (
    <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-lime-400 rounded-2xl shadow-2xl p-5 text-center border border-green-300 backdrop-blur-lg">

      <h2 className="text-xl font-extrabold mb-4 text-white tracking-wide drop-shadow">
        🏏 Tournament Boundaries
      </h2>

      <div className="flex justify-center gap-12 text-lg font-semibold">

        <div className="flex flex-col bg-white/20 backdrop-blur-md px-6 py-4 rounded-xl shadow-lg border border-white/30">
          <span className="text-xs text-white uppercase tracking-widest">
            🔥 Fours
          </span>
          <span className="text-white text-4xl font-black drop-shadow-lg">
            {stats.fours}
          </span>
        </div>

        <div className="flex flex-col bg-white/20 backdrop-blur-md px-6 py-4 rounded-xl shadow-lg border border-white/30">
          <span className="text-xs text-white uppercase tracking-widest">
            🚀 Sixes
          </span>
          <span className="text-white text-4xl font-black drop-shadow-lg">
            {stats.sixes}
          </span>
        </div>

      </div>

      <p className="mt-4 text-[10px] text-white/80 uppercase font-semibold tracking-wider">
        Based on live ball-by-ball history
      </p>

    </div>
  );
}
