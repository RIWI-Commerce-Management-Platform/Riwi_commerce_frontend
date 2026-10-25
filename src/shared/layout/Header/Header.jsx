import { useLocation } from "react-router-dom";
import { Shield, MapPin, Bell } from "lucide-react";
import { useAuth, ROLES } from "@/features/auth";
import styles from "./Header.module.css";

const TITLES = {
  "/dashboard": "Panel de Control y Métricas",
  "/clientes": "Directorio de Clientes",
  "/rutas": "Planeación de Rutas Comerciales",
  "/visitas": "Agenda y Registro de Visitas",
  "/mapa": "Mapa Interactivo de Visitas",
  "/cotizaciones": "Gestión Comercial de Cotizaciones y Pedidos",
  "/asesores": "Administración de Asesores Comerciales",
  "/catalogos": "Catálogos y Parámetros del Sistema",
  "/reportes": "Centro de Reportes y Exportación",
};

export default function Header() {
  const location = useLocation();
  const { user, role, zoneId } = useAuth();

  const title = TITLES[location.pathname] || "Comercial 360";

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h2 className={styles.pageTitle}>{title}</h2>
      </div>

      <div className={styles.right}>
        {/* Badge territorial si el usuario tiene zona asignada */}
        {zoneId && (
          <div className={styles.zoneBadge}>
            <MapPin size={15} className={styles.zoneIcon} />
            <span>Zona {zoneId}</span>
          </div>
        )}

        {/* Badge de Rol */}
        <div className={styles.roleBadge}>
          <Shield size={14} />
          <span>{role}</span>
        </div>

        {/* Notificaciones */}
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Notificaciones"
          title="Notificaciones"
        >
          <Bell size={18} />
          <span className={styles.notificationDot} />
        </button>
      </div>
    </header>
  );
}
