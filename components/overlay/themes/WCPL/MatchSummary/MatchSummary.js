"use client";

import styles from "./MatchSummary.module.css";
import { getMatchSummaryData } from "./utils/matchSummaryData";

const DEFAULT_LOGO = "/themes/OkCrick/default-team.png";

const normalize = (value) =>
  String(value || "").trim().toLowerCase();

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
    ...Array(Math.max(0, 4 - list.length)).fill(emptyPlayer),
  ].slice(0, 4);
}

function PlayerStatRows({ battingPlayers, bowlingPlayers }) {
  const batsmen = padPlayers(battingPlayers);
  const bowlers = padPlayers(bowlingPlayers);

  return (
    <div className={styles.statsGrid}>
      {[0, 1, 2, 3].map((index) => {
        const bat = batsmen[index] || {};
        const bowl = bowlers[index] || {};
        const hasBowlingFigures =
          bowl.wickets !== "" || bowl.runs !== "";

        return (
          <div className={styles.statRow} key={`stat-row-${index}`}>
            <div className={styles.batCell}>
              <span className={styles.playerName}>{bat.name}</span>
              <span className={styles.batScore}>
                {bat.runs}
                {bat.balls !== "" && bat.balls !== undefined ? (
                  <small>{bat.balls}</small>
                ) : null}
              </span>
            </div>

            <div className={styles.bowlCell}>
              <span className={styles.playerName}>{bowl.name}</span>
              <span className={styles.bowlFigs}>
                {hasBowlingFigures ? `${bowl.wickets}-${bowl.runs}` : ""}
                {bowl.overs !== "" && bowl.overs !== undefined ? (
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

function InningsSummary({
  match,
  innings,
  inningsNumber,
}) {
  if (!innings) return null;

  const teamLogo = getTeamLogo(match, innings.team);
  const headerBarClass =
    inningsNumber === 1 ? styles.barGreen : styles.barGold;

  return (
    <section className={styles.inningsBlock}>
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

      <div className={styles.scorePanel}>
        <div className={`${styles.teamHeader} ${headerBarClass}`}>
          <span className={styles.teamName}>{innings.team}</span>
          <div className={styles.teamTotalWrap}>
            <span className={styles.oversLabel}>
              {innings.overs !== "" && innings.overs !== undefined
                ? `OVERS ${innings.overs}`
                : ""}
            </span>
            <span className={styles.teamScore}>
              {innings.runs !== "" &&
              innings.runs !== undefined &&
              innings.wickets !== "" &&
              innings.wickets !== undefined
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

  const tournamentLogo =
    metadata.logoUrl ||
    match.logoUrl ||
    "";

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

  const headerLine = `${tournamentName} - ${matchLabel}, ${venue}`;

  return (
    <div className={styles.broadcastCanvas}>
      <div className={styles.summaryBoard}>
        {/* Background Geometric Pattern Overlay */}
        <div className={styles.bgChevrons} />

        {/* Top Header Section */}
        <header className={styles.boardHeader}>
          {tournamentLogo ? (
            <img
              src={tournamentLogo}
              alt="Tournament logo"
              className={styles.tournamentLogo}
              loading="eager"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className={styles.brandBadge}>
              <span className={styles.badgeSmall}>SHE&apos;S</span>
              <span className={styles.badgeLarge}>IN</span>
            </div>
          )}

          <div className={styles.headerTitles}>
            <h1 className={styles.mainTitle}>MATCH SUMMARY</h1>
            <p className={styles.subTitle}>{headerLine}</p>
          </div>
        </header>

        {/* Main Scorecards Container */}
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

        {/* Bottom Result Footer Bar */}
        <footer className={styles.resultFooter}>
          <p className={styles.resultText}>{bannerText}</p>
        </footer>
      </div>
    </div>
  );
    }
                
