/**
 * WCPL artwork readiness manager..
 *
 * All three same-origin WebP files are requested in parallel and decoded
 * before the WCPL overlay is allowed to mount. The cache stores the Promise
 * (not a { image, ready } object), so every caller waits for the same result.
 */
export const WCPL_ARTWORK = Object.freeze([
  "/themes/WCPL/batting-panel.webp",
  "/themes/WCPL/bowling-panel.webp",
  "/themes/WCPL/match-center.webp",
]);

const imagePromiseCache = new Map();
let artworkPromise = null;

function loadAndDecode(src) {
  const cachedPromise = imagePromiseCache.get(src);
  if (cachedPromise) return cachedPromise;

  const request = new Promise((resolve, reject) => {
    if (typeof Image === "undefined") {
      reject(new Error("[WCPL] Image is unavailable in this environment."));
      return;
    }

    const image = new Image();
    image.decoding = "async";
    image.loading = "eager";

    try {
      image.fetchPriority = "high";
    } catch (_) {
      // fetchPriority is not supported by every embedded browser.
    }

    let settled = false;
    let timeoutId;

    const finish = (error) => {
      if (settled) return;
      settled = true;
      if (timeoutId) clearTimeout(timeoutId);
      image.onload = null;
      image.onerror = null;

      if (error) reject(error);
      else resolve(image);
    };

    const decodeLoadedImage = async () => {
      if (!image.complete) return;

      if (!image.naturalWidth || !image.naturalHeight) {
        finish(new Error(`[WCPL] Image loaded without valid dimensions: ${src}`));
        return;
      }

      // Some embedded Chromium builds have incomplete decode() behavior.
      // If decode() rejects but the image has valid dimensions, it is still
      // a usable loaded image and must not deadlock the entire overlay.
      if (typeof image.decode === "function") {
        try {
          await image.decode();
        } catch (_) {
          if (!image.naturalWidth || !image.naturalHeight) {
            finish(new Error(`[WCPL] Image decode failed: ${src}`));
            return;
          }
        }
      }

      finish(null);
    };

    image.onload = decodeLoadedImage;
    image.onerror = () => {
      finish(new Error(`[WCPL] Failed to load artwork: ${src}`));
    };

    // Fail closed instead of leaving OBS/CameraFi waiting forever.
    timeoutId = setTimeout(() => {
      finish(new Error(`[WCPL] Artwork loading timed out: ${src}`));
    }, 15000);

    image.src = src;

    // Handles memory/disk cache hits where complete is already true.
    if (image.complete) {
      decodeLoadedImage();
    }
  });

  // Cache the Promise itself. Remove only failed requests so a later mount
  // can retry without discarding already decoded artwork.
  const cachedRequest = request.catch((error) => {
    if (imagePromiseCache.get(src) === cachedRequest) {
      imagePromiseCache.delete(src);
    }
    throw error;
  });

  imagePromiseCache.set(src, cachedRequest);
  return cachedRequest;
}

export function preloadAndDecodeWcplArtwork() {
  if (typeof window === "undefined") {
    return Promise.resolve([]);
  }

  if (!artworkPromise) {
    // All network requests start together; Promise.all resolves only when
    // every artwork file has loaded and completed decoding.
    artworkPromise = Promise.all(WCPL_ARTWORK.map(loadAndDecode)).catch((error) => {
      artworkPromise = null;
      throw error;
    });
  }

  return artworkPromise;
}
