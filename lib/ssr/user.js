import { getAdminDb } from "../firebase-admin";

/**
 * Convert Firestore values into values that Next.js
 * can safely send through getServerSideProps.
 */
function serializeValue(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (typeof value === "object") {
    const result = {};

    for (const [key, item] of Object.entries(value)) {
      result[key] = serializeValue(item);
    }

    return result;
  }

  return value;
}

/**
 * Convert a Firestore document into a plain serializable object.
 */
function serializeDocument(doc) {
  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...serializeValue(doc.data()),
  };
}

/**
 * Get tournaments belonging to the authenticated user.
 *
 * IMPORTANT:
 * This runs on the server with Firebase Admin.
 */
export async function getMyTournamentsInitialProps(uid) {
  if (!uid) {
    return [];
  }

  const db = getAdminDb();

  const snapshot = await db
    .collection("tournaments")
    .where("adminId", "==", uid)
    .get();

  const tournaments = snapshot.docs.map(serializeDocument);

  return tournaments;
}

/**
 * Get matches belonging to tournaments owned by the authenticated user.
 *
 * IMPORTANT:
 * This also runs only on the server.
 */
export async function getMyMatchesInitialProps(uid) {
  if (!uid) {
    return [];
  }

  const db = getAdminDb();

  const tournamentSnapshot = await db
    .collection("tournaments")
    .where("adminId", "==", uid)
    .get();

  if (tournamentSnapshot.empty) {
    return [];
  }

  const matchRequests = tournamentSnapshot.docs.map(async (tournamentDoc) => {
    const matchesSnapshot = await db
      .collection("tournaments")
      .doc(tournamentDoc.id)
      .collection("matches")
      .get();

    return matchesSnapshot.docs.map((matchDoc) => ({
      id: matchDoc.id,
      tournamentId: tournamentDoc.id,
      tournamentName:
        tournamentDoc.data()?.name ||
        tournamentDoc.data()?.tournamentName ||
        "",
      ...serializeValue(matchDoc.data()),
    }));
  });

  const matchGroups = await Promise.all(matchRequests);

  return matchGroups.flat();
}
