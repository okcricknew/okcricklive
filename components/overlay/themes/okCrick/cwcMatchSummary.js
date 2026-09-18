"use client";

import styles from "./cwcmatchsummary.module.css";
import {
  getTopBatters,
  getTopBowlers,
  getInningsData,
} from "../../utils/matchSummaryHelpers";

export default function MatchSummaryOverlay({ match }) {
  if (!match) return null;

  const i1 = getInningsData(match, 1);
  const i2 = getInningsData(match, 2);

  const i1Bat = getTopBatters(i1.batting);
  const i1Bowl = getTopBowlers(i1.bowling, match);

  const i2Bat = getTopBatters(i2.batting);
  const i2Bowl = getTopBowlers(i2.bowling, match);

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
      <div className={styles.scorecardContainer}>
        
        <div className={styles.matchStatusBar}>
          <div className={styles.matchStatusContent}>
            <span className={styles.matchStatusText}>
              MATCH SUMMARY
            </span>
          </div>
        </div>

        <div className={styles.topHeaderSection}>
          <div className={styles.teamsHeader}>

            <div className={`${styles.teamBox} ${styles.teamLeft}`}>
              {i1.team}
            </div>

            <div className={styles.vsLogo}>
              {match.logoUrl ? (
    <img 
      src={match.logoUrl} 
      alt="Tournament Logo" 
      style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
    />
  ) : (
    "🏆"
  )}
            </div>

            <div className={`${styles.teamBox} ${styles.teamRight}`}>
              {i2.team}
            </div>

          </div>

          <div className={styles.venueBar}>
            {match?.venue || "OKCRICK.IN"}
          </div>
        </div>

        <div className={styles.lowerScorecardLayout}>

          <div className={styles.sidePatternContainer}></div>

          <div className={styles.mainContent}>

            <div className={styles.matchDataGrid}>

              {/* LEFT SIDE */}

              <div className={`${styles.dataColumn} ${styles.borderRight}`}>

                <div className={styles.scoreRowBlue}>
                  {i1.runs}-{i1.wickets}
                </div>

                {[...i1Bat, ...Array(Math.max(0, 5 - i1Bat.length)).fill({
                  name: "",
                  runs: "",
                  balls: ""
                })].slice(0, 5).map((p, i) => (
                  <div key={i} className={styles.playerRow}>
                    <span className={styles.name}>{p.name}</span>
                    <span className={styles.runs}>{p.runs}</span>
                    <span className={styles.ballss}>{p.balls}</span>
                  </div>
                ))}

                <div className={styles.oversRow}>
                  {i1.overs} OVERS
                </div>

                {[...i1Bowl, ...Array(Math.max(0, 5 - i1Bowl.length)).fill({
                  name: "",
                  wickets: "",
                  runs: "",
                  overs: ""
                })].slice(0, 5).map((p, i) => (
                  <div key={i} className={styles.playerRow}>
                    <span className={styles.name}>{p.name}</span>
                    <span className={styles.stat}>
                      {p.wickets}-{p.runs}
                    </span>
                    <span className={styles.ballss}>
                      {p.overs}
                    </span>
                  </div>
                ))}
              </div>

              {/* RIGHT SIDE */}

              <div className={styles.dataColumn}>

                <div className={styles.scoreRowBlue}>
                  {i2.runs}-{i2.wickets}
                </div>

                {[...i2Bat, ...Array(Math.max(0, 5 - i2Bat.length)).fill({
                  name: "",
                  runs: "",
                  balls: ""
                })].slice(0, 5).map((p, i) => (
                  <div key={i} className={styles.playerRow}>
                    <span className={styles.name}>{p.name}</span>
                    <span className={styles.runs}>{p.runs}</span>
                    <span className={styles.ballss}>{p.balls}</span>
                  </div>
                ))}

                <div className={styles.oversRow}>
                  {i2.overs} OVERS
                </div>

                {[...i2Bowl, ...Array(Math.max(0, 5 - i2Bowl.length)).fill({
                  name: "",
                  wickets: "",
                  runs: "",
                  overs: ""
                })].slice(0, 5).map((p, i) => (
                  <div key={i} className={styles.playerRow}>
                    <span className={styles.name}>{p.name}</span>
                    <span className={styles.stat}>
                      {p.wickets}-{p.runs}
                    </span>
                    <span className={styles.ballss}>
                      {p.overs}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            <div className={styles.bottomBanner}>
              {bannerText}
            </div>

          </div>

          <div className={styles.sidePatternContainer}></div>

        </div>
      </div>
    </div>
  );
}
