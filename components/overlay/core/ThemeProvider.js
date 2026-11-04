import { useRouter } from "next/router";
import MatchOverlay from "../themes/willow/MatchOverlay";
import OkCrickOverlay from "../themes/okCrick/MatchOverlay";
import WcplOverlay from "../themes/WCPL/MatchOverlay";
import { useOverlay } from "./OverlayProvider";
import styles from "../themes/willow/willow.module.css";

export default function ThemeProvider({ initialTheme }) {
  const router = useRouter();
  const match = useOverlay();
  const theme =
    initialTheme ||
    (typeof router.query.theme === "string" ? router.query.theme : "");

  if (!match) {
    return (
      <div className={styles.overlayCanvas}>
        <div className={styles.lowerThird}>Waiting for active match data...</div>
      </div>
    );
  }

  return (
    <div className={styles.overlayCanvas}>
      {theme === "willow" && <MatchOverlay match={match} />}
      {theme === "okCrick" && <OkCrickOverlay match={match} />}
      {theme === "WCPL" && <WcplOverlay match={match} />}
    </div>
  );
      }
       
