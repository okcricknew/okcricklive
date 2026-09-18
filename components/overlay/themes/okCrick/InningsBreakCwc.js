"use client";

import React from 'react';
import styles from './MatchIntroCwc.module.css';
import { useOverlay } from "../../core/OverlayProvider";

const InningsBreakCwc = () => {
  const match = useOverlay();
  const basePath = '/themes/OkCrick';

  if (!match) return null;

  // Real time parameters
  const currentRuns = Number(match.totalRuns || 0);
  const totalWickets = Number(match.totalWickets || 0);
  const totalOversLimit = Number(match.overs || 0);
  const currentOver = Number(match.currentOver || 0);
  const ballsInOver = Number(match.ballsInOver || 0);
  const currentInnings = Number(match.innings || 1);

  const isAllOut = totalWickets >= 10;
  const isOversComplete = currentOver >= totalOversLimit || (currentOver === totalOversLimit - 1 && ballsInOver === 6);

  // Verification to show break UI
  const isExplicitOverlay = match.overlayType === "inningsBreak";
  const isFirstInningsFinished = currentInnings === 1 && (isAllOut || isOversComplete);

  if (!isExplicitOverlay && !isFirstInningsFinished) return null;

  // Target calculation
  const target = currentRuns + 1;
  const totalBalls = totalOversLimit * 6;

  // Chasing Team name
  const chasingTeam = (
    currentInnings === 1
      ? (match.bowlingTeam || (match.battingTeam === match.teamA ? match.teamB : match.teamA))
      : (match.battingTeam || "TBC")
  ).toUpperCase();

  const teamAName = match.teamA || "TEAM A";
  const teamBName = match.teamB || "TEAM B";

  const logoA = match.teamALogoUrl || `${basePath}/default-team.png`;
  const logoB = match.teamBLogoUrl || `${basePath}/default-team.png`;

  const animationClass = match.animateOut || match.status === 'exiting'
    ? `${styles.lowerThird} ${styles.lowerThirdOut}`
    : styles.lowerThird;

  return (
    <div className={styles.overlayRoot}>
      <div className={animationClass}>

        {/* LEFT Section */}  
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
              onError={(e) => { e.currentTarget.src = `${basePath}/default-team.png`; }}  
            />  
          </div>  
        </div>  

        {/* CENTER Section */}  
        <div className={styles.centerWrapper}>  
          <div className={styles.pngLayerFix}>  
            <div className={styles.layer}>  
              <img src={`${basePath}/main-score.png`} className={`${styles.img} ${styles.mainScore}`} alt="" />  
            </div>  

            <div className={styles.score}>  
              <div className={styles.line1}>{chasingTeam} NEED</div>  
              <div className={styles.line2}>{target} RUNS FROM {totalBalls} BALLS</div>  
            </div>  
          </div>  
        </div>  

        {/* RIGHT Section */}  
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
              onError={(e) => { e.currentTarget.src = `${basePath}/default-team.png`; }}  
            />  
          </div>  
        </div>  

      </div>  
    </div>
  );
};

export default InningsBreakCwc;
          
