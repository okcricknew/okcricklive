export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);

    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const isProduction = process.env.NODE_ENV === "production";

  res.setHeader(
    "Set-Cookie",
    `__session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${
      isProduction ? "; Secure" : ""
    }`
  );

  return res.status(200).json({
    success: true,
  });
}
