import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  doc, updateDoc, arrayUnion, onSnapshot, addDoc, 
  collection, serverTimestamp, query 
} from 'firebase/firestore'; 
import { AnimatePresence, motion } from "framer-motion";
import { Users, Plus, PlayCircle, Loader2, X, AlertCircle } from 'lucide-react';
import OverlayControlModal from "./overlay/themes/OverlayControlModal";

let modalMatchCache = {};

export default function PlayerSelectionModal({ isOpen, match, onStart, onClose }) {
  const [battingInput, setBattingInput] = useState('');
  const [bowlingInput, setBowlingInput] = useState('');
  const [striker, setStriker] = useState('');
  const [nonStriker, setNonStriker] = useState('');
  const [bowler, setBowler] = useState('');
  const [loadingType, setLoadingType] = useState(null); 
  const [openOverlay, setOpenOverlay] = useState(false);
  
  const cacheKey = match?.id;

const [localMatchData, setLocalMatchData] = useState(
  () => modalMatchCache[cacheKey] || match || null
);
  const [globalBattingPlayers, setGlobalBattingPlayers] = useState([]);
  const [globalBowlingPlayers, setGlobalBowlingPlayers] = useState([]);

  useEffect(() => {
    if (isOpen && match) {
      setLocalMatchData(match);
      setStriker(''); setNonStriker(''); setBowler('');
    }
  }, [isOpen, match?.innings]);

  useEffect(() => {
    if (!isOpen || !match?.id || !match?.tournamentId) return;
    const matchRef = doc(db, 'tournaments', match.tournamentId, 'matches', match.id);
    const unsubscribe = onSnapshot(matchRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };

setLocalMatchData(data);
modalMatchCache[cacheKey] = data; // 🔥 cache store
      }
    });
    return () => unsubscribe();
  }, [isOpen, match?.id]);

  useEffect(() => {
    if (!isOpen || !localMatchData) return;
    const isTeamA_Batting = localMatchData.battingTeam === localMatchData.teamA;
    const battingTeamId = isTeamA_Batting ? localMatchData.teamAId : localMatchData.teamBId;
    const bowlingTeamId = isTeamA_Batting ? localMatchData.teamBId : localMatchData.teamAId;
    const unsubBatting = onSnapshot(query(collection(db, 'tournaments', localMatchData.tournamentId, 'teams', battingTeamId, 'players')), (snap) => {
      setGlobalBattingPlayers(snap.docs.map(d => d.data().name.trim()));
    });
    const unsubBowling = onSnapshot(query(collection(db, 'tournaments', localMatchData.tournamentId, 'teams', bowlingTeamId, 'players')), (snap) => {
      setGlobalBowlingPlayers(snap.docs.map(d => d.data().name.trim()));
    });
    return () => { unsubBatting(); unsubBowling(); };
  }, [isOpen, localMatchData?.battingTeam]);

  // --- RENDERING LOGIC FIX (No existing logic touched) ---
  
  // Agar Modal open hi nahi hai toh kuch mat dikhao

  // AGAR Modal open hai par data load ho raha hai, toh 'null' ki jagah 
  // wahi Dark Blue color dikhao jo aapke app ka theme hai. 
  // Isse background peek-through bilkul band ho jayega.
  if (isOpen && !localMatchData?.id) {
  return <div className="fixed inset-0 z-[100000] bg-[#001d3d]" />;
  }

  const isTeamA_Batting = localMatchData.battingTeam === localMatchData.teamA;
  const getFinalList = (global, local) => {
    const combined = [...global, ...(local || [])];
    return Array.from(new Set(combined.filter(n => n).map(name => name.trim()))).sort();
  };

  const finalBattingList = getFinalList(globalBattingPlayers, isTeamA_Batting ? localMatchData.teamA_players : localMatchData.teamB_players);
  const finalBowlingList = getFinalList(globalBowlingPlayers, isTeamA_Batting ? localMatchData.teamB_players : localMatchData.teamA_players);

  const handleAddPlayer = async (type) => {
    const name = type === 'batting' ? battingInput : bowlingInput;
    if (!name.trim() || loadingType) return;
    const targetTeamId = type === 'batting' ? (isTeamA_Batting ? localMatchData.teamAId : localMatchData.teamBId) : (isTeamA_Batting ? localMatchData.teamBId : localMatchData.teamAId);
    const fieldToUpdate = type === 'batting' ? (isTeamA_Batting ? 'teamA_players' : 'teamB_players') : (isTeamA_Batting ? 'teamB_players' : 'teamA_players');
    setLoadingType(type);
    try {
      const trimmedName = name.trim();
      const matchRef = doc(db, 'tournaments', localMatchData.tournamentId, 'matches', localMatchData.id);
      const playerCollectionRef = collection(db, 'tournaments', localMatchData.tournamentId, 'teams', targetTeamId, 'players');
      await Promise.all([
        addDoc(playerCollectionRef, { name: trimmedName, runs: 0, balls: 0, wickets: 0, matchId: localMatchData.id, createdAt: serverTimestamp() }),
        updateDoc(matchRef, { [fieldToUpdate]: arrayUnion(trimmedName) })
      ]);
      type === 'batting' ? setBattingInput('') : setBowlingInput('');
    } catch (e) { console.error(e); } finally { setLoadingType(null); }
  };

  const isStartDisabled = !striker || !nonStriker || !bowler || striker === nonStriker;

  return (
  <AnimatePresence>
    {isOpen && (
      <>
    // Z-Index ko 100000 rakha hai taaki background file ka 0% chance ho dikhne ka
    <motion.div
  className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-[#001d3d]/90 backdrop-blur-sm"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.25 }}
>
      <motion.div
  className="bg-[#020c1b] border border-blue-500/30 w-full max-w-lg p-6 rounded-[2rem] shadow-2xl overflow-y-auto max-h-[95vh] relative scrollbar-hide"
  initial={{
    opacity: 0,
    scale: 0.95,
    y: 25,
  }}
  animate={{
    opacity: 1,
    scale: 1,
    y: 0,
  }}
  exit={{
    opacity: 0,
    scale: 0.96,
    y: 20,
  }}
  transition={{
    duration: 0.28,
    ease: [0.22, 1, 0.36, 1],
  }}
>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-black text-white italic uppercase flex items-center justify-center gap-2">
            <Users className="text-blue-500" size={24} /> 
            Innings {localMatchData.innings} Setup
          </h2>
          <div className="mt-2 inline-block px-4 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <p className="text-blue-400 text-[9px] font-bold tracking-widest uppercase">
              {localMatchData.battingTeam} is Batting
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <PlayerInput label="Add Batsman" value={battingInput} onChange={setBattingInput} onAdd={() => handleAddPlayer('batting')} loading={loadingType === 'batting'} color="blue" />
          <PlayerInput label="Add Bowler" value={bowlingInput} onChange={setBowlingInput} onAdd={() => handleAddPlayer('bowling')} loading={loadingType === 'bowling'} color="red" />

          <div className="bg-blue-950/20 p-4 rounded-2xl border border-blue-500/10 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <SelectBox label="Striker" value={striker} onChange={setStriker} options={finalBattingList} />
              <SelectBox label="Non-Striker" value={nonStriker} onChange={setNonStriker} options={finalBattingList} />
            </div>
            <SelectBox label="Opening Bowler" value={bowler} onChange={setBowler} options={finalBowlingList} theme="red" />
            
            {striker && nonStriker && striker === nonStriker && (
              <div className="flex items-center gap-2 text-amber-500 text-[10px] font-bold bg-amber-500/10 p-2 rounded-lg justify-center">
                <AlertCircle size={14} /> SAME PLAYER SELECTED
              </div>
            )}
          </div>

{/* <button 
            onClick={() => onStart({ striker, nonStriker, bowler })} 
            disabled={isStartDisabled}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 py-4 rounded-xl font-black uppercase text-white transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-900/20"
          > */}

<button
  onClick={() => setOpenOverlay(true)}
  className="w-full bg-slate-900 hover:bg-black py-3 rounded-xl font-black uppercase text-white"
>
  Overlay Control
</button>

{/* <button 
  onClick={async () => {
    try {
      // 1. Sabse pehle Firebase Match ka address nikala
      const matchRef = doc(db, 'tournaments', localMatchData.tournamentId, 'matches', localMatchData.id);
      
      // 2. Striker ko No. 1 aur Non-Striker ko No. 2 par fix kiya
      const openersOrder = [striker.trim().toUpperCase(), nonStriker.trim().toUpperCase()];
      
      // 3. Database mein battingPlayers array ko is sahi kram (order) se update kiya
      await updateDoc(matchRef, {
        battingPlayers: openersOrder
      });
      
      // 4. Fir normal match start kar diya
      onStart({ striker, nonStriker, bowler });
    } catch (error) {
      console.error("Error saving batting order:", error);
      // Agar koi error aaye toh bhi match rukna nahi chahiye, safety ke liye start ho jaye
      onStart({ striker, nonStriker, bowler });
    }
  }} 
  disabled={isStartDisabled}
  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 py-4 rounded-xl font-black uppercase text-white transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-900/20"
>
    
            {localMatchData.innings === 2 ? 'Start Run Chase' : 'Begin Match'} <PlayCircle size={20} />
          </button> */}

<button 
  onClick={async () => {
    try {
      const matchRef = doc(db, 'tournaments', localMatchData.tournamentId, 'matches', localMatchData.id);
      const openersOrder = [striker.trim().toUpperCase(), nonStriker.trim().toUpperCase()];
      
      await updateDoc(matchRef, {
        battingPlayers: openersOrder
      });
      
      onStart({ striker, nonStriker, bowler });
    } catch (error) {
      console.error("Error saving batting order:", error);
      onStart({ striker, nonStriker, bowler });
    }
  }} 
  disabled={isStartDisabled}
  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 py-4 rounded-xl font-black uppercase text-white transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-900/20"
>
  {localMatchData.innings === 2 ? 'Start Run Chase' : 'Begin Match'} <PlayCircle size={20} />
</button>
    
        </div>
      </motion.div>
    </motion.div>

<OverlayControlModal
  isOpen={openOverlay}
  onClose={() => setOpenOverlay(false)}
  tId={localMatchData.tournamentId}
  matchId={localMatchData.id}
  match={localMatchData}
/>

          </>
    )}
  </AnimatePresence>
);
}

