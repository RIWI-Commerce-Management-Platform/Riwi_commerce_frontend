import styles from "./Divider.module.css";

export default function Divider({ children }) {
  return <p className={styles.divider}>{children}</p>;
}
