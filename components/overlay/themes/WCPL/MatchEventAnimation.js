import { useEffect, useRef, useState } from "react";
import { useOverlay } from "../../core/OverlayProvider";
import styles from "./MatchEventAnimation.module.css";

const EVENT_DURATION = 4500;

function getEventType(ball) {
  if (!ball) return null;

  if (ball.type === "OUT" || ball.wicketInfo) return "WICKET";
  if (ball.type === "NB") return "FREE HIT";

  if (ball.type === "NORMAL") {
    const runs = Number(ball.runs);

    if (runs === 4) return "FOUR";
    if (runs === 6) return "SIX";
  }

  return null;
}

function getBallKey(ball, historyLength) {
  return [
    ball?.over ?? "",
    ball?.ball ?? "",
    ball?.runs ?? "",
    ball?.type ?? "",
    ball?.subCategory ?? "",
    ball?.wicketInfo ? JSON.stringify(ball.wicketInfo) : "",
    historyLength,
  ].join("|");
}

export default function MatchEventAnimation({ onActiveChange }) {
  const match = useOverlay();

  const [activeEvent, setActiveEvent] = useState(null);

  const lastBallKeyRef = useRef(null);
  const timeoutRef = useRef(null);
  const eventSequenceRef = useRef(0);

  // Parent ko batayega ki event active hai ya nahi.
  useEffect(() => {
    onActiveChange(Boolean(activeEvent));
  }, [activeEvent, onActiveChange]);

  useEffect(() => {
    lastBallKeyRef.current = null;
    setActiveEvent(null);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [match?.id]);

  useEffect(() => {
    const history = Array.isArray(match?.ballHistory)
      ? match.ballHistory
      : [];

    if (!history.length) return;

    const lastBall = history[history.length - 1];
    const nextBallKey = getBallKey(lastBall, history.length);

    // First render par purani ball replay nahi hogi.
    if (lastBallKeyRef.current === null) {
      lastBallKeyRef.current = nextBallKey;
      return;
    }

    if (lastBallKeyRef.current === nextBallKey) return;

    lastBallKeyRef.current = nextBallKey;

    const eventType = getEventType(lastBall);

    if (!eventType) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const eventId = ++eventSequenceRef.current;

    setActiveEvent({
      type: eventType,
      id: eventId,
    });

    timeoutRef.current = setTimeout(() => {
      setActiveEvent((current) =>
        current?.id === eventId ? null : current
      );

      timeoutRef.current = null;
    }, EVENT_DURATION);
  }, [match?.ballHistory]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const eventClass = activeEvent
    ? {
        FOUR: styles.four,
        SIX: styles.six,
        WICKET: styles.wicket,
        "FREE HIT": styles.freeHit,
      }[activeEvent.type]
    : "";

  // Viewport hamesha mounted rahega.
  return (
    <div className={styles.eventViewport} aria-hidden="true">
      {activeEvent && (
        <div
          key={activeEvent.id}
          className={`${styles.eventStage} ${eventClass}`}
        >
          <div className={styles.energyRing} />

          <div className={styles.energyRingSecondary} />

          <div className={styles.particleField}>
            {Array.from({ length: 12 }, (_, index) => (
              <i
                key={index}
                className={styles.particle}
                style={{
                  "--particle-index": index,
                }}
              />
            ))}
          </div>

          <div className={styles.ghostText}>
            {activeEvent.type}
          </div>

          <div className={styles.mainEventText}>
            {activeEvent.type}
          </div>

          <div className={styles.eventUnderline} />
        </div>
      )}
    </div>
  );
          }
