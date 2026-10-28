
import { testPocketBaseConnection } from "../../lib/pocketbase-test";

export default async function handler(req, res) {
  // Public access ko band rakho.
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Test endpoint sirf server-side secret ke saath enabled ho.
  if (process.env.POCKETBASE_TEST_ENABLED !== "true") {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    const result = await testPocketBaseConnection();

    return res.status(200).json({
      success: true,
      message: "PocketBase connection successful",
      ...result,
    });
  } catch (error) {
    console.error("PocketBase test failed:", error.message);

    return res.status(500).json({
      success: false,
      error: "PocketBase connection failed. Check server environment variables and logs.",
    });
  }
}
