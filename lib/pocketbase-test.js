import PocketBase from "pocketbase";

export async function testPocketBaseConnection() {
  const url = process.env.POCKETBASE_URL;
  const email = process.env.POCKETBASE_SUPERUSER_EMAIL;
  const password = process.env.POCKETBASE_SUPERUSER_PASSWORD;

  if (!url || !email || !password) {
    throw new Error("Missing PocketBase environment variables");
  }

  const pb = new PocketBase(url);
  pb.autoCancellation(false);

  try {
    await pb.collection("_superusers").authWithPassword(email, password);
  } catch (error) {
    console.error("POCKETBASE_AUTH_STEP_FAILED", {
      status: error?.status,
      message: error?.message,
      url,
    });
    throw new Error("PocketBase superuser authentication failed");
  }

  try {
    const result = await pb.collections.getFullList();

    return {
      connected: true,
      collectionCount: result.length,
      collectionNames: result.map((item) => item.name),
    };
  } catch (error) {
    console.error("POCKETBASE_COLLECTIONS_STEP_FAILED", {
      status: error?.status,
      message: error?.message,
    });
    throw new Error("PocketBase collections request failed");
  }
}
