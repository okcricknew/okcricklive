import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../lib/firebase';
import { collection, query, onSnapshot, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ArrowLeft, Loader2, ChevronRight, Play, Eye, Trophy, PlusCircle, Pencil, Trash2, Radio } from 'lucide-react'; 

import TossModal from '../../../components/TossModal'; 
import PlayerSelectionModal from '../../../components/PlayerSelectionModal';
import MatchSummaryModal from '../../../components/MatchSummaryModal';
import EditMatchModal from '../../../components/scoring/EditMatchModal';
import { getMatchListInitialProps } from '../../../lib/ssr/tournament';
import { getNavbarInitialProps } from '../../../lib/ssr/auth';

export default function MatchList({ initialTournament = null, initialMatches = [] }) {
  const router = useRouter();
  const { id } = router.query;
  const [matches, setMatches] = useState(initialMatches);
  const [tournament, setTournament] = useState(initialTournament);
  const [loading, setLoading] = useState(false);

  const [isTossModalOpen, setIsTossModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    // 1. Tournament Name Realtime Sync
    const tourneyRef = doc(db, "tournaments", id);
    const unsubTourney = onSnapshot(tourneyRef, (snap) => {
      if (snap.exists()) setTournament(snap.data());
    });

    // 2. Matches List Realtime Sync
    const q = query(collection(db, "tournaments", id, "matches"));
    const unsubMatches = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      const matchesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sorting
      const sortedMatches = matchesData.sort((a, b) => 
        (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );

      setMatches(sortedMatches);
    });

    return () => {
      unsubTourney();
      unsubMatches();
    };
  }, [id]);
  

  // --- HELPER: FIXED DATA MAPPING (Corrected Innings logic) ---
  const getTeamDisplayData = (match, teamSlot) => {
    const teamName = teamSlot === 'A' ? match.teamA : match.teamB;
    const maxOvers = match.overs || 0;
    const isCurrentlyBatting = match.battingTeam === teamName;

    const calculateOversFromHistory = (inningsNumber) => {
      const balls = (match.ballHistory || []).filter(
        b => Number(b.innings) === inningsNumber && !['WD', 'NB'].includes(b.type)
      ).length;

      const overs = Math.floor(balls / 6);
      const ballPart = balls % 6;

      return `${overs}.${ballPart}`;
    };

    // 1. Agar match upcoming hai
    if (!match.status || match.status === 'upcoming' || !match.tossCompleted) {
      return { runs: 0, wickets: 0, oversFormatted: "0.0", maxOvers };
    }

    // 2. Innings Logic Check
    const backup = match.firstInningsStatsBackup;
    
    const firstBattingTeam =
      match.tossDecision === 'bat'
        ? match.tossWinner
        : (match.tossWinner === match.teamA ? match.teamB : match.teamA);

    const wasFirstBattingTeam = teamName === firstBattingTeam;

    // CASE A: Team ne 1st innings kheli thi
    if (wasFirstBattingTeam) {
      if (match.innings === 1) {
        return {
          runs: match.totalRuns || 0,
          wickets: match.totalWickets || 0,
          oversFormatted: calculateOversFromHistory(1),
          maxOvers
        };
      } else {
        return {
          runs: match.firstInningsScore || 0,
          wickets: match.firstInningsWickets || 0,
          oversFormatted: calculateOversFromHistory(1),
          maxOvers
        };
      }
    }

    // CASE B: Team 2nd batting team hai
    if (!wasFirstBattingTeam) {
      if (match.innings === 1) {
        return { runs: 0, wickets: 0, oversFormatted: "0.0", maxOvers };
      }
      return {
        runs: match.totalRuns || 0,
        wickets: match.totalWickets || 0,
        oversFormatted: calculateOversFromHistory(2),
        maxOvers
      };
    }

    return { runs: 0, wickets: 0, oversFormatted: "0.0", maxOvers };
  };
  
  const handleActionClick = (match) => {
    setSelectedMatch(match);
    if (match.status === 'completed') {
      setIsSummaryModalOpen(true);
    } else if (!match.tossCompleted) {
      setIsTossModalOpen(true);
    } else if (!match.setupComplete) {
      setIsPlayerModalOpen(true);
    } else {
      router.push(`/scoring/${id}/${match.id}`);
    }
  };

  const handleTossComplete = async (winner, decision, setupData) => {
    try {
      const matchRef = doc(db, "tournaments", id, "matches", selectedMatch.id);
      const firstTeam =
        decision.toLowerCase() === 'bat'
          ? winner
          : (winner === selectedMatch.teamA
              ? selectedMatch.teamB
              : selectedMatch.teamA);

      await updateDoc(matchRef, {
        tossWinner: winner,
        tossDecision: decision.toLowerCase(),
        tossCompleted: true,
        setupComplete: false,
        status: 'live',
        innings: 1,

        battingTeam: firstTeam,
        bowlingTeam:
          firstTeam === selectedMatch.teamA
            ? selectedMatch.teamB
            : selectedMatch.teamA,

        firstInningsBattingTeam: firstTeam,

        ...setupData
      });
      setIsTossModalOpen(false);
      setIsPlayerModalOpen(true);
    } catch (error) { console.error(error); }
  };

  const handlePlayerSelectionComplete = async (playerData) => {
    try {
      const matchRef = doc(db, "tournaments", id, "matches", selectedMatch.id);
      await updateDoc(matchRef, {
        striker: playerData.striker,
        nonStriker: playerData.nonStriker,
        bowler: playerData.bowler,
        setupComplete: true,
        status: 'live'
      });
      router.push(`/scoring/${id}/${selectedMatch.id}`);
    } catch (error) { console.error(error); }
  };

  const handleDeleteMatch = async (matchId) => {
    const confirmDelete = confirm("Are you sure you want to delete this match?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "tournaments", id, "matches", matchId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditMatch = (match) => {
    setSelectedMatch(match);
    setIsEditModalOpen(true);
  };

  const handleSetOverlayActive = async (matchId) => {
    try {
      for (const m of matches) {
        if (m.isOverlayActive) {
          await updateDoc(doc(db, "tournaments", id, "matches", m.id), { isOverlayActive: false });
        }
      }
      await updateDoc(doc(db, "tournaments", id, "matches", matchId), { isOverlayActive: true });
      alert("Match Overlay Activated! ✅");
    } catch (error) {
      console.error(error);
    }
  };
  
  if (loading) return (
    <div className="fixed inset-0 bg-[#F4F4F4] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-slate-900" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F4F4] pb-24">
      {/* HEADER SECTION */}
      <div className="sticky top-16 left-0 right-0 z-[150] px-4 pt-3 pointer-events-none">
        <header className="bg-[#1D2939] text-white h-16 flex items-center px-4 shadow-xl rounded-2xl pointer-events-auto border border-slate-700/30">
          <div className="flex items-center w-full">
            <button onClick={() => router.back()} className="p-2 -ml-1 active:bg-slate-800 rounded-full transition-colors flex-shrink-0">
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 flex flex-col items-center text-center px-2 overflow-hidden">
              <h1 className="text-[20px] font-black uppercase tracking-widest text-white truncate w-full drop-shadow-md">
                {tournament?.tournamentName || "Tournament Matches"}
              </h1>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">MATCH SCHEDULE</p>
              </div>
            </div>
            <div className="w-8" />
          </div>
        </header>

        <div className="flex justify-center mt-4 pointer-events-auto">
          <button 
            onClick={() => router.push(`/tournament/manage-match/${id}`)}
            className="bg-[#C10E44] text-white px-6 py-2.5 rounded-full shadow-lg flex items-center gap-2 active:scale-95 transition-transform border border-white/10"
          >
            <PlusCircle size={18} />
            <span className="text-[11px] font-black uppercase tracking-wider">Create New Match</span>
          </button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto pt-12 px-3 space-y-4">

      {matches.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-bold text-slate-500">No Matches Found</p>
          <p className="text-sm text-slate-400">Create a new match to get started</p>
        </div>
      ) : (
        matches.map((match, idx) => {
          const isLive = match.status === 'live';
          const isFinished = match.status === 'completed';
          
          let firstBattingTeam;
          let secondBattingTeam;

          if (!match.tossCompleted) {
            firstBattingTeam = match.teamA;
            secondBattingTeam = match.teamB;
          } else {
            firstBattingTeam =
              match.firstInningsBattingTeam ||
              match.battingTeam ||
              match.teamA;

            secondBattingTeam =
              firstBattingTeam === match.teamA
                ? match.teamB
                : match.teamA;
          }

          const leftTeamData = getTeamDisplayData(
            match,
            firstBattingTeam === match.teamA ? 'A' : 'B'
          );

          const rightTeamData = getTeamDisplayData(
            match,
            secondBattingTeam === match.teamA ? 'A' : 'B'
          );

          return (
            <div key={match.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-2 bg-slate-50 flex justify-between items-center border-b border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter italic">
                  Match #{match.matchNo || matches.length - idx}
                </span>

                <button
                  onClick={() => handleSetOverlayActive(match.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md border transition-all duration-200
                  ${match.isOverlayActive 
                    ? 'bg-[#C10E44] border-[#C10E44] text-white shadow-md' 
                    : 'bg-[#1E3A8A] border-[#1E3A8A] text-white/80 hover:bg-[#1E40AF] hover:border-[#1E40AF] hover:text-white'
                  }`}
                >
                  <Radio size={12} className={match.isOverlayActive ? "animate-pulse" : ""} />
                  <span className="text-[9px] font-black uppercase">{match.isOverlayActive ? 'Active' : 'Active Overlay'}</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleEditMatch(match)}
                    className="text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    onClick={() => handleDeleteMatch(match.id)}
                    className="text-slate-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>

                  {isLive && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                      <span className="text-[9px] font-black text-red-600 uppercase">Live</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 grid grid-cols-7 items-center gap-2">
                {/* TEAM A */}
                <div className="col-span-3">
                  <h4 className="text-[11px] font-black uppercase text-slate-700 truncate mb-1">{firstBattingTeam}</h4>
                  <div className="flex items-baseline gap-1">
                    <p className="text-xl font-black text-slate-900">{leftTeamData.runs}/{leftTeamData.wickets}</p>
                    <p className="text-[9px] font-bold text-slate-400 italic">({leftTeamData.oversFormatted}/{leftTeamData.maxOvers})</p>
                  </div>
                </div>

                <div className="col-span-1 flex justify-center">
                  {isFinished ? <Trophy size={16} className="text-amber-500" /> : <span className="text-[10px] font-black text-slate-200 italic">VS</span>}
                </div>

                {/* TEAM B */}
                <div className="col-span-3 text-right">
                  <h4 className="text-[11px] font-black uppercase text-slate-700 truncate mb-1">{secondBattingTeam}</h4>
                  <div className="flex items-baseline justify-end gap-1">
                    <p className="text-[9px] font-bold text-slate-400 italic">({rightTeamData.oversFormatted}/{rightTeamData.maxOvers})</p>
                    <p className="text-xl font-black text-slate-900">{rightTeamData.runs}/{rightTeamData.wickets}</p>
                  </div>
                </div>
              </div>

              <div className={`px-4 py-2.5 text-center border-t border-slate-50 ${isFinished ? 'bg-emerald-50/50' : 'bg-white'}`}>
                <p className="text-[9px] font-black uppercase italic tracking-tight text-slate-500">
                  {isFinished ? (match.resultSummary || `${match.winner} WON`) : (match.tossCompleted ? `${match.tossWinner} Won The Toss Elected To ${match.tossDecision}` : 'Toss Pending')}
                </p>
              </div>

              <button 
                onClick={() => handleActionClick(match)}
                className={`w-full py-4 flex items-center justify-center gap-3 active:opacity-90 ${isFinished ? 'bg-[#1D2939]' : 'bg-[#C10E44]'} text-white`}
              >
                {isFinished ? <Eye size={16} /> : <Play size={16} fill="currentColor" />}
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                  {isFinished ? 'VIEW SUMMARY' : !match.tossCompleted ? 'START TOSS' : !match.setupComplete ? 'SELECT PLAYERS' : 'RESUME SCORING'}
                </span>
                <ChevronRight size={16} className="opacity-40" />
              </button>
            </div>
          );
        }))}
      </main>

      <TossModal isOpen={isTossModalOpen} onClose={() => setIsTossModalOpen(false)} match={selectedMatch} onComplete={handleTossComplete} />
      {isPlayerModalOpen && <PlayerSelectionModal isOpen={isPlayerModalOpen} match={selectedMatch} onStart={handlePlayerSelectionComplete} />}
      {isSummaryModalOpen && <MatchSummaryModal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} match={selectedMatch} />}
       
      {isEditModalOpen && selectedMatch && (
        <EditMatchModal
          match={selectedMatch}
          tId={id}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedMatch(null);
          }}
        />
      )}
    </div>
  );
}

// --- SERVER SIDE RENDERING (SSR) ---

export async function getServerSideProps({ params, req, res }) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');

  try {
    const [data, navbarProps] = await Promise.all([
      getMatchListInitialProps(params.id),
      getNavbarInitialProps(req),
    ]);

    if (!data) {
      return { notFound: true };
    }

    return {
      props: {
        initialTournament: data.tournament ?? null,
        initialMatches: data.matches ?? [],
        ...navbarProps,
      },
    };
  } catch (error) {
    console.error(
      'Match list SSR failed:',
      error?.code || error?.message
    );

    return { notFound: true };
  }
}
