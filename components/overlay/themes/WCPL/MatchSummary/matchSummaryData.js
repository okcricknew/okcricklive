const safeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const normalize = (value) =>
  String(value || "").trim().toLowerCase();

const formatOvers = (legalBalls) => {
  const balls = Math.max(0, safeNumber(legalBalls));

  return `${Math.floor(balls / 6)}.${balls % 6}`;
};

const getCurrentOvers = (match) => {
  const over = safeNumber(match.currentOver);
  const balls = safeNumber(match.ballsInOver);

  // Scoring system mein 6 balls complete hone par
  // currentOver increment hone se pehle summary aa sakti hai.
  if (balls >= 6) {
    return `${over + Math.floor(balls / 6)}.${balls % 6}`;
  }

  return `${over}.${balls}`;
};

const getFirstBattingTeam = (match) => {
  if (match.firstInningsBattingTeam) {
    return match.firstInningsBattingTeam;
  }

  if (match.firstInningsStatsBackup?.teamName) {
    return match.firstInningsStatsBackup.teamName;
  }

  const tossWinner = match.tossWinner;
  const decision = normalize(
    match.tossDecision || match.tossChoice
  );

  if (tossWinner && decision) {
    if (decision === "bat") {
      return tossWinner;
    }

    return normalize(tossWinner) === normalize(match.teamA)
      ? match.teamB
      : match.teamA;
  }

  return match.teamA || match.battingTeam || "TEAM A";
};

const getInningsScore = (match, inningsNumber) => {
  const currentInnings = safeNumber(match.innings || 1);

  if (inningsNumber === 1 && currentInnings >= 2) {
    const backup = match.firstInningsStatsBackup || {};

    return {
      runs: safeNumber(
        backup.totalRuns ?? match.firstInningsScore
      ),
      wickets: safeNumber(
        backup.totalWickets ?? match.firstInningsWickets
      ),
    };
  }

  if (currentInnings === inningsNumber) {
    return {
      runs: safeNumber(match.totalRuns),
      wickets: safeNumber(match.totalWickets),
    };
  }

  return {
    runs: 0,
    wickets: 0,
  };
};

const getInningsOvers = (match, inningsNumber) => {
  const currentInnings = safeNumber(match.innings || 1);

  if (inningsNumber === 1 && currentInnings >= 2) {
    const backup = match.firstInningsStatsBackup || {};

    if (backup.overs !== undefined && backup.overs !== null) {
      return String(backup.overs);
    }

    const firstInningsBalls = (match.ballHistory || []).filter(
      (ball) =>
        Number(ball.innings || 1) === 1 &&
        !["WD", "NB", "PENALTY"].includes(
          String(ball.type || "").toUpperCase()
        )
    ).length;

    return formatOvers(firstInningsBalls);
  }

  if (currentInnings === inningsNumber) {
    return getCurrentOvers(match);
  }

  return "0.0";
};

const getInningsStats = (match, inningsNumber) => {
  const currentInnings = safeNumber(match.innings || 1);

  if (inningsNumber === 1 && currentInnings >= 2) {
    const backup = match.firstInningsStatsBackup || {};

    return {
      batting: backup.batting || {},
      bowling: backup.bowling || {},
      battingPlayers: backup.battingPlayers || [],
    };
  }

  if (currentInnings === inningsNumber) {
    return {
      batting: match.battingStats || {},
      bowling: match.bowlingStats || {},
      battingPlayers: match.battingPlayers || [],
    };
  }

  return {
    batting: {},
    bowling: {},
    battingPlayers: [],
  };
};

const getBatters = (stats, battingPlayers = []) => {
  const entries = Object.entries(stats || {});

  const order = Array.isArray(battingPlayers)
    ? battingPlayers.map(normalize)
    : [];

  return entries
    .filter(([name, player]) => {
      if (!name || !player) return false;

      return (
        safeNumber(player.runs) > 0 ||
        safeNumber(player.balls) > 0 ||
        Boolean(player.isOut) ||
        Boolean(player.retiredHurt)
      );
    })
    .sort(([nameA, playerA], [nameB, playerB]) => {
      const indexA = order.indexOf(normalize(nameA));
      const indexB = order.indexOf(normalize(nameB));

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      return (
        safeNumber(playerB.runs) - safeNumber(playerA.runs) ||
        safeNumber(playerB.balls) - safeNumber(playerA.balls)
      );
    })
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
    .filter(([name, player]) => {
      if (!name || !player) return false;

      return (
        safeNumber(player.wickets) > 0 ||
        safeNumber(player.runs) > 0 ||
        safeNumber(player.balls) > 0 ||
        safeNumber(player.overs) > 0
      );
    })
    .map(([name, player]) => {
      const balls = (match.ballHistory || []).filter((ball) => {
        const sameInnings =
          Number(ball.innings || 1) === inningsNumber;

        const sameBowler =
          normalize(ball.bowler) === normalize(name);

        const legalBall = ![
          "WD",
          "NB",
          "PENALTY",
        ].includes(String(ball.type || "").toUpperCase());

        return sameInnings && sameBowler && legalBall;
      }).length;

      return {
        name: player.name || name,
        wickets: safeNumber(player.wickets),
        runs: safeNumber(player.runs),
        overs: formatOvers(balls),
      };
    })
    .sort(
      (a, b) =>
        b.wickets - a.wickets ||
        a.runs - b.runs
    )
    .slice(0, 4);
};

export const getWcplMatchSummaryData = (match) => {
  if (!match) return null;

  const firstTeam = getFirstBattingTeam(match);

  const secondTeam =
    normalize(firstTeam) === normalize(match.teamA)
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
      batting: getBatters(
        stats.batting,
        stats.battingPlayers
      ),
      bowling: getBowlers(
        stats.bowling,
        match,
        inningsNumber
      ),
    };
  });
};

export const getWcplTeamLogo = (match, teamName) => {
  const defaultLogo = "/themes/OkCrick/default-team.png";

  if (!match || !teamName) {
    return defaultLogo;
  }

  if (normalize(teamName) === normalize(match.teamA)) {
    return (
      match.teamALogoUrl ||
      match.teamAColorDocument?.logoUrl ||
      defaultLogo
    );
  }

  if (normalize(teamName) === normalize(match.teamB)) {
    return (
      match.teamBLogoUrl ||
      match.teamBColorDocument?.logoUrl ||
      defaultLogo
    );
  }

  return defaultLogo;
};
        
