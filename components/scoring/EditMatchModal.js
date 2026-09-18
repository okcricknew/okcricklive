import { useState, useEffect } from "react";
import { doc, updateDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function EditMatchModal({ match, tId, onClose }) {
  const [overs, setOvers] = useState("");
  const [matchType, setMatchType] = useState("league");
  const [tossWinner, setTossWinner] = useState("");
  const [tossDecision, setTossDecision] = useState("bat");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (match) {
      setOvers(match.overs || "");
      setMatchType((match.matchType || "league").toLowerCase());
      setTossWinner(match.tossWinner || match.teamA);

      const normalizedDecision = (match.tossDecision || "bat").toLowerCase();
      setTossDecision(normalizedDecision === "bowl" ? "bowl" : "bat");
    }
  }, [match]);

  const handleSave = async () => {
    if (!overs || Number(overs) <= 0) {
      alert("Overs must be greater than 0");
      return;
    }

    if (!tossWinner) {
      alert("Please select toss winner");
      return;
    }

    if (Number(overs) < (match.currentOver || 0)) {
      alert("Overs cannot be less than current over.");
      return;
    }

    setLoading(true);

    try {
      const matchRef = doc(db, "tournaments", tId, "matches", match.id);

      const tossChanged = match.tossWinner !== tossWinner || match.tossDecision !== tossDecision;

      // Default: preserve current teams if nothing changes
      let updateData = {
        overs: Number(overs),
        matchType: matchType.toLowerCase(),
        tossWinner,
        tossDecision,
        battingTeam: match.battingTeam,
        bowlingTeam: match.bowlingTeam,
        firstInningsBattingTeam: match.firstInningsBattingTeam || match.teamA,
      };

      if (tossChanged) {
        // Agar match started hai, balls aur players clear karo
        const matchStarted = (match.totalRuns || 0) > 0 || (match.totalWickets || 0) > 0 || (match.innings || 1) > 1;

        if (matchStarted) {
          const ballsRef = collection(matchRef, "balls");
          const ballsSnap = await getDocs(ballsRef);
          await Promise.all(ballsSnap.docs.map(d => deleteDoc(d.ref)));

          const playersRef = collection(matchRef, "players");
          const playersSnap = await getDocs(playersRef);
          await Promise.all(playersSnap.docs.map(d => deleteDoc(d.ref)));
        }

        // Assign first innings batting team based on toss decision
        const firstInningsBattingTeam =
          tossDecision === "bat"
            ? tossWinner
            : tossWinner === match.teamA
              ? match.teamB
              : match.teamA;

        const battingTeam = firstInningsBattingTeam; // LEFT side
        const bowlingTeam = firstInningsBattingTeam === match.teamA ? match.teamB : match.teamA; // RIGHT side

        updateData = {
          ...updateData,
          tossCompleted: true,
          setupComplete: false,
          status: "live",
          innings: 1,
          battingTeam,
          bowlingTeam,
          firstInningsBattingTeam,
          totalRuns: 0,
          totalWickets: 0,
          firstInningsScore: 0,
          firstInningsWickets: 0,
          secondInningsScore: 0,
          secondInningsWickets: 0,
          target: 0,
          striker: "",
          nonStriker: "",
          bowler: "",
          currentOver: 0,
          ballsInOver: 0,
          bowlerBalls: 0,
          ballHistory: [],
          battingStats: {},
          bowlingStats: {},
          extras: {
            innings1: { wd: 0, nb: 0, byes: 0, legByes: 0 },
            innings2: { wd: 0, nb: 0, byes: 0, legByes: 0 },
          },
          currentPartnership: { runs: 0, balls: 0 },
          winner: "",
          result: "",
          matchEnded: false,
        };
      }

      await updateDoc(matchRef, updateData);
      onClose();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update match.");
    }

    setLoading(false);
  };

  if (!match) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center mt-12 z-50">
      <div className="bg-white w-[95%] max-w-md p-6 rounded-xl shadow-2xl">
        <h2 className="text-xl font-bold mb-5 text-center">Edit Match Settings</h2>

        {/* Overs */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Overs</label>
          <input
            type="number"
            value={overs}
            onChange={(e) => setOvers(e.target.value)}
            className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Match Type */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Match Type</label>
          <select
            value={matchType}
            onChange={(e) => setMatchType(e.target.value)}
            className="w-full border p-2 rounded-lg"
          >
            <option value="league">League</option>
            <option value="quarter final">Quarter Final</option>
            <option value="semi final">Semi Final</option>
            <option value="final">Final</option>
          </select>
        </div>

        {/* Toss Winner */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Toss Winner</label>
          <select
            value={tossWinner}
            onChange={(e) => setTossWinner(e.target.value)}
            className="w-full border p-2 rounded-lg"
          >
            <option value={match.teamA}>{match.teamA}</option>
            <option value={match.teamB}>{match.teamB}</option>
          </select>
        </div>

        {/* Toss Decision */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-1">Toss Decision</label>
          <select
            value={tossDecision}
            onChange={(e) => setTossDecision(e.target.value)}
            className="w-full border p-2 rounded-lg"
          >
            <option value="bat">Bat First</option>
            <option value="bowl">Bowl First</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-400 px-4 py-2 rounded-lg text-white hover:opacity-90"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 px-4 py-2 rounded-lg text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
          }
