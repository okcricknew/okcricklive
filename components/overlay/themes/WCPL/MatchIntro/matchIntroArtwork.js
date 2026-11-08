// WCPL Match Intro artwork loader.
// All four WebP assets load and decode together.

export const WCPL_MATCH_INTRO_ARTWORK = Object.freeze([
  "/themes/WCPL/matchIntro/intro.webp",
  "/themes/WCPL/matchIntro/teamA-panel.webp",
  "/themes/WCPL/matchIntro/teamB-panel.webp",
  "/themes/WCPL/matchIntro/tourName.webp",
]);

const imageCache = new Map();
let artworkPromise = null;

function loadAndDecode(src) {
  const cached = imageCache.get(src);
  if (cached) return cached;

  const image = new Image();
  image.decoding = "async";
  image.loading = "eager";

  try {
    image.fetchPriority = "high";
  } catch (_) {}

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
        finish(new Error(`[WCPL MatchIntro] Invalid image: ${src}`));
        return;
      }

      if (typeof image.decode === "function") {
        image.decode().then(
          () => finish(),
          () => {
            if (image.naturalWidth && image.naturalHeight) {
              finish();
            } else {
              finish(new Error(`[WCPL MatchIntro] Decode failed: ${src}`));
            }
          }
        );
      } else {
        finish();
      }
    };

    image.onload = decodeIfReady;

    image.onerror = () => {
      finish(new Error(`[WCPL MatchIntro] Load failed: ${src}`));
    };

    image.src = src;

    if (image.complete) decodeIfReady();
  });

  const entry = { image, ready };
  imageCache.set(src, entry);

  return entry;
}

export function preloadAndDecodeWcplMatchIntroArtwork() {
  if (typeof window === "undefined") {
    return Promise.resolve([]);
  }

  if (!artworkPromise) {
    artworkPromise = Promise.all(
      WCPL_MATCH_INTRO_ARTWORK.map((src) =>
        loadAndDecode(src).ready
      )
    ).catch((error) => {
      artworkPromise = null;
      imageCache.clear();
      throw error;
    });
  }

  return artworkPromise;
}
