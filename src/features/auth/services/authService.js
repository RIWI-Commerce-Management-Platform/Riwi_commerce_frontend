import { API_URL } from "@/config/env";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Inicio de sesión con correo y contraseña.
 * Si VITE_API_URL no está definido, se simula la respuesta (modo demo).
 */
export async function login({ email, password, remember }) {
  if (!API_URL) {
    await wait(700);
    return { mocked: true };
  }

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, remember }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Credenciales incorrectas.");
  }
  return res.json();
}

/** TODO: integrar MSAL (Microsoft 365). */
export async function loginWithMicrosoft() {
  console.warn("Inicio de sesión con Microsoft: pendiente de integrar (MSAL).");
}
