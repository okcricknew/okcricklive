import { useRouter } from "next/router";
import Head from "next/head";
import MatchOverlay from "../themes/willow/MatchOverlay";
import OkCrickOverlay from "../themes/okCrick/MatchOverlay";
import WcplOverlay from "../themes/WCPL/MatchOverlay";
import { WCPL_ARTWORK } from "../themes/WCPL/wcplArtwork";
import { useOverlay } from "./OverlayProvider";
import styles from "../themes/willow/willow.module.css";

export default function ThemeProvider({ initialTheme }) {
  const router = useRouter();
  const match = useOverlay();
  const theme = initialTheme || (typeof router.query.theme === "string" ? router.query.theme : "");

  return (
    <>
      {/* Early browser preload; MatchOverlay separately waits for image decode. */}
      {theme.toLowerCase() === "wcpl" && (
        <Head>
          {WCPL_ARTWORK.map((src) => (
            <link key={src} rel="preload" as="image" href={src} fetchPriority="high" />
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
          {theme.toLowerCase() === "wcpl" && <WcplOverlay />}
        </div>
      )}
    </>
  );
}
