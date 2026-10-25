import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Calendar,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import { useAuth, ROLES } from "@/features/auth";
import Logo from "@/shared/components/Logo/Logo";
import styles from "./Header.module.css";

function getRoleLabel(role, zoneId) {
  if (role === ROLES.ADMIN) return "Administrador";
  if (role === ROLES.DIRECTOR_REGIONAL) {
    return zoneId ? `Director Regional (Zona ${zoneId})` : "Director Regional";
  }
  return "Asesor Comercial";
}

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function Header({ onToggleMenu = () => {} }) {
  const { user, role, zoneId, logout } = useAuth();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const isRoutesPage = location.pathname.startsWith("/rutas");

  // Cerrar dropdown de usuario si se hace clic afuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.name || user?.email?.split("@")[0] || "Richard Lopez";
  const roleLabel = getRoleLabel(role, zoneId);

  return (
    <header className={styles.header}>
      {/* Zona Izquierda: Logo + Botón Hamburguesa + Título de página o Buscador Global */}
      <div className={styles.left}>
        <div className={styles.logoBlock}>
          <Logo size="sm" color="dark" />
        </div>

        <button
          type="button"
          className={styles.hamburgerBtn}
          onClick={onToggleMenu}
          aria-label="Alternar menú"
          title="Menú"
        >
          <Menu size={20} />
        </button>

        {isRoutesPage ? (
          <h1 className={styles.pageHeaderTitle}>Creación de rutas</h1>
        ) : (
          <div className={styles.searchBar}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar clientes, contactos, rutas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Zona Derecha: Filtros rápidos + Notificaciones + Perfil de Usuario */}
      <div className={styles.right}>
        {/* Selector de Territorio */}
        <div className={styles.quickFilter}>
          <span className={styles.filterLabel}>Regional</span>
          <div className={styles.filterValue}>
            <span>Atlántico</span>
            <ChevronDown size={14} />
          </div>
        </div>

        {/* Selector de Semana */}
        <div className={styles.quickFilter}>
          <span className={styles.filterLabel}>Semana</span>
          <div className={styles.filterValue}>
            <Calendar size={14} className={styles.calendarIcon} />
            <span>20 - 26 May 2024</span>
            <ChevronDown size={14} />
          </div>
        </div>

        {/* Campana de Notificaciones con Badge */}
        <button
          type="button"
          className={styles.notifBtn}
          aria-label="8 notificaciones nuevas"
          title="Notificaciones"
        >
          <Bell size={19} />
          <span className={styles.notifBadge}>8</span>
        </button>

        {/* Perfil de Usuario con Menú Desplegable */}
        <div className={styles.userProfileWrapper} ref={dropdownRef}>
          <button
            type="button"
            className={styles.profileBtn}
            onClick={() => setUserMenuOpen((prev) => !prev)}
            aria-expanded={userMenuOpen}
            aria-label="Menú de usuario"
          >
            <div className={styles.avatar}>{getInitials(displayName)}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{displayName}</span>
              <span className={styles.userRole}>{roleLabel}</span>
            </div>
            <ChevronDown
              size={15}
              className={`${styles.chevron} ${userMenuOpen ? styles.chevronOpen : ""}`}
            />
          </button>

          {/* Dropdown Menu */}
          {userMenuOpen && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownHeader}>
                <strong className={styles.dropdownName}>{displayName}</strong>
                <span className={styles.dropdownEmail}>
                  {user?.email || "usuario@comercial360.co"}
                </span>
                <span className={styles.roleBadge}>{roleLabel}</span>
              </div>

              <div className={styles.dropdownDivider} />

              <button
                type="button"
                className={styles.dropdownItem}
                onClick={() => {
                  setUserMenuOpen(false);
                }}
              >
                <User size={15} />
                <span>Mi Perfil</span>
              </button>

              <button
                type="button"
                className={styles.dropdownItem}
                onClick={() => {
                  setUserMenuOpen(false);
                }}
              >
                <Shield size={15} />
                <span>Permisos y Zona</span>
              </button>

              <div className={styles.dropdownDivider} />

              <button
                type="button"
                className={`${styles.dropdownItem} ${styles.logoutItem}`}
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
              >
                <LogOut size={15} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
