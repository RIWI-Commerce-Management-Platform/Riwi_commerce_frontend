import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Calendar,
  Navigation,
  FileText,
  UserCheck,
  Layers,
  BarChart3,
  LogOut,
  ChevronRight,
} from "lucide-react";
import Logo from "@/shared/components/Logo/Logo";
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
    to: "/clientes",
    label: "Clientes",
    icon: Users,
    roles: [ROLES.ADMIN, ROLES.DIRECTOR_REGIONAL, ROLES.ASESOR],
  },
  {
    to: "/rutas",
    label: "Planeación de Rutas",
    icon: MapPin,
    roles: [ROLES.ADMIN, ROLES.DIRECTOR_REGIONAL],
  },
  {
    to: "/visitas",
    label: "Agenda de Visitas",
    icon: Calendar,
    roles: [ROLES.ASESOR, ROLES.DIRECTOR_REGIONAL, ROLES.ADMIN],
  },
  {
    to: "/mapa",
    label: "Mapa de Visitas",
    icon: Navigation,
    roles: [ROLES.DIRECTOR_REGIONAL, ROLES.ADMIN],
  },
  {
    to: "/cotizaciones",
    label: "Cotizaciones y Pedidos",
    icon: FileText,
    roles: [ROLES.ADMIN, ROLES.DIRECTOR_REGIONAL, ROLES.ASESOR],
  },
  {
    to: "/asesores",
    label: "Gestión de Asesores",
    icon: UserCheck,
    roles: [ROLES.ADMIN],
  },
  {
    to: "/catalogos",
    label: "Catálogos y Parámetros",
    icon: Layers,
    roles: [ROLES.ADMIN],
  },
  {
    to: "/reportes",
    label: "Reportes CSV",
    icon: BarChart3,
    roles: [ROLES.ADMIN, ROLES.DIRECTOR_REGIONAL],
  },
];

function getRoleLabel(role, zoneId) {
  switch (role) {
    case ROLES.ADMIN:
      return "Administrador";
    case ROLES.DIRECTOR_REGIONAL:
      return zoneId ? `Director Regional (Zona ${zoneId})` : "Director Regional";
    case ROLES.ASESOR:
      return "Asesor Comercial";
    default:
      return role || "Usuario";
  }
}

function getInitials(name = "") {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function Sidebar() {
  const { user, role, zoneId, logout, hasRole } = useAuth();

  const accessibleItems = MENU_ITEMS.filter((item) => hasRole(item.roles));

  return (
    <aside className={styles.sidebar}>
      {/* Cabecera del Sidebar con Logo */}
      <div className={styles.header}>
        <div className={styles.logoWrapper}>
          <Logo />
        </div>
      </div>

      {/* Navegación con items filtrados por rol */}
      <nav className={styles.nav}>
        <div className={styles.sectionLabel}>Menú Principal</div>
        <ul className={styles.navList}>
          {accessibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                  }
                >
                  <Icon className={styles.icon} size={20} />
                  <span className={styles.navLabel}>{item.label}</span>
                  <ChevronRight className={styles.arrow} size={14} />
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Tarjeta inferior con el usuario autenticado y botón de cierre de sesión */}
      <div className={styles.footer}>
        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {getInitials(user?.name || user?.email)}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName} title={user?.name || user?.email}>
              {user?.name || user?.email?.split("@")[0]}
            </span>
            <span className={styles.userRole}>
              {getRoleLabel(role, zoneId)}
            </span>
          </div>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={logout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
