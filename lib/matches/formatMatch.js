// lib/matches/formatMatch.js

export function getMatchTime(match) {
  const value = match?.createdAt;

  if (typeof value === "string") {
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? 0 : time;
  }

  if (value?.seconds) return value.seconds * 1000;
  if (typeof value?.toMillis === "function") return value.toMillis();

  return 0;
}

export function getTeamScore(match, teamName) {
  const currentScore = {
    runs: Number(match.totalRuns || 0),
    wickets: Number(match.totalWickets || 0),
  };

  const innings = Number(match.innings || 1);
  const currentBattingTeam = match.battingTeam || "";
  const firstBattingTeam =
    match.firstInningsBattingTeam || currentBattingTeam;

  if (innings >= 2) {
    if (teamName === firstBattingTeam) {
      return {
        runs: Number(match.firstInningsScore || 0),
        wickets: Number(match.firstInningsWickets || 0),
      };
    }

    if (teamName === currentBattingTeam) {
      return currentScore;
    }
  } else if (teamName === currentBattingTeam) {
    return currentScore;
  }

  return { runs: 0, wickets: 0 };
}

export function getTeamOvers(match, teamName) {
  const currentBattingTeam = match.battingTeam || "";
  const firstBattingTeam =
    match.firstInningsBattingTeam || currentBattingTeam;

  if (
    Number(match.innings || 1) >= 2 &&
    teamName === firstBattingTeam
  ) {
    if (match.firstInningsOvers != null) {
      return String(match.firstInningsOvers);
    }

    return null;
  }

  if (teamName === currentBattingTeam) {
    return `${Number(match.currentOver || 0)}.${Number(
      match.ballsInOver || 0
    )}`;
  }

  return null;
}
