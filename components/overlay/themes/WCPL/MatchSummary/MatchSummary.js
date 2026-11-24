import Head from "next/head";
import styles from "./MatchSummary.module.css";
import {
  getWcplMatchSummaryData,
  getWcplTeamLogo,
} from "./matchSummaryData";

function StatRow({ batting, bowling }) {
  return (
    <div className={styles["stat-row"]}>
      <div className={styles["bat-cell"]}>
        <span className={styles["player-name"]}>
          {batting?.name || ""}
        </span>
        <span className={styles["bat-score"]}>
          {batting
            ? `${batting.runs}${batting.notOut ? "*" : ""}`
            : ""}
          {batting ? <small>{batting.balls}</small> : null}
        </span>
      </div>

      <div className={styles["bowl-cell"]}>
        <span className={styles["player-name"]}>
          {bowling?.name || ""}
        </span>
        <span className={styles["bowl-figs"]}>
          {bowling
            ? `${bowling.wickets}-${bowling.runs}`
            : ""}
          {bowling ? <small>{bowling.overs}</small> : null}
        </span>
      </div>
    </div>
  );
}

function InningsBlock({ match, innings }) {
  const batting = innings.batting || [];
  const bowling = innings.bowling || [];
  const logo = getWcplTeamLogo(match, innings.team);

  return (
    <section className={styles["innings-block"]}>
      <div className={styles["team-logo-col"]}>
        <img
          className={styles["team-crest"]}
          src={logo}
          alt={innings.team}
          loading="eager"
          decoding="async"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src =
              "/themes/OkCrick/default-team.png";
          }}
        />
      </div>

      <div className={styles["score-panel"]}>
        <div
          className={`${styles["team-header"]} ${
            innings.inningsNumber === 1
              ? styles["bar-green"]
              : styles["bar-gold"]
          }`}
        >
          <span className={styles["team-name"]}>
            {innings.team}
          </span>
          <div className={styles["team-total-wrap"]}>
            <span className={styles["overs-label"]}>
              OVERS {innings.overs}
            </span>
            <span className={styles["team-score"]}>
              {innings.runs}-{innings.wickets}
            </span>
          </div>
        </div>

        <div className={styles["stats-grid"]}>
          {[0, 1, 2, 3].map((index) => (
            <StatRow
              key={`${innings.inningsNumber}-${index}`}
              batting={batting[index]}
              bowling={bowling[index]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function MatchSummary({ match }) {
  if (!match) return null;

  const inningsData = getWcplMatchSummaryData(match);
  if (!inningsData) return null;

  const result =
    match.resultSummary ||
    (match.status === "completed"
      ? "MATCH COMPLETED"
      : "MATCH IN PROGRESS");

  const matchNumber = match.matchNo ?? match.matchNumber;

  const subtitle = [
    match.tournamentName || "LIMACOL WCPL 2026",
    matchNumber ? `MATCH ${matchNumber}` : "",
    match.venue || "",
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600;700&family=Orbitron:wght@600;700;800&family=Rajdhani:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className={styles["broadcast-canvas"]}>
        <div className={styles["summary-board"]}>
          {/* Background Geometric Pattern Overlay */}
          <div className={styles["bg-chevrons"]} />

          {/* Top Header Section */}
          <header className={styles["board-header"]}>
            <div className={styles["brand-badge"]}>
              <span className={styles["badge-small"]}>SHE&apos;S</span>
              <span className={styles["badge-large"]}>IN</span>
            </div>
            <div className={styles["header-titles"]}>
              <h1 className={styles["main-title"]}>MATCH SUMMARY</h1>
              <p className={styles["sub-title"]}>{subtitle}</p>
            </div>
          </header>

          {/* Main Scorecards Container */}
          <main className={styles["innings-container"]}>
            {inningsData.map((innings) => (
              <InningsBlock
                key={innings.inningsNumber}
                match={match}
                innings={innings}
              />
            ))}
          </main>

          {/* Bottom Result Footer Bar */}
          <footer className={styles["result-footer"]}>
            <p className={styles["result-text"]}>{result}</p>
          </footer>
        </div>
      </div>
    </>
  );
            }
