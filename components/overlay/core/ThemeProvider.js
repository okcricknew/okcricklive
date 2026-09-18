import { useRouter } from 'next/router';
import MatchOverlay from "../themes/willow/MatchOverlay";
import OkCrickOverlay from "../themes/okCrick/MatchOverlay";
import { useOverlay } from "./OverlayProvider"; // 👈 Database se data lene ke liye
import styles from "../themes/willow/willow.module.css";

export default function ThemeProvider() {
  const router = useRouter();
  const { theme } = router.query;
  const match = useOverlay(); // 👈 Active match ka data yahan aayega

  // Jab tak data load ho raha hai ya match active nahi hai
  if (!match) {
  return (
    <div className={styles.overlayCanvas}>
      <div className={styles.lowerThird}>
        Waiting for active match data...
      </div>
    </div>
  );
  }

  return (
    <div className="overlayCanvas">
      {/* Willow theme tabhi dikhega jab URL mein willow ho */}
      {theme === 'willow' && <MatchOverlay match={match} />}
      {theme === 'okCrick' && <OkCrickOverlay match={match} />}
      {/* Agar okCrick theme ho toh yahan add karein */}
    </div>
  );
}
