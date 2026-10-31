import { getAdminDb } from '../firebase-admin';
import { serializeFirestoreDoc } from './firestore';

async function getHomepageStats(db) {
  const initialStats = {
    matches: 0,
    players: 0,
    locations: 0,
  };

  try {
    const tournamentsSnap = await db
      .collection('tournaments')
      .get();

    if (tournamentsSnap.empty) {
      return initialStats;
    }

    const tournamentStats = await Promise.all(
      tournamentsSnap.docs.map(async (tournamentDoc) => {
        const tournamentData = tournamentDoc.data();

        const location =
          typeof tournamentData.location === 'string'
            ? tournamentData.location.trim()
            : '';

        const [matchesCountSnap, teamsSnap] = await Promise.all([
          tournamentDoc.ref
            .collection('matches')
            .count()
            .get(),

          tournamentDoc.ref
            .collection('teams')
            .get(),
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

    return {
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

    return initialStats;
  }
}

export async function getHomeInitialProps() {
  const db = getAdminDb();

  try {
    // Run all independent SSR operations simultaneously.
    const [
  matchSnap,
  initialStats,
] = await Promise.all([
      db
        .doc('tournaments/demo_tournament/matches/demo_match')
        .get(),

      getHomepageStats(db),
    ]);

    return {
      initialMatch: serializeFirestoreDoc(matchSnap),

      initialStats,
    };
  } catch (error) {
    console.error(
      'Homepage SSR failed:',
      error.code || error.message
    );

    return {
      initialMatch: null,

      initialStats: {
        matches: 0,
        players: 0,
        locations: 0,
      },
    };
  }
}
