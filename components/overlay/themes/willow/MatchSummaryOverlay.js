"use client"

import styles from "./matchSummaryOverlay.module.css"
import {
  getTopBatters,
  getTopBowlers,
  getInningsData
} from "../../utils/matchSummaryHelpers"

export default function MatchSummaryOverlay({ match }) {
  if (!match) return null;

  // Helpers now return the correct team based on batting order
  const i1 = getInningsData(match, 1);
  const i2 = getInningsData(match, 2);

  const i1Bat = getTopBatters(i1.batting);
  const i1Bowl = getTopBowlers(i1.bowling);

  const i2Bat = getTopBatters(i2.batting);
  const i2Bowl = getTopBowlers(i2.bowling);

  let bannerText = "";

if (match.status === "completed") {
  bannerText = match.resultSummary;
}
else if (Number(match.innings) === 1) {
  bannerText =
    `${match.tossWinner} WON THE TOSS & ELECTED TO ${match.tossDecision.toUpperCase()} FIRST`;
}
else if (Number(match.innings) === 2) {

  const runsNeeded = Math.max(
    0,
    (match.target || 0) - (i2.runs || 0)
  );

  const oversText = String(i2.overs || "0");
  const [ov, ball] = oversText.split(".");

  const ballsPlayed =
    (parseInt(ov || 0) * 6) +
    (parseInt(ball || 0));

  const totalBalls =
    (match.overs || 0) * 6;

  const ballsLeft = Math.max(
    0,
    totalBalls - ballsPlayed
  );

  bannerText =
    `${i2.team} NEED ${runsNeeded} RUNS FROM ${ballsLeft} BALLS`;
}

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>MATCH SUMMARY</div>

        {/* INNINGS 1 - Team that batted first */}
        <div className={styles.scoreRow}>
          <span>{i1.team}</span>
          <span>{i1.runs}/{i1.wickets} ({i1.overs})</span>
        </div>
        <div className={styles.grid}>
          <div>
            {i1Bat.map((p, i) => (
              <div key={i} className={`${styles.blueRow} ${i % 2 ? styles.blueRowAlt : ""} ${styles.animate}`} style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                <span>{p.name}</span>
                <span>{p.runs} ({p.balls})</span>
              </div>
            ))}
          </div>
          <div>
            {i1Bowl.map((p, i) => (
              <div key={i} className={`${styles.yellowRow} ${i % 2 ? styles.yellowRowAlt : ""} ${styles.animate}`} style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                <span>{p.name}</span>
                <span>{p.wickets}-{p.runs}</span>
              </div>
            ))}
          </div>
        </div>

        {/* INNINGS 2 - Team batting second */}
        <div className={styles.scoreRow}>
          <span>{i2.team}</span>
          <span>{i2.runs}/{i2.wickets} ({i2.overs})</span>
        </div>
        <div className={styles.grid}>
          <div>
            {i2Bat.map((p, i) => (
              <div key={i} className={`${styles.yellowRow} ${i % 2 ? styles.yellowRowAlt : ""} ${styles.animate}`} style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                <span>{p.name}</span>
                <span>{p.runs} ({p.balls})</span>
              </div>
            ))}
          </div>
          <div>
            {i2Bowl.map((p, i) => (
              <div key={i} className={`${styles.blueRow} ${i % 2 ? styles.blueRowAlt : ""} ${styles.animate}`} style={{ animationDelay: `${0.8 + i * 0.1}s` }}>
                <span>{p.name}</span>
                <span>{p.wickets}-{p.runs}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.result}>{bannerText}</div>
      </div>
    </div>
  );
  }
              
