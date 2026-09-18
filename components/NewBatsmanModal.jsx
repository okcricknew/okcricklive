import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Plus, Loader2, X, User, ChevronRight, Target } from 'lucide-react';
import { db } from '../lib/firebase'; 
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function NewBatsmanModal({ isOpen, onSelect, currentStriker, currentNonStriker, tId, match }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [liveSquad, setLiveSquad] = useState([]);

  // --- ULTRA FAST TRANSITION (0.1s) ---
  const fastTransition = { duration: 0.18, ease: "easeOut" };

  useEffect(() => {
    if (!isOpen || !tId || !match?.battingTeam) return;
    const battingTeamId = match.battingTeam === match.teamA ? match.teamAId : match.teamBId;
    if (!battingTeamId) return;
    const q = query(collection(db, 'tournaments', tId, 'teams', battingTeamId, 'players'), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setLiveSquad(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [isOpen, tId, match]);

  useEffect(() => {
    if (!isOpen) { setIsAdding(false); setNewPlayerName(""); }
  }, [isOpen]);

  const handleQuickAdd = async () => {
    const name = newPlayerName.trim().toUpperCase();
    if (!name || loading) return;
    setLoading(true);
    try {
      const battingTeamId = match.battingTeam === match.teamA ? match.teamAId : match.teamBId;
      await addDoc(collection(db, 'tournaments', tId, 'teams', battingTeamId, 'players'), { name, createdAt: serverTimestamp() });
      setNewPlayerName(""); setIsAdding(false);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // --- AUTO SLOT SELECTION LOGIC ---
  {/* const handlePlayerClick = (playerName) => {
    // Agar striker khali hai, toh wahan add karo
    if (!currentStriker || currentStriker === "") {
      onSelect(playerName, 'striker');
    } 
    // Agar striker bhara hai par non-striker khali hai, toh wahan add karo
    else if (!currentNonStriker || currentNonStriker === "") {
      onSelect(playerName, 'nonStriker');
    }
    // Default safety
    else {
      onSelect(playerName, 'striker');
    }
  }; */}

    // --- AUTO SLOT SELECTION LOGIC ---
  const handlePlayerClick = async (playerName) => {
    const formattedName = playerName.trim().toUpperCase();

    try {
      // Agar tournament ID aur match ID dono hain, toh pehle sequence array update karo
      if (tId && match?.id) {
        const matchRef = doc(db, 'tournaments', tId, 'matches', match.id);
        await updateDoc(matchRef, {
          battingPlayers: arrayUnion(formattedName)
        });
      }
    } catch (error) {
      console.error("Error updating sequence list:", error);
    }

    // Aapka purana onSelect logic jise humne bilkul nahi chheda (Taaki baki app safe rahe)
    if (!currentStriker || currentStriker === "") {
      onSelect(playerName, 'striker');
    } 
    else if (!currentNonStriker || currentNonStriker === "") {
      onSelect(playerName, 'nonStriker');
    }
    else {
      onSelect(playerName, 'striker');
    }
  };
  

  const displayPlayers = liveSquad
    .filter(p => {
      const pName = p.name?.toUpperCase();
      const sName = typeof currentStriker === 'string' ? currentStriker.toUpperCase() : "";
      const nsName = typeof currentNonStriker === 'string' ? currentNonStriker.toUpperCase() : "";
      return pName !== sName && pName !== nsName;
    })
    .map(p => {
      const stats = match?.battingStats?.[p.name] || match?.battingStats?.[p.name.toUpperCase()] || {};
      const runs = Number(stats.runs || 0);
      const balls = Number(stats.balls || 0);
      const sr = balls > 0 ? ((runs / balls) * 100).toFixed(1) : "0.0";
      
      let dismissalText = "";
      const isRetiredHurt = stats?.outType?.toUpperCase() === "RETIRED HURT";
      if (isRetiredHurt) {dismissalText = "retired hurt";}
      if (stats.isOut && stats.outType !== "RETIRED HURT") {
        const type = stats.outType?.toUpperCase();
        const f = stats.fielderName || "";
        const b = stats.bowlerName || "";
        switch (type) {
          case 'BOWLED': dismissalText = `b ${b}`; break;
          case 'CAUGHT': dismissalText = `c ${f} b ${b}`; break;
          case 'LBW': dismissalText = `lbw b ${b}`; break;
          case 'RUN OUT': dismissalText = `run out (${f})`; break;
          case 'STUMPED': dismissalText = `st ${f} b ${b}`; break;
          case 'CAUGHT & BOWLED': dismissalText = `c & b ${b}`; break;
          case 'HIT WICKET': dismissalText = `hit wicket b ${b}`; break;
          case 'RETIRED OUT': dismissalText = `retired out`; break;
          case 'TIMED OUT': dismissalText = `timed out`; break;
          case 'OBSTRUCTING FIELD': dismissalText = `obstructing field`; break;
          default: dismissalText = "out";
        }
      }
      return { 
  name: p.name, 
  isAlreadyOut: stats?.isOut && !isRetiredHurt, 
  dismissalText, 
  stats: { ...stats, runs, balls, sr } 
};
    })
    .sort((a, b) => a.isAlreadyOut - b.isAlreadyOut);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10006] flex items-end sm:items-center justify-center overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.1 }}
            onClick={() => onSelect(null)} 
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" 
          />
          
          <motion.div 
            initial={{ y: 60, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 60, opacity: 0 }} 
            transition={fastTransition}
            className="w-full sm:max-w-sm bg-white rounded-t-[24px] sm:rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[82vh] will-change-transform"
          >
            
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Next Batsman</h3>
              <button onClick={() => setIsAdding(!isAdding)} className="p-2 rounded-lg bg-slate-100 text-slate-600 active:scale-90 transition-transform">
                {isAdding ? <X size={16} /> : <UserPlus size={16} />}
              </button>
            </div>

            <div className="overflow-y-auto no-scrollbar flex-1">
              <div className="px-2 pt-2 pb-6">
                {isAdding && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={fastTransition}
                    className="mx-2 mb-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-2 overflow-hidden"
                  >
                    <input autoFocus value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} placeholder="PLAYER NAME..." className="flex-1 bg-transparent outline-none text-xs font-bold uppercase" />
                    <button onClick={handleQuickAdd} className="bg-blue-600 text-white p-2 rounded-lg active:scale-95">{loading ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}</button>
                  </motion.div>
                )}

                {displayPlayers.map((player, idx) => (
                  <button
                    key={player.name + idx}
                    disabled={player.isAlreadyOut}
                    onClick={() => handlePlayerClick(player.name)}
                    className={`w-full text-left flex flex-col p-4 border-b border-slate-50 transition-colors active:bg-slate-100 ${player.isAlreadyOut ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center font-black text-[10px] ${player.isAlreadyOut ? 'bg-slate-200' : 'bg-slate-900 text-white'}`}>{player.name[0]}</div>
                        <div>
                          <p className="font-black text-xs uppercase text-slate-900">{player.name}</p>
                          {(player.isAlreadyOut || player.dismissalText === "retired hurt") && <p className="text-[8px] font-bold text-slate-500 uppercase italic">OUT {player.dismissalText}</p>}
                        </div>
                      </div>
                      {!player.isAlreadyOut && <ChevronRight size={14} className="text-slate-300" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-white">
              <button
                onClick={() => onSelect(null)}
                className="w-full py-3 rounded-xl bg-red-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-red-200 active:scale-95 transition-all"
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
