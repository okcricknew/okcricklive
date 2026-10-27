import { getAdminDb } from '../firebase-admin';
import { serializeFirestoreDoc } from './firestore';
import { getLatestMatchesInitialProps } from './latest-matches';

export async function getHomeInitialProps() {
  const db = getAdminDb();

  // Existing demo match SSR logic preserved
  const matchSnap = await db
    .doc('tournaments/demo_tournament/matches/demo_match')
    .get();

  // Homepage statistics: Firebase registered data
  let initialStats = {
    matches: 0,
    players: 0,
    locations: 0,
  };

  try {
    const tournamentsSnap = await db
      .collection('tournaments')
      .get();

    const tournamentStats = await Promise.all(
      tournamentsSnap.docs.map(async (tournamentDoc) => {
        const tournamentData = tournamentDoc.data();

        const location =
          typeof tournamentData.location === 'string'
            ? tournamentData.location.trim()
            : '';

        const [matchesCountSnap, teamsSnap] = await Promise.all([
          tournamentDoc.ref.collection('matches').count().get(),
          tournamentDoc.ref.collection('teams').get(),
        ]);

        const playerCounts = await Promise.all(
          teamsSnap.docs.map(async (teamDoc) => {
            try {
              const playersCountSnap = await teamDoc.ref
                .collection('players')
                .count()
                .get();

              return playersCountSnap.data().count || 0;
            } catch (error) {
              console.error(
                'Player count error:',
                error.code || error.message
              );
              return 0;
            }
          })
        );

        return {
          matches: matchesCountSnap.data().count || 0,
          players: playerCounts.reduce(
            (total, count) => total + count,
            0
          ),
          location,
        };
      })
    );

    const uniqueLocations = new Set(
      tournamentStats
        .map((item) => item.location.toLowerCase())
        .filter(Boolean)
    );

    initialStats = {
      matches: tournamentStats.reduce(
        (total, item) => total + item.matches,
        0
      ),
      players: tournamentStats.reduce(
        (total, item) => total + item.players,
        0
      ),
      locations: uniqueLocations.size,
    };
  } catch (error) {
    console.error(
      'Homepage statistics error:',
      error.code || error.message
    );
  }
  
const { initialMatches = [] } =
  await getLatestMatchesInitialProps();
  return {
  initialMatch: serializeFirestoreDoc(matchSnap),
  initialStats,
  initialMatches,
};
}
