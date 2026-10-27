// lib/ssr/latest-matches.js

import { getAdminDb } from "../firebase-admin";
import { serializeFirestoreData } from "./firestore";

function getCreatedAtTime(match) {
  const value = match?.createdAt;

  if (typeof value === "string") {
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? 0 : time;
  }

  if (value?.seconds) {
    return value.seconds * 1000;
  }

  return 0;
}

export async function getLatestMatchesInitialProps() {
  try {
    const db = getAdminDb();

    const tournamentsSnapshot = await db
      .collection("tournaments")
      .get();

    const matchesByTournament = await Promise.all(
      tournamentsSnapshot.docs.map(async (tournamentDoc) => {
        try {
          const tournamentData = tournamentDoc.data();

          const matchesSnapshot = await tournamentDoc.ref
            .collection("matches")
            .orderBy("createdAt", "desc")
            .limit(10)
            .get();

          return matchesSnapshot.docs.map((matchDoc) => {
            const matchData = matchDoc.data();

            return {
              ...matchData,
              id: matchDoc.id,
              tournamentId: tournamentDoc.id,
              tournamentName:
                matchData.tournamentName ||
                tournamentData.tournamentName ||
                tournamentData.name ||
                tournamentData.title ||
                "Tournament",
            };
          });
        } catch (error) {
          console.error(
            "Latest matches SSR query failed:",
            tournamentDoc.id,
            error?.code || error?.message
          );

          return [];
        }
      })
    );

    const matches = matchesByTournament
      .flat()
      .filter((match) =>
        ["live", "completed"].includes(
          String(match.status || "").toLowerCase()
        )
      )
      .sort((a, b) => getCreatedAtTime(b) - getCreatedAtTime(a))
      .slice(0, 10);

    // Firestore Timestamp objects ko JSON-safe values mein badlein.
    return {
      initialMatches: serializeFirestoreData(matches),
    };
  } catch (error) {
    console.error(
      "Latest matches SSR failed:",
      error?.code || error?.message
    );

    return { initialMatches: [] };
  }
}
