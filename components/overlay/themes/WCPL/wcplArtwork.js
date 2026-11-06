// One shared loader for all WCPL artwork.
// All five files start loading in the same task and the overlay is revealed
// only after every file has loaded and decoded successfully.
export const WCPL_ARTWORK = Object.freeze([
  "/themes/WCPL/batting-panel.webp",
  "/themes/WCPL/left-icon.webp",
  "/themes/WCPL/match-center.webp",
  "/themes/WCPL/right-icon.webp",
  "/themes/WCPL/bowling-panel.webp",
]);

const imageCache = new Map();
let artworkPromise = null;

function loadAndDecode(src) {
  const cached = imageCache.get(src);
  if (cached) return cached.ready;

  const image = new Image();
  image.decoding = "async";
  image.loading = "eager";

  // Set priority before src so it applies to the initial request.
  try {
    image.fetchPriority = "high";
  } catch (_) {
    // fetchPriority is not supported in every browser.
  }

  const ready = new Promise((resolve, reject) => {
    let settled = false;

    const finish = (error) => {
      if (settled) return;
      settled = true;
      image.onload = null;
      image.onerror = null;

      if (error) reject(error);
      else resolve(image);
    };

    const decodeIfReady = () => {
      if (!image.complete) return;

      if (!image.naturalWidth || !image.naturalHeight) {
        finish(new Error(`[WCPL] Image has no decoded dimensions: ${src}`));
        return;
      }

      // decode() is preferred. If a browser reports a decode() rejection
      // despite a successfully loaded image, keep the loaded image usable.
      if (typeof image.decode === "function") {
        image.decode().then(
          () => finish(),
          () => {
            if (image.naturalWidth && image.naturalHeight) finish();
            else finish(new Error(`[WCPL] Could not decode: ${src}`));
          }
        );
      } else {
        finish();
      }
    };

    image.onload = decodeIfReady;
    image.onerror = () => finish(new Error(`[WCPL] Failed to load: ${src}`));
    image.src = src;

    // Handles memory-cache hits where load fired before handlers were attached.
    if (image.complete) decodeIfReady();
  });

  imageCache.set(src, { image, ready });
  return ready;
}

export function preloadAndDecodeWcplArtwork() {
  if (typeof window === "undefined") return Promise.resolve([]);

  if (!artworkPromise) {
    // map() starts all five requests immediately; Promise.all gates reveal.
    artworkPromise = Promise.all(WCPL_ARTWORK.map(loadAndDecode)).catch((error) => {
      // Allow a later render/retry after a transient network failure.
      artworkPromise = null;
      imageCache.clear();
      throw error;
    });
  }

  return artworkPromise;
}
