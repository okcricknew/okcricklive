const SESSION_COOKIE_NAME = "__session";
const USER_PROFILE_CACHE_TTL_MS = 30 * 1000;
const userProfileCache = new Map();

export async function getServerUser(req) {
  const sessionCookie = req.cookies?.[SESSION_COOKIE_NAME];

  if (!sessionCookie) {
    return null;
  }

  try {
    const { getAdminAuth } = await import("../firebase-admin");
    const decodedClaims = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true
    );

    return decodedClaims;
  } catch (error) {
    console.error("SSR auth verification failed:", error);
    return null;
  }
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}


export async function getNavbarInitialProps(req) {
  const sessionCookie = req?.cookies?.__session;

  if (!sessionCookie) {
    return {
      initialUser: null,
      initialUserData: null,
    };
  }

  try {
    const { getAdminAuth, getAdminDb } = await import("../firebase-admin");
    const decodedClaims = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true
    );

    const cached = userProfileCache.get(decodedClaims.uid);
    let displayName = cached && Date.now() < cached.expiresAt
      ? cached.displayName
      : null;

    if (displayName === null) {
      const userSnap = await getAdminDb()
        .collection("users")
        .doc(decodedClaims.uid)
        .get();

      const userData = userSnap.exists ? userSnap.data() : null;
      displayName = userData?.name || decodedClaims.name || "";
      userProfileCache.set(decodedClaims.uid, {
        displayName,
        expiresAt: Date.now() + USER_PROFILE_CACHE_TTL_MS,
      });
    }

    return {
      initialUser: {
        uid: decodedClaims.uid,
        email: decodedClaims.email || null,
        displayName,
      },
      initialUserData: {
        name: displayName,
      },
    };
  } catch (error) {
    console.error(
      "Navbar SSR auth lookup failed:",
      error?.code || error?.message
    );

    return {
      initialUser: null,
      initialUserData: null,
    };
  }
}
