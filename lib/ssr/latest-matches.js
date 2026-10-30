import { getAdminDb } from "../firebase-admin";
import { serializeFirestoreData } from "./firestore";

export async function getLatestMatchesInitialProps() {
  try {
    const db = getAdminDb();

    // Fetch tournament documents.
    const tournamentsSnapshot = await db
      .collection("tournaments")
      .get();

    if (tournamentsSnapshot.empty) {
      return { initialMatches: [] };
    }

    // Fetch matches concurrently for all tournaments.
    const matchPromises = tournamentsSnapshot.docs.map(
      async (tournamentDoc) => {
        try {
          const tournamentData = tournamentDoc.data();

          const matchesSnapshot = await tournamentDoc.ref
            .collection("matches")
            .orderBy("createdAt", "desc")
            .limit(10)
            .get();

          return matchesSnapshot.docs
            .map((matchDoc) => {
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
            })
            .filter((match) =>
              ["live", "completed"].includes(
                String(match.status || "").toLowerCase()
              )
            );
        } catch (error) {
          console.error(
            "Latest matches SSR query failed:",
            tournamentDoc.id,
            error?.code || error?.message
          );

          return [];
        }
      }
    );

    const matchesByTournament = await Promise.all(matchPromises);

    // Preserve existing match ordering.
    const matches = matchesByTournament
      .flat()
      .sort((a, b) => {
        const matchA = Number(a.matchNo);
        const matchB = Number(b.matchNo);

        if (
          Number.isFinite(matchA) &&
          Number.isFinite(matchB)
        ) {
          return matchA - matchB;
        }

        return String(a.matchNo ?? "").localeCompare(
          String(b.matchNo ?? ""),
          undefined,
          { numeric: true }
        );
      })
      .slice(0, 10);

    return {
      initialMatches: serializeFirestoreData(matches),
    };
  } catch (error) {
    console.error(
      "Latest matches SSR failed:",
      error?.code || error?.message
    );

    return {
      initialMatches: [],
    };
  }
}
