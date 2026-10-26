import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  ChevronDown,
  X,
} from "lucide-react";
import { useAuth, ROLES } from "@/features/auth";
import styles from "./Sidebar.module.css";

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { hasRole, role } = useAuth();
  const location = useLocation();

  // Planeación de rutas submenú desplegable
  const isRoutesActive = location.pathname.startsWith("/rutas");
  const [routesSubmenuOpen, setRoutesSubmenuOpen] = useState(true);

  const isDirectorOrAdmin = role === ROLES.ADMIN || role === ROLES.DIRECTOR_REGIONAL;

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

        {/* Lista de navegación */}
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {/* Dashboard */}
            <li>
              <NavLink
                to="/dashboard"
                onClick={onClose}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                }
              >
                <LayoutDashboard className={styles.icon} size={19} />
                <span className={styles.navLabel}>Dashboard</span>
              </NavLink>
            </li>

            {/* Planeación de rutas con submenú colapsable */}
            <li className={styles.menuGroup}>
              <button
                type="button"
                className={`${styles.navItem} ${styles.submenuTrigger} ${
                  isRoutesActive ? styles.navItemActiveParent : ""
                }`}
                onClick={() => setRoutesSubmenuOpen((prev) => !prev)}
                aria-expanded={routesSubmenuOpen}
              >
                <div className={styles.triggerLeft}>
                  <GitBranch className={styles.icon} size={19} />
                  <span className={styles.navLabel}>Planeación de rutas</span>
                </div>
                <ChevronDown
                  size={15}
                  className={`${styles.chevron} ${
                    routesSubmenuOpen ? styles.chevronOpen : ""
                  }`}
                />
              </button>

              {routesSubmenuOpen && (
                <ul className={styles.submenuList}>
                  <li>
                    <NavLink
                      to="/rutas"
                      end
                      onClick={onClose}
                      className={({ isActive }) =>
                        `${styles.submenuItem} ${
                          isActive ? styles.submenuItemActive : ""
                        }`
                      }
                    >
                      <span className={styles.subBullet} />
                      <span>Creación de rutas</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/rutas/asignadas"
                      onClick={onClose}
                      className={({ isActive }) => `${styles.submenuItem} ${isActive ? styles.submenuItemActive : ""}`}
                    >
                      <span className={styles.subBullet} />
                      <span>Rutas asignadas</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/visitas"
                      onClick={onClose}
                      className={styles.submenuItem}
                    >
                      <span className={styles.subBullet} />
                      <span>Agenda de asesores</span>
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>

            {/* Mapa de visitas */}
            <li>
              <NavLink
                to="/mapa"
                onClick={onClose}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                }
              >
                <Compass className={styles.icon} size={19} />
                <span className={styles.navLabel}>Mapa de visitas</span>
              </NavLink>
            </li>

            {/* Clientes */}
            <li>
              <NavLink
                to="/clientes"
                onClick={onClose}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                }
              >
                <Users className={styles.icon} size={19} />
                <span className={styles.navLabel}>Clientes</span>
              </NavLink>
            </li>

            {/* Visitas */}
            <li>
              <NavLink
                to="/visitas"
                onClick={onClose}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                }
              >
                <ClipboardList className={styles.icon} size={19} />
                <span className={styles.navLabel}>Visitas</span>
              </NavLink>
            </li>

            {/* Cotizaciones */}
            <li>
              <NavLink
                to="/cotizaciones"
                onClick={onClose}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                }
              >
                <FileText className={styles.icon} size={19} />
                <span className={styles.navLabel}>Cotizaciones</span>
              </NavLink>
            </li>

            {/* Pedidos */}
            <li>
              <NavLink
                to="/pedidos"
                onClick={onClose}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                }
              >
                <ShoppingCart className={styles.icon} size={19} />
                <span className={styles.navLabel}>Pedidos</span>
              </NavLink>
            </li>

            {/* Indicadores */}
            {isDirectorOrAdmin && (
              <li>
                <NavLink
                  to="/indicadores"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                  }
                >
                  <BarChart2 className={styles.icon} size={19} />
                  <span className={styles.navLabel}>Indicadores</span>
                </NavLink>
              </li>
            )}

            {/* Reportes */}
            {isDirectorOrAdmin && (
              <li>
                <NavLink
                  to="/reportes"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                  }
                >
                  <TrendingUp className={styles.icon} size={19} />
                  <span className={styles.navLabel}>Reportes</span>
                </NavLink>
              </li>
            )}

            {/* Configuración */}
            {role === ROLES.ADMIN && (
              <li>
                <NavLink
                  to="/configuracion"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                  }
                >
                  <Settings className={styles.icon} size={19} />
                  <span className={styles.navLabel}>Configuración</span>
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        {/* Widget inferior: Resumen Regional (Idéntico a la imagen del Workbench) */}
        <div className={styles.regionalWidget}>
          <div className={styles.regionalHeader}>
            <div className={styles.targetIconCircle}>
              <Target size={16} />
            </div>
            <span className={styles.regionalTitle}>Resumen regional</span>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <strong className={styles.statNumber}>24</strong>
              <span className={styles.statLabel}>Rutas activas</span>
            </div>
            <div className={styles.statBox}>
              <strong className={styles.statNumber}>12</strong>
              <span className={styles.statLabel}>Asesores activos</span>
            </div>
            <div className={styles.statBox}>
              <strong className={styles.statNumber}>1.285</strong>
              <span className={styles.statLabel}>Clientes en la región</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}


