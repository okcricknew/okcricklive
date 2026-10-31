import { getAdminDb } from "../firebase-admin";

async function getHomepageStats(db) {
  const initialStats = {
    matches: 0,
    players: 0,
    locations: 0,
  };

  try {
    // Read tournament documents only for unique location names.
    // Use aggregation queries for subcollection totals instead of downloading
    // every team/player/match document during every homepage SSR request.
    const [tournamentsSnap, matchesCountSnap, playersCountSnap] =
      await Promise.all([
        db.collection("tournaments").get(),
        db.collectionGroup("matches").count().get(),
        db.collectionGroup("players").count().get(),
      ]);

    const uniqueLocations = new Set();

    tournamentsSnap.docs.forEach((tournamentDoc) => {
      const location = tournamentDoc.data()?.location;

      if (typeof location === "string" && location.trim()) {
        uniqueLocations.add(location.trim().toLowerCase());
      }
    });

    return {
      matches: matchesCountSnap.data()?.count || 0,
      players: playersCountSnap.data()?.count || 0,
      locations: uniqueLocations.size,
    };
  } catch (error) {
    console.error(
      "Homepage statistics error:",
      error?.code || error?.message
    );

    return initialStats;
  }
}

export async function getHomeInitialProps() {
  const db = getAdminDb();

  try {
    const initialStats = await getHomepageStats(db);

    return {
      initialStats,
    };
  } catch (error) {
    console.error(
      "Homepage SSR failed:",
      error.code || error.message
    );

    return {
      initialStats: {
        matches: 0,
        players: 0,
        locations: 0,
      },
    };
  }
}
