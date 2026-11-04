// WCPL artwork is small and reused by both <img> elements and CSS masks.
// Keep one decoded Image instance per asset for the lifetime of this page.
export const WCPL_ARTWORK = [
  "/themes/WCPL/batting-panel.webp",
  "/themes/WCPL/bowling-panel.webp",
  "/themes/WCPL/match-center.webp",
];

let decodePromise;

export function preloadAndDecodeWcplArtwork() {
  if (typeof window === "undefined") return Promise.resolve();

  if (!decodePromise) {
    const images = WCPL_ARTWORK.map((src) => {
      const image = new window.Image();
      image.decoding = "async";
      image.src = src;
      return image.decode().catch((error) => {
        // Do not permanently block the overlay if a browser cannot decode
        // an asset; the rendered image can still report its own load error.
        console.warn("[WCPL] Artwork decode failed:", src, error);
      });
    });

    decodePromise = Promise.all(images);
  }

  return decodePromise;
}
