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
  const ssrMatches = Array.isArray(initialMatches)
    ? initialMatches
    : [];

  const [matches, setMatches] = useState(ssrMatches);
  const [loading, setLoading] = useState(ssrMatches.length === 0);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    const matchListeners = new Map();
    const matchesByTournament = new Map();
    const tournamentNames = new Map();
    const readyTournamentIds = new Set();
    const failedTournamentIds = new Set();

    let expectedTournamentIds = new Set();

    // SSR matches ko cache mein rakho, taaki refresh par
    // visible matches turant disappear na hon.
    ssrMatches.forEach((match) => {
      if (!match.tournamentId) return;

      const tournamentId = match.tournamentId;

      if (!matchesByTournament.has(tournamentId)) {
        matchesByTournament.set(tournamentId, []);
      }

      matchesByTournament.get(tournamentId).push(match);
    });

    const buildLatestMatches = () => {
      const latestMatches = [];

      expectedTournamentIds.forEach((tournamentId) => {
        const tournamentMatches =
          matchesByTournament.get(tournamentId) || [];

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

          return String(a.matchNo ?? "").localeCompare(
            String(b.matchNo ?? ""),
            undefined,
            { numeric: true }
          );
        })
        .slice(0, 10);
    };

    const publishMatches = () => {
      if (!active) return;

      // Jab tak sabhi current tournaments ka first snapshot
      // nahi aata, existing visible list ko mat badlo.
      for (const tournamentId of expectedTournamentIds) {
        if (!readyTournamentIds.has(tournamentId)) {
          return;
        }
      }

      const latestMatches = buildLatestMatches();

      setMatches((current) => {
        if (
          JSON.stringify(current) ===
          JSON.stringify(latestMatches)
        ) {
          return current;
        }

        return latestMatches;
      });

      setLoading(false);
      setError(failedTournamentIds.size > 0);
    };

    const unsubscribeTournaments = onSnapshot(
      collection(db, "tournaments"),
      (tournamentSnapshot) => {
        if (!active) return;

        // SSR matches available hon to empty cache snapshot
        // ki wajah se unhe clear mat karo.
        if (
          ssrMatches.length > 0 &&
          tournamentSnapshot.metadata?.fromCache &&
          tournamentSnapshot.empty
        ) {
          return;
        }

        const currentTournamentIds = new Set(
          tournamentSnapshot.docs.map((doc) => doc.id)
        );

        expectedTournamentIds = currentTournamentIds;

        // Sirf deleted tournaments ke listeners remove karo.
        for (const [
          tournamentId,
          subscription,
        ] of matchListeners) {
          if (!currentTournamentIds.has(tournamentId)) {
            subscription.unsubscribe?.();

            matchListeners.delete(tournamentId);
            matchesByTournament.delete(tournamentId);
            tournamentNames.delete(tournamentId);
            readyTournamentIds.delete(tournamentId);
            failedTournamentIds.delete(tournamentId);
          }
        }

        if (tournamentSnapshot.empty) {
          setMatches((current) =>
            current.length === 0 ? current : []
          );

          setLoading(false);
          setError(false);
          return;
        }

        tournamentSnapshot.docs.forEach((tournamentDoc) => {
          const tournamentId = tournamentDoc.id;
          const tournamentData = tournamentDoc.data();

          const tournamentName =
            tournamentData.tournamentName ||
            tournamentData.name ||
            tournamentData.title ||
            "Tournament";

          tournamentNames.set(
            tournamentId,
            tournamentName
          );

          // Existing listener ko recreate mat karo.
          if (matchListeners.has(tournamentId)) {
            const existingMatches =
              matchesByTournament.get(tournamentId) || [];

            matchesByTournament.set(
              tournamentId,
              existingMatches.map((match) => ({
                ...match,
                tournamentName:
                  match.tournamentName || tournamentName,
              }))
            );

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

          const token = {};

          const subscription = {
            token,
            unsubscribe: null,
          };

          matchListeners.set(
            tournamentId,
            subscription
          );

          subscription.unsubscribe = onSnapshot(
            matchesQuery,
            (matchSnapshot) => {
              if (!active) return;

              // Deleted/replaced listener ka old callback ignore karo.
              if (
                matchListeners.get(tournamentId)?.token !==
                token
              ) {
                return;
              }

              const tournamentMatches =
                matchSnapshot.docs.map((matchDoc) => {
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
                });

              matchesByTournament.set(
                tournamentId,
                tournamentMatches
              );

              readyTournamentIds.add(tournamentId);
              failedTournamentIds.delete(tournamentId);

              publishMatches();
            },
            (listenerError) => {
              if (!active) return;

              if (
                matchListeners.get(tournamentId)?.token !==
                token
              ) {
                return;
              }

              console.error(
                "Match listener failed:",
                listenerError?.code ||
                  listenerError?.message
              );

              // Error par existing/SSR matches preserve karo.
              readyTournamentIds.add(tournamentId);
              failedTournamentIds.add(tournamentId);

              publishMatches();
            }
          );
        });

        publishMatches();
      },
      (listenerError) => {
        if (!active) return;

        console.error(
          "Tournament listener failed:",
          listenerError?.code ||
            listenerError?.message
        );

        setError(true);
        setLoading(false);
      }
    );

    return () => {
      active = false;

      unsubscribeTournaments();

      matchListeners.forEach((subscription) => {
        subscription.unsubscribe?.();
      });

      matchListeners.clear();
      matchesByTournament.clear();
      tournamentNames.clear();
      readyTournamentIds.clear();
      failedTournamentIds.clear();
    };
  }, []);

  return { matches, loading, error };
}
