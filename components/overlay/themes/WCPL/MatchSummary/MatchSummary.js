
"use client";

import styles from "./MatchSummary.module.css";

import {
  getInningsData,
  getTopBatters,
} from "../../../utils/matchSummaryHelpers";

const DEFAULT_LOGO = "/themes/OkCrick/default-team.png";

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getTeamLogo(match, teamName) {
  const isTeamA = normalize(teamName) === normalize(match.teamA);
  const isTeamB = normalize(teamName) === normalize(match.teamB);

  if (isTeamA) {
    return (
      match.teamALogoUrl ||
      match.teamAColorDocument?.logoUrl ||
      DEFAULT_LOGO
    );
  }

  if (isTeamB) {
    return (
      match.teamBLogoUrl ||
      match.teamBColorDocument?.logoUrl ||
      DEFAULT_LOGO
    );
  }

  return DEFAULT_LOGO;
}

function getTopBowlersForInnings(match, bowlingStats, inningsNumber) {
  return Object.entries(bowlingStats || {})
    .filter(([, stats]) =>
      Number(stats.wickets || 0) > 0 ||
      Number(stats.runs || 0) > 0 ||
      Number(stats.balls || 0) > 0 ||
      Number(stats.overs || 0) > 0
    )
    .sort((a, b) =>
      Number(b[1].wickets || 0) - Number(a[1].wickets || 0) ||
      Number(a[1].runs || 0) - Number(b[1].runs || 0)
    )
    .slice(0, 4)
    .map(([name, stats]) => {
      const legalBalls = (match.ballHistory || []).filter((ball) => {
        const sameBowler =
          normalize(ball.bowler) === normalize(name);

        const sameInnings =
          Number(ball.innings) === Number(inningsNumber);

        const legalDelivery =
          !["WD", "NB"].includes(String(ball.type || "").toUpperCase());

        return sameBowler && sameInnings && legalDelivery;
      }).length;

      const overs = `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;

      return {
        name,
        wickets: stats.wickets || 0,
        runs: stats.runs || 0,
        overs,
      };
    });
}

function padPlayers(players) {
  const emptyPlayer = {
    name: "",
    runs: "",
    balls: "",
    wickets: "",
    overs: "",
  };

  return [
    ...players,
    ...Array(Math.max(0, 4 - players.length)).fill(emptyPlayer),
  ].slice(0, 4);
}

function PlayerRows({ players, type }) {
  return (
    <div className={styles.playerRows}>
      {padPlayers(players).map((player, index) => (
        <div
          className={styles.playerRow}
          key={`${type}-${player.name || "empty"}-${index}`}
        >
          <div className={styles.playerName}>
            {player.name}
          </div>

          {type === "batting" ? (
            <div className={styles.playerFigures}>
              <strong>{player.runs}</strong>
              <small>{player.balls}</small>
            </div>
          ) : (
            <div className={styles.playerFigures}>
              <strong>
                {player.wickets}-{player.runs}
              </strong>
              <small>{player.overs}</small>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function InningsSummary({ match, innings, inningsNumber }) {
  const battingPlayers = getTopBatters(innings.batting);

  const bowlingPlayers = getTopBowlersForInnings(
    match,
    innings.bowling,
    inningsNumber
  );

  const logo = getTeamLogo(match, innings.team);

  return (
    <section className={styles.inningsSection}>
      <div className={styles.teamLogoArea}>
        <img
          src={logo}
          alt={`${innings.team} logo`}
          className={styles.teamLogo}
          loading="eager"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = DEFAULT_LOGO;
          }}
        />
      </div>

      <div className={styles.inningsContent}>
        <div
          className={
            inningsNumber === 1
              ? styles.firstInningsHeader
              : styles.secondInningsHeader
          }
        >
          <div className={styles.teamName}>
            {innings.team}
          </div>

          <div className={styles.inningsOvers}>
            OVERS {innings.overs}
          </div>

          <div className={styles.inningsScore}>
            {innings.runs}-{innings.wickets}
          </div>
        </div>

        <div className={styles.playerColumns}>
          <div className={styles.playerColumn}>
            <PlayerRows
              players={battingPlayers}
              type="batting"
            />
          </div>

          <div className={styles.playerColumn}>
            <PlayerRows
              players={bowlingPlayers}
              type="bowling"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function getResultBanner(match, secondInnings) {
  if (match.status === "completed") {
    return match.resultSummary || "MATCH COMPLETED";
  }

  if (Number(match.innings || 1) === 1) {
    if (match.tossWinner && match.tossDecision) {
      return (
        `${match.tossWinner} WON THE TOSS & ELECTED TO ` +
        `${String(match.tossDecision).toUpperCase()} FIRST`
      );
    }

    return "MATCH IN PROGRESS";
  }

  const runsNeeded = Math.max(
    0,
    Number(match.target || 0) - Number(secondInnings.runs || 0)
  );

  const oversText = String(secondInnings.overs || "0.0");
  const [over, ball] = oversText.split(".");

  const ballsPlayed =
    Number.parseInt(over || "0", 10) * 6 +
    Number.parseInt(ball || "0", 10);

  const totalBalls = Number(match.overs || 0) * 6;
  const ballsLeft = Math.max(0, totalBalls - ballsPlayed);

  return (
    `${secondInnings.team} NEED ${runsNeeded} RUNS FROM ${ballsLeft} BALLS`
  );
}

export default function MatchSummary({ match }) {
  if (!match) return null;

  const firstInnings = getInningsData(match, 1);
  const secondInnings = getInningsData(match, 2);

  const matchNumber = match.matchNo ?? match.matchNumber;

  const metadata = [
    match.tournamentName,
    matchNumber !== undefined && matchNumber !== null
      ? `MATCH ${matchNumber}`
      : null,
    match.venue,
  ].filter(Boolean);

  const resultBanner = getResultBanner(match, secondInnings);

  return (
    <div className={styles.summaryOverlay}>
      <div className={styles.summaryCard}>
        <div className={styles.summaryBackground} />

        <header className={styles.summaryHeader}>
          {match.logoUrl ? (
            <img
              src={match.logoUrl}
              alt="Tournament logo"
              className={styles.tournamentLogo}
              loading="eager"
            />
          ) : null}

          <div className={styles.headerContent}>
            <div className={styles.summaryTitle}>
              MATCH SUMMARY
            </div>

            <div className={styles.tournamentBar}>
              {metadata.join(" - ")}
            </div>
          </div>
        </header>

        <div className={styles.inningsList}>
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
        </div>

        <footer className={styles.resultBanner}>
          {resultBanner}
        </footer>
      </div>
    </div>
  );
            }
            
