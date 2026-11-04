import styles from "./WCPL.module.css";

export default function LowerThirdLayout({ children }) {
  return <div className={styles.canvas}>{children}</div>;
}
