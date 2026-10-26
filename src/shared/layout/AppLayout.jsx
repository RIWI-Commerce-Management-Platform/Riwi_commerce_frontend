import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import Sidebar from "./Sidebar/Sidebar";
import Header from "./Header/Header";
import styles from "./AppLayout.module.css";

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className={styles.appContainer}>
      {/* 1. Header completo en la parte superior (Full width) */}
      <Header onToggleMenu={toggleMobileMenu} />

      {/* 2. Cuerpo: Sidebar a la izquierda + Contenido Principal a la derecha */}
      <div className={styles.bodyWrapper}>
        <Sidebar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />

        <div className={styles.mainWrapper}>
          <main className={styles.mainContent}>
            <Outlet />
          </main>

          {/* Pie de página oficial (Idéntico a Image 2) */}
          <footer className={styles.footer}>
            <span className={styles.copyright}>
              © 2024 Comercial 360. Todos los derechos reservados.
            </span>
            <div className={styles.footerLinks}>
              <a href="#ayuda">Ayuda</a>
              <span>|</span>
              <a href="#terminos">Términos y condiciones</a>
              <span>|</span>
              <a href="#privacidad">Política de privacidad</a>
            </div>
            <span className={styles.version}>Versión 1.0.0</span>
          </footer>

          {/* Botón flotante "+ Registrar visita" (FAB) con animación hover zoom */}
          <button
            type="button"
            className={styles.fabBtn}
            onClick={() => navigate("/visitas")}
            title="Registrar visita"
          >
            <div className={styles.fabIcon}>
              <Plus size={22} strokeWidth={2.5} />
            </div>
            <span>Registrar visita</span>
          </button>
        </div>
      </div>
    </div>
  );
}
