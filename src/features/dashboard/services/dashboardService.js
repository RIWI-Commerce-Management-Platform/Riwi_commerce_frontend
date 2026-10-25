import { API_URL } from "@/config/env";

const MESSAGES = {
  401: "Tu sesión no es válida o expiró. Inicia sesión de nuevo.",
  403: "No tienes permiso para ver el dashboard.",
  400: "Los filtros seleccionados no son válidos.",
};

async function get(path) {
  if (!API_URL) throw new Error("Define VITE_API_URL para consultar los indicadores.");

  let res;
  try {
    // credentials: la sesión de Better Auth viaja en una cookie.
    res = await fetch(`${API_URL}${path}`, { credentials: "include" });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (!res.ok) {
    const error = new Error(MESSAGES[res.status] ?? "Ocurrió un error en el servidor. Intenta de nuevo.");
    error.status = res.status;
    throw error;
  }
  return res.json();
}

/** KPI de la semana (HU-35). Sin territorio = todos los territorios visibles. */
export function getWeeklyKpis({ weekStart, territoryId }) {
  const params = new URLSearchParams({ weekStart });
  if (territoryId) params.set("territoryId", territoryId);
  return get(`/dashboard/kpis?${params}`);
}

export const getTerritories = () => get("/zones");
