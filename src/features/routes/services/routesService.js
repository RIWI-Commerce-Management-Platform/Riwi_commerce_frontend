import { api } from "@/shared/services/apiClient";

/**
 * Consulta listado paginado de rutas comerciales con filtros.
 */
export async function getRoutes({
  search = "",
  zoneId = "",
  advisorId = "",
  status = "",
  dayOfWeek = "",
  frequency = "",
  isActive = "",
  page = 1,
  limit = 10,
} = {}) {
  const params = { page, limit };
  if (search?.trim()) params.search = search.trim();
  if (zoneId) params.zoneId = zoneId;
  if (advisorId) params.advisorId = advisorId;
  if (status) params.status = status;
  if (dayOfWeek) params.dayOfWeek = dayOfWeek;
  if (frequency) params.frequency = frequency;
  if (isActive !== "") params.isActive = isActive;

  return api.get("/routes", { params });
}

/**
 * Obtiene el detalle completo de una ruta con paradas enriquecidas y coordenadas para el mapa interactivo.
 */
export async function getRouteById(id) {
  return api.get(`/routes/${id}`);
}

/**
 * Crea una ruta comercial en estado Borrador.
 */
export async function createRouteDraft(payload) {
  return api.post("/routes", payload);
}

/**
 * Actualiza los datos generales de una ruta comercial.
 */
export async function updateRouteDraft(id, payload) {
  return api.patch(`/routes/${id}`, payload);
}

/**
 * Alterna el estado activo/inactivo (Soft delete / Reactivación) de una ruta.
 */
export async function toggleRouteStatus(id) {
  return api.patch(`/routes/${id}/status`);
}

/**
 * Agrega un cliente como parada en el itinerario de la ruta.
 * Recalcula automáticamente la distancia en km y tiempo estimado de viaje.
 */
export async function addRouteStop(routeId, stopData) {
  return api.post(`/routes/${routeId}/stops`, stopData);
}

/**
 * Remueve una parada de cliente de la ruta y reindexa la secuencia correlativa.
 */
export async function removeRouteStop(routeId, clientId) {
  return api.delete(`/routes/${routeId}/stops/${clientId}`);
}

/**
 * Reordena las paradas de la ruta según la nueva secuencia enviada desde el mapa o drag-and-drop.
 */
export async function reorderRouteStops(routeId, orderedClientIds) {
  return api.patch(`/routes/${routeId}/stops/reorder`, { orderedClientIds });
}

/**
 * Asigna la ruta a un asesor comercial y dispara la generación de visitas programadas en su agenda.
 */
export async function assignRouteAdvisor(routeId, advisorId) {
  return api.post(`/routes/${routeId}/assign`, { advisorId });
}

/**
 * Previsualiza las métricas de distancia y tiempo estimado de viaje para una lista de clientes.
 */
export async function calculateRouteMetrics(clientIds) {
  return api.post("/routes/metrics/calculate", { clientIds });
}

/**
 * Obtiene el directorio de asesores comerciales activos para asignación de ruta.
 */
export async function getAvailableAdvisors(zoneId = "") {
  const params = { isActive: true, limit: 100 };
  if (zoneId) params.zoneId = zoneId;
  return api.get("/advisors", { params });
}
