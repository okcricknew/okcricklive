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
