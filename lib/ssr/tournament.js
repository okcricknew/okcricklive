import { getAdminDb } from '../firebase-admin';
import { serializeFirestoreData, serializeFirestoreDoc } from './firestore';

export async function getTournamentInitialProps(id) {
  const db = getAdminDb();
  const tournamentSnap = await db.doc(`tournaments/${id}`).get();
  if (!tournamentSnap.exists) return null;

  const teamsSnap = await db.collection(`tournaments/${id}/teams`).orderBy('createdAt', 'desc').get();

  return {
    tournament: serializeFirestoreDoc(tournamentSnap),
    teams: teamsSnap.docs.map(serializeFirestoreDoc),
  };
}

export async function getMatchListInitialProps(id) {
  const db = getAdminDb();
  const [tournamentSnap, matchesSnap] = await Promise.all([
    db.doc(`tournaments/${id}`).get(),
    db.collection(`tournaments/${id}/matches`).get(),
  ]);

  return {
    tournament: serializeFirestoreDoc(tournamentSnap),
    matches: matchesSnap.docs
      .map(serializeFirestoreDoc)
      .sort((a, b) => String(b?.createdAt || '').localeCompare(String(a?.createdAt || ''))),
  };
}

export async function getManageMatchInitialProps(id) {
  const db = getAdminDb();
  const [tournamentSnap, teamsSnap] = await Promise.all([
    db.doc(`tournaments/${id}`).get(),
    db.collection(`tournaments/${id}/teams`).get(),
  ]);

  return {
    tournament: serializeFirestoreDoc(tournamentSnap),
    teams: teamsSnap.docs.map(serializeFirestoreDoc),
  };
}

export async function getMatchInitialProps(tourneyId, matchId) {
  const db = getAdminDb();
  const snap = await db.doc(`tournaments/${tourneyId}/matches/${matchId}`).get();
  return serializeFirestoreDoc(snap);
}

export async function getStatsInitialProps(tId) {
  const db = getAdminDb();
  const snap = await db.doc(`tournaments/${tId}`).get();
  return serializeFirestoreDoc(snap);
}
