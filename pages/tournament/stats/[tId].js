import { getAdminAuth, getAdminDb } from "../../../lib/firebase-admin";
import TournamentStats from "../../../components/scoring/TournamentStats";

function serializeValue(value) {
  if (value === null || value === undefined) return null;

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
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        serializeValue(item),
      ])
    );
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  return value;
}

export default function StatsPage({ tId, tournament, matches }) {
  return (
    <div className="pt-10">
      <TournamentStats
        tId={tId}
        data={tournament}
        matches={matches}
      />
    </div>
  );
}

export async function getServerSideProps({ req, params, res }) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");

  let initialUser = null;
  let initialUserData = null;

  try {
    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();
    const sessionCookie = req.cookies?.__session || "";

    if (sessionCookie) {
      try {
        const decodedToken = await adminAuth.verifySessionCookie(
          sessionCookie,
          true
        );

        const userDoc = await adminDb
          .collection("users")
          .doc(decodedToken.uid)
          .get();

        initialUserData = userDoc.exists
          ? serializeValue(userDoc.data())
          : null;

        initialUser = {
          uid: decodedToken.uid,
          email: decodedToken.email || null,
          displayName:
            initialUserData?.name || decodedToken.name || "",
        };
      } catch (error) {
        console.error("Stats page session verification failed:", error.code || error.message);
      }
    }

    const tId = params.tId;

    const tournamentDoc = await adminDb
      .collection("tournaments")
      .doc(tId)
      .get();

    if (!tournamentDoc.exists) {
      return { notFound: true };
    }

    const matchesSnapshot = await adminDb
      .collection("tournaments")
      .doc(tId)
      .collection("matches")
      .get();

    const matches = matchesSnapshot.docs.map((matchDoc) => ({
      id: matchDoc.id,
      ...serializeValue(matchDoc.data()),
    }));

    return {
      props: {
        tId,
        tournament: serializeValue(tournamentDoc.data()),
        matches,
        initialUser,
        initialUserData,
      },
    };
  } catch (error) {
    console.error("Tournament stats SSR failed:", error.code || error.message);

    return {
      props: {
        tId: params.tId,
        tournament: {},
        matches: [],
        initialUser,
        initialUserData,
      },
    };
  }
}
