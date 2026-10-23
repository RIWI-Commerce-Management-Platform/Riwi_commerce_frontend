import styles from "./Button.module.css";

export default function Button({ children, loading = false, disabled, ...rest }) {
  return (
    <button className={styles.button} disabled={disabled || loading} {...rest}>
      {loading ? "Procesando..." : children}
    </button>
  );
}
