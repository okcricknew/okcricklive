// Shared WCPL artwork preparation for the two CSS alpha masks and center image.
// Keep the Image instances alive so the browser can reuse their decoded resources.
export const WCPL_ARTWORK = [
  "/themes/WCPL/batting-panel.webp",
  "/themes/WCPL/bowling-panel.webp",
  "/themes/WCPL/match-center.webp",
];

const imageCache = new Map();
let decodePromise = null;

function loadAndDecode(src) {
  if (imageCache.has(src)) return imageCache.get(src);

  const image = new window.Image();
  image.decoding = "async";
  image.loading = "eager";
  image.fetchPriority = "high";

  const ready = new Promise((resolve, reject) => {
    let decodeStarted = false;

    const decodeLoadedImage = () => {
      if (decodeStarted) return;
      if (!image.naturalWidth || !image.naturalHeight) {
        reject(new Error(`WCPL artwork loaded without image dimensions: ${src}`));
        return;
      }

      decodeStarted = true;
      if (typeof image.decode === "function") {
        image.decode().then(resolve).catch(reject);
      } else {
        // Older browsers: the load event means the resource is available
        // for the browser's normal rendering pipeline.
        resolve();
      }
    };

    image.onload = decodeLoadedImage;
    image.onerror = () => reject(new Error(`Failed to load WCPL artwork: ${src}`));
    image.src = src;

    // The browser may have completed a cached request before handlers run.
    if (image.complete) decodeLoadedImage();
  });

  imageCache.set(src, { image, ready });
  return ready;
}

export function preloadAndDecodeWcplArtwork() {
  if (typeof window === "undefined") return Promise.resolve();

  if (!decodePromise) {
    decodePromise = Promise.all(WCPL_ARTWORK.map(loadAndDecode)).catch((error) => {
      // Permit an explicit retry if a transient network failure occurred.
      decodePromise = null;
      throw error;
    });
  }

  return decodePromise;
}
