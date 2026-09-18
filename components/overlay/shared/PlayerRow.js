"use client";

export default function PlayerRow({
  name,
  runs,
  balls,
  styles
}) {

  return (
    <div className={styles.playerRow}>

      <span className={styles.playerName}>
        {name}
      </span>

      <span className={styles.playerScore}>
        {runs}({balls})
      </span>

    </div>
  );

}
