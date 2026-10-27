import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  doc,
  serverTimestamp,
  orderBy,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { ArrowLeft, Plus, X, Trash2, Users, Edit2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getTournamentInitialProps } from '../../lib/ssr/tournament';
import { getNavbarInitialProps } from '../../lib/ssr/auth';

// --- SUB-COMPONENT: COMPACT TEAM CARD ---
function TeamRow({
  team,
  tournamentId,
  initialCount = 0,
  onManage,
  onDelete,
  onEdit,
}) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    if (!tournamentId || !team.id) return;
    const q = query(collection(db, "tournaments", tournamentId, "teams", team.id, "players"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCount(snapshot.docs.length);
    });
    return () => unsubscribe();
  }, [team.id, tournamentId]);

  
  return (
    <div className="w-full">
      <div className="bg-white border border-emerald-900/10 p-4 rounded-2xl shadow-sm hover:shadow-xl hover:border-emerald-600/40 transition-all duration-300 flex items-center justify-between gap-3 group">
        {/* Left Section: Info */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-[#0C381E] to-[#14532D] border border-emerald-500/30 shrink-0 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            {team.logoUrl ? (
              <img
                src={team.logoUrl}
                alt={team.name}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <div className="text-yellow-400 flex flex-col items-center justify-center w-full h-full">
                <span className="text-sm font-black leading-none">{count}</span>
                <span className="text-[6px] font-bold uppercase tracking-tighter text-yellow-300/80">
                  SQD
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="font-black text-[14px] uppercase tracking-tight text-[#0C381E] truncate leading-tight group-hover:text-emerald-900 transition-colors">
              {team.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-[9px] text-amber-600 font-extrabold uppercase tracking-widest">
                {count} SQUAD PLAYERS
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onEdit(team)}
            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
            title="Edit Team Name"
          >
            <Edit2 size={15} />
          </button>

          <button
            onClick={() => onDelete(team.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            title="Delete Team"
          >
            <Trash2 size={15} />
          </button>

          <button
            onClick={() => onManage(team)}
            className="ml-1 bg-gradient-to-r from-[#0C381E] to-[#14532D] hover:from-emerald-900 hover:to-emerald-800 text-yellow-300 font-extrabold px-3.5 py-2.5 rounded-xl active:scale-95 transition-all shadow-md shadow-emerald-900/10 text-xs flex items-center gap-1 border border-yellow-400/20"
          >
            <span>Add Player</span>
          </button>
        </div>
      </div>
    </div>
  );

}

// --- MAIN COMPONENT ---
export default function TournamentDetails({
  initialTournament = null,
  initialTeams = [],
  initialTeamCounts = {},
}) {
  const router = useRouter();
  const { id } = router.query;
  const [tournament, setTournament] = useState(initialTournament);
  const [teams, setTeams] = useState(initialTeams);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTeam, setActiveTeam] = useState(null);
  const [teamPlayers, setTeamPlayers] = useState([]); 
  const [playerName, setPlayerName] = useState('');
  const [playerPhoto, setPlayerPhoto] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [teamLogo, setTeamLogo] = useState(null);

  useEffect(() => {
  if (!id) return;

  const qTeams = query(
    collection(db, "tournaments", id, "teams"),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(
    qTeams,
    (snapshot) => {
      setTeams(
        snapshot.docs.map((teamDoc) => ({
          id: teamDoc.id,
          ...teamDoc.data(),
        }))
      );
    },
    (error) => {
      console.error("Teams live update failed:", error);
    }
  );

  return () => unsubscribe();
}, [id]);

  useEffect(() => {
    if (!activeTeam || !id || !isModalOpen) return;
    const qPlayers = query(collection(db, "tournaments", id, "teams", activeTeam.id, "players"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(qPlayers, (snapshot) => {
      setTeamPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [activeTeam, id, isModalOpen]);

  // --- LOGIC HANDLERS ---
  const handleAddTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    const tempId = "temp_" + Date.now();
    setTeams(prev => [
      {
        id: tempId,
        name: teamName.trim().toUpperCase(),
        logoUrl: teamLogo ? URL.createObjectURL(teamLogo) : "",
        createdAt: new Date(),
        temp: true
      },
      ...prev
    ]);

    try {
      let logoUrl = "";
      if (teamLogo) {
        const formData = new FormData();
        formData.append("file", teamLogo);
        formData.append("upload_preset", "okcrick");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/m4xdhjiq/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        logoUrl = data.secure_url;
      }

      await addDoc(collection(db, "tournaments", id, "teams"), { 
        name: teamName.trim().toUpperCase(), 
        logoUrl: logoUrl,
        createdAt: serverTimestamp()
      });
      setTeamName(''); 
      setTeamLogo(null);
    } catch (e) { console.error(e); }
  };

  const handleEditTeam = async (team) => {
    const newName = prompt("Update Team Name:", team.name);
    if (!newName || newName.trim() === "" || newName === team.name) return;
    try {
      await updateDoc(doc(db, "tournaments", id, "teams", team.id), {
        name: newName.trim().toUpperCase()
      });
    } catch (e) { console.error(e); }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!confirm("Are you sure? This team and its players will be removed.")) return;
    try {
      await deleteDoc(doc(db, "tournaments", id, "teams", teamId));
    } catch (e) { console.error(e); }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!playerName.trim() || !activeTeam?.id || !id) return;

    const tempId = "temp_" + Date.now();
    setTeamPlayers(prev => [
      {
        id: tempId,
        name: playerName.trim().toUpperCase(),
        photoUrl: playerPhoto ? URL.createObjectURL(playerPhoto) : "",
        temp: true
      },
      ...prev
    ]);
    
    try {
      let photoUrl = "";
      if (playerPhoto) {
        const formData = new FormData();
        formData.append("file", playerPhoto);
        formData.append("upload_preset", "okcrick");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/m4xdhjiq/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        photoUrl = data.secure_url;
      }

      await addDoc(collection(db, "tournaments", id, "teams", activeTeam.id, "players"), {
        name: playerName.trim().toUpperCase(),
        photoUrl: photoUrl,
        runs: 0, balls: 0, wickets: 0, role: 'Batsman',
        createdAt: serverTimestamp()
      });
      setPlayerName('');
      setPlayerPhoto(null);
    } catch (e) { console.error(e); }
  };

  const handleDeletePlayer = async (playerId) => {
    if(!confirm("Remove player?")) return;
    try {
      await deleteDoc(doc(db, "tournaments", id, "teams", activeTeam.id, "players", playerId));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-[#F2F7F4] text-[#0C381E]">
      
      {/* STICKY HEADER */}
      <nav className="w-full bg-white/95 backdrop-blur-md border-b border-emerald-900/10 sticky top-0 z-40 h-16 md:h-20 flex items-center px-4 shadow-sm">
        <div className="flex items-center justify-between w-full gap-3 max-w-7xl mx-auto">
          <Link href="/my-tournaments" className="p-2.5 bg-emerald-50 text-[#0C381E] rounded-xl active:scale-95 transition-all shrink-0 hover:bg-emerald-100 border border-emerald-200/50 shadow-xs">
            <ArrowLeft size={20} />
          </Link>

          <div className="flex-1 min-w-0 text-center">
            <h1 className="text-[17px] md:text-lg font-black uppercase tracking-tight leading-none truncate px-1 text-[#0C381E]">
              {tournament?.tournamentName || "Tournament"}
            </h1>
            <p className="text-[9px] text-red-600 font-extrabold uppercase tracking-[0.25em] mt-1.5 whitespace-nowrap">Manage Squads & Teams</p>
          </div>
              
        </div>
      </nav>

      {/* CREATE MATCH BUTTON SECTION */}
      <div className="flex justify-center mt-6">
        <button 
          onClick={() => router.push(`/tournament/manage-match/${id}`)}
          className="bg-gradient-to-r from-[#0C381E] to-[#14532D] hover:from-emerald-900 hover:to-emerald-800 text-yellow-300 border border-yellow-400/40 px-7 py-3.5 rounded-2xl font-black text-[12px] uppercase tracking-wider flex items-center gap-2.5 shadow-xl shadow-emerald-900/15 active:scale-95 transition-all"
        >
          <div className="p-1 bg-yellow-400/20 rounded-lg">
            <Plus size={16} className="text-yellow-400" />
          </div>
          <span>CREATE MATCH</span>
        </button>
      </div>

      <main className="w-full px-4 pt-8 pb-32 max-w-7xl mx-auto">
        
        {/* COMPACT ADD TEAM INPUT CARD */}
        <div className="mb-10 max-w-xl mx-auto">
          <div className="bg-white p-2.5 border-2 border-emerald-900/10 flex flex-col sm:flex-row gap-2.5 items-center rounded-3xl shadow-lg shadow-emerald-900/5 backdrop-blur-sm">
             <input 
               type="text" placeholder="ENTER NEW TEAM NAME..." value={teamName} 
               onChange={(e) => setTeamName(e.target.value)} 
               className="w-full sm:flex-1 bg-emerald-50/50 border border-emerald-900/10 px-4 py-3 rounded-2xl text-xs outline-none font-black italic uppercase text-[#0C381E] placeholder:text-gray-400 focus:bg-white focus:border-emerald-600 transition-all" 
             />
             <div className="w-full sm:w-auto flex items-center gap-2">
               <input
                 type="file"
                 accept="image/*"
                 onChange={(e) => setTeamLogo(e.target.files[0])}
                 className="text-[10px] w-full sm:w-[130px] text-gray-500 file:py-2.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-emerald-100 file:text-[#0C381E] hover:file:bg-emerald-200 cursor-pointer"
               />
               <button onClick={handleAddTeam} className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 font-black italic text-[11px] uppercase rounded-2xl active:scale-95 transition-all shadow-md shadow-red-600/20 whitespace-nowrap">
                 Add Team
               </button>
             </div>
          </div>
        </div>

        {/* COMPACT DIRECTORY GRID */}
        <div className="w-full">
          <div className="flex items-center gap-4 mb-6 px-2">
            <h2 className="text-[11px] font-black uppercase text-emerald-900 tracking-[0.25em] whitespace-nowrap">Squads Directory ({teams.length})</h2>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-emerald-200/80 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {teams.map((team) => (
              <TeamRow
                key={team.id}
                team={team}
                tournamentId={id}
                initialCount={initialTeamCounts[team.id] ?? 0}
                onManage={(t) => {
                  setActiveTeam(t);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteTeam}
                onEdit={handleEditTeam}
              />
            ))}
          </div>

          {teams.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-emerald-200 shadow-sm max-w-md mx-auto">
               <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                 <Users className="text-emerald-600" size={32} />
               </div>
               <p className="text-emerald-900 uppercase font-black italic text-xs tracking-widest">Awaiting First Squad</p>
               <p className="text-gray-400 text-[10px] mt-1 font-medium">Add a team above to start managing player lists.</p>
            </div>
          )}
        </div>

        {/* SQUAD MODAL */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="absolute inset-0 bg-[#0C381E]/70 backdrop-blur-sm"
                onClick={() => setIsModalOpen(false)}
              />
    
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{
                  type: "tween",
                  duration: 0.28,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative bg-white border border-emerald-200 w-full max-w-lg overflow-hidden flex flex-col h-[80vh] sm:h-[620px] shadow-2xl rounded-t-[2rem] sm:rounded-3xl will-change-transform z-10"
              >
    
                {/* Modal Header */}
                <div className="p-5 border-b border-emerald-100 flex justify-between items-center bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/30">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse shrink-0" />
                    <h2 className="text-base sm:text-lg font-black italic uppercase text-[#0C381E] truncate">{activeTeam?.name}</h2>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white border border-emerald-200 rounded-full active:scale-90 transition-all hover:bg-emerald-50 text-[#0C381E] shadow-xs">
                    <X size={18} />
                  </button>
                </div>

                {/* Player Input Section */}
                <div className="p-4 bg-emerald-50/40 border-b border-emerald-100">
                  <form onSubmit={handleAddPlayer} className="flex flex-col sm:flex-row gap-2">
                    <input 
                      autoFocus 
                      type="text" 
                      required 
                      placeholder="PLAYER NAME..." 
                      value={playerName} 
                      onChange={(e) => setPlayerName(e.target.value)} 
                      className="flex-1 bg-white border border-emerald-200 px-4 py-3 rounded-2xl text-xs font-black uppercase italic outline-none focus:border-red-600 text-[#0C381E] shadow-xs" 
                    />

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPlayerPhoto(e.target.files[0])}
                        className="text-[10px] w-[120px] text-gray-500 file:py-2.5 file:px-2.5 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-emerald-100 file:text-[#0C381E] cursor-pointer"
                      />
      
                      <button type="submit" className="bg-[#0C381E] hover:bg-emerald-900 text-yellow-300 font-extrabold px-5 py-3 rounded-2xl shadow-md active:scale-95 shrink-0 text-xs tracking-wider uppercase border border-yellow-400/20">
                        Add
                      </button>
                    </div>
                  </form>
                </div>

                {/* Players List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar pb-24 bg-gray-50/50">
                  {teamPlayers.map((p, index) => (
                    <div key={p.id} className="flex items-center justify-between p-3.5 bg-white border border-emerald-100/80 rounded-2xl shadow-xs hover:shadow-md hover:border-emerald-300 transition-all">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-[#0C381E] to-[#14532D] flex items-center justify-center shrink-0 border border-emerald-300 shadow-xs">
                          {p.photoUrl ? (
                            <img
                              src={p.photoUrl}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-yellow-300 text-[11px] font-black">
                              {(index + 1).toString().padStart(2, "0")}
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-black uppercase tracking-tight text-[#0C381E] truncate">
                          {p.name}
                        </span>
                      </div>
                                   
                      <button onClick={() => handleDeletePlayer(p.id)} className="p-2 hover:bg-red-50 rounded-xl text-gray-300 hover:text-red-600 transition-all" title="Remove Player">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {teamPlayers.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-xs font-bold uppercase text-emerald-800/60 tracking-wider">No players added to this squad yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* SYSTEM STATUS FOOTER PILL */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-[#0C381E] border border-yellow-400/40 shadow-2xl rounded-full z-40 flex items-center gap-2.5 backdrop-blur-md">
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-300">Live Database Connected</span>
      </div>
    </div>
  );
}

// --- SERVER SIDE RENDERING (SSR) ---
export async function getServerSideProps({ params, req, res }) {
  res.setHeader(
    "Cache-Control",
    "private, no-store, max-age=0"
  );

  try {
    const [data, navbarProps] = await Promise.all([
      getTournamentInitialProps(params.id),
      getNavbarInitialProps(req),
    ]);

    if (!data || !data.tournament) {
      return { notFound: true };
    }

    const initialTeamCounts = {};

    try {
      const { getAdminDb } = await import("../../lib/firebase-admin");
      const adminDb = getAdminDb();

      await Promise.all(
        (data.teams || []).map(async (team) => {
          const playersSnapshot = await adminDb
            .collection("tournaments")
            .doc(params.id)
            .collection("teams")
            .doc(team.id)
            .collection("players")
            .get();

          initialTeamCounts[team.id] = playersSnapshot.size;
        })
      );
    } catch (countError) {
      console.error(
        "SSR team counts failed:",
        countError?.code || countError?.message
      );
    }

    return {
      props: {
        initialTournament: data.tournament,
        initialTeams: data.teams || [],
        initialTeamCounts,
        initialUser: navbarProps.initialUser,
        initialUserData: navbarProps.initialUserData,
      },
    };
  } catch (error) {
    console.error(
      "Tournament details SSR failed:",
      error?.code || error?.message
    );

    return {
      props: {
        initialTournament: null,
        initialTeams: [],
        initialTeamCounts: {},
        initialUser: null,
        initialUserData: null,
        ssrError: true,
      },
    };
  }
}
