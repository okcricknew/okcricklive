"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReplaceBatsmanModal({
  isOpen,
  onClose,
  match,
  battingSquad = [],
  onSubmit
}) {
  const [step, setStep] = useState('SELECT_TARGET'); // 'SELECT_TARGET' | 'SELECT_REPLACEMENT'
  const [selectedPosition, setSelectedPosition] = useState(null); // 'striker' | 'nonStriker'
  const [targetPlayerName, setTargetPlayerName] = useState('');

  if (!isOpen) return null;

  const currentStriker = match?.striker || 'Striker';
  const currentNonStriker = match?.nonStriker || 'Non-Striker';

  // Step 1: Target Batter Selection
  const handleSelectTarget = (position, name) => {
    setSelectedPosition(position);
    setTargetPlayerName(name);
    setStep('SELECT_REPLACEMENT');
  };

  // Step 2: Available Squad Filter
  const availablePlayers = battingSquad.filter((player) => {
    const name = player.name || player.playerName || player.id;
    return name !== currentStriker && name !== currentNonStriker;
  });

  const handleConfirmReplacement = (newPlayerName) => {
    onSubmit(newPlayerName, selectedPosition);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[rgb(228,228,228)] text-slate-900 w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col gap-2 font-sans"
        >
          {/* STEP 1: Kise replace karna hai? */}
          {step === 'SELECT_TARGET' && (
            <>
              <h3 className="text-center font-bold text-lg text-slate-800 my-1">
                Replace Batter
              </h3>

              <div className="flex flex-col gap-2.5 my-1">
                <button
                  type="button"
                  onClick={() => handleSelectTarget('striker', currentStriker)}
                  className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 active:scale-95 transition rounded-2xl font-bold text-base text-slate-900 shadow-sm border border-slate-200/60 uppercase cursor-pointer"
                >
                  {currentStriker}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTarget('nonStriker', currentNonStriker)}
                  className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 active:scale-95 transition rounded-2xl font-bold text-base text-slate-900 shadow-sm border border-slate-200/60 uppercase cursor-pointer"
                >
                  {currentNonStriker}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3.5 bg-slate-100/80 hover:bg-slate-200 transition rounded-2xl font-bold text-base text-slate-800 border border-slate-200/60 mt-1 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {/* STEP 2: Who is Replacing [NAME]? */}
          {step === 'SELECT_REPLACEMENT' && (
            <>
              <h3 className="text-center font-bold text-base text-slate-800 my-1">
                Who is Replacing {targetPlayerName}
              </h3>

              <div className="flex flex-col gap-2 my-1 max-h-[60vh] overflow-y-auto pr-1">
                {availablePlayers.length > 0 ? (
                  availablePlayers.map((player) => {
                    const name = player.name || player.playerName || player.id;
                    return (
                      <button
                        key={player.id || name}
                        type="button"
                        onClick={() => handleConfirmReplacement(name)}
                        className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 active:scale-95 transition rounded-2xl font-semibold text-base text-slate-900 shadow-sm border border-slate-200/60 cursor-pointer"
                      >
                        {name}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-center text-xs text-slate-500 py-4">
                    Koi extra player squad me nahi mila.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => setStep('SELECT_TARGET')}
                  className="w-full py-3.5 bg-slate-100/80 hover:bg-slate-200 transition rounded-2xl font-bold text-base text-slate-800 border border-slate-200/60 mt-1 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
