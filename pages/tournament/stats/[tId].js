import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import TournamentStats from "../../../components/scoring/TournamentStats";

export default function StatsPage() {
  const router = useRouter();
  const { tId } = router.query;

  const [matchData, setMatchData] = useState({}); // ✅ empty object instead of null

  useEffect(() => {
    if (!tId) return;

    const ref = doc(db, "tournaments", tId);

    const unsub = onSnapshot(
      ref,
      { includeMetadataChanges: true },
      (snap) => {
        if (snap.exists()) {
          setMatchData(snap.data()); // ⚡ instant update (cache first)
        }
      }
    );

    return () => unsub();
  }, [tId]);

  if (!tId) return null;

  return (
    <div className="pt-10">
      {/* ✅ Always render — no loading state */}
      <TournamentStats tId={tId} data={matchData} />
    </div>
  );
}
