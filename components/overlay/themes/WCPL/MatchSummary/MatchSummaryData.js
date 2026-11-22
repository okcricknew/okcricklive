
import {
  getInningsData,
  getTopBatters,
} from "../../../../utils/matchSummaryHelpers";

const normalize = (value) =>
  String(value || "").trim().toLowerCase();

function getTopBowlersForInnings(match, bowlingStats, inningsNumber) {
  return Object.entries(bowlingStats || {})
    .filter(([, stats]) =>
      Number(stats.wickets || 0) > 0 ||
      Number(stats.runs || 0) > 0 ||
      Number(stats.balls || 0) > 0 ||
      Number(stats.overs || 0) > 0
    )
    .sort((a, b) =>
      Number(b[1].wickets || 0) -
        Number(a[1].wickets || 0) ||
      Number(a[1].runs || 0) -
        Number(b[1].runs || 0)
    )
    .slice(0, 4)
    .map(([name, stats]) => {
      const legalBalls = (match.ballHistory || []).filter(
        (ball) => {
          const sameBowler =
            normalize(ball.bowler) === normalize(name);

          const sameInnings =
            Number(ball.innings) === Number(inningsNumber);

          const ballType = String(ball.type || "").toUpperCase();

          const isLegal =
            !["WD", "NB"].includes(ballType);

          return sameBowler && sameInnings && isLegal;
        }
      ).length;

      const overs = Math.floor(legalBalls / 6);
      const balls = legalBalls % 6;

      return {
        name,
        wickets: stats.wickets || 0,
        runs: stats.runs || 0,
        overs: balls === 0
          ? String(overs)
          : `${overs}.${balls}`,
      };
    });
}

function getInningsSummary(match, inningsNumber) {
  const innings = getInningsData(match, inningsNumber);

  return {
    ...innings,
    battingPlayers: getTopBatters(innings.batting),
    bowlingPlayers: getTopBowlersForInnings(
      match,
      innings.bowling,
      inningsNumber
    ),
  };
}

function getBannerText(match, secondInnings) {
  if (match.status === "completed") {
    return match.resultSummary || "MATCH COMPLETED";
  }

  if (Number(match.innings || 1) === 1) {
    return (
      `${match.tossWinner || ""} WON THE TOSS & ELECTED TO ` +
      `${String(match.tossDecision || "").toUpperCase()} FIRST`
    ).trim();
  }

  if (Number(match.innings) === 2) {
    const runsNeeded = Math.max(
      0,
      Number(match.target || 0) -
        Number(secondInnings.runs || 0)
    );

    const oversText = String(secondInnings.overs || "0");
    const [over, ball] = oversText.split(".");

    const ballsPlayed =
      Number.parseInt(over || "0", 10) * 6 +
      Number.parseInt(ball || "0", 10);

    const totalBalls = Number(match.overs || 0) * 6;

    const ballsLeft = Math.max(
      0,
      totalBalls - ballsPlayed
    );

    return (
      `${secondInnings.team} NEED ${runsNeeded} RUNS FROM ${ballsLeft} BALLS`
    );
  }

  return "MATCH IN PROGRESS";
}

export function getMatchSummaryData(match) {
  if (!match) return null;

  const firstInnings = getInningsSummary(match, 1);
  const secondInnings = getInningsSummary(match, 2);

  return {
    firstInnings,
    secondInnings,
    bannerText: getBannerText(match, secondInnings),
    metadata: [
      match.tournamentName,
      match.matchNo ?? match.matchNumber
        ? `MATCH ${match.matchNo ?? match.matchNumber}`
        : null,
      match.venue,
    ].filter(Boolean),
  };
}
