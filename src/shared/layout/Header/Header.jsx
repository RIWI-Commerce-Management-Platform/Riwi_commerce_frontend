import { useState, useRef, useEffect } from "react";
import {
  Menu,
  Search,
  ChevronDown,
  Calendar,
  Bell,
  LogOut,
  User,
  MapPin,
} from "lucide-react";
import Logo from "@/shared/components/Logo/Logo";
import { useAuth, ROLES } from "@/features/auth";
import styles from "./Header.module.css";

function getRoleLabel(role, zoneId) {
  switch (role) {
    case ROLES.ADMIN:
      return "Administrador";
    case ROLES.DIRECTOR_REGIONAL:
      return zoneId ? `Director Reg. (Zona ${zoneId})` : "Director Regional";
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

export default function Header({ onToggleMenu = () => {} }) {
  const { user, role, zoneId, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

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

  const displayName = user?.name || user?.email?.split("@")[0] || "Juan Pérez";
  const roleLabel = getRoleLabel(role, zoneId);

  return (
    <header className={styles.header}>
      {/* Zona Izquierda: Logo + Botón Hamburguesa + Buscador Global */}
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
      </div>

      {/* Zona Derecha: Filtros rápidos + Notificaciones + Perfil de Usuario */}
      <div className={styles.right}>
        {/* Selector de Territorio */}
        <div className={styles.quickFilter}>
          <span className={styles.filterLabel}>Territorio</span>
          <div className={styles.filterValue}>
            <span>{zoneId ? `Zona ${zoneId}` : "NORTE"}</span>
            <ChevronDown size={14} />
          </div>
        </div>

        {/* Selector de Semana */}
        <div className={styles.quickFilter}>
          <span className={styles.filterLabel}>Semana</span>
          <div className={styles.filterValue}>
            <span>19 - 25 Oct 2026</span>
            <Calendar size={14} className={styles.calendarIcon} />
          </div>
        </div>

        {/* Campana de Notificaciones con Badge */}
        <button
          type="button"
          className={styles.notifBtn}
          aria-label="6 notificaciones nuevas"
          title="Notificaciones"
        >
          <Bell size={19} />
          <span className={styles.notifBadge}>6</span>
        </button>

        {/* Perfil de Usuario con Menú Desplegable */}
        <div className={styles.userProfileWrapper} ref={dropdownRef}>
          <button
            type="button"
            className={styles.userProfileBtn}
            onClick={() => setUserMenuOpen((v) => !v)}
            aria-expanded={userMenuOpen}
          >
            <div className={styles.avatar}>
              {getInitials(displayName)}
            </div>
            <div className={styles.userText}>
              <span className={styles.userName}>{displayName}</span>
              <span className={styles.userRole}>{roleLabel}</span>
            </div>
            <ChevronDown size={15} className={`${styles.chevron} ${userMenuOpen ? styles.chevronRotated : ""}`} />
          </button>

          {/* Menú Dropdown al hacer clic en el perfil */}
          {userMenuOpen && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownHeader}>
                <strong>{displayName}</strong>
                <span>{user?.email || "correo@empresa.com"}</span>
              </div>
              <hr className={styles.divider} />
              <button
                type="button"
                className={styles.dropdownItem}
                onClick={() => setUserMenuOpen(false)}
              >
                <User size={16} />
                <span>Mi Perfil</span>
              </button>
              {zoneId && (
                <div className={styles.dropdownItem}>
                  <MapPin size={16} />
                  <span>Territorio: Zona {zoneId}</span>
                </div>
              )}
              <hr className={styles.divider} />
              <button
                type="button"
                className={`${styles.dropdownItem} ${styles.dropdownItemLogout}`}
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
              >
                <LogOut size={16} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
