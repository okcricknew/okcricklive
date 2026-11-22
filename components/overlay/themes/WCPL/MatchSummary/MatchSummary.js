"use client";

import styles from "./MatchSummary.module.css";
import { getMatchSummaryData } from "./utils/matchSummaryData";

const DEFAULT_LOGO = "/themes/OkCrick/default-team.png";

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

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
  const emptyPlayer = {
    name: "",
    runs: "",
    balls: "",
    wickets: "",
    overs: "",
  };

  return [
    ...(players || []),
    ...Array(Math.max(0, 4 - (players || []).length)).fill(
      emptyPlayer
    ),
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
  if (!innings) return null;

  return (
    <section className={styles.inningsSection}>
      <div className={styles.teamLogoArea}>
        <img
          src={getTeamLogo(match, innings.team)}
          alt={`${innings.team || "Team"} logo`}
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
              players={innings.battingPlayers}
              type="batting"
            />
          </div>

          <div className={styles.playerColumn}>
            <PlayerRows
              players={innings.bowlingPlayers}
              type="bowling"
            />
          </div>
        </div>
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
    metadata,
  } = summary;

  return (
    <div className={styles.summaryOverlay}>
      <div className={styles.summaryCard}>
        <div className={styles.summaryBackground} />

        <header className={styles.summaryHeader}>
          {match.logoUrl && (
            <img
              src={match.logoUrl}
              alt="Tournament logo"
              className={styles.tournamentLogo}
              loading="eager"
            />
          )}

          <div className={styles.headerContent}>
            <div className={styles.summaryTitle}>
              MATCH SUMMARY
            </div>

            <div className={styles.tournamentBar}>
              {metadata.join(" | ")}
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
          {bannerText}
        </footer>
      </div>
    </div>
  );
}
