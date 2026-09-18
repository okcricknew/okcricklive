import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { db } from '../../../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import ScoringPanel from '../../../components/scoring/ScoringPanel';
import { getMatchInitialProps } from '../../../lib/ssr/tournament';

let matchCache = {};

export default function MatchScoringPage({ initialMatch = null }) {
  const router = useRouter();
  
  const { id, tourneyId } = router.query;
const cacheKey = `${tourneyId}_${id}`;
const [match, setMatch] = useState(initialMatch);
  
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!router.isReady) return;
    const { id, tourneyId } = router.query;
    const cacheKey = `${tourneyId}_${id}`;

// Memory cache
if (matchCache[cacheKey]) {
  setMatch(matchCache[cacheKey]);
} else {
  // Session cache
  const cached = typeof window !== "undefined" ? sessionStorage.getItem(cacheKey) : null;
  if (cached) {
    const data = JSON.parse(cached);
    matchCache[cacheKey] = data;
    setMatch(data);
  }
}
    const matchRef = doc(db, 'tournaments', tourneyId, 'matches', id);
    unsubRef.current = onSnapshot(matchRef, (docSnap) => {
  if (docSnap.exists()) {
    const data = { id: docSnap.id, ...docSnap.data() };

    setMatch(data);
    matchCache[cacheKey] = data;
if (typeof window !== "undefined") sessionStorage.setItem(cacheKey, JSON.stringify(data));
  }
});
    return () => unsubRef.current?.();
  }, [router.isReady, router.query.id, router.query.tourneyId]);

  // Bina kisi wait ke, ye DIV hamesha render hogi aur screen cover karegi

  if (!router.isReady) return null;
  
  return (
    <div className="fixed inset-0 bg-[#001d3d] z-[99999]">
      {match && <ScoringPanel match={match} tId={router.query.tourneyId} />}
    </div>
  );
}


export async function getServerSideProps({ params }) {
  try {
    const initialMatch = await getMatchInitialProps(params.tourneyId, params.id);
    if (!initialMatch) return { notFound: true };
    return { props: { initialMatch } };
  } catch (error) {
    console.error("Scoring SSR failed:", error);
    return { props: { initialMatch: null } };
  }
}
