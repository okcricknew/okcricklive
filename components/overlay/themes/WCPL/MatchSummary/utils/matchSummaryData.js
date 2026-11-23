const DEFAULT_INNINGS = 1;
const PLAYER_LIMIT = 4;

const normalizeName = (value) =>
  String(value || "").trim().toLowerCase();

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatOvers = (over, balls) => {
  let completedOvers = toNumber(over);
  let completedBalls = toNumber(balls);

  if (completedBalls >= 6) {
    completedOvers += Math.floor(completedBalls / 6);
    completedBalls %= 6;
  }

  return `${completedOvers}.${completedBalls}`;
};

// Existing first batting team selection logic preserved.
const getFirstBattingTeam = (match) => {
  if (match.firstInningsBattingTeam) {
    return match.firstInningsBattingTeam;
  }

  if (String(match.tossDecision || "").toLowerCase() === "bat") {
    return match.tossWinner || match.teamA || "";
  }

  if (match.tossWinner) {
    return match.tossWinner === match.teamA
      ? match.teamB || ""
      : match.teamA || "";
  }

  if (Number(match.innings || DEFAULT_INNINGS) >= 2) {
    return match.battingTeam === match.teamA
      ? match.teamB || ""
      : match.teamA || "";
  }

  return match.battingTeam || match.teamA || "";
};

const getTopBatters = (battingStats = {}) => {
  return Object.entries(battingStats || {})
    .filter(([, stats]) => stats && typeof stats === "object")
    .sort(
      (a, b) =>
        toNumber(b[1].runs) - toNumber(a[1].runs)
    )
    .slice(0, PLAYER_LIMIT)
    .map(([name, stats]) => ({
      name,
      runs: toNumber(stats.runs),
      balls: toNumber(stats.balls),
    }));
};

// Existing ball history filtering preserved.
const getBowlerLegalBalls = (
  match,
  inningsNumber,
  bowlerName
) => {
  const history = Array.isArray(match.ballHistory)
    ? match.ballHistory
    : [];

  const targetBowler = normalizeName(bowlerName);

  return history.filter((ball) => {
    const ballInnings = toNumber(
      ball.innings || DEFAULT_INNINGS
    );

    const sameInnings = ballInnings === inningsNumber;

    const sameBowler =
      normalizeName(ball.bowler) === targetBowler;

    const isLegalDelivery = ![
      "WD",
      "NB",
      "PENALTY",
    ].includes(String(ball.type || "").toUpperCase());

    return sameInnings && sameBowler && isLegalDelivery;
  }).length;
};

const formatLegalBalls = (legalBalls) => {
  const balls = toNumber(legalBalls);

  return `${Math.floor(balls / 6)}.${balls % 6}`;
};

const getTopBowlers = (
  bowlingStats = {},
  match,
  inningsNumber
) => {
  return Object.entries(bowlingStats || {})
    .filter(([, stats]) => stats && typeof stats === "object")
    .filter(([, stats]) =>
      toNumber(stats.wickets) > 0 ||
      toNumber(stats.runs) > 0 ||
      toNumber(stats.balls) > 0 ||
      toNumber(stats.overs) > 0
    )
    .sort(
      (a, b) =>
        toNumber(b[1].wickets) - toNumber(a[1].wickets) ||
        toNumber(a[1].runs) - toNumber(b[1].runs)
    )
    .slice(0, PLAYER_LIMIT)
    .map(([name, stats]) => {
      const legalBalls = getBowlerLegalBalls(
        match,
        inningsNumber,
        name
      );

      return {
        name,
        wickets: toNumber(stats.wickets),
        runs: toNumber(stats.runs),
        overs: formatLegalBalls(legalBalls),
      };
    });
};

