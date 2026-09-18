"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';

export default function EditTotalScoreModal({
  isOpen,
  onClose,
  match,
  onSubmit
}) {
  const currentActiveKey = match?.currentInnings || `innings${match?.innings || 1}`;

  const [selectedInningsKey, setSelectedInningsKey] = useState(currentActiveKey);
  const [runs, setRuns] = useState('');
  const [wickets, setWickets] = useState('');

  // Always fetch latest live runs & wickets from match object
  const getInningsData = (key) => {
    const isLive = key === currentActiveKey;
    const targetInnings = match?.[key] || {};

    const liveRuns = isLive 
      ? (match?.totalRuns ?? match?.runs ?? targetInnings?.runs ?? 0)
      : (targetInnings?.runs ?? 0);

    const liveWickets = isLive 
      ? (match?.totalWickets ?? match?.wickets ?? targetInnings?.wickets ?? 0)
      : (targetInnings?.wickets ?? 0);

    return { runs: Number(liveRuns), wickets: Number(liveWickets) };
  };

  // Sync inputs dynamically whenever modal opens, tab changes, OR Match Undo/Scoring updates
  useEffect(() => {
    if (isOpen) {
      const activeKey = selectedInningsKey || currentActiveKey;
      const data = getInningsData(activeKey);
      setRuns(data.runs);
      setWickets(data.wickets);
    }
  }, [
    isOpen, 
    selectedInningsKey, 
    match?.totalRuns, 
    match?.totalWickets, 
    match?.runs, 
    match?.wickets, 
    match?.innings1, 
    match?.innings2,
    match?.updatedAt,
    match?.history
  ]);

  if (!isOpen) return null;

  const handleInningsTabChange = (key) => {
    setSelectedInningsKey(key);
    const data = getInningsData(key);
    setRuns(Number(data.runs || 0));
    setWickets(Number(data.wickets || 0));
  };

  const handleSave = () => {
    const liveInningsKey = match?.currentInnings || `innings${match?.innings || 1}`;
    
    // Fallback extraction for overs to avoid Firestore undefined crashes
    const existingOvers = match?.[selectedInningsKey]?.overs ?? match?.overs ?? 0;

    onSubmit({
      targetInningsKey: selectedInningsKey,
      runs: Number(runs || 0),
      wickets: Number(wickets || 0),
      overs: Number(existingOvers),
      isCurrentlyActiveInnings: selectedInningsKey === liveInningsKey
    });
  };

  // Calculate live badge text dynamically for tabs
  const inn1Data = getInningsData('innings1');
  const inn2Data = getInningsData('innings2');

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
              <h3 className="text-base font-bold">Edit Total Score & Wickets</h3>
              <p className="text-xs text-slate-300">Select Innings to Edit</p>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {/* INNINGS SWITCHER TABS */}
          <div className="flex bg-slate-100 p-1 m-4 mb-0 rounded-xl">
            <button
              type="button"
              onClick={() => handleInningsTabChange('innings1')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                selectedInningsKey === 'innings1'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1st Innings ({inn1Data.runs}/{inn1Data.wickets})
            </button>
            <button
              type="button"
              onClick={() => handleInningsTabChange('innings2')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                selectedInningsKey === 'innings2'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2nd Innings ({inn2Data.runs}/{inn2Data.wickets})
            </button>
          </div>

          {/* Form Fields */}
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                {selectedInningsKey === 'innings1' ? '1st' : '2nd'} Innings Total Runs
              </label>
              <input
                type="number"
                value={runs}
                onChange={(e) => setRuns(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-base focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                {selectedInningsKey === 'innings1' ? '1st' : '2nd'} Innings Wickets
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={wickets}
                onChange={(e) => setWickets(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-base focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-200 text-slate-700 font-bold text-xs uppercase rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-blue-600 text-white font-bold text-xs uppercase rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer hover:bg-blue-700"
            >
              <Save size={14} /> Save {selectedInningsKey === 'innings1' ? '1st' : '2nd'} Innings
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
                  }
                  
