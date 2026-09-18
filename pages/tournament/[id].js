import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import { 
  collection, addDoc, query, onSnapshot, doc, 
  getDoc, serverTimestamp, orderBy, deleteDoc, updateDoc 
} from 'firebase/firestore';
import { ArrowLeft, Plus, Loader2, X, Trash2, Users, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getTournamentInitialProps } from '../../lib/ssr/tournament';

// --- SUB-COMPONENT: COMPACT TEAM CARD ---
function TeamRow({ team, tournamentId, onManage, onDelete, onEdit }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!tournamentId || !team.id) return;
    const q = query(collection(db, "tournaments", tournamentId, "teams", team.id, "players"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCount(snapshot.docs.length);
    });
    return () => unsubscribe();
  }, [team.id, tournamentId]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
      <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3">
        {/* Left Section: Info */}
        <div className="flex items-center gap-3 min-w-0">
{/* <div className="bg-[#1D2939] text-white w-10 h-10 flex flex-col items-center justify-center rounded-xl shrink-0">
            <span className="text-sm font-black leading-none">{count}</span>
            <span className="text-[6px] font-bold uppercase tracking-tighter">SQD</span>
          </div> */}

  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1D2939] border border-gray-200 shrink-0 flex items-center justify-center">
  {team.logoUrl ? (
    <img
      src={team.logoUrl}
      alt={team.name}
      className="w-full h-full object-contain p-1"
    />
  ) : (
    <div className="text-white flex flex-col items-center justify-center w-full h-full">
      <span className="text-sm font-black leading-none">{count}</span>
      <span className="text-[6px] font-bold uppercase tracking-tighter">
        SQD
      </span>
    </div>
  )}
</div>
    
          <div className="min-w-0">
            <h3 className="font-black text-[13px] uppercase tracking-tighter text-[#1D2939] truncate leading-tight">
              {team.name}
            </h3>
            <p className="text-[8px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">
  {count} SQD
</p>
          </div>
        </div>
        
        {/* Right Section: Compact Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(team)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
            <Edit2 size={14} />
          </button>
          <button onClick={() => onDelete(team.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
          <button 
            onClick={() => onManage(team)} 
            className="ml-1 bg-[#1D2939] text-white p-2 rounded-xl active:scale-90 transition-all shadow-sm"
          >
            Add Player
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// --- MAIN COMPONENT ---
export default function TournamentDetails({ initialTournament = null, initialTeams = [] }) {
  const router = useRouter();
  const { id } = router.query;
  const [tournament, setTournament] = useState(initialTournament);
  const [teams, setTeams] = useState(initialTeams);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTeam, setActiveTeam] = useState(null);
  const [teamPlayers, setTeamPlayers] = useState([]); 
  const [playerName, setPlayerName] = useState('');
  const [playerPhoto, setPlayerPhoto] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [teamLogo, setTeamLogo] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchTournament = async () => {
      const snap = await getDoc(doc(db, "tournaments", id));
      if (snap.exists()) setTournament(snap.data());
    };
    fetchTournament();

    const qTeams = query(collection(db, "tournaments", id, "teams"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(qTeams, (snapshot) => {
      setTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
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

    
    e.preventDefault();
    if (!teamName.trim()) return;
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
    
    e.preventDefault();
    if (!playerName.trim() || !activeTeam?.id || !id) return;
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

  if (loading) return (
    <div className="fixed inset-0 bg-[#F4F4F4] flex flex-col items-center justify-center z-[200]">
      <Loader2 className="animate-spin text-[#1D2939]" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1D2939]">
      
      {/* STICKY HEADER */}
      <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-40 h-16 md:h-20 flex items-center px-4 shadow-sm">
        <div className="flex items-center justify-between w-full gap-3">
          <Link href="/my-tournaments" className="p-2.5 bg-gray-50 rounded-xl text-gray-600 active:scale-95 transition-all shrink-0">
            <ArrowLeft size={20} />
          </Link>

          <div className="flex-1 min-w-0 text-center">
            <h1 className="text-[20px] md:text-base font-black uppercase tracking-tighter leading-none truncate px-1">
              {tournament?.tournamentName || "Tournament"}
            </h1>
            <p className="text-[8px] text-blue-600 font-bold uppercase tracking-[0.2em] mt-1 whitespace-nowrap">Add Team & Players</p>
          </div>
              
        </div>
      </nav>
              <div className="flex justify-center mt-4">
  <button 
    onClick={() => router.push(`/tournament/manage-match/${id}`)}
    className="bg-[#2E7D32] text-white px-5 py-2.5 rounded-xl font-black text-[12px] uppercase flex items-center gap-2 shadow-md active:scale-95 transition-all"
  >
    <Plus size={14} /> CREATE MATCH
  </button>
