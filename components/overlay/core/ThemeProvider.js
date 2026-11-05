import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import MatchOverlay from "../themes/willow/MatchOverlay";
import OkCrickOverlay from "../themes/okCrick/MatchOverlay";
import WcplOverlay from "../themes/WCPL/MatchOverlay";
import {
  WCPL_ARTWORK,
  preloadAndDecodeWcplArtwork,
} from "../themes/WCPL/wcplArtwork";
import { useOverlay } from "./OverlayProvider";
import styles from "../themes/willow/willow.module.css";

export default function ThemeProvider({ initialTheme }) {
  const router = useRouter();
  const match = useOverlay();
  const theme =
    initialTheme ||
    (typeof router.query.theme === "string" ? router.query.theme : "");
  const [decodedTheme, setDecodedTheme] = useState("");

  useEffect(() => {
    if (theme !== "WCPL") {
      setDecodedTheme("");
      return;
    }

    let active = true;
    preloadAndDecodeWcplArtwork()
      .then(() => {
        if (active) setDecodedTheme("WCPL");
      })
      .catch((error) => {
        // Keep the overlay fail-safe: a broken artwork request should be
        // visible in the console rather than silently treated as decoded.
        console.error("[WCPL] Artwork could not be prepared:", error);
      });

    return () => {
      active = false;
    };
  }, [theme]);

  // Artwork and final team colors are prepared independently, in parallel.
  // The WCPL overlay is revealed only when both are ready, preventing a
  // default-color frame followed by a team-color flash.
  const wcplReady =
    theme !== "WCPL" ||
    (decodedTheme === "WCPL" && Boolean(match?.teamColorsReady));

  return (
    <>
      {theme === "WCPL" && (
        <Head>
          {WCPL_ARTWORK.map((src) => (
            <link
              key={src}
              rel="preload"
              as="image"
              href={src}
              fetchPriority="high"
            />
          ))}
        </Head>
      )}

      {!match ? (
        <div className={styles.overlayCanvas}>
          <div className={styles.lowerThird}>Waiting for active match data...</div>
        </div>
      ) : (
        <div className={styles.overlayCanvas}>
          {theme === "willow" && <MatchOverlay match={match} />}
          {theme === "okCrick" && <OkCrickOverlay match={match} />}
          {theme === "WCPL" && wcplReady && <WcplOverlay />}
        </div>
      )}
    </>
  );
                          }
