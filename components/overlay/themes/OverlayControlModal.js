"use client";

import { motion, AnimatePresence } from "framer-motion";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useState, useRef } from "react";

export default function OverlayControlModal({ 
  isOpen, 
  onClose, 
  children,
  tId,
  matchId,
  match
}) {

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeOverlay, setActiveOverlay] = useState(null); // ✅ NEW
  const timeoutRef = useRef(null);

  const activeMatchId = matchId || match?.id || match?.matchId;
const activeTournamentId = tId || match?.tournamentId || match?.tId;

const isInvalid = !activeTournamentId || !activeMatchId;
  

  const handleOverlayChange = async (type) => {
    try {
      setMessage(null);

      if (isInvalid) {
  setMessage("❌ Match data not loaded properly. Try again.");
  return;
      }
      

      setLoading(true);

if (type === "tossResult") {
  // Toss Result button click se hi green on/off hoga
  setActiveOverlay(
    match?.overlayType === "tossResult" ? null : "tossResult"
  );
} else {
  setActiveOverlay(type);

  if (timeoutRef.current) clearTimeout(timeoutRef.current);
  timeoutRef.current = setTimeout(() => {
    setActiveOverlay(null);
  }, 8000);
}

      const ref = doc(db, "tournaments", tId, "matches", matchId);

      let overlayType = type;

// ✅ Sirf Toss Result toggle hoga
if (type === "tossResult") {
  overlayType =
    match?.overlayType === "tossResult"
      ? "main"
      : "tossResult";
}

await updateDoc(ref, {
  overlayType
});

    } catch (e) {
      console.error(e);
      setMessage("❌ Firebase update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSquad = async (team) => {
  try {
    setLoading(true);
    setActiveOverlay(team);

if (timeoutRef.current) clearTimeout(timeoutRef.current);
timeoutRef.current = setTimeout(() => {
  setActiveOverlay(null);
}, 8000);

    const ref = doc(db, "tournaments", activeTournamentId, "matches", activeMatchId);
    

    await updateDoc(ref, {
      overlayType: "squad",
      squadTeam: team // 🔥 IMPORTANT
    });

  } catch (e) {
    console.error(e);
    setMessage("❌ Squad update failed");
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  // ✅ Button style helper
  const getBtnClass = (type) => {
  return `
    bg-gray-800 text-white py-3 rounded-xl font-bold
    transition-all duration-300
    ${activeOverlay === type 
      ? "bg-green-500 scale-95 shadow-lg" 
      : "hover:bg-gray-700"}
  `;
};

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999999] bg-white flex flex-col"
      >

        {/* HEADER */}
        <div className="flex items-center justify-center py-4 border-b">
          <h2 className="text-lg font-bold">Overlay Options</h2>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* MESSAGE */}
          {message && (
            <div className="text-center text-sm font-bold text-white bg-black py-2 rounded-lg">
              {message}
            </div>
          )}

          {/* WARNING */}
          {isInvalid && (
            <div className="text-center text-xs font-bold text-red-600">
              Waiting for match data...
            </div>
          )}

          {/* BUTTONS */}
          <div className="grid grid-cols-3 gap-4">

            <button
  onClick={() => handleSquad("teamA")}
  className={getBtnClass("teamA")}
  disabled={loading}
>
                         
  {match?.teamA || "Team A"} Squad
</button>

<button
  onClick={() => handleSquad("teamB")}
  className={getBtnClass("teamB")}
>
  {match?.teamB || "Team B"} Squad
</button>

    <button
  onClick={() => handleOverlayChange("battingSummary")}
  className={getBtnClass("battingSummary")}
>
  Batting Summary
</button>

    <button
  onClick={() => handleOverlayChange("bowlingSummary")}
  className={getBtnClass("bowlingSummary")}
>
  Bowling Summary
</button>

    <button
  onClick={() => handleOverlayChange("matchSummary")}
  className={getBtnClass("matchSummary")}
>
  Match Summary
</button>

    <button
  onClick={() => handleOverlayChange("firstInningsScorecard")}
  className={getBtnClass("firstInningsScorecard")}
>
  i1 Scorecard
</button>

    <button
              onClick={() => handleOverlayChange("firstInningsBowling")}
              className={getBtnClass("firstInningsBowling")}
            >
              i1 Bowling
            </button>

                    <button
      onClick={() => handleOverlayChange("secondInningsScorecard")}
      className={getBtnClass("secondInningsScorecard")}
    >
      i2 Scorecard
    </button>

    <button
      onClick={() => handleOverlayChange("secondInningsBowling")}
      className={getBtnClass("secondInningsBowling")}
    >
      i2 Bowling
    </button>

        <button
  onClick={() => handleOverlayChange("tossResult")}
  className={getBtnClass("tossResult")}
>
  Toss Result
</button>
                

          </div>

          {children}

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-bold"
          >
            CLOSE
          </button>
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
