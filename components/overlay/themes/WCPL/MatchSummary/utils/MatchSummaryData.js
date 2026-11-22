const getLegalBalls = (match, inningsNum, playerName, playerStats = {}) => {
  const history = Array.isArray(match?.ballHistory)
    ? match.ballHistory
    : [];

  return history.filter((ball) => {
    const ballInnings = Number(ball.innings || 1);

    const sameInnings = ballInnings === Number(inningsNum);

    const sameBowler =
      (ball.bowlerId &&
        playerStats.playerId &&
        ball.bowlerId === playerStats.playerId) ||
      (String(ball.bowler || "").trim().toLowerCase() ===
        String(playerName || "").trim().toLowerCase());

    const isLegal = !["WD", "NB", "PENALTY", "MANUAL_SCORE_OVERRIDE"].includes(
      ball.type
    );

    return sameInnings && sameBowler && isLegal;
  }).length;
};

const formatOvers = (legalBalls) => {
  const balls = Number(legalBalls || 0);
  return `${Math.floor(balls / 6)}.${balls % 6}`;
};

const getTopBatters = (battingStats = {}) => {
  return Object.entries(battingStats || {})
    .filter(([, stats]) => stats && typeof stats === "object")
    .sort(
      (a, b) =>
        Number(b[1].runs || 0) - Number(a[1].runs || 0)
    )
    .slice(0, 5)
    .map(([name, stats]) => ({
      name,
      runs: Number(stats.runs || 0),
      balls: Number(stats.balls || 0),
    }));
};

const getTopBowlers = (bowlingStats = {}, match = {}, inningsNum = 1) => {
  return Object.entries(bowlingStats || {})
    .filter(([, stats]) => stats && typeof stats === "object")
    .filter(([, stats]) =>
      Number(stats.wickets || 0) > 0 ||
      Number(stats.runs || 0) > 0 ||
      Number(stats.balls || 0) > 0 ||
      Number(stats.overs || 0) > 0
    )
    .sort(
      (a, b) =>
        Number(b[1].wickets || 0) - Number(a[1].wickets || 0) ||
        Number(a[1].runs || 0) - Number(b[1].runs || 0)
    )
    .slice(0, 5)
    .map(([name, stats]) => {
      const legalBalls = getLegalBalls(
        match,
        inningsNum,
        name,
        stats
      );

      return {
        name,
        wickets: Number(stats.wickets || 0),
        runs: Number(stats.runs || 0),
        overs: formatOvers(legalBalls),
      };
    });
};

const getInningsData = (match, inningsNum) => {
  const currentInnings = Number(match?.innings || 1);
  const requestedInnings = Number(inningsNum);

  const firstInningsBackup = match?.firstInningsStatsBackup || {};
  const isFirstInnings = requestedInnings === 1;
  const isCurrentInnings = requestedInnings === currentInnings;

  const firstBattingTeam =
    match?.firstInningsBattingTeam ||
    (currentInnings === 1
      ? match?.battingTeam
      : match?.battingTeam === match?.teamA
        ? match?.teamB
        : match?.teamA) ||
    match?.teamA ||
    "";

  const secondBattingTeam =
    firstBattingTeam === match?.teamA
      ? match?.teamB
      : match?.teamA;

  const stats = isFirstInnings
    ? currentInnings === 1
      ? {
          batting: match?.battingStats || {},
          bowling: match?.bowlingStats || {},
        }
      : {
          batting: firstInningsBackup.batting || {},
          bowling: firstInningsBackup.bowling || {},
        }
    : currentInnings >= 2
      ? {
          batting: match?.battingStats || {},
          bowling: match?.bowlingStats || {},
        }
      : {
          batting: {},
          bowling: {},
        };

  let runs = 0;
  let wickets = 0;
  let overs = "0.0";

  if (isFirstInnings) {
    if (currentInnings === 1) {
      runs = Number(match?.totalRuns || 0);
      wickets = Number(match?.totalWickets || 0);
      overs = `${Number(match?.currentOver || 0)}.${Number(
        match?.ballsInOver || 0
      )}`;
    } else {
      runs = Number(
        firstInningsBackup.totalRuns ?? match?.firstInningsScore ?? 0
      );
      wickets = Number(
        firstInningsBackup.totalWickets ?? match?.firstInningsWickets ?? 0
      );
      overs = firstInningsBackup.overs || "0.0";
    }
  } else if (currentInnings >= 2) {
    runs = Number(match?.totalRuns || 0);
    wickets = Number(match?.totalWickets || 0);
    overs = `${Number(match?.currentOver || 0)}.${Number(
      match?.ballsInOver || 0
    )}`;
  }

  const team = isFirstInnings ? firstBattingTeam : secondBattingTeam;

  return {
    team,
    runs,
    wickets,
    overs,
    battingPlayers: getTopBatters(stats.batting),
    bowlingPlayers: getTopBowlers(
      stats.bowling,
      match,
      requestedInnings
    ),
  };
};

export const getMatchSummaryData = (match) => {
  if (!match) {
    return {
      firstInnings: null,
      secondInnings: null,
      bannerText: "",
      metadata: {},
    };
  }

  const firstInnings = getInningsData(match, 1);
  const secondInnings = getInningsData(match, 2);

  let bannerText = "";

  if (match.status === "completed" || match.matchStatus === "completed") {
    bannerText =
      match.resultSummary ||
      match.result ||
      match.winner ||
      "MATCH COMPLETED";
  } else if (Number(match.innings || 1) === 1) {
    const decision = String(match.tossDecision || "bat").toUpperCase();
    bannerText = match.tossWinner
      ? `${match.tossWinner} WON THE TOSS & ELECTED TO ${decision} FIRST`
      : "MATCH IN PROGRESS";
  } else {
    const target = Number(
      match.target || firstInnings.runs + 1
    );
    const runsNeeded = Math.max(0, target - secondInnings.runs);

    const [overs, balls] = String(secondInnings.overs || "0.0")
      .split(".")
      .map(Number);

    const ballsPlayed = (overs || 0) * 6 + (balls || 0);
    const totalBalls = Number(match.overs || 0) * 6;
    const ballsLeft = Math.max(0, totalBalls - ballsPlayed);

    bannerText = `${secondInnings.team} NEED ${runsNeeded} RUNS FROM ${ballsLeft} BALLS`;
  }

  return {
    firstInnings,
    secondInnings,
    bannerText,
    metadata: {
      tournamentName: match.tournamentName || match.tournament || "",
      matchName:
        match.matchOrderSummary ||
        `MATCH ${match.matchNo || 1}`,
      venue: match.venue || "",
      logoUrl: match.logoUrl || "",
    },
  };
};
                                                    
