import { getAdminDb } from '../firebase-admin';
import { serializeFirestoreData, serializeFirestoreDoc } from './firestore';

// Safe serializer helper to prevent Next.js non-serializable object errors (Timestamps, etc.)
const safeJSON = (data) => JSON.parse(JSON.stringify(data));

export async function getTournamentInitialProps(id) {
  try {
    const db = getAdminDb();
    const tournamentSnap = await db.doc(`tournaments/${id}`).get();
    if (!tournamentSnap.exists) return null;

    const teamsSnap = await db.collection(`tournaments/${id}/teams`).orderBy('createdAt', 'desc').get();

    const tournament = serializeFirestoreDoc ? serializeFirestoreDoc(tournamentSnap) : { id: tournamentSnap.id, ...tournamentSnap.data() };
    const teams = teamsSnap.docs.map(doc => serializeFirestoreDoc ? serializeFirestoreDoc(doc) : { id: doc.id, ...doc.data() });

    return safeJSON({
      tournament,
      teams,
    });
  } catch (error) {
    console.error("Error in getTournamentInitialProps:", error);
    return null;
  }
}

export async function getMatchListInitialProps(id) {
  try {
    const db = getAdminDb();
    const [tournamentSnap, matchesSnap] = await Promise.all([
      db.doc(`tournaments/${id}`).get(),
      db.collection(`tournaments/${id}/matches`).get(),
    ]);

    if (!tournamentSnap.exists) return null;

    const tournament = serializeFirestoreDoc ? serializeFirestoreDoc(tournamentSnap) : { id: tournamentSnap.id, ...tournamentSnap.data() };
    const matches = matchesSnap.docs
      .map(doc => serializeFirestoreDoc ? serializeFirestoreDoc(doc) : { id: doc.id, ...doc.data() })
      .sort((a, b) => String(b?.createdAt || '').localeCompare(String(a?.createdAt || '')));

    return safeJSON({
      tournament,
      matches,
    });
  } catch (error) {
    console.error("Error in getMatchListInitialProps:", error);
    return null;
  }
}

export async function getManageMatchInitialProps(id) {
  try {
    const db = getAdminDb();
    const [tournamentSnap, teamsSnap] = await Promise.all([
      db.doc(`tournaments/${id}`).get(),
      db.collection(`tournaments/${id}/teams`).get(),
    ]);

    if (!tournamentSnap.exists) return null;

    const tournament = serializeFirestoreDoc ? serializeFirestoreDoc(tournamentSnap) : { id: tournamentSnap.id, ...tournamentSnap.data() };
    const teams = teamsSnap.docs.map(doc => serializeFirestoreDoc ? serializeFirestoreDoc(doc) : { id: doc.id, ...doc.data() });

    return safeJSON({
      tournament,
      teams,
    });
  } catch (error) {
    console.error("Error in getManageMatchInitialProps:", error);
    return null;
  }
}

export async function getMatchInitialProps(tourneyId, matchId) {
  try {
    const db = getAdminDb();
    const snap = await db.doc(`tournaments/${tourneyId}/matches/${matchId}`).get();
    if (!snap.exists) return null;

    const matchData = serializeFirestoreDoc ? serializeFirestoreDoc(snap) : { id: snap.id, ...snap.data() };
    return safeJSON(matchData);
  } catch (error) {
    console.error("Error in getMatchInitialProps:", error);
    return null;
  }
}

export async function getStatsInitialProps(tId) {
  try {
    const db = getAdminDb();
    const snap = await db.doc(`tournaments/${tId}`).get();
    if (!snap.exists) return null;

    const statsData = serializeFirestoreDoc ? serializeFirestoreDoc(snap) : { id: snap.id, ...snap.data() };
    return safeJSON(statsData);
  } catch (error) {
    console.error("Error in getStatsInitialProps:", error);
    return null;
  }
}
