import { getAdminAuth } from "../firebase-admin";

const SESSION_COOKIE_NAME = "__session";

export async function getServerUser(req) {
  const sessionCookie = req.cookies?.[SESSION_COOKIE_NAME];

  if (!sessionCookie) {
    return null;
  }

  try {
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
    const { getAdminDb } = await import('../firebase-admin');

    const decodedClaims = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true
    );

    const userSnap = await getAdminDb()
      .collection('users')
      .doc(decodedClaims.uid)
      .get();

    const userData = userSnap.exists ? userSnap.data() : null;
    const displayName = userData?.name || decodedClaims.name || '';

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
      'Navbar SSR auth lookup failed:',
      error?.code || error?.message
    );

    return {
      initialUser: null,
      initialUserData: null,
    };
  }
}