// PlayerInput aur SelectBox wahi hain jo aapne diye the
function PlayerInput({ label, value, onChange, onAdd, loading, color }) {
  const colorClass = color === 'blue' ? 'text-blue-400 border-blue-500/10 bg-blue-600/5' : 'text-red-400 border-red-500/10 bg-red-600/5';
  const btnClass = color === 'blue' ? 'bg-blue-600' : 'bg-red-600';
  return (
    <div className={`p-3 rounded-2xl border ${colorClass}`}>
      <label className="text-[8px] font-black uppercase mb-1 block tracking-widest opacity-60">{label}</label>
      <div className="flex gap-2">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Name..." className="flex-1 bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-current" />
        <button onClick={onAdd} disabled={loading || !value} className={`${btnClass} w-8 h-8 rounded-lg flex items-center justify-center shrink-0`}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} className="text-white" />}
        </button>
      </div>
    </div>
    
  );
}

function SelectBox({ label, value, onChange, options, theme = "blue" }) {
  return (
    <div>
      <span className="text-[8px] text-gray-500 font-black uppercase mb-1 block">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`w-full bg-black/60 border border-white/5 p-2.5 rounded-lg text-white text-[11px] font-bold outline-none focus:border-${theme === 'red' ? 'red' : 'blue'}-500`}>
        <option value="">SELECT...</option>
        {options.map((name, i) => <option key={i} value={name}>{name}</option>)}
      </select>
    </div>
  );
    }
