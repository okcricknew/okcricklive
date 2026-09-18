import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, ShieldCheck, ChevronDown } from 'lucide-react';

const ALL_OUT_TYPES = [
  { id: 'bowled', label: 'Bowled', bowler: true, fielder: false, mustBeStriker: true, allowedOn: ['NORMAL'] },
  { id: 'caught', label: 'Caught', bowler: true, fielder: true, mustBeStriker: true, allowedOn: ['NORMAL'] },
  { id: 'lbw', label: 'LBW', bowler: true, fielder: false, mustBeStriker: true, allowedOn: ['NORMAL'] },
  { id: 'runout', label: 'Run Out', bowler: false, fielder: true, mustBeStriker: false, allowedOn: ['NORMAL','WD','NB'] },
  { id: 'stumped', label: 'Stumped', bowler: true, fielder: true, mustBeStriker: true, allowedOn: ['WD'] },
  { id: 'hit_wicket', label: 'Hit Wicket', bowler: true, fielder: false, mustBeStriker: true, allowedOn: ['NORMAL','NB'] },
  { id: 'retired_out', label: 'Retired Out', bowler: false, fielder: false, mustBeStriker: false, allowedOn: ['NORMAL','WD','NB'] },

  { id: 'retired_hurt', label: 'Retired Hurt', bowler: false, fielder: false, mustBeStriker: false, allowedOn: ['NORMAL','WD','NB'] },

  { id: 'timed_out', label: 'Timed Out', bowler: false, fielder: false, mustBeStriker: false, allowedOn: ['NORMAL'] },

  { id: 'obstructing_field', label: 'Obstructing Field', bowler: false, fielder: false, mustBeStriker: false, allowedOn: ['NORMAL','WD','NB'] },
];

