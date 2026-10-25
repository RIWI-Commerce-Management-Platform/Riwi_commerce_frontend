import { api } from "@/shared/services/apiClient";

/** KPI de la semana (HU-35). Sin territorio = todos los territorios visibles. */
export function getWeeklyKpis({ weekStart, territoryId } = {}) {
  const params = {};
  if (weekStart) params.weekStart = weekStart;
  if (territoryId) params.territoryId = territoryId;

  return api.get("/dashboard/kpis", { params });
}

export const getTerritories = () => api.get("/zones");
