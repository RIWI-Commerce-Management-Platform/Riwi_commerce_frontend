import { useState, useEffect } from "react";
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
import * as visitsService from "@/features/visits/services/visitsService";
import styles from "./Sidebar.module.css";

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { role } = useAuth();
  const location = useLocation();

  // Submenú desplegable de Planeación de rutas
  const isRoutesActive = location.pathname.startsWith("/rutas");
  const [routesSubmenuOpen, setRoutesSubmenuOpen] = useState(true);

  // Widget inferior: Objetivo semanal (HU-39)
  const [weeklyGoal, setWeeklyGoal] = useState({
    goal: 24,
    completed: 19,
    progressPercentage: 78,
  });

  useEffect(() => {
    visitsService
      .getWeeklyGoal()
      .then((data) => {
        if (data && data.goal != null) {
          setWeeklyGoal(data);
        }
      })
      .catch(() => null);
  }, []);

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
                      className={({ isActive }) =>
                        `${styles.submenuItem} ${isActive ? styles.submenuItemActive : ""}`
                      }
                    >
                      <span className={styles.subBullet} />
                      <span>Rutas asignadas</span>
                    </NavLink>
                  </li>

                </ul>
              )}
            </li>

            {/* Agenda directa */}
            <li>
              <NavLink
                to="/agenda"
                onClick={onClose}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                }
              >
                <Calendar className={styles.icon} size={19} />
                <span className={styles.navLabel}>Agenda</span>
              </NavLink>
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
                  `${styles.navItem} ${
                    isActive || location.pathname.startsWith("/visitas")
                      ? styles.navItemActive
                      : ""
                  }`
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

        {/* Widget inferior: Objetivo Semanal (Idéntico a la maqueta de Visitas) */}
        <div className={styles.goalWidget}>
          <div className={styles.goalHeader}>
            <div className={styles.goalIconCircle}>
              <Target size={16} />
            </div>
            <span className={styles.goalTitle}>Objetivo semanal</span>
          </div>

          <div className={styles.goalProgressBlock}>
            <div className={styles.goalPercentageRow}>
              <strong className={styles.goalPercentage}>
                {weeklyGoal.progressPercentage}%
              </strong>
              <span className={styles.goalSubtitle}>de cumplimiento</span>
            </div>
            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{
                  width: `${Math.min(100, Math.max(0, weeklyGoal.progressPercentage))}%`,
                }}
              />
            </div>
            <span className={styles.goalMetaText}>
              Meta: {weeklyGoal.goal} visitas | Completadas: {weeklyGoal.completed}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
