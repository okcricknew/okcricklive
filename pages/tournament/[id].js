import { useRouter } from 'next/router';
import { ArrowLeft, Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { getTournamentInitialProps } from '../../lib/ssr/tournament';
import { getNavbarInitialProps } from '../../lib/ssr/auth';

import TeamRow from '../../components/tournament/TeamRow';
import SquadModal from '../../components/tournament/SquadModal';
import AddTeamCard from '../../components/tournament/AddTeamCard';
import EditTeamModal from '../../components/tournament/EditTeamModal';
import EditPlayerModal from '../../components/tournament/EditPlayerModal';
import ConfirmModal from '../../components/tournament/ConfirmModal';
import { useTournamentDetails } from '../../hooks/useTournamentDetails';

export default function TournamentDetails({
  initialTournament = null,
  initialTeams = [],
  initialTeamCounts = {},
}) {
  const router = useRouter();
  const { id } = router.query;
  const tournament = initialTournament;

  const {
    teams,
    isModalOpen,
    setIsModalOpen,
    activeTeam,
    setActiveTeam,
    teamPlayers,
    playerName,
    setPlayerName,
    setPlayerPhoto,
    teamName,
    setTeamName,
    setTeamLogo,
    handleAddTeam,
    handleDeleteTeam,
    handleAddPlayer,
    handleDeletePlayer,
    isEditModalOpen,
    setIsEditModalOpen,
    editingTeam,
    editTeamName,
    setEditTeamName,
    setEditTeamLogo,
    openEditModal,
    handleUpdateTeam,
    isEditPlayerModalOpen,
    setIsEditPlayerModalOpen,
    editingPlayer,
    editPlayerName,
    setEditPlayerName,
    setEditPlayerPhoto,
    openEditPlayerModal,
    handleUpdatePlayer,
    // Delete Confirmation props
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    deleteConfig,
    executeDelete,
  } = useTournamentDetails(id, initialTeams);

  return (
    <div className="min-h-screen bg-[#F4F7F5] text-[#0C381E]">
      
      {/* STICKY HEADER */}
      <nav className="w-full bg-white border-b border-emerald-100 sticky top-0 z-40 h-16 md:h-20 flex items-center px-4 shadow-sm">
        <div className="flex items-center justify-between w-full gap-3">
          <Link href="/my-tournaments" className="p-2.5 bg-emerald-50 text-[#0C381E] rounded-xl active:scale-95 transition-all shrink-0 hover:bg-emerald-100">
            <ArrowLeft size={20} />
          </Link>

          <div className="flex-1 min-w-0 text-center">
            <h1 className="text-[20px] md:text-base font-black uppercase tracking-tighter leading-none truncate px-1 text-[#0C381E]">
              {tournament?.tournamentName || "Tournament"}
            </h1>
            <p className="text-[9px] text-red-600 font-extrabold uppercase tracking-[0.2em] mt-1 whitespace-nowrap">Add Team & Players</p>
          </div>
        </div>
      </nav>

      <div className="flex justify-center mt-5">
        <button 
          onClick={() => router.push(`/tournament/manage-match/${id}`)}
          className="bg-[#0C381E] hover:bg-emerald-900 text-yellow-300 border border-yellow-400/30 px-6 py-3 rounded-xl font-black text-[12px] uppercase flex items-center gap-2 shadow-lg shadow-emerald-900/10 active:scale-95 transition-all"
        >
          <Plus size={15} className="text-yellow-400" /> CREATE MATCH
        </button>
      </div>

      <main className="w-full px-4 pt-6 pb-32 max-w-7xl mx-auto">
        
        {/* ADD TEAM CARD */}
        <AddTeamCard
          teamName={teamName}
          setTeamName={setTeamName}
          setTeamLogo={setTeamLogo}
          handleAddTeam={handleAddTeam}
        />

        {/* COMPACT DIRECTORY GRID */}
        <div className="w-full">
          <div className="flex items-center gap-3 mb-6 px-2">
            <h2 className="text-[10px] font-black uppercase text-emerald-800 tracking-[0.25em] whitespace-nowrap">Squads Directory ({teams.length})</h2>
            <div className="h-[1px] flex-1 bg-emerald-200/60" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
                onEdit={openEditModal}
              />
            ))}
          </div>

          {teams.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-emerald-200 shadow-sm">
               <Users className="mx-auto text-emerald-300 mb-4" size={48} />
               <p className="text-emerald-800 uppercase font-black italic text-[10px] tracking-widest">Awaiting First Squad</p>
            </div>
          )}
        </div>

        {/* SQUAD MODAL */}
        <SquadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          activeTeam={activeTeam}
          teamPlayers={teamPlayers}
          playerName={playerName}
          setPlayerName={setPlayerName}
          setPlayerPhoto={setPlayerPhoto}
          handleAddPlayer={handleAddPlayer}
          handleDeletePlayer={handleDeletePlayer}
          onEditPlayer={openEditPlayerModal}
        />

        {/* EDIT TEAM MODAL */}
        <EditTeamModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          editingTeam={editingTeam}
          editTeamName={editTeamName}
          setEditTeamName={setEditTeamName}
          setEditTeamLogo={setEditTeamLogo}
          handleUpdateTeam={handleUpdateTeam}
        />

        {/* EDIT PLAYER MODAL */}
        <EditPlayerModal
          isOpen={isEditPlayerModalOpen}
          onClose={() => setIsEditPlayerModalOpen(false)}
          editingPlayer={editingPlayer}
          editPlayerName={editPlayerName}
          setEditPlayerName={setEditPlayerName}
          setEditPlayerPhoto={setEditPlayerPhoto}
          handleUpdatePlayer={handleUpdatePlayer}
        />

        {/* DELETE CONFIRMATION MODAL */}
        <ConfirmModal
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={executeDelete}
          title={deleteConfig.title}
          message={deleteConfig.message}
        />
      </main>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#0C381E] border border-yellow-400/30 shadow-xl rounded-full z-40 flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-widest text-yellow-300">System Stable</span>
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
            
