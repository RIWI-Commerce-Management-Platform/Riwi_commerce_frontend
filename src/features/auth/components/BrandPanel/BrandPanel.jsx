import Logo from "@/shared/components/Logo/Logo";
import HeroIllustration from "./HeroIllustration";
import FeatureList from "./FeatureList";
import styles from "./BrandPanel.module.css";

export default function BrandPanel() {
  return (
    <aside className={styles.panel}>
      <Logo />
      <div className={styles.rule} />
      <h2 className={styles.title}>Plataforma de Gestión Comercial</h2>
      <p className={styles.text}>
        Administra tus rutas, visitas y clientes de manera eficiente y en tiempo real.
      </p>

      <div className={styles.hero}><HeroIllustration /></div>

      <FeatureList />
    </aside>
  );
}
