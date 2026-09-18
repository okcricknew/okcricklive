import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExtraRunModal({ isOpen, onClose, onConfirm, initialType = 'WD' }) {
  const [extraType, setExtraType] = useState(initialType);
  const [nbSubCategory, setNbSubCategory] = useState('From Bat');

  // Fast Transition Config
  const fastTransition = { duration: 0.1, ease: "linear" };

  useEffect(() => {
    if (isOpen) {
      setExtraType(initialType);
      setNbSubCategory('From Bat');
    }
  }, [isOpen, initialType]);

  const extraTypes = [
    { id: 'WD', label: 'WIDE' },
    { id: 'NB', label: 'NO BALL' },
    { id: 'BYE', label: 'BYE' },
    { id: 'LB', label: 'LEG BYE' },
  ];

  const runOptions = [0, 1, 2, 3, 4, 5, 6];

  const handleQuickSelect = (runs) => {
    onConfirm({
      type: extraType,
      runs: Number(runs), 
      isExtra: true,
      subCategory: extraType === 'NB' ? nbSubCategory : null
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10007] flex items-end justify-center">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={fastTransition}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          />

          <motion.div 
            initial={{ y: "20%", opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: "20%", opacity: 0 }}
            transition={fastTransition}
            className="relative w-full max-w-md bg-white rounded-t-[32px] overflow-hidden shadow-2xl pb-10"
          >
            <div className="w-full flex justify-center pt-3 pb-1">
              <div className="w-16 h-1.5 bg-slate-200 rounded-full" />
            </div>

            {/* Extra Type Switcher */}
            <div className="flex justify-around border-b border-slate-100 mb-2">
              {extraTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setExtraType(t.id)}
                  className={`py-4 px-2 text-[10px] font-black tracking-tighter transition-all ${
                    extraType === t.id ? 'text-[#a30b43] border-b-2 border-[#a30b43]' : 'text-slate-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="px-5 space-y-6">
              {extraType === 'NB' && (
                <div className="flex justify-center gap-4 bg-slate-50 p-3 rounded-2xl">
                  {['From Bat', 'Bye', 'Leg Bye'].map((cat) => (
                    <button 
                      key={cat}
                      onClick={() => setNbSubCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                        nbSubCategory === cat ? 'bg-[#a30b43] text-white' : 'bg-white text-slate-500 border border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Selection Grid */}
              <div className="grid grid-cols-3 gap-3">
                {runOptions.map((run) => (
                  (extraType === 'WD' && run === 6) ? null : (
                    <button
                      key={run}
                      onClick={() => handleQuickSelect(run)}
                      className="group flex flex-col items-center justify-center py-4 border-[1.5px] border-slate-200 rounded-2xl hover:border-[#a30b43] hover:bg-rose-50 transition-all active:scale-95"
                    >
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-[#a30b43]">{extraType} +</span>
                      <span className="text-xl font-black text-slate-900 group-hover:text-[#a30b43]">{run}</span>
                    </button>
                  )
                ))}
              </div>

              <button 
                onClick={onClose}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
