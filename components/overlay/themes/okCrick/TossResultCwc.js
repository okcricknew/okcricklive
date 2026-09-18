"use client";

import React from 'react';
import styles from './MatchIntroCwc.module.css'; // Agar CSS file ka naam bhi change karein
import { useOverlay } from "../../core/OverlayProvider";

const TossResultCwc = () => {
  const match = useOverlay();
  const basePath = '/themes/OkCrick';

  // Agar match data missing ho ya toss complete na hua ho toh overlay nahi dikhega
  if (!match || !match.tossCompleted) return null;

  const teamAName = match.teamA || "TEAM A";
  const teamBName = match.teamB || "TEAM B";

  const logoA = match.teamALogoUrl || `${basePath}/default-team.png`;
  const logoB = match.teamBLogoUrl || `${basePath}/default-team.png`;

  // Toss Details
  const tossWinner = (match.tossWinner || "TEAM").toUpperCase();
  const tossDecision = (match.tossDecision || match.tossChoice || "BAT").toUpperCase();

  const animationClass = match.animateOut || match.status === 'exiting'
    ? `${styles.lowerThird} ${styles.lowerThirdOut}`
    : styles.lowerThird;

  return (
    <div className={styles.overlayRoot}>
      <div className={animationClass}>
        
        {/* ================= LEFT Section (Team A) ================= */}
        <div className={styles.battingWrapper}>
          <div className={styles.pngLayerFix}>
            <div className={styles.layer}>
              <img src={`${basePath}/batting-team.png`} className={`${styles.img} ${styles.teamBg}`} alt="" />
<span className={`${styles.overlay} ${styles.teamLeft}`}>{teamAName.toUpperCase()}</span>
            </div>
            <div className={styles.layer}>
              <img src={`${basePath}/batsman.png`} className={`${styles.img} ${styles.batsman}`} alt="" />
            </div>
            <div className={styles.layer}>
              <img src={`${basePath}/strip-left.png`} className={`${styles.img} ${styles.stripLeft}`} alt="" />
            </div>
            <img
              src={logoA}
              alt={teamAName}
              className={styles.logoLeft}
              onError={(e) => {
                e.currentTarget.src = `${basePath}/default-team.png`;
              }}
            />
          </div>
        </div>

        {/* ================= CENTER Section (Toss Result) ================= */}
        <div className={styles.centerWrapper}>
          <div className={styles.pngLayerFix}>
            <div className={styles.layer}>
              <img src={`${basePath}/main-score.png`} className={`${styles.img} ${styles.mainScore}`} alt="" />
            </div>

            <div className={styles.score}>
              <div className={styles.line1}>{tossWinner} WON THE TOSS</div>
              <div className={styles.line2}>AND ELECTED TO {tossDecision}</div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT Section (Team B) ================= */}
        <div className={styles.bowlingWrapper}>
          <div className={styles.pngLayerFix}>
            <div className={styles.layer}>
              <img src={`${basePath}/bowler.png`} className={`${styles.img} ${styles.bowlerImg}`} alt="" />
            </div>
            <div className={styles.layer}>
              <img src={`${basePath}/bowling-team.png`} className={`${styles.img} ${styles.teamBgRight}`} alt="" />
<span className={`${styles.overlay} ${styles.teamRight}`}>{teamBName.toUpperCase()}</span>
            </div>
            <div className={styles.layer}>
              <img src={`${basePath}/strip-right.png`} className={`${styles.img} ${styles.stripRight}`} alt="" />
            </div>
            <img
              src={logoB}
              alt={teamBName}
              className={styles.logoRight}
              onError={(e) => {
                e.currentTarget.src = `${basePath}/default-team.png`;
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default TossResultCwc;
