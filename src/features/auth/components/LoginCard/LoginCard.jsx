import Divider from "@/shared/components/Divider/Divider";
import { LockBadgeIcon, HeadsetIcon } from "@/shared/components/icons";
import MicrosoftButton from "../MicrosoftButton/MicrosoftButton";
import LoginForm from "../LoginForm/LoginForm";
import { loginWithMicrosoft } from "../../services/authService";
import styles from "./LoginCard.module.css";

export default function LoginCard() {
  return (
    <div className={styles.card}>
      <header className={styles.header}>
        <div className={styles.badge}><LockBadgeIcon size="55%" /></div>
        <h1 className={styles.title}>Iniciar sesión</h1>
        <p className={styles.subtitle}>
          Ingresa con tu correo corporativo para acceder a la plataforma
        </p>
      </header>

      <Divider>o continúa con</Divider>
      <MicrosoftButton onClick={loginWithMicrosoft} />
      <Divider>o inicia sesión con tu cuenta</Divider>

      <LoginForm />

      <div className={styles.help}>
        <HeadsetIcon size={22} />
        <span>¿Necesitas ayuda?</span>
        <a href="#" className={styles.link}>Contáctanos</a>
      </div>
    </div>
  );
}
