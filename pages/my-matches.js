import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore'; 
import { onAuthStateChanged } from 'firebase/auth';
import { Trophy, Calendar, Zap, ChevronRight, Loader2, Users, ArrowLeft, ShieldCheck, Activity } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import TossModal from '../components/TossModal';
import PlayerSelectionModal from '../components/PlayerSelectionModal';

export default function MyMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // LOGIC PRESERVED: Original Auth & Real-time Snapshot Integration
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const tourneyQuery = query(
            collection(db, "tournaments"),
            where("adminId", "==", currentUser.uid)
          );
          
          const tourneySnapshot = await getDocs(tourneyQuery);
          
          if (tourneySnapshot.empty) {
            setMatches([]);
            setLoading(false);
            return;
          }

          tourneySnapshot.docs.forEach((tourneyDoc) => {
            const matchesRef = collection(db, "tournaments", tourneyDoc.id, "matches");
            
            onSnapshot(matchesRef, (matchSnap) => {
              const tourneyMatches = matchSnap.docs.map(doc => ({
                id: doc.id,
                tournamentId: tourneyDoc.id,
                ...doc.data()
              }));

              setMatches(prev => {
                const otherMatches = prev.filter(m => m.tournamentId !== tourneyDoc.id);
                const combined = [...otherMatches, ...tourneyMatches];
                return combined.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
              });
            });
          });

          setLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleManageClick = (match) => {
    setSelectedMatch(match);
    if (match.setupComplete) {
      router.push(`/scoring/${match.tournamentId}/${match.id}`);
    } else if (match.tossCompleted) {
      setIsPlayerModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleTossComplete = async (winner, decision, setupData) => {
    try {
      const matchRef = doc(db, "tournaments", selectedMatch.tournamentId, "matches", selectedMatch.id);
      const updateData = {
        tossWinner: winner,
        tossDecision: decision,
        ...setupData,
        tossCompleted: true,
        setupComplete: false
      };
      await updateDoc(matchRef, updateData);
      setSelectedMatch(prev => ({ ...prev, ...updateData }));
      setIsModalOpen(false);
      setTimeout(() => setIsPlayerModalOpen(true), 100);
    } catch (error) {
      console.error("Error updating toss:", error);
    }
  };

  const handlePlayerSelectionComplete = async (playerData) => {
    try {
      const matchRef = doc(db, "tournaments", selectedMatch.tournamentId, "matches", selectedMatch.id);
      await updateDoc(matchRef, {
        striker: playerData.striker,
        nonStriker: playerData.nonStriker,
        bowler: playerData.bowler,
        status: 'live',
        score: 0,
        wickets: 0,
        balls: 0,
        setupComplete: true 
      });
      setIsPlayerModalOpen(false);
      router.push(`/scoring/${selectedMatch.tournamentId}/${selectedMatch.id}`);
    } catch (error) {
      console.error("Error updating players:", error);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-[#1D2939] flex flex-col items-center justify-center gap-4 z-[2000]">
      <Loader2 className="animate-spin text-[#FACC15]" size={40} />
      <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Syncing Matches</span>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] pt-24 pb-32 px-2 md:px-4">
      <div className="w-full mx-auto">
        
        {/* COMPACT HEADER */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg shadow-sm">
              <ArrowLeft size={16} />
            </Link>
            <h1 className="text-lg font-black italic text-[#1D2939] uppercase tracking-tighter">
              Manage <span className="text-[#FACC15]">Matches</span>
            </h1>
          </div>
          <div className="bg-[#1D2939] px-3 py-1 rounded text-white text-[10px] font-black italic">
            {matches.length} LIVE
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="w-full py-12 border-2 border-dashed border-slate-200 text-center bg-white rounded-none">
            <Trophy className="mx-auto text-slate-100 mb-3" size={40} />
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No Matches</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {matches.map((match) => (
              <div key={match.id} className="w-full bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
                
                {/* MATCH HEADER - Screenshot Style */}
                <div className="bg-[#F8FAFC] px-3 py-2 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-[#1D2939] font-bold text-[11px] uppercase truncate pr-4">
                    {match.tournamentName || "Tournament"} #{match.matchNo}
                  </span>
                  <span className="text-slate-500 text-[10px] whitespace-nowrap">
                    {match.matchDate || "11-02-26 9:11 PM"}
                  </span>
                </div>

                {/* TEAMS CONTENT - Compact Version of Screenshot */}
                <div className="p-4 flex items-center justify-between gap-2">
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="w-12 h-12 rounded-full border border-slate-100 bg-slate-50 p-0.5 overflow-hidden shadow-sm">
                      <img src={match.teamALogo || "/team-placeholder.png"} className="w-full h-full object-cover rounded-full" alt="T1" />
                    </div>
                    <div className="text-center">
                      <p className="text-[#1D2939] font-black text-sm uppercase leading-none mb-1">{match.teamA || "TEAM A"}</p>
                      <p className="text-[#1D2939] font-bold text-[11px]">{match.totalRuns || "0/0"} <span className="text-slate-400 font-normal text-[9px]">({match.teamABalls || "0.0"}/{match.overs})</span></p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-[9px] font-bold italic text-slate-400">vs</div>
                    <div className="bg-[#EF4444] text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase animate-pulse">Live</div>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="w-12 h-12 rounded-full border border-slate-100 bg-slate-50 p-0.5 overflow-hidden shadow-sm">
                      <img src={match.teamBLogo || "/team-placeholder.png"} className="w-full h-full object-cover rounded-full" alt="T2" />
                    </div>
                    <div className="text-center">
                      <p className="text-[#1D2939] font-black text-sm uppercase leading-none mb-1">{match.teamB || "TEAM B"}</p>
                      <p className="text-[#1D2939] font-bold text-[11px]">{match.totalRuns || "0/0"} <span className="text-slate-400 font-normal text-[9px]">({match.teamBBalls || "0.0"}/{match.overs})</span></p>
                    </div>
                  </div>
                </div>

                {/* COMPACT ACTION BUTTON - Sharp Corners */}
                <button 
                  onClick={() => handleManageClick(match)}
                  className="w-full py-3 bg-[#A60B30] hover:bg-[#850926] text-white font-bold text-[11px] uppercase tracking-wider transition-colors"
                >
                  {match.setupComplete ? 'View Match' : 'Setup Match'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <TossModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        match={selectedMatch} 
        onComplete={handleTossComplete}
      />

      {isPlayerModalOpen && (
        <PlayerSelectionModal 
          isOpen={isPlayerModalOpen}
          match={selectedMatch}
          onStart={handlePlayerSelectionComplete}
        />
      )}
    </div>
  );
                  }
