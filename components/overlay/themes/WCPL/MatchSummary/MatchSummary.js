"use client";

import styles from "./MatchSummary.module.css";
import { getMatchSummaryData } from "./utils/matchSummaryData";

const DEFAULT_LOGO = "/themes/OkCrick/default-team.png";

const normalize = (value) =>
  String(value || "").trim().toLowerCase();

/* Get the correct team logo from the existing match data */
function getTeamLogo(match, teamName) {
  if (normalize(teamName) === normalize(match.teamA)) {
    return (
      match.teamALogoUrl ||
      match.teamAColorDocument?.logoUrl ||
      DEFAULT_LOGO
    );
  }

  if (normalize(teamName) === normalize(match.teamB)) {
    return (
      match.teamBLogoUrl ||
      match.teamBColorDocument?.logoUrl ||
      DEFAULT_LOGO
    );
  }

  return DEFAULT_LOGO;
}

/* Always render four player rows */
function padPlayers(players) {
  const list = Array.isArray(players) ? players : [];

  const emptyPlayer = {
    name: "",
    runs: "",
    balls: "",
    wickets: "",
    overs: "",
  };

  return [
    ...list,
    ...Array.from(
      { length: Math.max(0, 4 - list.length) },
      () => ({ ...emptyPlayer })
    ),
  ].slice(0, 4);
}

/* Batting and bowling player rows */
function PlayerStatRows({ battingPlayers, bowlingPlayers }) {
  const batsmen = padPlayers(battingPlayers);
  const bowlers = padPlayers(bowlingPlayers);

  return (
    <div className={styles.statsGrid}>
      {[0, 1, 2, 3].map((index) => {
        const bat = batsmen[index] || {};
        const bowl = bowlers[index] || {};

        const hasBattingRuns =
          bat.runs !== "" && bat.runs !== undefined && bat.runs !== null;

        const hasBattingBalls =
          bat.balls !== "" && bat.balls !== undefined && bat.balls !== null;

        const hasBowlingFigures =
          (bowl.wickets !== "" &&
            bowl.wickets !== undefined &&
            bowl.wickets !== null) ||
          (bowl.runs !== "" &&
            bowl.runs !== undefined &&
            bowl.runs !== null);

        const hasBowlingOvers =
          bowl.overs !== "" &&
          bowl.overs !== undefined &&
          bowl.overs !== null;

        return (
          <div className={styles.statRow} key={`stat-row-${index}`}>
            {/* Batting side */}
            <div className={styles.batCell}>
              <span className={styles.playerName}>
                {bat.name || ""}
              </span>

              <span className={styles.batScore}>
                {hasBattingRuns ? bat.runs : ""}

                {hasBattingBalls ? (
                  <small>{bat.balls}</small>
                ) : null}
              </span>
            </div>

            {/* Bowling side */}
            <div className={styles.bowlCell}>
              <span className={styles.playerName}>
                {bowl.name || ""}
              </span>

              <span className={styles.bowlFigs}>
                {hasBowlingFigures
                  ? `${bowl.wickets ?? ""}-${bowl.runs ?? ""}`
                  : ""}

                {hasBowlingOvers ? (
                  <small>{bowl.overs}</small>
                ) : null}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* One innings scorecard */
function InningsSummary({
  match,
  innings,
  inningsNumber,
}) {
  if (!innings) return null;

  const teamLogo = getTeamLogo(match, innings.team);

  const headerBarClass =
    inningsNumber === 1
      ? styles.barGreen
      : styles.barGold;

  const hasOvers =
    innings.overs !== "" &&
    innings.overs !== undefined &&
    innings.overs !== null;

  const hasScore =
    innings.runs !== "" &&
    innings.runs !== undefined &&
    innings.runs !== null &&
    innings.wickets !== "" &&
    innings.wickets !== undefined &&
    innings.wickets !== null;

  return (
    <section className={styles.inningsBlock}>
      {/* Team logo */}
      <div className={styles.teamLogoCol}>
        <img
          src={teamLogo}
          alt={`${innings.team || "Team"} logo`}
          className={styles.teamCrest}
          loading="eager"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = DEFAULT_LOGO;
          }}
        />
      </div>

      {/* Score and player details */}
      <div className={styles.scorePanel}>
        <div
          className={`${styles.teamHeader} ${headerBarClass}`}
        >
          <span className={styles.teamName}>
            {innings.team || ""}
          </span>

          <div className={styles.teamTotalWrap}>
            <span className={styles.oversLabel}>
              {hasOvers ? `OVERS ${innings.overs}` : ""}
            </span>

            <span className={styles.teamScore}>
              {hasScore
                ? `${innings.runs}-${innings.wickets}`
                : ""}
            </span>
          </div>
        </div>

        <PlayerStatRows
          battingPlayers={innings.battingPlayers}
          bowlingPlayers={innings.bowlingPlayers}
        />
      </div>
    </section>
  );
}

/* Main WCPL Match Summary */
export default function MatchSummary({ match }) {
  if (!match) return null;

  const summary = getMatchSummaryData(match);

  if (!summary) return null;

  const {
    firstInnings,
    secondInnings,
    bannerText,
    metadata = {},
  } = summary;

  const tournamentName = String(
    metadata.tournamentName ||
    match.tournamentName ||
    match.tournament ||
    "LIMACOL WCPL 2026"
  ).trim();

  const matchNumber = match.matchNo ?? match.matchNumber;

  const matchLabel = String(
    metadata.matchName ||
    (matchNumber !== undefined &&
    matchNumber !== null &&
    String(matchNumber).trim()
      ? `MATCH ${matchNumber}`
      : "MATCH")
  ).trim();

  const venue = String(
    metadata.venue ||
    match.venue ||
    match.venueName ||
    match.ground ||
    match.stadium ||
    "VENUE TBC"
  ).trim();

  const headerLine =
    `${tournamentName} - ${matchLabel}, ${venue}`;

  return (
    <div className={styles.broadcastCanvas}>
      <div className={styles.summaryBoard}>
        {/* Purple geometric background */}
        <div className={styles.bgChevrons} />

        {/* Header */}
        <header className={styles.boardHeader}>
          {/* Reference design uses this badge in the header */}
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
              {headerLine}
            </p>
          </div>
        </header>

        {/* Innings scorecards */}
        <main className={styles.inningsContainer}>
          <InningsSummary
            match={match}
            innings={firstInnings}
            inningsNumber={1}
          />

          <InningsSummary
            match={match}
            innings={secondInnings}
            inningsNumber={2}
          />
        </main>

        {/* Match result footer */}
        <footer className={styles.resultFooter}>
          <p className={styles.resultText}>
            {bannerText || ""}
          </p>
        </footer>
      </div>
    </div>
  );
}
