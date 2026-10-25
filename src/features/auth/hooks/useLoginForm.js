import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function useLoginForm() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: "error" | "info" | "success", text }

  const { login } = useAuth();
  const navigate = useNavigate();

  const setField = (name) => (e) => {
    setValues((v) => ({ ...v, [name]: e.target.value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const next = {};
    if (!values.email?.trim()) {
      next.email = "Ingresa tu correo corporativo.";
    } else if (!EMAIL_RE.test(values.email.trim())) {
      next.email = "Ingresa un formato de correo válido.";
    }

    if (!values.password) {
      next.password = "Ingresa tu contraseña.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await login({
        email: values.email,
        password: values.password,
        rememberMe,
      });

      // Redirección inteligente según el rol si es necesario, o al dashboard general
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setFeedback({
        type: "error",
        text: err.message || "Credenciales incorrectas. Verifica correo y contraseña.",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    values,
    errors,
    loading,
    feedback,
    remember: rememberMe,
    showPassword,
    setEmail: setField("email"),
    setPassword: setField("password"),
    setRemember: (e) => setRememberMe(e.target.checked),
    toggleShowPassword: () => setShowPassword((s) => !s),
    handleSubmit,
  };
}
