"use client";

import React from 'react';
import styles from './MatchIntroCwc.module.css';
import { useOverlay } from "../../core/OverlayProvider";

const WinningResultCwc = () => {
  const match = useOverlay();
  const basePath = '/themes/OkCrick';

  // 1. SAFETY FALLBACK
  if (!match) return null;

  // 2. SHOW WHEN MATCH IS COMPLETED OR EXPLICITLY TRIGGERED
  const isCompleted = match.status === 'completed' || match.overlayType === 'winningResult';
  if (!isCompleted) return null;

  // Team Details & Logos
  const teamAName = match.teamA || "TEAM A";
  const teamBName = match.teamB || "TEAM B";

  const logoA = match.teamALogoUrl || `${basePath}/default-team.png`;
  const logoB = match.teamBLogoUrl || `${basePath}/default-team.png`;

  // WINNER & MARGIN LOGIC
  const winningTeam = (match.winner || "MATCH DRAW").toUpperCase();
  const rawSummary = match.resultSummary || "";

  const resultText = rawSummary
    .replace(/^.*?\bwon\b\s*/i, "")
    .replace(/^by\s+/i, "BY ")
    .toUpperCase();

  // Animation handling
  const animationClass = match.animateOut || match.status === 'exiting'
    ? `${styles.lowerThird} ${styles.lowerThirdOut}`
    : styles.lowerThird;

  return (
    <div className={styles.overlayRoot}>
      <div className={animationClass}>
        
        {/* LEFT Section (Team A) */}
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

        {/* CENTER Section (Winning Result Display) */}
        <div className={styles.centerWrapper}>
          <div className={styles.pngLayerFix}>
            <div className={styles.layer}>
              <img src={`${basePath}/main-score.png`} className={`${styles.img} ${styles.mainScore}`} alt="" />
            </div>

            <div className={styles.score}>
              {/* Line 1: Winning Team Name */}
              <div className={styles.line1}>
                {winningTeam} WIN
              </div>
              
              {/* Line 2: Victory Margin / Summary */}
              <div className={styles.line2}>
                {resultText || "MATCH COMPLETED"}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT Section (Team B) */}
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

export default WinningResultCwc;
          
