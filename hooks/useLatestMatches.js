// hooks/useLatestMatches.js

import { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import { getMatchTime } from "../lib/matches/formatMatch";

export default function useLatestMatches(initialMatches = []) {
  const [matches, setMatches] = useState(initialMatches);
  const [loading, setLoading] = useState(initialMatches.length === 0);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const matchUnsubscribersMap = new Map(); // tournamentId -> unsubscribe function
    let matchesByTournament = new Map();

    const updateAndComputeMatches = () => {
      if (!active) return;

      const latestMatches = Array.from(matchesByTournament.values())
        .flat()
        .filter((match) =>
          ["live", "completed"].includes(
            String(match.status || "").toLowerCase()
          )
        )
        .sort((a, b) => {
          const matchA = Number(a.matchNo);
          const matchB = Number(b.matchNo);

          if (Number.isFinite(matchA) && Number.isFinite(matchB)) {
            return matchA - matchB;
          }

          return String(a.matchNo ?? "").localeCompare(
            String(b.matchNo ?? ""),
            undefined,
            { numeric: true }
          );
        })
        .slice(0, 10);

      setMatches(latestMatches);
      setLoading(false);
      setError(false);
    };

    const unsubscribeTournaments = onSnapshot(
      collection(db, "tournaments"),
      (tournamentSnapshot) => {
        if (!active) return;

        if (tournamentSnapshot.empty) {
          matchUnsubscribersMap.forEach((unsubscribe) => unsubscribe());
          matchUnsubscribersMap.clear();
          matchesByTournament.clear();
          setMatches([]);
          setLoading(false);
          setError(false);
          return;
        }

        const currentTournamentIds = new Set();

        tournamentSnapshot.docs.forEach((tournamentDoc) => {
          const tournamentData = tournamentDoc.data();
          const tournamentId = tournamentDoc.id;
          currentTournamentIds.add(tournamentId);

          // Agar is tournament ka listener pehle se nahi hai, tabhi naya banayein
          if (!matchUnsubscribersMap.has(tournamentId)) {
            const matchesQuery = query(
              collection(db, "tournaments", tournamentId, "matches"),
              orderBy("createdAt", "desc"),
              limit(10)
            );

            const unsubscribeMatches = onSnapshot(
              matchesQuery,
              (matchSnapshot) => {
                if (!active) return;

                const tournamentMatches = matchSnapshot.docs.map(
                  (matchDoc) => {
                    const matchData = matchDoc.data();

                    return {
                      ...matchData,
                      id: matchDoc.id,
                      tournamentId,
                      tournamentName:
                        matchData.tournamentName ||
                        tournamentData.tournamentName ||
                        tournamentData.name ||
                        tournamentData.title ||
                        "Tournament",
                    };
                  }
                );

                matchesByTournament.set(
                  tournamentId,
                  tournamentMatches
                );

                updateAndComputeMatches();
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

            matchUnsubscribersMap.set(tournamentId, unsubscribeMatches);
          }
        });

        // Jo tournaments ab exist nahi karte, unke listeners cleanup karein
        for (const [tournamentId, unsubscribe] of matchUnsubscribersMap.entries()) {
          if (!currentTournamentIds.has(tournamentId)) {
            unsubscribe();
            matchUnsubscribersMap.delete(tournamentId);
            matchesByTournament.delete(tournamentId);
          }
        }

        // Agar saare tournaments empty hain
        if (matchUnsubscribersMap.size === 0) {
          setMatches([]);
          setLoading(false);
        }
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
      unsubscribeTournaments();
      matchUnsubscribersMap.forEach((unsubscribe) => unsubscribe());
      matchUnsubscribersMap.clear();
    };
  }, []);

  return { matches, loading, error };
}
