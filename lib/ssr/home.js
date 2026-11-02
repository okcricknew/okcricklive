import { getAdminDb } from "../firebase-admin";

// Per-process cache prevents every homepage SSR request from repeating the
// same aggregate queries. Each server instance maintains its own short cache.
const CACHE_TTL_MS = 60 * 1000;
const EMPTY_STATS = Object.freeze({ matches: 0, players: 0, locations: 0 });
let cachedStats = null;
let cacheExpiresAt = 0;
let pendingStatsPromise = null;

async function loadHomepageStats(db) {
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
}

export async function getHomeInitialProps() {
  if (cachedStats && Date.now() < cacheExpiresAt) {
    return { initialStats: cachedStats };
  }

  if (pendingStatsPromise) {
    return { initialStats: await pendingStatsPromise };
  }

  pendingStatsPromise = (async () => {
    try {
      const stats = await loadHomepageStats(getAdminDb());
      cachedStats = stats;
      cacheExpiresAt = Date.now() + CACHE_TTL_MS;
      return stats;
    } catch (error) {
      console.error("Homepage statistics error:", error?.code || error?.message);
      return cachedStats || EMPTY_STATS;
    } finally {
      pendingStatsPromise = null;
    }
  })();

  return { initialStats: await pendingStatsPromise };
}
