const safeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatOvers = (balls) => {
  const legalBalls = Math.max(0, safeNumber(balls));
  return `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
};

const getInningsOvers = (match, inningsNumber) => {
  if (inningsNumber === 1 && match.innings >= 2) {
    const backup = match.firstInningsStatsBackup || {};
    if (backup.overs !== undefined && backup.overs !== null) {
      return String(backup.overs);
    }
  }

  if (Number(match.innings || 1) === inningsNumber) {
    return formatOvers(
      safeNumber(match.currentOver) * 6 +
      safeNumber(match.ballsInOver)
    );
  }

  return "0.0";
};

const getInningsScore = (match, inningsNumber) => {
  if (inningsNumber === 1 && Number(match.innings) >= 2) {
    return {
      runs: safeNumber(
        match.firstInningsStatsBackup?.totalRuns ??
        match.firstInningsScore
      ),
      wickets: safeNumber(
        match.firstInningsStatsBackup?.totalWickets ??
        match.firstInningsWickets
      ),
    };
  }

  if (Number(match.innings || 1) === inningsNumber) {
    return {
      runs: safeNumber(match.totalRuns),
      wickets: safeNumber(match.totalWickets),
    };
  }

  return { runs: 0, wickets: 0 };
};

const getInningsStats = (match, inningsNumber) => {
  if (inningsNumber === 1 && Number(match.innings) >= 2) {
    const backup = match.firstInningsStatsBackup || {};

    return {
      batting: backup.batting || {},
      bowling: backup.bowling || {},
    };
  }

  if (Number(match.innings || 1) === inningsNumber) {
    return {
      batting: match.battingStats || {},
      bowling: match.bowlingStats || {},
    };
  }

  return { batting: {}, bowling: {} };
};

const getBatters = (stats) => {
  return Object.entries(stats || {})
    .filter(([name, player]) =>
      name && player && (
        safeNumber(player.runs) > 0 ||
        safeNumber(player.balls) > 0 ||
        player.isOut
      )
    )
    .sort((a, b) =>
      safeNumber(b[1].runs) - safeNumber(a[1].runs) ||
      safeNumber(b[1].balls) - safeNumber(a[1].balls)
    )
    .slice(0, 4)
    .map(([name, player]) => ({
      name: player.name || name,
      runs: safeNumber(player.runs),
      balls: safeNumber(player.balls),
      notOut: !player.isOut,
    }));
};

const getBowlers = (stats, match, inningsNumber) => {
  return Object.entries(stats || {})
    .filter(([name, player]) =>
      name && player && (
        safeNumber(player.wickets) > 0 ||
        safeNumber(player.runs) > 0 ||
        safeNumber(player.balls) > 0 ||
        safeNumber(player.overs) > 0
      )
    )
    .map(([name, player]) => {
      const balls = (match.ballHistory || []).filter((ball) =>
        Number(ball.innings || 1) === inningsNumber &&
        String(ball.bowler || "").trim().toLowerCase() ===
          name.trim().toLowerCase() &&
        !["WD", "NB", "PENALTY"].includes(
          String(ball.type || "").toUpperCase()
        )
      ).length;

      return {
        name: player.name || name,
        wickets: safeNumber(player.wickets),
        runs: safeNumber(player.runs),
        overs: formatOvers(balls),
        balls,
      };
    })
    .sort((a, b) =>
      b.wickets - a.wickets ||
      a.runs - b.runs
    )
    .slice(0, 4);
};

const getFirstBattingTeam = (match) => {
  if (match.firstInningsBattingTeam) {
    return match.firstInningsBattingTeam;
  }

  if (match.firstInningsStatsBackup?.teamName) {
    return match.firstInningsStatsBackup.teamName;
  }

  const tossWinner = match.tossWinner;
  const decision = String(
    match.tossDecision || match.tossChoice || ""
  ).toLowerCase();

  if (tossWinner && decision) {
    return decision === "bat"
      ? tossWinner
      : tossWinner === match.teamA
        ? match.teamB
        : match.teamA;
  }

  return match.teamA || match.battingTeam || "TEAM A";
};

export const getWcplMatchSummaryData = (match) => {
  if (!match) return null;

  const firstTeam = getFirstBattingTeam(match);

  const secondTeam =
    firstTeam === match.teamA
      ? match.teamB
      : match.teamA;

  const teams = [firstTeam, secondTeam];

  return [1, 2].map((inningsNumber) => {
    const score = getInningsScore(match, inningsNumber);
    const stats = getInningsStats(match, inningsNumber);

    return {
      inningsNumber,
      team: teams[inningsNumber - 1] || "TEAM",
      runs: score.runs,
      wickets: score.wickets,
      overs: getInningsOvers(match, inningsNumber),
      batting: getBatters(stats.batting),
      bowling: getBowlers(
        stats.bowling,
        match,
        inningsNumber
      ),
    };
  });
};

export const getWcplTeamLogo = (match, teamName) => {
  if (!match || !teamName) return "/themes/OkCrick/default-team.png";

  const normalize = (value) =>
    String(value || "").trim().toLowerCase();

  if (normalize(teamName) === normalize(match.teamA)) {
    return (
      match.teamALogoUrl ||
      match.teamAColorDocument?.logoUrl ||
      "/themes/OkCrick/default-team.png"
    );
  }

  if (normalize(teamName) === normalize(match.teamB)) {
    return (
      match.teamBLogoUrl ||
      match.teamBColorDocument?.logoUrl ||
      "/themes/OkCrick/default-team.png"
    );
  }

  return "/themes/OkCrick/default-team.png";
};
