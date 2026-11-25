
import React from "react";

import styles from "./MatchSummary.module.css";
import matchSummaryData from "./matchSummaryData";

function GuyanaCrest() {
  return (
    <svg
      className={styles.teamCrest}
      viewBox="0 0 140 165"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gaw-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffe066" />
          <stop offset="50%" stopColor="#f59f00" />
          <stop offset="100%" stopColor="#b26a00" />
        </linearGradient>

        <linearGradient id="gaw-green" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#12b886" />
          <stop offset="100%" stopColor="#087f5b" />
        </linearGradient>
      </defs>

      {/* Crossed Spears / Swords */}
      <polygon points="15,10 70,68 62,75 10,18" fill="url(#gaw-gold)" stroke="#111" strokeWidth="2" />
      <polygon points="125,10 70,68 78,75 130,18" fill="url(#gaw-gold)" stroke="#111" strokeWidth="2" />
      <polygon points="22,125 70,72 76,78 28,130" fill="url(#gaw-gold)" stroke="#111" strokeWidth="2" />
      <polygon points="118,125 70,72 64,78 112,130" fill="url(#gaw-gold)" stroke="#111" strokeWidth="2" />

      {/* Center Diamond Shield */}
      <polygon
        points="70,22 108,70 70,118 32,70"
        fill="#c92a2a"
        stroke="url(#gaw-gold)"
        strokeWidth="4"
      />

      <polygon
        points="70,32 98,70 70,108 42,70"
        fill="url(#gaw-green)"
        stroke="#ffe066"
        strokeWidth="2"
      />

      {/* Inner Star / Warrior Symbol */}
      <polygon
        points="70,46 77,64 95,70 77,76 70,94 63,76 45,70 63,64"
        fill="#ffe066"
      />

      {/* Bottom Banner */}
      <path
        d="M18,118 L122,118 L112,155 L28,155 Z"
        fill="#096c38"
        stroke="url(#gaw-gold)"
        strokeWidth="3"
      />

      <text
        x="70"
        y="131"
        textAnchor="middle"
        fill="#ffe066"
        fontFamily="Rajdhani, sans-serif"
        fontWeight="700"
        fontSize="11"
        letterSpacing="1"
      >
        GUYANA
      </text>

      <text
        x="70"
        y="142"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="Chakra Petch, sans-serif"
        fontWeight="700"
        fontSize="13"
        letterSpacing="0.5"
      >
        AMAZON
      </text>

      <text
        x="70"
        y="152"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="Chakra Petch, sans-serif"
        fontWeight="700"
        fontSize="12"
        letterSpacing="0.5"
      >
        WARRIORS
      </text>
    </svg>
  );
}

function JamaicaCrest() {
  return (
    <svg
      className={styles.teamCrest}
      viewBox="0 0 140 165"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="je-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff3bf" />
          <stop offset="50%" stopColor="#fcc419" />
          <stop offset="100%" stopColor="#d9480f" />
        </linearGradient>

        <linearGradient id="je-green" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2b8a3e" />
          <stop offset="100%" stopColor="#14361d" />
        </linearGradient>
      </defs>

      {/* Outer Shield & Feathered Crown */}
      <path
        d="M70,12 L105,36 L115,85 L70,152 L25,85 L35,36 Z"
        fill="#1a1a1a"
        stroke="url(#je-gold)"
        strokeWidth="4"
      />

      <path
        d="M70,20 L98,40 L106,82 L70,140 L34,82 L42,40 Z"
        fill="url(#je-green)"
        stroke="#fcc419"
        strokeWidth="2"
      />

      {/* Crown Spikes */}
      <polygon
        points="48,38 54,18 63,34 70,14 77,34 86,18 92,38"
        fill="url(#je-gold)"
        stroke="#111"
        strokeWidth="1.5"
      />

      {/* Stylized Helmet / Visor */}
      <path
        d="M50,48 L90,48 L86,88 L70,102 L54,88 Z"
        fill="url(#je-gold)"
        stroke="#111"
        strokeWidth="2"
      />

      <path d="M56,60 L67,66 L67,86 L58,80 Z" fill="#1a1a1a" />
      <path d="M84,60 L73,66 L73,86 L82,80 Z" fill="#1a1a1a" />

      {/* Ribbon Banner */}
      <rect
        x="20"
        y="108"
        width="100"
        height="22"
        rx="3"
        fill="#141414"
        stroke="url(#je-gold)"
        strokeWidth="2.5"
      />

      <text
        x="70"
        y="123"
        textAnchor="middle"
        fill="#fcc419"
        fontFamily="Chakra Petch, sans-serif"
        fontWeight="700"
        fontSize="11.5"
        letterSpacing="0.5"
      >
        JAMAICA EMPRESS
      </text>
    </svg>
  );
}

function TeamCrest({ type }) {
  if (type === "guyana") return <GuyanaCrest />;
  if (type === "jamaica") return <JamaicaCrest />;

  return null;
}

function PlayerStats({ batting, bowling }) {
  return (
    <div className={styles.statsGrid}>
      {batting.map((batter, index) => {
        const bowler = bowling[index];

        return (
          <div className={styles.statRow} key={index}>
            <div className={styles.batCell}>
              <span className={styles.playerName}>
                {batter.name}
              </span>

              <span className={styles.batScore}>
                {batter.runs}
                <small>{batter.balls}</small>
              </span>
            </div>

            <div className={styles.bowlCell}>
              <span className={styles.playerName}>
                {bowler?.name}
              </span>

              <span className={styles.bowlFigs}>
                {bowler?.figures}
                <small>{bowler?.overs}</small>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InningsBlock({ innings }) {
  return (
    <section className={styles.inningsBlock}>
      <div className={styles.teamLogoCol}>
        <TeamCrest type={innings.crest} />
      </div>

      <div className={styles.scorePanel}>
        <div
          className={`${styles.teamHeader} ${
            innings.headerStyle === "green"
              ? styles.barGreen
              : styles.barGold
          }`}
        >
          <span className={styles.teamName}>
            {innings.teamName}
          </span>

          <div className={styles.teamTotalWrap}>
            <span className={styles.oversLabel}>
              OVERS {innings.overs}
            </span>

            <span className={styles.teamScore}>
              {innings.score}
            </span>
          </div>
        </div>

        <PlayerStats
          batting={innings.batting}
          bowling={innings.bowling}
        />
      </div>
    </section>
  );
}

export default function MatchSummary() {
  return (
    <div className={styles.broadcastCanvas}>
      <div className={styles.summaryBoard}>
        {/* Background Geometric Pattern Overlay */}
        <div className={styles.bgChevrons} />

        {/* Top Header Section */}
        <header className={styles.boardHeader}>
          <div className={styles.brandBadge}>
            <span className={styles.badgeSmall}>SHE'S</span>
            <span className={styles.badgeLarge}>IN</span>
          </div>

          <div className={styles.headerTitles}>
            <h1 className={styles.mainTitle}>
              {matchSummaryData.title}
            </h1>

            <p className={styles.subTitle}>
              {matchSummaryData.subtitle}
            </p>
          </div>
        </header>

        {/* Main Scorecards Container */}
        <main className={styles.inningsContainer}>
          {matchSummaryData.innings.map((innings) => (
            <InningsBlock
              key={innings.id}
              innings={innings}
            />
          ))}
        </main>

        {/* Bottom Result Footer Bar */}
        <footer className={styles.resultFooter}>
          <p className={styles.resultText}>
            {matchSummaryData.result}
          </p>
        </footer>
      </div>
    </div>
  );
        }
        
