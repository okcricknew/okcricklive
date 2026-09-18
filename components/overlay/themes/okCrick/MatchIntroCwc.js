"use client";

import React, { useState, useEffect, useMemo } from 'react';
import styles from './MatchIntroCwc.module.css';
import { useOverlay } from "../../core/OverlayProvider";

const MatchIntroCwc = () => {
  const match = useOverlay();
  const [infoIndex, setInfoIndex] = useState(0);

  const basePath = '/themes/OkCrick';

  // Dynamic Array mapping with conditional object structure for Toss
  const infoList = useMemo(() => {
    if (!match) return [];
    
    const list = [];

    // 1. Toss Info: Agar complete hai, toh hamesha index 0 par rahega
    if (match.tossCompleted && match.tossWinner) {
      list.push({
        isToss: true,
        line1: `${match.tossWinner.toUpperCase()} WON THE TOSS`,
        line2: `AND ELECTED TO ${(match.tossDecision || match.tossChoice || "BAT").toUpperCase()}`
      });
    }

    // 2. Tournament Name
    if (match.tournamentName) {
      list.push(match.tournamentName.toUpperCase());
    }

    // 3. Match Type
    if (match.matchType) {
      list.push(match.matchType.toUpperCase());
    }

    // 4. Overs
    if (match.overs) {
      list.push(`${match.overs} OVERS MATCH`);
    }

    // 5. Match Number
    if (match.matchNo) {
      list.push(`MATCH NO: ${match.matchNo}`);
    }

    return list;
  }, [match]);

  // **FORCE RESET TO TOSS:** Jaise hi toss complete ho, rotation ko directly Toss par switch kar do
  useEffect(() => {
    if (match?.tossCompleted) {
      setInfoIndex(0);
    }
  }, [match?.tossCompleted]);

  // Dynamic Rotation System (Toss = 20s, Normal = 5s)
  useEffect(() => {
    if (infoList.length <= 1) return;

    // Check karein ki current item toss hai ya normal string
    const currentItem = infoList[infoIndex];
    const delay = currentItem && currentItem.isToss ? 20000 : 5000;

    const timeout = setTimeout(() => {
      setInfoIndex((prev) => (prev + 1) % infoList.length);
    }, delay);

    return () => clearTimeout(timeout);
  }, [infoIndex, infoList]); // Jab index badlega ya list update hogi tab delay recalculate hoga

  if (!match) return null;

  const currentItem = infoList[infoIndex];
  if (!currentItem) return null;

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
        
        {/* ================= LEFT Section ================= */}
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

        {/* ================= CENTER Section ================= */}
        <div className={styles.centerWrapper}>
          <div className={styles.pngLayerFix}>
            <div className={styles.layer}>
              <img src={`${basePath}/main-score.png`} className={`${styles.img} ${styles.mainScore}`} alt="" />
            </div>

            {/* Content Display: `key={currentItem.isToss ? 'toss' : infoIndex}` clear transition ke liye */}
            <div className={styles.score} key={currentItem.isToss ? 'toss' : infoIndex}>
              {currentItem.isToss ? (
                <>
                  <div className={styles.line1}>{currentItem.line1}</div>
                  <div className={styles.line2}>{currentItem.line2}</div>
                </>
              ) : (
                <div className={styles.normalText}>{currentItem}</div>
              )}
            </div>

          </div>
        </div>

        {/* ================= RIGHT Section ================= */}
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

export default MatchIntroCwc;
          
