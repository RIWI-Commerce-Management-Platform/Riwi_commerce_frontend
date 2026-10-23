import TextField from "@/shared/components/TextField/TextField";
import Checkbox from "@/shared/components/Checkbox/Checkbox";
import Button from "@/shared/components/Button/Button";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "@/shared/components/icons";
import useLoginForm from "../../hooks/useLoginForm";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const f = useLoginForm();

  return (
    <form className={styles.form} onSubmit={f.handleSubmit} noValidate>
      <TextField
        id="email" label="Correo electrónico" type="email" autoComplete="email"
        placeholder="tuusuario@empresa.com" icon={<MailIcon />}
        value={f.values.email} onChange={f.setEmail} error={f.errors.email}
      />

      <TextField
        id="password" label="Contraseña" autoComplete="current-password"
        type={f.showPassword ? "text" : "password"}
        placeholder="Ingresa tu contraseña" icon={<LockIcon />}
        value={f.values.password} onChange={f.setPassword} error={f.errors.password}
        rightSlot={
          <button type="button" className={styles.eye} onClick={f.toggleShowPassword}
            aria-label={f.showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
            {f.showPassword ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        }
      />

      <div className={styles.row}>
        <Checkbox label="Recordarme" checked={f.remember} onChange={f.setRemember} />
        <a href="#" className={styles.link}>¿Olvidaste tu contraseña?</a>
      </div>

      <Button type="submit" loading={f.loading}>Iniciar sesión</Button>

      {f.feedback && (
        <p className={`${styles.feedback} ${styles[f.feedback.type]}`} role="status">{f.feedback.text}</p>
      )}
    </form>
  );
}
