"use client";

export default function OverBall({ value, styles = {} }) {

  const val = String(value).trim();

  let type = "";

  if (val === "W") {
    type = styles.wicket || "";
  }
  else if (val === "4") {
    type = styles.four || "";
  }
  else if (val === "6") {
    type = styles.six || "";
  }
  else if (val.includes("WD")) {
    type = styles.wide || "";
  }
  else if (val.includes("NB")) {
    type = styles.noBall || "";
  }

  else if (val.includes("LB")) {
  type = styles.lb || "";
}
else if (val.includes("B")) {
  type = styles.bye || "";
}

  return (
    <div className={`${styles.ball || ""} ${type}`}>
      {value}
    </div>
  );
}
