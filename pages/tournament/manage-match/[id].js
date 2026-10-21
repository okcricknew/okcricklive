import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db, auth } from '../../../lib/firebase'; 
import { collection, query, where, getDocs, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore'; 
import { onAuthStateChanged } from 'firebase/auth'; 
import { ArrowLeft, Zap, Trophy, Loader2 } from 'lucide-react';

export default function CreateMatch() {
  const router = useRouter();
  const { id } = router.query;
  const [teams, setTeams] = useState([]);
  const [tournamentName, setTournamentName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminId, setAdminId] = useState(null);

  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [matchType, setMatchType] = useState('League');
  const [matchNo, setMatchNo] = useState('');
  const [overs, setOvers] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setAdminId(user.uid);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const tourneyRef = doc(db, "tournaments", id);
          const tourneySnap = await getDoc(tourneyRef);
          if (tourneySnap.exists()) {
  const data = tourneySnap.data();

  setTournamentName(data.tournamentName);
  setLogoUrl(data.logoUrl || "");
            setLocation(data.location || "");
          }

          const teamsRef = collection(db, "tournaments", id, "teams");
          const snap = await getDocs(teamsRef);
          setTeams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (e) { console.error("Error fetching teams:", e); }
      };
      fetchData();
    }
  }, [id]);

  const handleAddTeamInline = async (teamName) => {
    if (!teamName.trim()) return;

    try {
      const teamRef = await addDoc(
        collection(db, "tournaments", id, "teams"),
        {
          name: teamName.trim().toUpperCase(),
          createdAt: serverTimestamp()
        }
      );

      setTeams([...teams, { id: teamRef.id, name: teamName.trim().toUpperCase() }]);

    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (teamA === teamB) return alert("Team A and Team B cannot be same!");
    if (!adminId) return alert("Admin not authenticated!");

    setLoading(true);
    try {
      const matchesRef = collection(db, "tournaments", id, "matches");
      
      const teamAData = teams.find(t => t.name === teamA);
      const teamBData = teams.find(t => t.name === teamB);

      await addDoc(matchesRef, {
        tournamentId: id,
        tournamentName: tournamentName,
        logoUrl: logoUrl,
        location: location,
        adminId: adminId,
        teamA,
        teamAId: teamAData?.id || '',
        teamALogoUrl: teamAData?.logoUrl || '',
        teamB,
        teamBId: teamBData?.id || '',
        teamBLogoUrl: teamBData?.logoUrl || '',
        matchType,
        matchNo: Number(matchNo),
        overs: Number(overs),
        status: 'upcoming',
        createdAt: serverTimestamp(),
        totalRuns: 0, totalWickets: 0, currentOver: 0, ballsInOver: 0,
        innings: 1, target: 0, setupComplete: false, tossCompleted: false,
        battingTeam: '', bowlingTeam: '', status: 'upcoming', overlayType: "none", squadTeam: "teamA"
      });

      alert("Match Scheduled! 🏏");
      router.push(`/tournament/matches/${id}`);

    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (

<div className="h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 text-[#1D2939] font-sans pb-16 pt-20">

<header className="fixed top-16 left-0 right-0 z-[150] px-4 pt-3">
  <div className="max-w-lg mx-auto">
    <div className="bg-[#1D2939]/95 backdrop-blur-xl text-white h-12 flex items-center px-4 shadow-2xl rounded-2xl border border-slate-700/30">
      
      <button 
        onClick={() => router.back()} 
        className="p-2 active:bg-slate-800 rounded-full transition"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="flex-1 text-center">
        <h1 className="text-[13px] font-black uppercase tracking-widest">
          Schedule <span className="text-blue-400">Match</span>
        </h1>
        <p className="text-[9px] text-slate-400 uppercase tracking-widest truncate">
          {tournamentName || "Loading..."}
        </p>
      </div>

      <div className="w-8" />
    </div>
  </div>
</header>


<main className="max-w-lg mx-auto px-5">

<div className="bg-white rounded-[24px] shadow-2xl border border-gray-200 overflow-hidden">

<form onSubmit={handleCreateMatch} className="p-3 space-y-3">


<div className="grid grid-cols-2 gap-4">

<div>
<label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
Match No.
</label>

<input
required
type="number"
value={matchNo}
onChange={(e)=>setMatchNo(e.target.value)}
className="mt-2 w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm font-bold italic outline-none focus:ring-2 focus:ring-blue-500 transition"
/>

</div>

<div>
<label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
Overs
</label>

<input
required
type="number"
value={overs}
onChange={(e)=>setOvers(e.target.value)}
className="mt-2 w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm font-bold italic outline-none focus:ring-2 focus:ring-blue-500 transition"
/>

</div>

</div>


<div>

<label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
Match Type
</label>

<select
value={matchType}
onChange={(e)=>setMatchType(e.target.value)}
className="mt-2 w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold uppercase italic outline-none focus:ring-2 focus:ring-blue-500 transition"
>

<option value="League">League Match</option>
<option value="Quarter Final">Quarter Final</option>
<option value="Semi Final">Semi Final</option>
<option value="Final">Final</option>

</select>

</div>


<div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-[22px] border border-gray-200 space-y-5">

<div>

<label className="text-[10px] text-blue-600 font-black uppercase tracking-widest">
Team A
</label>

<div className="flex gap-2 mt-2">

<select
required
value={teamA}
onChange={(e)=>setTeamA(e.target.value)}
className="flex-1 bg-white border border-gray-200 p-4 rounded-xl text-sm font-black uppercase italic outline-none focus:ring-2 focus:ring-blue-500"
>

<option value="">Select Team</option>

{teams.map(t=>(
<option key={t.id} value={t.name}>{t.name}</option>
))}

</select>

<button
type="button"
onClick={()=>{

const name = prompt("Enter New Team Name")
if(name) handleAddTeamInline(name)

}}
className="bg-[#1D2939] text-white px-4 rounded-xl font-bold hover:scale-105 active:scale-95 transition"
>
+
</button>

</div>

</div>


<div className="flex items-center gap-4">

<div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

<div className="bg-black text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest">
VS
</div>

<div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

</div>


<div>

<label className="text-[10px] text-red-600 font-black uppercase tracking-widest">
Team B
</label>

<div className="flex gap-2 mt-2">

<select
required
value={teamB}
onChange={(e)=>setTeamB(e.target.value)}
className="flex-1 bg-white border border-gray-200 p-4 rounded-xl text-sm font-black uppercase italic outline-none focus:ring-2 focus:ring-red-500"
>

<option value="">Select Team</option>

{teams.map(t=>(
<option key={t.id} value={t.name}>{t.name}</option>
))}

</select>

<button
type="button"
onClick={()=>{

const name = prompt("Enter New Team Name")
if(name) handleAddTeamInline(name)

}}
className="bg-[#1D2939] text-white px-4 rounded-xl font-bold hover:scale-105 active:scale-95 transition"
>
+
</button>

</div>

</div>

</div>


<button
disabled={loading}
type="submit"
className="w-full bg-gradient-to-r from-[#C10E44] to-[#9E0B36] text-white py-5 rounded-2xl font-black uppercase italic tracking-widest text-xs shadow-xl hover:scale-[1.02] active:scale-[0.97] transition flex items-center justify-center gap-3"
>

{loading ? (
<Loader2 className="animate-spin" size={18}/>
) : (
<>
Schedule Match
<Zap size={15} className="fill-yellow-400 text-yellow-400"/>
</>
)}

</button>

</form>
</div>
</main>
</div>
  );
    }
