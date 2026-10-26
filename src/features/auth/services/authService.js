import { api } from "@/shared/services/apiClient";

/**
 * Iniciar sesión con correo y contraseña.
 * El backend valida las credenciales y establece la cookie de sesión de Better Auth.
 */
export async function login({ email, password, rememberMe = true }) {
  const result = await api.post("/auth/login", {
    email: email.trim(),
    password,
    rememberMe,
  });
  return result;
}

/**
 * Obtener la sesión activa y el usuario con su rol sincronizado desde la base de datos.
 */
export async function getMe() {
  return api.get("/auth/me");
}

/**
 * Cerrar sesión e invalidar la cookie en el backend.
 */
export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    console.warn("Error al cerrar sesión en el servidor:", err);
  }
}

/**
 * Iniciar flujo OAuth de Microsoft 365 (HU-10).
 * Devuelve la URL de redirección provista por Better Auth.
 */
export async function loginWithMicrosoft() {
  const { url } = await api.post("/auth/microsoft", {
    callbackURL: `${window.location.origin}/dashboard`,
  });

  if (url) {
    window.location.href = url;
  }
}

/**
 * Solicitar enlace de recuperación de contraseña (HU-09).
 */
export async function requestPasswordReset(email) {
  return api.post("/auth/forgot-password", {
    email: email.trim(),
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

/**
 * Restablecer contraseña con el token recibido por correo (HU-09).
 */
export async function resetPassword({ token, newPassword }) {
  return api.post("/auth/reset-password", {
    token,
    newPassword,
  });
}
