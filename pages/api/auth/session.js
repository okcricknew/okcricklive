import { getAdminAuth } from "../../../lib/firebase-admin";

const SESSION_COOKIE_NAME = "__session";
const SESSION_EXPIRES_IN = 5 * 24 * 60 * 60 * 1000;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);

    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const { idToken } = req.body || {};

    if (!idToken || typeof idToken !== "string") {
      return res.status(400).json({
        success: false,
        error: "Firebase ID token is missing.",
      });
    }

    const adminAuth = getAdminAuth();

    // Step 1: verify Firebase ID token
    await adminAuth.verifyIdToken(idToken);

    // Step 2: create server session
    const sessionCookie = await adminAuth.createSessionCookie(
      idToken,
      {
        expiresIn: SESSION_EXPIRES_IN,
      }
    );

    const isProduction = process.env.NODE_ENV === "production";

    const cookieParts = [
      `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionCookie)}`,
      `Max-Age=${Math.floor(SESSION_EXPIRES_IN / 1000)}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
    ];

    if (isProduction) {
      cookieParts.push("Secure");
    }

    res.setHeader(
      "Set-Cookie",
      cookieParts.join("; ")
    );

    return res.status(200).json({
      success: true,
      message: "Authentication session created successfully.",
    });
  } catch (error) {
    // Temporary diagnostic information.
    // IMPORTANT: never return credentials/private keys here.
    console.error("SSR SESSION ERROR:", error);

    return res.status(401).json({
      success: false,
      error: error?.message || "Unable to create authentication session.",
      code: error?.code || null,
    });
  }
}
