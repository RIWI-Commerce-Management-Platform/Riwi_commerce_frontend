import styles from "./Logo.module.css";

export const LogoMark = ({ height = "1.4em" }) => (
  <svg height={height} viewBox="0 0 64 66" aria-hidden="true">
    <polygon points="0,36 16,36 16,58 0,58" fill="#ff6a00" />
    <polygon points="22,22 40,12 40,60 30,66 22,58" fill="#ff6a00" />
    <polygon points="46,10 62,0 62,52 54,58 46,52" fill="#ff6a00" />
  </svg>
);

export default function Logo() {
  return (
    <div className={styles.logo}>
      <LogoMark />
      <span>Comercial 360</span>
    </div>
  );
}
