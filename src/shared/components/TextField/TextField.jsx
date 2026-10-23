import styles from "./TextField.module.css";

export default function TextField({ id, label, icon, rightSlot, error, ...inputProps }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <div className={styles.control}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          id={id}
          className={`${styles.input} ${error ? styles.invalid : ""}`}
          aria-invalid={Boolean(error)}
          {...inputProps}
        />
        {rightSlot && <span className={styles.right}>{rightSlot}</span>}
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  );
}