const getInningsData = (match, inningsNumber) => {
  const currentInnings = toNumber(
    match.innings || DEFAULT_INNINGS
  );

  const firstInnings = inningsNumber === 1;

  const firstInningsBackup =
    match.firstInningsStatsBackup || {};

  const firstBattingTeam = getFirstBattingTeam(match);

  const secondBattingTeam =
    firstBattingTeam === match.teamA
      ? match.teamB || ""
      : match.teamA || "";

  let battingStats = {};
  let bowlingStats = {};
  let runs = 0;
  let wickets = 0;
  let overs = "0.0";

  if (firstInnings) {
    if (currentInnings === 1) {
      battingStats = match.battingStats || {};
      bowlingStats = match.bowlingStats || {};

      runs = toNumber(match.totalRuns);
      wickets = toNumber(match.totalWickets);

      overs = formatOvers(
        match.currentOver,
        match.ballsInOver
      );
    } else {
      battingStats = firstInningsBackup.batting || {};
      bowlingStats = firstInningsBackup.bowling || {};

      runs = toNumber(
        firstInningsBackup.totalRuns ??
        match.firstInningsScore
      );

      wickets = toNumber(
        firstInningsBackup.totalWickets ??
        match.firstInningsWickets
      );

      overs =
        firstInningsBackup.overs ||
        formatOvers(
          firstInningsBackup.currentOver,
          firstInningsBackup.ballsInOver
        );
    }
  } else if (currentInnings >= 2) {
    battingStats = match.battingStats || {};
    bowlingStats = match.bowlingStats || {};

    runs = toNumber(match.totalRuns);
    wickets = toNumber(match.totalWickets);

    overs = formatOvers(
      match.currentOver,
      match.ballsInOver
    );
  }

  return {
    team: firstInnings
      ? firstBattingTeam
      : secondBattingTeam,

    runs,
    wickets,
    overs,

    battingPlayers: getTopBatters(battingStats),

    bowlingPlayers: getTopBowlers(
      bowlingStats,
      match,
      inningsNumber
    ),
  };
};

/* =========================================
   MATCH STATUS BANNER
========================================= */

const getResultBanner = (
  match,
  firstInnings,
  secondInnings
) => {

  // 1. MATCH COMPLETED
  // Use the actual result saved by existing scoring logic.
  if (match.status === "completed") {
    return (
      match.resultSummary ||
      (match.winner
        ? `${match.winner} WON`
        : "MATCH COMPLETED")
    );
  }

  const currentInnings = toNumber(
    match.innings || DEFAULT_INNINGS
  );

  // 2. TOSS COMPLETED
  if (currentInnings === 1) {

    if (match.tossCompleted === true && match.tossWinner) {

      const decision = String(
        match.tossDecision || ""
      ).trim().toLowerCase();

      if (decision === "bat" || decision === "bowl") {
        return (
          `${match.tossWinner} WON THE TOSS ` +
          `& ELECTED TO ${decision.toUpperCase()}`
        );
      }
    }

    return "MATCH IN PROGRESS";
  }

  // 3. SECOND INNINGS - REQUIRED RUNS
  if (currentInnings === 2) {

    const target = toNumber(
      match.target || firstInnings.runs + 1
    );

    const runsNeeded = Math.max(
      0,
      target - secondInnings.runs
    );

    const [overs, balls] = String(
      secondInnings.overs || "0.0"
    )
      .split(".")
      .map(toNumber);

    const ballsPlayed = overs * 6 + balls;

    const totalBalls = toNumber(match.overs) * 6;

    const ballsLeft = Math.max(
      0,
      totalBalls - ballsPlayed
    );

    return (
      `${secondInnings.team} NEED ${runsNeeded} ` +
      `RUNS FROM ${ballsLeft} BALLS`
    );
  }

  return "MATCH IN PROGRESS";
};

/* =========================================
   MAIN MATCH SUMMARY DATA
========================================= */

export const getMatchSummaryData = (match) => {
  if (!match) {
    return {
      firstInnings: null,
      secondInnings: null,
      bannerText: "",
      metadata: {
        tournamentName: "",
        matchName: "",
        venue: "",
        logoUrl: "",
      },
    };
  }

  const firstInnings = getInningsData(match, 1);
  const secondInnings = getInningsData(match, 2);

  return {
    firstInnings,
    secondInnings,

    bannerText: getResultBanner(
      match,
      firstInnings,
      secondInnings
    ),

    metadata: {
      tournamentName:
        match.tournamentName ||
        match.tournament ||
        "",

      matchName:
        match.matchOrderSummary ||
        (match.matchNo
          ? `MATCH ${match.matchNo}`
          : ""),

      venue: match.venue || "",

      logoUrl: match.logoUrl || "",
    },
  };
};
  
