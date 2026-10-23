import { PinIcon, UsersIcon, ChartIcon, ShieldIcon } from "@/shared/components/icons";
import styles from "./FeatureList.module.css";

const FEATURES = [
  { title: "Rutas", sub: "Optimizadas", Icon: PinIcon },
  { title: "Clientes", sub: "Gestionados", Icon: UsersIcon },
  { title: "Resultados", sub: "en tiempo real", Icon: ChartIcon },
  { title: "Información", sub: "segura", Icon: ShieldIcon },
];

export default function FeatureList() {
  return (
    <ul className={styles.list}>
      {FEATURES.map(({ title, sub, Icon }) => (
        <li key={title} className={styles.item}>
          <span className={styles.circle}><Icon size="50%" stroke="#ff6a00" /></span>
          {title}<br />{sub}
        </li>
      ))}
    </ul>
  );
}
