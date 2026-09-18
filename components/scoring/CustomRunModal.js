import { useState } from "react";

export default function CustomRunModal({ isOpen, onClose, onConfirm }) {
  const [runs, setRuns] = useState(1);
  const [penalty, setPenalty] = useState(false);
  const [countBall, setCountBall] = useState(true);
  const [overthrow, setOverthrow] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
      <div className="bg-white w-full rounded-t-2xl p-5">
        <h2 className="text-center font-bold text-lg mb-4">Custom Runs</h2>

        {/* RUN BUTTONS */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRuns(n)}
              className={`border rounded-xl py-3 font-bold ${
                runs === n ? "bg-red-600 text-white" : "bg-white"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* MANUAL RUN INPUT */}
        <input
          type="number"
          value={runs}
          placeholder="Enter Custom Runs"
          className="w-full border rounded-lg p-3 mb-4"
          onChange={(e) => setRuns(Number(e.target.value))}
        />

        {/* --- ADDED OVERTHROW CHECKBOX --- */}
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            id="overthrow"
            checked={overthrow}
            onChange={() => setOverthrow(!overthrow)}
          />
          <label htmlFor="overthrow">Overthrow (+4 Runs)</label>
        </div>

        {/* PENALTY */}
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            id="penalty"
            checked={penalty}
            onChange={() => {
              setPenalty(!penalty);
              // Cricket Rule: Aksar penalty dead ball par hoti hai isliye ball count off kar dete hain
              // Par user ise manually on kar sakta hai (e.g. Helmet hit)
              if (!penalty) setCountBall(false);
            }}
          />
          <label htmlFor="penalty">Penalty Runs</label>
        </div>

        {/* COUNT BALL - Disabled hataya taaki penalty me bhi ball count toggle ho sake */}
        <div className="flex items-center gap-2 mb-5">
          <input
            type="checkbox"
            id="countBall"
            checked={countBall}
            onChange={() => setCountBall(!countBall)}
          />
          <label htmlFor="countBall">Count the Ball</label>
        </div>

        <button
          onClick={() => {
            // Calculation Logic
            let finalRuns = Number(runs);

            if (overthrow) {
              finalRuns = finalRuns + 4;
            }

            // Object pass ho raha hai (Ensure handleBall handles this object)
            onConfirm({
              runs: finalRuns,
              type: penalty ? "PENALTY" : "NORMAL",
              countBall: countBall,
            });

            // State Reset for next time
            setPenalty(false);
            setOverthrow(false);
            setCountBall(true);
            onClose();
          }}
          className="w-full bg-red-600 text-white py-3 rounded-xl font-bold"
        >
          UPDATE SCORE
        </button>

        <button onClick={onClose} className="w-full text-red-600 mt-3">
          CANCEL
        </button>
      </div>
    </div>
  );
}
