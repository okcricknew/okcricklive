import styles from "./WCPL.module.css";

export default function LowerThirdLayout({ children, animate = false }) {
  return (
    <div
      className={`${styles.canvas} ${
        animate ? styles.lowerThirdAnimation : ""
      }`}
    >
      {children}
    </div>
  );
}
