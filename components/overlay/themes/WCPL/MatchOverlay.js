import { useOverlay } from "../../core/OverlayProvider";
import LowerThirdLayout from "./LowerThirdLayout";
import BattingPanel from "./BattingPanel";
import MatchCenter from "./MatchCenter";
import BowlingPanel from "./BowlingPanel";

export default function MatchOverlay() {
  const match = useOverlay();
  if (!match) return null;

  return (
    <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 99999 }}>
      <LowerThirdLayout>
        <BattingPanel team={match.battingTeam} />
        <MatchCenter />
        <BowlingPanel team={match.bowlingTeam} />
      </LowerThirdLayout>
    </div>
  );
}
