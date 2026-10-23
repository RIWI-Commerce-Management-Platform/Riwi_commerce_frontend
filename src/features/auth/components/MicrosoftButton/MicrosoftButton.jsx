import styles from "./MicrosoftButton.module.css";

const MsLogo = () => (
  <svg width="100%" height="100%" viewBox="0 0 38 38" aria-hidden="true">
    <rect x="0" y="0" width="18" height="18" fill="#f25022" />
    <rect x="20" y="0" width="18" height="18" fill="#7fba00" />
    <rect x="0" y="20" width="18" height="18" fill="#00a4ef" />
    <rect x="20" y="20" width="18" height="18" fill="#ffb900" />
  </svg>
);

export default function MicrosoftButton({ onClick }) {
  return (
    <button type="button" className={styles.button} onClick={onClick}>
      <span className={styles.logo}><MsLogo /></span>
      <span>
        <span className={styles.title}>Iniciar sesión con Microsoft</span>
        <span className={styles.subtitle}>Usa tu cuenta corporativa de Microsoft 365</span>
      </span>
    </button>
  );
}
