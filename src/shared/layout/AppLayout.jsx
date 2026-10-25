import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar";
import Header from "./Header/Header";
import styles from "./AppLayout.module.css";

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
      <div className={styles.contentWrapper}>
        <Header onToggleMenu={toggleMobileMenu} isMenuOpen={isMobileMenuOpen} />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