export default function OutModal({ isOpen, onClose, striker, nonStriker, fieldingSquad = [], onConfirm, match, isProcessing}) {
  const [outType, setOutType] = useState(null);
  const [ballType, setBallType] = useState('NORMAL'); 
  const [whoIsOut, setWhoIsOut] = useState('striker');
  const [selectedFielder, setSelectedFielder] = useState('');
  const [runsCompleted, setRunsCompleted] = useState(0);

  const selectedTypeObj = ALL_OUT_TYPES.find(t => t.id === outType);

  useEffect(() => {
    if (selectedTypeObj && !selectedTypeObj.allowedOn.includes(ballType)) {
      setOutType(null);
    }
  }, [ballType, selectedTypeObj]);

  useEffect(() => {
    if (selectedTypeObj?.mustBeStriker) setWhoIsOut('striker');
  }, [outType, selectedTypeObj]);

  useEffect(() => {
    if (!isOpen) {
      setOutType(null);
      setBallType('NORMAL');
      setWhoIsOut('striker');
      setSelectedFielder('');
      setRunsCompleted(0);
    }
  }, [isOpen]);

  const handleConfirm = () => {

    const isRetiredHurt = selectedTypeObj?.id === "retired_hurt";
    if (!outType || isProcessing) return;
    
    // --- Integration Fixes for useScoringLogic ---
    const currentBowler = match?.bowler || "Bowler";
    const isStrikerOut = whoIsOut === 'striker';
    const dismissedBatsman = isStrikerOut ? striker : nonStriker;
    const dismissedBatsmanId = isStrikerOut ? match?.strikerId : match?.nonStrikerId;

    onConfirm({
      outType: selectedTypeObj.label.toUpperCase(),
      ballType: ballType,
      isStriker: isStrikerOut,
      batsmanName: dismissedBatsman,
      batsmanId: dismissedBatsmanId || "", // Ensuring ID is passed for Firebase
      bowlerWicket: selectedTypeObj.bowler,
      fielderName: selectedTypeObj.fielder ? selectedFielder : null,
      bowlerName: currentBowler, 
      runsScored: Number(runsCompleted),
      isOut: !isRetiredHurt
    });
    onClose();
  };

  const isValid = outType && (selectedTypeObj?.fielder ? selectedFielder !== '' : true);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10005] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full sm:max-w-md bg-white rounded-t-[40px] sm:rounded-[32px] overflow-hidden shadow-2xl relative max-h-[95vh] flex flex-col z-10"
          >
            {/* Header */}
            <div className="p-6 bg-red-50/50 flex justify-between items-center border-b border-red-100 shrink-0">
               <div>
                  <h3 className="text-2xl font-black text-[#C10E44] italic uppercase leading-tight tracking-tighter">Wicket Lost</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Match Officials</p>
               </div>
               <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm text-slate-400 active:scale-90 transition-transform">
                 <X size={20} />
               </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="p-6 overflow-y-auto no-scrollbar space-y-8 pb-10">
              
              {/* Step 1: Ball Type */}
              {outType !== "timed_out" && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-slate-900 rounded-full" />
                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">1. Delivery Ball Type</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {['NORMAL', 'WD', 'NB'].map((t) => (
                    <button key={t} onClick={() => setBallType(t)}
                      className={`py-3.5 rounded-2xl font-black text-xs transition-all border-2 ${ballType === t ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400'}`}>
                      {t === 'NORMAL' ? 'LEGAL' : t}
                    </button>
                  ))}
                </div>
              </section>
)}

              {/* Step 2: Dismissal Type */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-red-600 rounded-full" />
                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">2. Out Method</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {ALL_OUT_TYPES.filter(t => t.allowedOn.includes(ballType)).map((t) => (
                    <button key={t.id} onClick={() => setOutType(t.id)}
                      className={`py-4 rounded-2xl border-2 font-black uppercase text-[11px] transition-all flex items-center justify-center text-center ${outType === t.id ? 'border-red-600 bg-red-600 text-white shadow-lg scale-[1.03]' : 'border-slate-200 bg-white text-slate-600 active:bg-slate-100'}`}>
                      {t.label}
                      {outType === t.id && <ShieldCheck size={14} />}
                    </button>
                  ))}
                </div>
              </section>

              {outType && (
                <div className="space-y-8">
                  {/* Step 3: Who is Out */}
                  {!selectedTypeObj?.mustBeStriker && (
                    <section>
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-3 italic">3. Who is Out?</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[{role: 'striker', name: striker}, {role: 'nonStriker', name: nonStriker}].map((p) => (
                          <button key={p.role} onClick={() => setWhoIsOut(p.role)}
                            className={`p-4 rounded-3xl border-2 text-left transition-all ${whoIsOut === p.role ? 'border-[#C10E44] bg-[#C10E44]/5' : 'border-slate-100 bg-white'}`}>
                            <div className="flex items-center gap-2 mb-1">
                               <User size={12} className={whoIsOut === p.role ? 'text-[#C10E44]' : 'text-slate-300'} />
                               <span className={`text-[9px] font-black uppercase ${whoIsOut === p.role ? 'text-[#C10E44]' : 'text-slate-400'}`}>{p.role}</span>
                            </div>
                            <span className={`font-black uppercase truncate block text-sm ${whoIsOut === p.role ? 'text-slate-900' : 'text-slate-400'}`}>{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Step 4: Fielder Dropdown */}
                  {selectedTypeObj?.fielder && outType !== "obstructing_field" && (
                    <section>
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-3">4. Fielder Involved</p>
                      <div className="relative group">
                        <select 
                          value={selectedFielder} 
                          onChange={(e) => setSelectedFielder(e.target.value)}
                          className="w-full appearance-none bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-black uppercase text-xs text-slate-700 focus:border-slate-900 outline-none transition-all cursor-pointer"
                        >
                          <option value="">Select Fielder...</option>
                          {fieldingSquad.map((f, i) => {
                            const name = typeof f === 'string' ? f : (f?.name || "Player");
                            return <option key={i} value={name}>{name}</option>;
                          })}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                          <ChevronDown size={18} />
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Step 5: Run Out Runs Logic */}
                  {(outType === 'runout' || ballType !== 'NORMAL') &&
outType !== 'retired_out' &&
outType !== 'retired_hurt' &&
outType !== 'timed_out' && (
                    <section>
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-3">5. Extra Runs (if any)</p>
                      <div className="grid grid-cols-6 gap-2">
                        {[0, 1, 2, 3, 4, 6].map((num) => (
                          <button key={num} onClick={() => setRunsCompleted(num)}
                            className={`h-10 rounded-xl font-black text-xs transition-all border-2 ${runsCompleted === num ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                            {num}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* Confirm Button */}
              <button 
                onClick={handleConfirm} 
                disabled={!isValid || isProcessing}
                className={`w-full py-5 rounded-3xl font-black italic uppercase tracking-widest transition-all duration-300 ${isValid ? 'bg-[#C10E44] text-white shadow-2xl shadow-red-200 active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
              >
                Confirm Dismissal
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
                }
