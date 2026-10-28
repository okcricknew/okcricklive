
import PocketBase from "pocketbase";

/**
 * Server-side PocketBase client.
 * Har call par naya instance banega, taaki requests
 * ek doosre ki authentication state share na karein.
 */
export function createPocketBaseServer() {
  const url = process.env.POCKETBASE_URL;

  if (!url) {
    throw new Error("Missing POCKETBASE_URL environment variable");
  }

  const pb = new PocketBase(url);

  // Server-side parallel requests ko auto-cancel hone se bachata hai.
  pb.autoCancellation(false);

  return pb;
}
