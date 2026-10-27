import { useState } from 'react';
import { createPortal } from 'react-dom';
import { db } from '../lib/firebase';
import { getAdminAuth, getAdminDb } from '../lib/firebase-admin';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
} from 'firebase/firestore';
import { Trophy, MapPin, Loader2, PlusCircle, ChevronRight, ChevronLeft, Users, Swords, LayoutList, Calendar, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; 
import Link from 'next/link';

// --- SUB-COMPONENT: COMPACT TOURNAMENT CARD (OPTIMIZED) ---
function TournamentCard({ tournament }) {
  const teamCount = tournament.teamCount ?? 0;
  const matchCount = tournament.matchCount ?? 0;
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newTournamentName, setNewTournamentName] = useState(tournament.tournamentName);
  const [editTournamentLogo, setEditTournamentLogo] = useState(null);

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!newTournamentName.trim()) return;

    try {
      let logoUrl = tournament.logoUrl || "";
      
      // Upload new logo to Cloudinary if selected
      if (editTournamentLogo) {
        const formData = new FormData();
        formData.append("file", editTournamentLogo);
        formData.append("upload_preset", "okcrick");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/m4xdhjiq/image/upload",
          { method: "POST", body: formData }
        );

        const data = await response.json();
        logoUrl = data.secure_url;
      }

      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, "tournaments", tournament.id), {
        tournamentName: newTournamentName.trim().toUpperCase(),
        logoUrl: logoUrl,
      });

      setShowEditModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Edit error:", error);
    }
  };

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
      setShowDeleteModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

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
              <div className="flex items-center gap-2">
                <h2 className="text-[#1D2939] font-black text-[1.05rem] uppercase tracking-tight truncate leading-none mb-1">
                  {tournament.tournamentName}
                </h2>
                {/* EDIT ICON */}
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setNewTournamentName(tournament.tournamentName);
                    setEditTournamentLogo(null);
                    setShowEditModal(true); 
                  }}
                  className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                  title="Edit Tournament"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>

        <button
  onClick={(e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  }}
  className="text-slate-400 hover:text-red-600 transition-colors p-1"
  title="Delete Tournament"
>
  <Trash2 size={14} strokeWidth={2.5} />
</button>
              </div>
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
                {teamCount} Teams
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 transition-colors">
              <Swords size={14} strokeWidth={2.5} />
              <span className="text-[11px] font-extrabold uppercase tracking-wider">
                {matchCount} Matches
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <MapPin size={14} strokeWidth={2.5} className="text-amber-500" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider truncate max-w-[120px]">
                {tournament.location || 'Local Arena'}
              </span>
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

      {/* --- MODALS --- */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.96, y: 8 }}
transition={{ duration: 0.18, ease: "easeOut" }}
              className="bg-white rounded-2xl p-6 w-[320px] shadow-xl"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Tournament?</h3>
              <p className="text-sm text-gray-500 mb-6">All matches, teams and players will be permanently deleted.</p>
              <div className="flex justify-end gap-3">
                <button onClick={()=>setShowDeleteModal(false)} className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 font-bold">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 font-bold">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showEditModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
transition={{ duration: 0.18, ease: "easeOut" }}
              className="bg-white rounded-2xl p-6 w-[360px] shadow-xl"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Tournament</h3>
              
              <div className="mb-4">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">Tournament Name</label>
                <input 
                  type="text" 
                  value={newTournamentName}
                  onChange={(e) => setNewTournamentName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs uppercase font-bold text-[#1D2939] focus:outline-none focus:border-blue-600"
                  placeholder="TOURNAMENT NAME..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">Update Tournament Logo (Optional)</label>
                <div className="flex items-center gap-3">
                  {Boolean(tournament?.logoUrl) && !editTournamentLogo && (
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center p-1">
                      <img src={tournament.logoUrl} alt="Current Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditTournamentLogo(e.target.files?.[0] || null)}
                    className="flex-1 text-[10px] text-gray-500 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-slate-100 file:text-[#1D2939] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={()=>setShowEditModal(false)} className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 font-bold">Cancel</button>
                <button onClick={handleEdit} className="px-4 py-2 text-sm rounded-lg bg-[#1D2939] text-white hover:bg-slate-800 font-bold">Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
                     }
                


// --- MAIN DASHBOARD (FULLY SSR) ---
export default function MyTournaments({ initialTournaments = [], initialUser = null, initialUserData = null }) {
  const [tournaments, setTournaments] = useState(initialTournaments);
  const [currentPage, setCurrentPage] = useState(1);
  const tournamentsPerPage = 10;
  
    const [activeTourId, setActiveTourId] = useState(() => {
    return initialTournaments[0]?.id || null;
  });

  const handleTourClick = (id) => {
    setActiveTourId(id);
  };

  const indexOfLastTournament = currentPage * tournamentsPerPage;
  const indexOfFirstTournament = indexOfLastTournament - tournamentsPerPage;
  const currentTournaments = tournaments.slice(indexOfFirstTournament, indexOfLastTournament);
  const totalPages = Math.ceil(tournaments.length / tournamentsPerPage);

  return (
    <motion.div 
      suppressHydrationWarning={true}
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

        {tournaments.length === 0 ? (
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

// --- SERVER SIDE RENDERING (SSR) ---
function serializeValue(value) {
  if (value == null) return null;

  if (value instanceof Date) return value.toISOString();

  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (typeof value === 'object') {
    const result = {};

    for (const [key, item] of Object.entries(value)) {
      if (item !== undefined) {
        result[key] = serializeValue(item);
      }
    }

    return result;
  }

  if (typeof value === 'number' && !Number.isFinite(value)) {
    return null;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  return null;
}

function getTimestampMillis(value) {
  if (!value) return 0;

  if (typeof value.toMillis === 'function') {
    return value.toMillis();
  }

  if (typeof value.toDate === 'function') {
    return value.toDate().getTime();
  }

  const millis = new Date(value).getTime();
  return Number.isFinite(millis) ? millis : 0;
}

export async function getServerSideProps({ req, res }) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');

  const sessionCookie = req.cookies?.__session;

  if (!sessionCookie) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    const decodedToken = await adminAuth.verifySessionCookie(
      sessionCookie,
      true
    );

    const uid = decodedToken.uid;

    const userDoc = await adminDb
      .collection('users')
      .doc(uid)
      .get();

    const userData = userDoc.exists ? userDoc.data() : {};

    const snapshot = await adminDb
      .collection('tournaments')
      .where('adminId', '==', uid)
      .get();

    const initialTournaments = await Promise.all(
      snapshot.docs.map(async (tournamentDoc) => {
        const tournamentRef = tournamentDoc.ref;

        const [teamsSnapshot, matchesSnapshot] = await Promise.all([
          tournamentRef.collection('teams').get(),
          tournamentRef.collection('matches').get(),
        ]);

        return {
          id: tournamentDoc.id,
          ...serializeValue(tournamentDoc.data()),
          teamCount: teamsSnapshot.size,
          matchCount: matchesSnapshot.size,
        };
      })
    );

    initialTournaments.sort(
      (a, b) =>
        getTimestampMillis(b.createdAt) -
        getTimestampMillis(a.createdAt)
    );

    return {
      props: {
        initialTournaments,
        initialUser: {
          uid,
          email: decodedToken.email || null,
          displayName:
            userData?.name || decodedToken.name || '',
        },
        initialUserData: null,
      },
    };
  } catch (error) {
    console.error(
      'My Tournaments SSR error:',
      error.code || error.message
    );

    res.setHeader('Set-Cookie', [
      '__session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    ]);

    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}
