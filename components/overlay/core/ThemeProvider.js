import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import MatchOverlay from "../themes/willow/MatchOverlay";
import OkCrickOverlay from "../themes/okCrick/MatchOverlay";
import WcplOverlay from "../themes/WCPL/MatchOverlay";
import { preloadAndDecodeWcplArtwork } from "../themes/WCPL/wcplArtwork";
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
    if (theme !== "WCPL") return;

    let active = true;
    preloadAndDecodeWcplArtwork().then(() => {
      if (active) setDecodedTheme("WCPL");
    });

    return () => {
      active = false;
    };
  }, [theme]);

  const wcplReady = theme !== "WCPL" || decodedTheme === "WCPL";

  return (
    <>
      {theme === "WCPL" && (
        <Head>
          <link
            rel="preload"
            as="image"
            href="/themes/WCPL/batting-panel.webp"
          />
          <link
            rel="preload"
            as="image"
            href="/themes/WCPL/bowling-panel.webp"
          />
          <link
            rel="preload"
            as="image"
            href="/themes/WCPL/match-center.webp"
          />
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
