import styles from "./MatchSummary.module.css";
import {
  getWcplMatchSummaryData,
  getWcplTeamLogo,
} from "./matchSummaryData";

function StatRow({ batting, bowling }) {
  return (
    <div className={styles.statRow}>
      <div className={styles.batCell}>
        <span className={styles.playerName}>
          {batting?.name || ""}
        </span>
        <span className={styles.batScore}>
          {batting
            ? `${batting.runs}${batting.notOut ? "*" : ""}`
            : ""}
          {batting ? <small>{batting.balls}</small> : null}
        </span>
      </div>

      <div className={styles.bowlCell}>
        <span className={styles.playerName}>
          {bowling?.name || ""}
        </span>
        <span className={styles.bowlFigs}>
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
    <section className={styles.inningsBlock}>
      <div className={styles.teamLogoCol}>
        <img
          className={styles.teamCrest}
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

      <div className={styles.scorePanel}>
        <div
          className={`${styles.teamHeader} ${
            innings.inningsNumber === 1
              ? styles.barGreen
              : styles.barGold
          }`}
        >
          <span className={styles.teamName}>
            {innings.team}
          </span>
          <div className={styles.teamTotalWrap}>
            <span className={styles.oversLabel}>
              OVERS {innings.overs}
            </span>
            <span className={styles.teamScore}>
              {innings.runs}-{innings.wickets}
            </span>
          </div>
        </div>

        <div className={styles.statsGrid}>
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
    <div className={styles.broadcastCanvas}>
      <div className={styles.scaleStage}>
        <div className={styles.summaryBoard}>
          {/* Background Geometric Pattern Overlay */}
          <div className={styles.bgChevrons} />

          {/* Top Header Section */}
          <header className={styles.boardHeader}>
            <div className={styles.brandBadge}>
              <span className={styles.badgeSmall}>SHE&apos;S</span>
              <span className={styles.badgeLarge}>IN</span>
            </div>
            <div className={styles.headerTitles}>
              <h1 className={styles.mainTitle}>MATCH SUMMARY</h1>
              <p className={styles.subTitle}>{subtitle}</p>
            </div>
          </header>

          {/* Main Scorecards Container */}
          <main className={styles.inningsContainer}>
            {inningsData.map((innings) => (
              <InningsBlock
                key={innings.inningsNumber}
                match={match}
                innings={innings}
              />
            ))}
          </main>

          {/* Bottom Result Footer Bar */}
          <footer className={styles.resultFooter}>
            <p className={styles.resultText}>{result}</p>
          </footer>
        </div>
      </div>
    </div>
  );
            }
            
