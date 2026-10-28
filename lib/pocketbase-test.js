
import PocketBase from "pocketbase";

export async function testPocketBaseConnection() {
  const url = process.env.POCKETBASE_URL;
  const email = process.env.POCKETBASE_SUPERUSER_EMAIL;
  const password = process.env.POCKETBASE_SUPERUSER_PASSWORD;

  if (!url || !email || !password) {
    throw new Error(
      "PocketBase environment variables missing"
    );
  }

  const pb = new PocketBase(url);
  pb.autoCancellation(false);

  await pb
    .collection("_superusers")
    .authWithPassword(email, password);

  const collections = await pb.collections.getFullList();

  return {
    connected: true,
    collectionCount: collections.length,
    collectionNames: collections.map((item) => item.name),
  };
}
