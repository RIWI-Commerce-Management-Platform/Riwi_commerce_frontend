import { api } from "@/shared/services/apiClient";

/**
 * Crea una cotización con sus productos; el backend calcula subtotal/total
 * y asigna el consecutivo COT-#### (HU-30).
 */
export async function createQuote({ clientId, notes, visitId, items }) {
  const payload = { clientId, items };
  if (notes?.trim()) payload.notes = notes.trim();
  if (visitId) payload.visitId = visitId;
  return api.post("/quotes", payload);
}

/**
 * Lista cotizaciones paginadas con filtros. Un asesor solo ve las suyas y un
 * director regional solo las de su zona (HU-06 / HU-34).
 */
export async function getQuotes({
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

  return api.get("/quotes", { params });
}

export async function getQuoteById(id) {
  return api.get(`/quotes/${id}`);
}

/**
 * Cambia el estado de la cotización (DRAFT -> SENT -> APPROVED/REJECTED), con
 * bitácora de actividad (HU-32).
 */
export async function changeQuoteStatus(id, status) {
  return api.patch(`/quotes/${id}/status`, { status });
}

/**
 * Adjunta un documento o imagen de soporte comercial en S3 (HU-31). Máx 10MB,
 * PDF/PNG/JPG/WebP.
 */
export async function attachQuoteDocument(id, file) {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`/quotes/${id}/attachment`, formData);
}

/** Convierte una cotización aprobada en un pedido oficial PED-#### (HU-33). */
export async function convertQuoteToOrder(id) {
  return api.post(`/quotes/${id}/convert-to-order`);
}
