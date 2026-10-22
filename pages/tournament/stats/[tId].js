import TournamentStats from "../../../components/scoring/TournamentStats";
import { getAdminDb } from "../../../lib/firebase-admin";

export async function getServerSideProps(context) {
  const { tId } = context.params;

  try {
    const adminDb = getAdminDb();

    const tournamentRef = adminDb
      .collection("tournaments")
      .doc(tId);

    const [tournamentSnap, matchesSnap] = await Promise.all([
      tournamentRef.get(),
      tournamentRef.collection("matches").get(),
    ]);

    if (!tournamentSnap.exists) {
      return {
        notFound: true,
      };
    }

    const tournament = {
      id: tournamentSnap.id,
      ...tournamentSnap.data(),
    };

    const matches = matchesSnap.docs.map((matchDoc) => ({
      id: matchDoc.id,
      ...matchDoc.data(),
    }));

    return {
      props: {
        tId,
        tournament: JSON.parse(JSON.stringify(tournament)),
        matches: JSON.parse(JSON.stringify(matches)),
      },
    };
  } catch (error) {
    console.error("Tournament Stats SSR Error:", error);

    return {
      props: {
        tId,
        tournament: null,
        matches: [],
        loadError: true,
      },
    };
  }
}

export default function StatsPage({
  tId,
  tournament,
  matches,
  loadError,
}) {
  if (loadError) {
    return (
      <div className="pt-10 p-4 text-center">
        Unable to load tournament statistics.
        Please try again later.
      </div>
    );
  }

  return (
    <div className="pt-10">
      <TournamentStats
        tId={tId}
        data={tournament}
        matches={matches}
      />
    </div>
  );
}
