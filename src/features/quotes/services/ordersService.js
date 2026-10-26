import { api } from "@/shared/services/apiClient";

/**
 * Lista pedidos paginados con filtros. Un asesor solo ve los suyos y un
 * director regional solo los de su zona (HU-06 / HU-34).
 */
export async function getOrders({
  clientId = "",
  advisorId = "",
  status = "",
  startDate = "",
  endDate = "",
  page = 1,
  limit = 10,
} = {}) {
  const params = { page, limit };
  if (clientId) params.clientId = clientId;
  if (advisorId) params.advisorId = advisorId;
  if (status) params.status = status;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  return api.get("/orders", { params });
}

export async function getOrderById(id) {
  return api.get(`/orders/${id}`);
}

/**
 * Cambia el estado del pedido (CREATED -> DISPATCHED -> DELIVERED/CANCELLED),
 * con bitácora de actividad (HU-33).
 */
export async function changeOrderStatus(id, status) {
  return api.patch(`/orders/${id}/status`, { status });
}
