import { getAdminDb } from '../firebase-admin';
import { serializeFirestoreDoc } from './firestore';

export async function getHomeInitialProps() {
  const db = getAdminDb();
  const snap = await db.doc('tournaments/demo_tournament/matches/demo_match').get();
  return { initialMatch: serializeFirestoreDoc(snap) };
}
