import { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../lib/firebase";

export default function useLatestMatches(initialMatches = []) {
  const [matches, setMatches] = useState(initialMatches);
  const [loading, setLoading] = useState(initialMatches.length === 0);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let generation = 0;

    const matchListeners = new Map();
    const matchesByTournament = new Map();
    const tournamentNames = new Map();

    const buildLatestMatches = () => {
      const latestMatches = [];

      matchesByTournament.forEach((tournamentMatches) => {
        latestMatches.push(...tournamentMatches);
      });

      return latestMatches
        .filter((match) =>
          ["live", "completed"].includes(
            String(match.status || "").toLowerCase()
          )
        )
        .sort((a, b) => {
          const matchA = Number(a.matchNo);
          const matchB = Number(b.matchNo);

          if (
            Number.isFinite(matchA) &&
            Number.isFinite(matchB)
          ) {
            return matchA - matchB;
          }

          return String(matchA === undefined ? "" : a.matchNo ?? "").localeCompare(
            String(matchB === undefined ? "" : b.matchNo ?? ""),
            undefined,
            { numeric: true }
          );
        })
        .slice(0, 10);
    };

    const publishMatches = () => {
      if (!active) return;

      setMatches(buildLatestMatches());
      setLoading(false);
      setError(false);
    };

    const unsubscribeTournament = onSnapshot(
      collection(db, "tournaments"),
      (tournamentSnapshot) => {
        if (!active) return;

        const currentGeneration = ++generation;
        const currentTournamentIds = new Set();

        tournamentSnapshot.docs.forEach((tournamentDoc) => {
          const tournamentId = tournamentDoc.id;
          const tournamentData = tournamentDoc.data();

          currentTournamentIds.add(tournamentId);

          const tournamentName =
            tournamentData.tournamentName ||
            tournamentData.name ||
            tournamentData.title ||
            "Tournament";

          const previousName = tournamentNames.get(tournamentId);

          tournamentNames.set(tournamentId, tournamentName);

          // Existing listener: update metadata without recreating it.
          if (matchListeners.has(tournamentId)) {
            if (previousName !== tournamentName) {
              const existingMatches =
                matchesByTournament.get(tournamentId) || [];

              matchesByTournament.set(
                tournamentId,
                existingMatches.map((match) => ({
                  ...match,
                  tournamentName:
                    match.tournamentName ||
                    tournamentName,
                }))
              );
            }

            return;
          }

          const matchesQuery = query(
            collection(
              db,
              "tournaments",
              tournamentId,
              "matches"
            ),
            orderBy("createdAt", "desc"),
            limit(10)
          );

          const unsubscribeMatch = onSnapshot(
            matchesQuery,
            (matchSnapshot) => {
              if (
                !active ||
                currentGeneration !== generation
              ) {
                return;
              }

              const tournamentMatches = matchSnapshot.docs.map(
                (matchDoc) => {
                  const matchData = matchDoc.data();

                  return {
                    ...matchData,
                    id: matchDoc.id,
                    tournamentId,
                    tournamentName:
                      matchData.tournamentName ||
                      tournamentNames.get(tournamentId) ||
                      "Tournament",
                  };
                }
              );

              matchesByTournament.set(
                tournamentId,
                tournamentMatches
              );

              publishMatches();
            },
            (listenerError) => {
              console.error(
                "Match listener failed:",
                listenerError?.code || listenerError?.message
              );

              if (active) {
                setError(true);
                setLoading(false);
              }
            }
          );

          matchListeners.set(tournamentId, unsubscribeMatch);
        });

        // Remove listeners only for deleted tournaments.
        for (const [tournamentId, unsubscribe] of matchListeners) {
          if (!currentTournamentIds.has(tournamentId)) {
            unsubscribe();
            matchListeners.delete(tournamentId);
            matchesByTournament.delete(tournamentId);
            tournamentNames.delete(tournamentId);
          }
        }

        if (tournamentSnapshot.empty) {
          setMatches([]);
          setLoading(false);
          setError(false);
          return;
        }

        // Publish updated tournament names and removals.
        publishMatches();
      },
      (listenerError) => {
        console.error(
          "Tournament listener failed:",
          listenerError?.code || listenerError?.message
        );

        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    );

    return () => {
      active = false;
      unsubscribeTournament();

      matchListeners.forEach((unsubscribe) => unsubscribe());
      matchListeners.clear();
    };
  }, []);

  return { matches, loading, error };
}
