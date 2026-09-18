"use client";

import { useEffect, useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import styles from "./battingSummary.module.css";

export default function BattingSummary({
  teamName = "TEAM",
  match,
  data = [],
  extras = { total: 0, w: 0, nb: 0, lb: 0 },
  total = "0/0",
  overs = "0",
  onClose,
}) {
  const [isVisible, setIsVisible] = useState(true);

  // AUTO CLOSE
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose && onClose(), 800);
    }, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // DATA
  const finalData = useMemo(() => {
    if (!match?.battingStats) return data;
    return Object.entries(match.battingStats).map(([name, s]) => ({
      name,
      r: s.runs || 0,
      b: s.balls || 0,
      fours: s.fours || 0,
      sixes: s.sixes || 0,
      sr: s.balls > 0 ? ((s.runs / s.balls) * 100).toFixed(1) : "0.0",
      notOut: !s.isOut,
    }));
  }, [match, data]);

  const finalExtras = useMemo(() => {
    if (!match) return extras;
    const inningsKey = `innings${match.innings || 1}`;
    const ex = match.extras?.[inningsKey] || {};
    return {
      total: (ex.wd || 0) + (ex.nb || 0) + (ex.legByes || 0) + (ex.byes || 0),
    };
  }, [match, extras]);

  const finalTotal = match
    ? `${match.totalRuns || 0}/${match.totalWickets || 0}`
    : total;

  const finalOvers = match
    ? `${match.currentOver || 0}.${match.ballsInOver || 0}`
    : overs;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className={styles.overlay}>
          <div className={styles.container}>

            {/* HEADER */}
            <div className={styles.header}>
              {(match?.battingTeam || teamName)} - BATTING SUMMARY
            </div>

            {/* SCORE */}
            <div className={styles.scoreRow}>
              <span>{finalTotal}</span>
              <span>({finalOvers} ov)</span>
            </div>

            {/* TABLE HEADER */}
            <div className={styles.tableHeader}>
              <span>BATTER</span>
              <span>R</span>
              <span>B</span>
              <span>4s</span>
              <span>6s</span>
              <span>SR</span>
            </div>

            {/* ROWS */}
            {finalData.map((p, i) => (
              <div
                key={i}
                className={styles.row}
                style={{ animationDelay: `${0.1 * (i + 1)}s` }}
              >
                <span className={styles.name}>
                  {p.name}{p.notOut ? "*" : ""}
                </span>
                <span>{p.r}</span>
                <span>{p.b}</span>
                <span>{p.fours}</span>
                <span>{p.sixes}</span>
                <span className={styles.sr}>{p.sr}</span>
              </div>
            ))}

            {/* FOOTER */}
<div className={styles.footer}>
  <span>Extras: {finalExtras.total}</span>
  <span>Total: {finalTotal}</span>
</div>
  

          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
