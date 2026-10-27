import { useEffect, useState } from "react";
import {
  collection,
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
    let matchUnsubscribers = [];
    let matchesByTournament = new Map();

    const unsubscribeTournaments = onSnapshot(
      collection(db, "tournaments"),
      (tournamentSnapshot) => {
        if (!active) return;

        matchUnsubscribers.forEach((unsubscribe) => unsubscribe());
        matchUnsubscribers = [];
        matchesByTournament = new Map();

        if (tournamentSnapshot.empty) {
          setMatches([]);
          setLoading(false);
          setError(false);
          return;
        }

        tournamentSnapshot.docs.forEach((tournamentDoc) => {
          const tournamentData = tournamentDoc.data();
          const tournamentId = tournamentDoc.id;

          const matchesQuery = query(
            collection(db, "tournaments", tournamentId, "matches"),
            orderBy("createdAt", "desc")
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

              const latestMatches = Array.from(
                matchesByTournament.values()
              )
                .flat()
                .filter((match) =>
                  ["live", "completed"].includes(
                    String(match.status || "").toLowerCase()
                  )
                )
                .sort((a, b) => getMatchTime(b) - getMatchTime(a))
.slice(0, 10);

              setMatches(latestMatches);
              setLoading(false);
              setError(false);
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

          matchUnsubscribers.push(unsubscribeMatches);
        });
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

      matchUnsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return { matches, loading, error };
}
