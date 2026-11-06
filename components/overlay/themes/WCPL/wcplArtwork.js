// Shared WCPL artwork loader. The overlay is revealed only after all three
// background images have loaded AND decoded, so text never appears alone.
export const WCPL_ARTWORK = Object.freeze([
  "/themes/WCPL/batting-panel.webp",
  "/themes/WCPL/bowling-panel.webp",
  "/themes/WCPL/match-center.webp",
]);

let artworkPromise = null;

function loadAndDecode(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    let settled = false;
    let decoding = false;

    const finish = (error) => {
      if (settled) return;
      settled = true;
      image.onload = null;
      image.onerror = null;
      if (error) reject(error);
      else resolve(image);
    };

    const decodeLoadedImage = () => {
      if (settled || decoding || !image.complete) return;
      if (!image.naturalWidth || !image.naturalHeight) {
        finish(new Error(`[WCPL] Image failed to load: ${src}`));
        return;
      }
      decoding = true;
      if (typeof image.decode !== "function") {
        finish();
        return;
      }
      image.decode().then(
        () => finish(),
        (error) => finish(new Error(`[WCPL] Image decode failed: ${src} (${error?.message || "unknown error"})`))
      );
    };

    image.decoding = "sync";
    try { image.fetchPriority = "high"; } catch (_) {}
    image.onload = decodeLoadedImage;
    image.onerror = () => finish(new Error(`[WCPL] Network error loading ${src}`));
    image.src = src;

    // Cached images may already be complete before onload is dispatched.
    if (image.complete) decodeLoadedImage();
  });
}

export function preloadAndDecodeWcplArtwork() {
  if (typeof window === "undefined") return Promise.resolve([]);
  if (!artworkPromise) {
    artworkPromise = Promise.all(WCPL_ARTWORK.map(loadAndDecode)).catch((error) => {
      // Permit a clean retry if the browser had a temporary network/decode error.
      artworkPromise = null;
      throw error;
    });
  }
  return artworkPromise;
}
