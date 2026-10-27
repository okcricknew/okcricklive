// lib/matches/formatMatch.js

// Match detail page ke same legal-ball calculation ka use karein.
export function formatOversDisplay(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const text = String(value).trim();
  if (!text) return null;

  const match = text.match(/^(\d+)(?:\.(\d+))?$/);

  if (!match) {
    return text.replace(/\.0$/, "");
  }

  const overs = Number(match[1]);
  const balls = match[2] === undefined ? 0 : Number(match[2]);

  if (balls === 0) {
    return String(overs);
  }

  return `${overs}.${balls}`;
}

export function getMatchTime(match) {
  const value = match?.createdAt;

  if (typeof value === "string") {
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? 0 : time;
  }

  if (typeof value?.toMillis === "function") {
    return value.toMillis();
  }

  if (typeof value?.seconds === "number") {
    return value.seconds * 1000;
  }

  if (typeof value?._seconds === "number") {
    return value._seconds * 1000;
  }

  return 0;
}

function getFirstBattingTeam(match) {
  if (match.firstInningsBattingTeam) {
    return match.firstInningsBattingTeam;
  }

  if (!match.tossWinner || !match.tossDecision) {
    return match.battingTeam || "";
  }

  return match.tossDecision === "bat"
    ? match.tossWinner
    : match.tossWinner === match.teamA
      ? match.teamB
      : match.teamA;
}

function getLegalBalls(match, inningsNumber) {
  return (match.ballHistory || []).filter((ball) => {
    return (
      Number(ball.innings) === inningsNumber &&
      !["WD", "NB"].includes(
        String(ball.type || "").toUpperCase()
      )
    );
  }).length;
}

function getOversFromHistory(match, inningsNumber) {
  const legalBalls = getLegalBalls(match, inningsNumber);
  const overs = Math.floor(legalBalls / 6);
  const balls = legalBalls % 6;

  return formatOversDisplay(`${overs}.${balls}`);
}

function isMatchReady(match) {
  return Boolean(
    match.status &&
    match.status !== "upcoming" &&
    match.tossCompleted
  );
}

export function getTeamScore(match, teamName) {
  if (!isMatchReady(match)) {
    return { runs: 0, wickets: 0 };
  }

  const innings = Number(match.innings || 1);
  const firstBattingTeam = getFirstBattingTeam(match);
  const currentBattingTeam = match.battingTeam || "";

  if (teamName === firstBattingTeam) {
    if (innings === 1) {
      return {
        runs: Number(match.totalRuns || 0),
        wickets: Number(match.totalWickets || 0),
      };
    }

    return {
      runs: Number(match.firstInningsScore || 0),
      wickets: Number(match.firstInningsWickets || 0),
    };
  }

  if (teamName !== firstBattingTeam && innings >= 2) {
    return {
      runs: Number(match.totalRuns || 0),
      wickets: Number(match.totalWickets || 0),
    };
  }

  if (teamName === currentBattingTeam && innings === 1) {
    return {
      runs: Number(match.totalRuns || 0),
      wickets: Number(match.totalWickets || 0),
    };
  }

  return { runs: 0, wickets: 0 };
}

export function getTeamOvers(match, teamName) {
  if (!isMatchReady(match)) {
    return "0";
  }

  const innings = Number(match.innings || 1);
  const firstBattingTeam = getFirstBattingTeam(match);

  if (teamName === firstBattingTeam) {
    return getOversFromHistory(match, 1);
  }

  if (innings >= 2) {
    return getOversFromHistory(match, 2);
  }

  return "0";
}
