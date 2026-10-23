import { useState } from "react";
import { login } from "../services/authService";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function useLoginForm() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: "error" | "info", text }

  const setField = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!EMAIL_RE.test(values.email)) next.email = "Ingresa un correo válido.";
    if (!values.password) next.password = "Ingresa tu contraseña.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await login({ ...values, remember });
      if (result?.mocked) {
        setFeedback({ type: "info", text: "Modo demo: define VITE_API_URL para conectar tu API." });
      }
      // TODO: guardar sesión / redirigir al dashboard
    } catch (err) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return {
    values, errors, loading, feedback, remember, showPassword,
    setEmail: setField("email"),
    setPassword: setField("password"),
    setRemember: (e) => setRemember(e.target.checked),
    toggleShowPassword: () => setShowPassword((s) => !s),
    handleSubmit,
  };
}
