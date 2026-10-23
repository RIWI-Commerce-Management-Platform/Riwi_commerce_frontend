import Footer from "@/shared/components/Footer/Footer";
import BrandPanel from "../components/BrandPanel/BrandPanel";
import LoginCard from "../components/LoginCard/LoginCard";
import BackgroundDecoration from "../components/BackgroundDecoration/BackgroundDecoration";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <BrandPanel />
        <section className={styles.right}>
          <BackgroundDecoration />
          <div className={styles.content}>
            <LoginCard />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
