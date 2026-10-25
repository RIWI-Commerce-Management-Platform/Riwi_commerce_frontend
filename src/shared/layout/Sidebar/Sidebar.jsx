import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GitBranch,
  Calendar,
  Compass,
  Users,
  ClipboardList,
  FileText,
  ShoppingCart,
  BarChart2,
  TrendingUp,
  Settings,
  Target,
  X,
} from "lucide-react";
import { useAuth, ROLES } from "@/features/auth";
import styles from "./Sidebar.module.css";

const MENU_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: [ROLES.ADMIN, ROLES.DIRECTOR_REGIONAL, ROLES.ASESOR],
  },
  {
    to: "/rutas",
    label: "Planeación de rutas",
    icon: GitBranch,
    roles: [ROLES.ADMIN, ROLES.DIRECTOR_REGIONAL, ROLES.ASESOR],
  },
  {
    to: "/visitas",
    label: "Agenda",
    icon: Calendar,
    roles: [ROLES.ASESOR, ROLES.DIRECTOR_REGIONAL, ROLES.ADMIN],
  },
  {
    to: "/mapa",
    label: "Mapa de visitas",
    icon: Compass,
    roles: [ROLES.DIRECTOR_REGIONAL, ROLES.ADMIN],
  },
  {
    to: "/clientes",
    label: "Clientes",
    icon: Users,
    roles: [ROLES.ADMIN, ROLES.DIRECTOR_REGIONAL, ROLES.ASESOR],
  },
  {
    to: "/visitas-gestion",
    label: "Visitas",
    icon: ClipboardList,
    roles: [ROLES.ASESOR, ROLES.DIRECTOR_REGIONAL, ROLES.ADMIN],
  },
  {
    to: "/cotizaciones",
    label: "Cotizaciones",
    icon: FileText,
    roles: [ROLES.ADMIN, ROLES.DIRECTOR_REGIONAL, ROLES.ASESOR],
  },
  {
    to: "/pedidos",
    label: "Pedidos",
    icon: ShoppingCart,
    roles: [ROLES.ADMIN, ROLES.DIRECTOR_REGIONAL, ROLES.ASESOR],
  },
  {
    to: "/indicadores",
    label: "Indicadores",
    icon: BarChart2,
    roles: [ROLES.ADMIN, ROLES.DIRECTOR_REGIONAL],
  },
  {
    to: "/reportes",
    label: "Reportes",
    icon: TrendingUp,
    roles: [ROLES.ADMIN, ROLES.DIRECTOR_REGIONAL],
  },
  {
    to: "/configuracion",
    label: "Configuración",
    icon: Settings,
    roles: [ROLES.ADMIN],
  },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { hasRole } = useAuth();

  const accessibleItems = MENU_ITEMS.filter((item) => hasRole(item.roles));

  return (
    <>
      {/* Backdrop oscuro para móvil cuando el menú está abierto */}
      {isOpen && (
        <div
          className={styles.backdrop}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}
        aria-label="Barra lateral de navegación"
      >
        {/* Cabecera solo visible en móvil para el botón cerrar */}
        <div className={styles.mobileHeader}>
          <span className={styles.mobileTitle}>Menú Comercial</span>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista de navegación con micro-interacciones hover (zoom y desplazamiento) */}
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {accessibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                    }
                  >
                    <Icon className={styles.icon} size={19} />
                    <span className={styles.navLabel}>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Widget inferior: Objetivo Semanal (Idéntico a la imagen de referencia) */}
        <div className={styles.goalWidget}>
          <div className={styles.goalHeader}>
            <div className={styles.targetIconCircle}>
              <Target size={18} />
            </div>
            <div className={styles.goalTitleBlock}>
              <span className={styles.goalLabel}>Objetivo semanal</span>
              <div className={styles.percentRow}>
                <span className={styles.percentValue}>78%</span>
                <span className={styles.percentText}>de cumplimiento</span>
              </div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className={styles.progressBarTrack}>
            <div className={styles.progressBarFill} style={{ width: "78%" }} />
          </div>

          <div className={styles.goalFooter}>
            <span>Meta: 24 visitas</span>
            <span>|</span>
            <span>Completadas: 19</span>
          </div>
        </div>
      </aside>
    </>
  );
}
