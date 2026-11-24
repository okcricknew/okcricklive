import styles from "./MatchSummary.module.css";

import {
  getWcplMatchSummaryData,
  getWcplTeamLogo,
} from "./matchSummaryData";

const DEFAULT_TEAM_LOGO = "/themes/OkCrick/default-team.png";

function StatRow({ batting, bowling }) {
  return (
    <div className={styles.statRow}>
      {/* BATTING */}
      <div className={styles.batCell}>
        <span className={styles.playerName}>
          {batting?.name || ""}
        </span>

        <span className={styles.batScore}>
          {batting
            ? `${batting.runs}${batting.notOut ? "*" : ""}`
            : ""}

          {batting ? (
            <small>{batting.balls}</small>
          ) : null}
        </span>
      </div>

      {/* BOWLING */}
      <div className={styles.bowlCell}>
        <span className={styles.playerName}>
          {bowling?.name || ""}
        </span>

        <span className={styles.bowlFigs}>
          {bowling
            ? `${bowling.wickets}-${bowling.runs}`
            : ""}

          {bowling ? (
            <small>{bowling.overs}</small>
          ) : null}
        </span>
      </div>
    </div>
  );
}

function InningsBlock({ match, innings }) {
  const batting = innings?.batting || [];
  const bowling = innings?.bowling || [];

  const logo =
    getWcplTeamLogo(match, innings?.team) ||
    DEFAULT_TEAM_LOGO;

  const teamName = innings?.team || "TEAM";

  return (
    <section className={styles.inningsBlock}>
      {/* TEAM LOGO */}
      <div className={styles.teamLogoCol}>
        <img
          className={styles.teamCrest}
          src={logo}
          alt={`${teamName} logo`}
          loading="eager"
          decoding="async"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = DEFAULT_TEAM_LOGO;
          }}
        />
      </div>

      {/* SCORECARD */}
      <div className={styles.scorePanel}>
        {/* TEAM HEADER */}
        <div
          className={`${styles.teamHeader} ${
            innings.inningsNumber === 1
              ? styles.barGreen
              : styles.barGold
          }`}
        >
          <span className={styles.teamName}>
            {teamName}
          </span>

          <div className={styles.teamTotalWrap}>
            <span className={styles.oversLabel}>
              OVERS {innings.overs || "0.0"}
            </span>

            <span className={styles.teamScore}>
              {Number(innings.runs || 0)}-
              {Number(innings.wickets || 0)}
            </span>
          </div>
        </div>

        {/* FOUR BATTING + BOWLING ROWS */}
        <div className={styles.statsGrid}>
          {[0, 1, 2, 3].map((index) => (
            <StatRow
              key={`${innings.inningsNumber}-${index}`}
              batting={batting[index] || null}
              bowling={bowling[index] || null}
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

  if (!Array.isArray(inningsData)) return null;

  const result =
    match.resultSummary ||
    (match.status === "completed"
      ? "MATCH COMPLETED"
      : "MATCH IN PROGRESS");

  const matchNumber =
    match.matchNo ?? match.matchNumber;

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

          {/* BACKGROUND GEOMETRIC PATTERN */}
          <div className={styles.bgChevrons} />

          {/* HEADER */}
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
                {subtitle}
              </p>
            </div>
          </header>

          {/* INNINGS SCORECARDS */}
          <main className={styles.inningsContainer}>
            {inningsData.map((innings) => (
              <InningsBlock
                key={innings.inningsNumber}
                match={match}
                innings={innings}
              />
            ))}
          </main>

          {/* RESULT FOOTER */}
          <footer className={styles.resultFooter}>
            <p className={styles.resultText}>
              {result}
            </p>
          </footer>

        </div>
      </div>
    </div>
  );
        }
    
