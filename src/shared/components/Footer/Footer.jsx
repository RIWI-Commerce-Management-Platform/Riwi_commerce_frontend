import styles from "./Footer.module.css";

export default function Footer({ year = 2024 }) {
  return (
    <footer className={styles.footer}>
      <span>© {year} Comercial 360. Todos los derechos reservados.</span>
      <span className={styles.bar}>|</span>
      <a href="#">Política de privacidad</a>
      <span className={styles.bar}>|</span>
      <a href="#">Términos y condiciones</a>
    </footer>
  );
}
