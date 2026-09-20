import { getAdminAuth } from "../../../lib/firebase-admin";

const SESSION_COOKIE_NAME = "__session";

// Firebase session cookies can live for 5 days.
// Firebase allows a maximum of 14 days.
const SESSION_EXPIRES_IN = 5 * 24 * 60 * 60 * 1000;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);

    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { idToken } = req.body || {};

    if (!idToken || typeof idToken !== "string") {
      return res.status(400).json({
        error: "Firebase ID token is required.",
      });
    }

    // Verify that the token actually belongs to a valid Firebase user.
    await getAdminAuth().verifyIdToken(idToken);

    // Convert Firebase ID token into an HTTP-only server session cookie.
    const sessionCookie = await getAdminAuth().createSessionCookie(
      idToken,
      {
        expiresIn: SESSION_EXPIRES_IN,
      }
    );

    const isProduction = process.env.NODE_ENV === "production";

    res.setHeader(
      "Set-Cookie",
      `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionCookie)}; Max-Age=${
        SESSION_EXPIRES_IN / 1000
      }; Path=/; HttpOnly; SameSite=Lax${
        isProduction ? "; Secure" : ""
      }`
    );

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Create session error:", error);

    return res.status(401).json({
      error: "Unable to create authenticated session.",
    });
  }
}
