import styles from "./KpiCard.module.css";

export default function KpiCard({ label, value, hint }) {
  return (
    <article className={styles.card}>
      <h3 className={styles.label}>{label}</h3>
      <p className={styles.value}>{value}</p>
      {hint && <p className={styles.hint}>{hint}</p>}
    </article>
  );
}
