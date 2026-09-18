import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Trophy, MapPin, Loader2, PlusCircle, ChevronRight, ChevronLeft, Users, Swords, LayoutList, Calendar, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; 
import Link from 'next/link';

// --- SUB-COMPONENT: COMPACT TOURNAMENT CARD (OPTIMIZED WITH INSTANT CACHE LOOKUP) ---
function TournamentCard({ tournament }) {
  // Local storage se counts ka initial lookup taaki refresh par bhi '...' na dikhe
  const [teamCount, setTeamCount] = useState(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem(`tc_${tournament.id}`)) || 0;
    }
    return 0;
  });
  
  const [matchCount, setMatchCount] = useState(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem(`mc_${tournament.id}`)) || 0;
    }
    return 0;
  });
  
  const [loading, setLoading] = useState(false); // Shuru se hi false rakhein taaki data instant render ho
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    try {
      const matchesRef = collection(db, "tournaments", tournament.id, "matches");
      const matchesSnapshot = await getDocs(matchesRef);
      const deleteMatches = matchesSnapshot.docs.map(match => deleteDoc(match.ref));
      await Promise.all(deleteMatches);

      const teamsRef = collection(db, "tournaments", tournament.id, "teams");
      const teamsSnapshot = await getDocs(teamsRef);

      for (const team of teamsSnapshot.docs) {
        const playersRef = collection(db, "tournaments", tournament.id, "teams", team.id, "players");
        const playersSnapshot = await getDocs(playersRef);
        const deletePlayers = playersSnapshot.docs.map(player => deleteDoc(player.ref));
        await Promise.all(deletePlayers);
        await deleteDoc(team.ref);
      }

      await deleteDoc(doc(db, "tournaments", tournament.id));
      
      // Cache clear on delete
      localStorage.removeItem(`tc_${tournament.id}`);
      localStorage.removeItem(`mc_${tournament.id}`);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  useEffect(() => {
    if (!tournament.id || tournament.id.startsWith("temp")) return;

    // Realtime changes sync karne ke liye snapshot lagaye rakhein par cache update ke sath
    const teamsCol = collection(db, "tournaments", tournament.id, "teams");
    const unsubTeams = onSnapshot(teamsCol, (snapshot) => {
      const size = snapshot.size;
      setTeamCount(size);
      localStorage.setItem(`tc_${tournament.id}`, size);
    });

    const matchesCol = collection(db, "tournaments", tournament.id, "matches");
    const unsubMatches = onSnapshot(matchesCol, (snapshot) => {
      const size = snapshot.snapshot ? snapshot.docs.length : snapshot.size;
      setMatchCount(size);
      localStorage.setItem(`mc_${tournament.id}`, size);
    });

    return () => {
      unsubTeams();
      unsubMatches();
    };
  }, [tournament.id]);

  return (
    <motion.div 
      layout="position"
      animate={{ opacity: 1 }}
      transition={{ duration: 0 }}
      className="w-full bg-white rounded-2xl p-5 border border-slate-200/60 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] transition-all duration-300 group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#1D2939] to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-50 border-2 border-slate-200 flex items-center justify-center">
              {tournament.logoUrl ? (
                <img src={tournament.logoUrl} alt={tournament.tournamentName} className="w-full h-full object-contain p-1" />
              ) : (
                <Trophy size={22} className="text-[#1D2939]" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-[#1D2939] font-black text-[1.05rem] uppercase tracking-tight truncate leading-none mb-1">
                {tournament.tournamentName}
              </h2>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active Arena</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 ml-1">
            <div className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
              <Users size={14} strokeWidth={2.5} />
              <span className="text-[11px] font-extrabold uppercase tracking-wider">
                {loading ? "..." : `${teamCount} Teams`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 transition-colors">
              <Swords size={14} strokeWidth={2.5} />
              <span className="text-[11px] font-extrabold uppercase tracking-wider">
                {loading ? "..." : `${matchCount} Matches`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <MapPin size={14} strokeWidth={2.5} className="text-amber-500" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider truncate max-w-[120px]">
                {tournament.location || 'Local Arena'}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }}
                className="ml-2 flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200 shadow"
              >
                <Trash2 size={16}/>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <Link href={`/tournament/matches/${tournament.id}`} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow-md transition-all duration-200 active:scale-95">
            <LayoutList size={14} />
            <span>Matches List</span>
          </Link>
          <Link href={`/tournament/${tournament.id}`} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm">
            <span>Add Teams</span>
          </Link>
          <Link href={`/tournament/stats/${tournament.id}`} className="flex-[1.5] lg:flex-none flex items-center justify-center gap-2 bg-[#1D2939] text-[#FACC15] px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-slate-800 active:scale-95 transition-all group/btn">
            <span>Tour. Details</span>
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div initial={{ scale:0.9 }} animate={{ scale:1 }} exit={{ scale:0.9 }} className="bg-white rounded-2xl p-6 w-[320px] shadow-xl">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Tournament?</h3>
              <p className="text-sm text-gray-500 mb-6">All matches, teams and players will be permanently deleted.</p>
              <div className="flex justify-end gap-3">
                <button onClick={()=>setShowDeleteModal(false)} className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- MAIN DASHBOARD (WITH STATE REHYDRATION JUGAD) ---
export default function MyTournaments() {
  // 1. STATE REHYDRATION LOGIC: Initialize state directly from LocalStorage
  const [tournaments, setTournaments] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cached_tournaments');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Agar cache mein data mil gaya toh spinner/loading ka jhanjhat hi khatam (0ms loading!)
  const [loadingTournaments, setLoadingTournaments] = useState(tournaments.length === 0);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [authChecked, setAuthChecked] = useState(false);
  const tournamentsPerPage = 10;
  const [activeTourId, setActiveTourId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('active_tournament_id') || null;
    }
    return null;
  });

  useEffect(() => {
    let unsubTourney = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
      
      if (currentUser) {
        const q = query(collection(db, "tournaments"), where("adminId", "==", currentUser.uid));
        
        unsubTourney = onSnapshot(q, (snapshot) => {
          const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          const sortedDocs = docs.sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
          });

          setTournaments(sortedDocs);
          setLoadingTournaments(false);

          // Sync data with local storage for next instant rehydration
          localStorage.setItem('cached_tournaments', JSON.stringify(sortedDocs));

          setActiveTourId(prev => {
            const nextId = prev || sortedDocs[0]?.id || null;
            if (nextId) localStorage.setItem('active_tournament_id', nextId);
            return nextId;
          });
        }, (err) => { 
          console.error(err);
        });
      }
    });

    return () => {
      unsubscribeAuth();
      unsubTourney();
    };
  }, []);

  const handleTourClick = (id) => {
    setActiveTourId(id);
    localStorage.setItem('active_tournament_id', id);
  };

  const indexOfLastTournament = currentPage * tournamentsPerPage;
  const indexOfFirstTournament = indexOfLastTournament - tournamentsPerPage;
  const currentTournaments = tournaments.slice(indexOfFirstTournament, indexOfLastTournament);
  const totalPages = Math.ceil(tournaments.length / tournamentsPerPage);

  return (
    <motion.div 
      suppressHydrationWarning={true} // Next.js UI mismatch warning ko rokne ke liye
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.1, ease: "linear" }}
      className="min-h-screen w-full bg-[#F4F4F4] px-4 pb-32"
    >
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 px-1">
          <motion.div initial={{ x: -20 }} animate={{ x: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1D2939]/5 text-[#1D2939] text-[9px] font-black uppercase tracking-widest mb-3">
              <Calendar size={12} />
              <span>Season 2026 Management</span>
            </div>
            <h1 className="text-4xl font-black text-[#1D2939] uppercase tracking-tighter leading-none">
              Tournament<span className="text-[#C10E44]">Hub</span>
            </h1>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-8 h-[1px] bg-slate-300 inline-block"></span>
              {tournaments.length} Active Environments
            </p>
          </motion.div>
          <button 
            onClick={() => window.dispatchEvent(new Event('openCreateTournamentModal'))}
            className="flex items-center justify-center gap-3 bg-[#C10E44] text-white px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-[0_10px_20px_-5px_rgba(193,14,68,0.3)] hover:brightness-110"
          >
            <PlusCircle size={18} />
            <span>Create Tournament</span>
          </button>
          <Link
            href={activeTourId ? `/overlay/themes?tId=${activeTourId}` : '#'}
            className={`mt-2 flex items-center justify-center gap-2 w-full px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow transition-all 
            ${tournaments.length === 0 ? 'bg-gray-300 pointer-events-none' : 'bg-white hover:bg-gray-800'}`}
          >
            Scoreboard Overlay Link
          </Link>
        </div>

        {tournaments.length === 0 && !loadingTournaments ? (
          <div className="py-24 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
            <Trophy className="text-slate-200 mx-auto mb-6" size={40} />
            <h3 className="text-[#1D2939] font-black text-lg uppercase tracking-tight">No Tournaments Found</h3>
            <button onClick={() => window.dispatchEvent(new Event('openCreateTournamentModal'))} className="mt-8 inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">
              Get Started
            </button>
          </div>
        ) : (
          <div className="w-full">
            <div className="grid grid-cols-1 gap-1">
              {currentTournaments.filter(Boolean).map((t) => (
                <div 
                  key={t.id}
                  onClick={() => handleTourClick(t.id)}
                  className={`cursor-pointer transition-all ${activeTourId === t.id ? 'ring-2 ring-[#C10E44] rounded-2xl' : ''}`}
                >
                  <TournamentCard tournament={t} />
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-10 px-2 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${currentPage === 1 ? 'text-slate-300' : 'text-[#1D2939]'}`}>
                  <ChevronLeft size={16} /> Previous
                </button>
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-[10px] font-black ${currentPage === i + 1 ? 'bg-[#1D2939] text-white' : 'text-slate-400'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${currentPage === totalPages ? 'text-slate-300' : 'text-[#1D2939]'}`}>
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
                  }
        
