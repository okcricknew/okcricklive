"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCheck } from 'lucide-react';

export default function ReplaceBowlerModal({
  isOpen,
  onClose,
  match,
  fieldingSquad = [],
  onSubmit
}) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  if (!isOpen) return null;

  const currentBowler = match?.bowler || "None";

  const handleSubmit = () => {
    if (!selectedPlayer) {
      alert("Kripya ek bowler select karein!");
      return;
    }
    onSubmit(selectedPlayer.name);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white text-slate-900 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl flex flex-col font-sans"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold">Replace Bowler</h3>
              <p className="text-xs text-slate-300">Current Bowler: <span className="text-amber-400 font-semibold">{currentBowler}</span></p>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Player List */}
          <div className="p-4 max-h-[50vh] overflow-y-auto divide-y divide-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase mb-2">Select From Fielding Squad</p>
            {fieldingSquad.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Squad data nahi mila.</p>
            ) : (
              fieldingSquad.map((player) => {
                const isCurrent = player.name === currentBowler;
                const isSelected = selectedPlayer?.id === player.id;

                return (
                  <button
                    key={player.id || player.name}
                    disabled={isCurrent}
                    onClick={() => setSelectedPlayer(player)}
                    className={`w-full py-3 px-2 flex justify-between items-center text-left transition-colors ${
                      isCurrent ? 'opacity-40 bg-slate-50 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    <span className={`text-sm font-medium ${isSelected ? 'text-blue-600 font-bold' : 'text-slate-800'}`}>
                      {player.name} {isCurrent && '(Bowling)'}
                    </span>
                    {isSelected && <UserCheck size={18} className="text-blue-600" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md"
            >
              Update Bowler
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
              }

