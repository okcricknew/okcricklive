import { useEffect, useState } from "react";
import styles from "./MatchSummary.module.css";

const innings = [
  {
    id: "gaw",
    team: "GUYANA AMAZON WARRIORS",
    overs: "20",
    score: "138-7",
    theme: "green",
    logo: "GAW",
    batting: [
      { name: "CAMPBELLE", score: "56", balls: "53" },
      { name: "R GRIMMOND", score: "45", balls: "46" },
      { name: "TRYON", score: "21*", balls: "16" },
      { name: "E BRATHWAITE", score: "3", balls: "5" },
    ],
    bowling: [
      { name: "MLABA", figures: "2-15", overs: "4" },
      { name: "TAYLOR", figures: "2-24", overs: "4" },
      { name: "MAIR", figures: "1-19", overs: "4" },
      { name: "HENRY", figures: "1-28", overs: "4" },
    ],
  },
  {
    id: "je",
    team: "JAMAICA EMPRESS",
    overs: "19",
    score: "136-9",
    theme: "gold",
    logo: "JE",
    batting: [
      { name: "HENRY", score: "41*", balls: "21" },
      { name: "LANNING", score: "31", balls: "21" },
      { name: "WILLIAMS", score: "31", balls: "28" },
      { name: "D JOSEPH", score: "19", balls: "24" },
    ],
    bowling: [
      { name: "BURNS", figures: "2-3", overs: "2" },
      { name: "ISMAIL", figures: "2-29", overs: "4" },
      { name: "de KLERK", figures: "1-15", overs: "2" },
      { name: "TRYON", figures: "1-39", overs: "4" },
    ],
  },
];

function TeamCrest({ shortName, variant }) {
  return (
    <svg
      className={styles.teamCrest}
      viewBox="0 0 160 180"
      role="img"
      aria-label={`${shortName} team crest`}
    >
      <defs>
        <linearGradient
          id={`crest-${shortName}`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor={
              variant === "green" ? "#f4d35e" : "#fff0a8"
            }
          />
          <stop
            offset="48%"
            stopColor={
              variant === "green" ? "#159447" : "#e7a51a"
            }
          />
          <stop
            offset="100%"
            stopColor={
              variant === "green" ? "#075b31" : "#8a4d05"
            }
          />
        </linearGradient>

        <linearGradient
          id={`shine-${shortName}`}
          x1="0"
          y1="0"
          x2="0.9"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor="#ffffff"
            stopOpacity=".9"
          />
          <stop
            offset="100%"
            stopColor="#ffffff"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      <path
        d="M80 5 145 28 137 112 80 169 23 112 15 28Z"
        fill={`url(#crest-${shortName})`}
        stroke="#f8e7a0"
        strokeWidth="5"
      />

      <path
        d="M80 17 132 35 125 105 80 151 35 105 28 35Z"
        fill="none"
        stroke="#24133e"
        strokeWidth="3"
      />

      <path
        d="M80 18 130 36 78 91 30 37Z"
        fill={`url(#shine-${shortName})`}
        opacity=".28"
      />

      <circle
        cx="80"
        cy="70"
        r="31"
        fill="#17112c"
        fillOpacity=".88"
        stroke="#f8e7a0"
        strokeWidth="3"
      />

      <path
        d="M80 44c-12 12-12 34 0 49 12-15 12-37 0-49Z"
        fill="#fff"
      />

      <path
        d="M80 44v49"
        stroke="#d51c36"
        strokeWidth="4"
      />

      <text
        x="80"
        y="126"
        textAnchor="middle"
        fill="#fff"
        fontSize="18"
        fontWeight="900"
        fontFamily="Arial, sans-serif"
      >
        {shortName}
      </text>
    </svg>
  );
}

function StatRow({ batter, bowler }) {
  return (
    <div className={styles.statRow}>
      <div className={styles.statCell}>
        <span className={styles.playerName}>
          {batter.name}
        </span>

        <span className={styles.figures}>
          {batter.score}
          <small>{batter.balls}</small>
        </span>
      </div>

      <div className={styles.statCell}>
        <span className={styles.playerName}>
          {bowler.name}
        </span>

        <span className={styles.figures}>
          {bowler.figures}
          <small>{bowler.overs}</small>
        </span>
      </div>
    </div>
  );
}

function InningsCard({ item }) {
  return (
    <section className={styles.inningsBlock}>
      <div className={styles.teamLogoCol}>
        <TeamCrest
          shortName={item.logo}
          variant={item.theme}
        />
      </div>

      <div className={styles.scorePanel}>
        <div
          className={`${styles.teamHeader} ${
            item.theme === "green"
              ? styles.barGreen
              : styles.barGold
          }`}
        >
          <span className={styles.teamName}>
            {item.team}
          </span>

          <div className={styles.teamTotalWrap}>
            <span className={styles.oversLabel}>
              OVERS {item.overs}
            </span>

            <span className={styles.teamScore}>
              {item.score}
            </span>
          </div>
        </div>

        <div className={styles.statsGrid}>
          {item.batting.map((batter, index) => (
            <StatRow
              key={`${item.id}-${index}`}
              batter={batter}
              bowler={item.bowling[index]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function MatchSummary() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth || 1280;
      const height = window.innerHeight || 720;

      const nextScale = Math.min(
        width / 1280,
        height / 720
      );

      setScale(nextScale);
    };

    updateScale();

    window.addEventListener("resize", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  return (
    <div className={styles.broadcastCanvas}>
      <div
        className={styles.scaleStage}
        style={{
          transform: `scale(${scale})`,
        }}
      >
        <div className={styles.summaryBoard}>
          <div className={styles.bgChevrons} />

          <header className={styles.boardHeader}>
            <div className={styles.brandBadge}>
              <span className={styles.badgeSmall}>
                SHE&apos;S
              </span>

              <span className={styles.badgeLarge}>
                IN
              </span>
            </div>

            <div className={styles.headerTitles}>
              <h1 className={styles.mainTitle}>
                MATCH SUMMARY
              </h1>

              <p className={styles.subTitle}>
                LIMACOL WCPL 2026 - MATCH 2, BARBADOS
              </p>
            </div>
          </header>

          <main className={styles.inningsContainer}>
            {innings.map((item) => (
              <InningsCard
                key={item.id}
                item={item}
              />
            ))}
          </main>

          <footer className={styles.resultFooter}>
            <p className={styles.resultText}>
              JAMAICA EMPRESS WON BY 1 WICKET (DLS)
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
              }
    
