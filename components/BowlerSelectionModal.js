import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, UserPlus, Loader2, ChevronRight } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc } from 'firebase/firestore';

export default function BowlerSelectionModal({ isOpen, onClose, onSelect, lastBowler, match, tId }) {
  const [liveBowlingSquad, setLiveBowlingSquad] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fastTransition = { duration: 0.18, ease: "easeOut" };

  const isTeamABatting = match.battingTeam?.toLowerCase() === match.teamA?.toLowerCase();
  const bowlingTeamId = isTeamABatting ? match.teamBId : match.teamAId;

  useEffect(() => {
    if (!isOpen || !tId || !bowlingTeamId) return;

    const q = query(
      collection(db, 'tournaments', tId, 'teams', bowlingTeamId, 'players'),
      orderBy("name", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setLiveBowlingSquad(snap.docs.map(d => d.data().name));
      },
      (error) => console.error("Bowler fetch error:", error)
    );

    return () => unsubscribe();
  }, [isOpen, tId, bowlingTeamId]);

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim() || !bowlingTeamId || isSaving) return;

    setIsSaving(true);

    try {
      await addDoc(
        collection(db, 'tournaments', tId, 'teams', bowlingTeamId, 'players'),
        {
          name: newPlayerName.trim().toUpperCase(),
          createdAt: new Date()
        }
      );

      setNewPlayerName('');
      setIsAdding(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const getBowlerStats = (playerName) => {
    const stats =
      match?.bowlingStats?.[playerName] ||
      match?.bowlingStats?.[playerName.toUpperCase()] ||
      {};

    const runs = Number(stats.runs || 0);
    const wickets = Number(stats.wickets || 0);
    const overs = Number(stats.overs || 0);
    const balls = Number(stats.balls || 0);

    const totalBalls = (overs * 6) + balls;

    const economy =
      totalBalls > 0
        ? ((runs / totalBalls) * 6).toFixed(1)
        : "0.0";

    const dotBalls =
      match?.ballHistory?.filter(
        (ball) =>
          ball.bowler?.toUpperCase() === playerName.toUpperCase() &&
          ball.type === 'NORMAL' &&
          Number(ball.runs) === 0 &&
          (!ball.isWicket || ball.wicketType === 'RUN OUT')
      ).length || 0;

    return {
      overs,
      balls,
      runs,
      wickets,
      economy,
      dotBalls,
      hasBowled: totalBalls > 0
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10005] flex items-end justify-center bg-black/60 p-0 overflow-hidden">

      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 cursor-pointer z-0"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={fastTransition}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#F4F4F4] w-full max-w-md rounded-t-[2rem] shadow-2xl max-h-[80vh] flex flex-col overflow-hidden relative z-20 will-change-transform"
      >

        {/* Notch */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mt-3 mb-1 shrink-0" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex justify-between items-center">

            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-widest flex items-center gap-2 uppercase">
                <BarChart3 size={18} className="text-blue-600" />
                Select Bowler
              </h2>

              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tight italic">
                Starting Over {(match?.currentOver || 0) + 1}
              </p>
            </div>

            <div className="flex gap-2">

              <button
                onClick={() => setIsAdding(!isAdding)}
                className={`p-2 rounded-xl transition-all active:scale-90 ${
                  isAdding
                    ? 'bg-red-50 text-red-500'
                    : 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                }`}
              >
                {isAdding ? <X size={18} /> : <UserPlus size={18} />}
              </button>

              <button
                onClick={onClose}
                className="p-2 bg-slate-100 rounded-xl text-slate-400 active:scale-90"
              >
                <X size={18} />
              </button>

            </div>
          </div>
        </div>

        {/* Add Player */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="bg-white border-b border-slate-200"
            >

              <div className="p-4">

                <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-200">

                  <input
                    autoFocus
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="BOWLER NAME..."
                    className="flex-grow bg-transparent px-3 py-2 text-xs font-black text-slate-800 uppercase outline-none"
                  />

                  <button
                    onClick={handleAddPlayer}
                    disabled={isSaving || !newPlayerName.trim()}
                    className="bg-blue-600 text-white px-5 rounded-lg font-black text-[10px] uppercase active:scale-95 transition-all"
                  >
                    {isSaving
                      ? <Loader2 size={14} className="animate-spin" />
                      : "ADD"}
                  </button>

                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bowler List */}
        <div className="flex-grow overflow-y-auto p-4 scrollbar-hide">

          {liveBowlingSquad.map((name, i) => {

            const stats = getBowlerStats(name);
            const isLast = name?.toLowerCase() === lastBowler?.toLowerCase();

            return (
              <button
                key={i}
                disabled={isLast}
                onClick={() => onSelect(name)}
                className={`w-full mb-2 p-4 flex items-center gap-4 transition-all rounded-2xl border text-left ${
                  isLast
                    ? 'opacity-40 bg-slate-200 border-transparent'
                    : 'bg-white border-slate-100 shadow-sm active:bg-blue-50 active:scale-[0.98]'
                }`}
              >

                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                    isLast
                      ? 'bg-slate-300 text-slate-500'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  {name[0]}
                </div>

                <div className="flex-grow">

                  <div className="flex justify-between items-center">
                    <span className="font-black text-xs text-slate-800 uppercase tracking-tight">
                      {name}
                    </span>

                    {isLast
                      ? (
                        <span className="text-[8px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-black">
                          RESTING
                        </span>
                      )
                      : (
                        <ChevronRight size={16} className="text-slate-300" />
                      )
                    }
                  </div>

                  {stats.hasBowled && (
                    <div className="flex items-center gap-3 text-[10px] font-black mt-1.5">

                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">O</span>
                        <span className="text-slate-900">{stats.overs}.{stats.balls}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">W</span>
                        <span className="text-blue-600">{stats.wickets}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">R</span>
                        <span className="text-red-500">{stats.runs}</span>
                      </div>

                      <div className="flex items-center gap-1 bg-emerald-50 px-1.5 rounded text-emerald-600">
                        DOT {stats.dotBalls}
                      </div>

                      <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                        <span className="text-slate-400 uppercase">Eco</span>
                        <span className="text-slate-900">{stats.economy}</span>
                      </div>

                    </div>
                  )}

                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200">
          <button
            onClick={() => onClose()}
            className="w-full py-3 rounded-xl bg-red-500 text-white text-xs font-black tracking-widest uppercase shadow-lg shadow-red-200 active:scale-95 transition-all"
          >
            Cancel
          </button>
        </div>

      </motion.div>
    </div>
  );
                      }
