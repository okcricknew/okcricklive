export const getBowlingSummaryData = (match) => {
  const bowling = match?.bowlingStats || {};

  const data = Object.keys(bowling).map((name) => {
    const b = bowling[name];

    const balls =
  (match?.ballHistory || []).filter(
    (ball) =>
      ball.bowler === name &&
      !["WD", "NB"].includes(ball.type)
  ).length;
    const overs = Math.floor(balls / 6);
    const remBalls = balls % 6;

    const o = `${overs}.${remBalls}`;

    const runs = (match?.ballHistory || []).reduce((total, ball) => {
  if (ball.bowler !== name) return total;

  const isBye = ["BYE", "LB"].includes(ball.type);

  if (ball.type === "WD" || ball.type === "NB") {
    return total + ((ball.runs || 0) + 1);
  }

  if (!isBye) {
    return total + (ball.runs || 0);
  }

  return total;
}, 0);

    const eco =
      balls > 0 ? ((runs / balls) * 6).toFixed(1) : "0.0";

    return {
      name,
      o,
      m: b.maidens || 0,
      r: runs,
      w: b.wickets || 0,
      eco,
    };
  });

  return {
    teamName: match?.bowlingTeam || "TEAM",
    data,
  };
};
