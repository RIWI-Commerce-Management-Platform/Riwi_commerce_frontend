import { api } from "@/shared/services/apiClient";

/**
 * Obtiene los pines georreferenciados de visitas del día con su estado (HU-36).
 * Sin fecha = hoy. Un director regional siempre ve su propia zona.
 */
export async function getVisitMap({ date = "", territoryId = "", advisorId = "" } = {}) {
  const params = {};
  if (date) params.date = date;
  if (territoryId) params.territoryId = territoryId;
  if (advisorId) params.advisorId = advisorId;

  return api.get("/visit-map", { params });
}