</div>

      <main className="w-full px-4 pt-6 pb-32 max-w-7xl mx-auto">
        
        {/* COMPACT ADD TEAM INPUT */}
        <div className="mb-8 max-w-lg mx-auto">
          <div className="bg-white p-1.5 border border-gray-100 flex gap-2 items-center rounded-2xl shadow-sm">
             <input 
               type="text" placeholder="NEW TEAM NAME..." value={teamName} 
               onChange={(e) => setTeamName(e.target.value)} 
               className="flex-1 bg-transparent pl-3 text-xs outline-none font-black italic uppercase text-[#1D2939]" 
             />
                 <input
  type="file"
  accept="image/*"
  onChange={(e) => setTeamLogo(e.target.files[0])}
  className="text-[10px] w-[110px]"
/>
             <button onClick={handleAddTeam} className="bg-[#1D2939] text-white px-5 py-2.5 font-black italic text-[10px] uppercase rounded-xl active:scale-95 transition-all">
               Add Team
             </button>
          </div>
        </div>

        {/* COMPACT DIRECTORY GRID */}
        <div className="w-full">
          <div className="flex items-center gap-3 mb-6 px-2">
            <h2 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.25em] whitespace-nowrap">Squads Directory ({teams.length})</h2>
            <div className="h-[1px] flex-1 bg-gray-100" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {teams.map((team) => (
              <TeamRow 
                key={team.id} 
                team={team} 
                tournamentId={id} 
                onManage={(t) => { setActiveTeam(t); setIsModalOpen(true); }}
                onDelete={handleDeleteTeam}
                onEdit={handleEditTeam}
              />
            ))}
          </div>

          {teams.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
               <Users className="mx-auto text-gray-100 mb-4" size={48} />
               <p className="text-gray-400 uppercase font-black italic text-[10px] tracking-widest">Awaiting First Squad</p>
            </div>
          )}
        </div>

        {/* SQUAD MODAL */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#1D2939]/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white border-t border-gray-200 w-full max-w-lg overflow-hidden flex flex-col h-[75vh] sm:h-[600px] shadow-2xl rounded-t-[1rem] sm:rounded-3xl">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <h2 className="text-lg font-black italic uppercase text-[#1D2939] truncate pr-4">{activeTeam?.name}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 rounded-full active:scale-90 transition-all"><X size={20} className="text-gray-400" /></button>
                </div>
                <div className="p-4 bg-gray-50/50">
                  <form onSubmit={handleAddPlayer} className="flex gap-2">
                    <input autoFocus type="text" required placeholder="PLAYER NAME..." value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="flex-1 bg-white border border-gray-200 px-4 py-3 rounded-xl text-xs font-black uppercase italic outline-none focus:border-[#1D2939]" />

          <input
  type="file"
  accept="image/*"
  onChange={(e) => setPlayerPhoto(e.target.files[0])}
  className="text-[10px] w-[110px]"
/>
    
                    <button type="submit" className="bg-[#1D2939] text-white px-4 rounded-xl shadow-md active:scale-95 shrink-0">Add Player</button>
                  </form>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar pb-24">
                  {teamPlayers.map((p, index) => (

                    <div key={p.id} className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-xl shadow-sm"
>
  <div className="flex items-center gap-3 min-w-0">

    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1D2939] flex items-center justify-center shrink-0">
      {p.photoUrl ? (
        <img
          src={p.photoUrl}
          alt={p.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-white text-[11px] font-black">
          {(index + 1).toString().padStart(2, "0")}
        </span>
      )}
    </div>

    <span className="text-xs font-black uppercase text-[#1D2939] truncate">
      {p.name}
    </span>

  </div>

                                   
                      <button onClick={() => handleDeletePlayer(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-500 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
<div>
          </div>
            <div>
            </div>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#1D2939] shadow-xl rounded-full z-40 flex items-center gap-2 border border-white/10">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        <span className="text-[8px] font-black uppercase tracking-widest text-white/90">System Stable</span>
      </div>
    </div>
  );
          }


export async function getServerSideProps({ params }) {
  try {
    const data = await getTournamentInitialProps(params.id);
    if (!data) return { notFound: true };
    return { props: { initialTournament: data.tournament, initialTeams: data.teams } };
  } catch (error) {
    console.error("Tournament SSR failed:", error);
    return { props: { initialTournament: null, initialTeams: [] } };
  }
}
