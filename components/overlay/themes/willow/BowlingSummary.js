"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import styles from "./bowlingSummary.module.css";

export default function BowlingSummary({
  teamName = "TEAM",
  data = [],
  onClose,
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose && onClose(), 800);
    }, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className={styles.overlay}>
          <div className={styles.container}>
            
            {/* HEADER - Left/Right Split */}
            <div className={styles.header}>
              <span>{teamName}</span>
              <span>BOWLING SUMMARY</span>
            </div>

            {/* TABLE HEADER */}
            <div className={styles.tableHeader}>
              <span>BOWLER</span>
              <span>O</span>
              <span>M</span>
              <span>R</span>
              <span>W</span>
              <span>ECO</span>
            </div>

            {/* ROWS */}
            <div>
              {data.map((b, i) => (
                <div 
                  key={i} 
                  className={styles.row}
                  style={{ animationDelay: `${0.1 * (i + 1)}s` }}
                >
                  <span className={styles.name}>{b.name}</span>
                  <span>{b.o}</span>
                  <span>{b.m}</span>
                  <span>{b.r}</span>
                  <span>{b.w}</span>
                  <span className={styles.eco}>{b.eco}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
