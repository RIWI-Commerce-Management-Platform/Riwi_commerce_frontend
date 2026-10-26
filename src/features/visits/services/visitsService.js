import { api } from "@/shared/services/apiClient";

/**
 * Consulta la agenda operativa de visitas del asesor comercial autenticado.
 * @param {Object} options
 * @param {'day'|'week'} options.period Período de consulta ('day' o 'week')
 * @param {string} [options.date] Fecha en formato YYYY-MM-DD
 */
export async function getVisitAgenda({ period = "day", date } = {}) {
  const params = { period };
  if (date) params.date = date;
  return api.get("/visits/agenda", { params });
}

/**
 * Obtiene el detalle completo de una visita por su identificador.
 * @param {number|string} id Identificador de la visita
 */
export async function getVisitById(id) {
  return api.get(`/visits/${id}`);
}

/**
 * Inicia la atención de una visita en terreno (pasa a estado IN_PROGRESS).
 * @param {number|string} id Identificador de la visita
 */
export async function startVisit(id) {
  return api.patch(`/visits/${id}/start`);
}

/**
 * Registra el resultado comercial y observaciones al culminar la visita (pasa a estado VISITED).
 * @param {number|string} id Identificador de la visita
 * @param {Object} payload
 * @param {string} payload.endTime Hora fin en formato HH:mm o HH:mm:ss
 * @param {string} payload.observations Observaciones generales (máx. 500 caracteres)
 * @param {Array<{id: number, observation?: string}>} payload.results Resultados tipificados del catálogo
 */
export async function registerVisitResult(id, payload) {
  return api.patch(`/visits/${id}/result`, payload);
}

/**
 * Registra si la visita derivó en generación de cotización o pedido.
 * @param {number|string} id Identificador de la visita
 * @param {Object} payload
 * @param {boolean} payload.quoteGenerated Si se generó cotización
 * @param {boolean} payload.orderGenerated Si se generó pedido
 */
export async function registerCommercialOutcome(id, payload) {
  return api.patch(`/visits/${id}/commercial-outcome`, payload);
}

/**
 * Programa un compromiso o seguimiento derivado de la visita.
 * @param {number|string} id Identificador de la visita
 * @param {Object} payload
 * @param {string|Date} payload.dueDate Fecha y hora límite del compromiso
 * @param {string} payload.activity Descripción de la actividad acordada
 * @param {string} [payload.observation] Observación complementaria
 * @param {number} payload.responsibleId Identificador del usuario responsable
 */
export async function createFollowUp(id, payload) {
  return api.post(`/visits/${id}/follow-ups`, payload);
}

/**
 * Reprograma una visita pendiente para una fecha futura.
 * @param {number|string} id Identificador de la visita
 * @param {Object} payload
 * @param {string|Date} payload.scheduledAt Nueva fecha y hora programada
 * @param {string} [payload.reason] Motivo de la reprogramación
 */
export async function rescheduleVisit(id, payload) {
  return api.patch(`/visits/${id}/reschedule`, payload);
}

/**
 * Registra que la visita no se pudo realizar (motivo tipificado).
 * @param {number|string} id Identificador de la visita
 * @param {Object} payload
 * @param {string} payload.reason Motivo por el cual no se visitó
 */
export async function markVisitNotVisited(id, payload) {
  return api.patch(`/visits/${id}/not-visited`, payload);
}

/**
 * Adjunta un soporte fotográfico o documento a la visita.
 * @param {number|string} id Identificador de la visita
 * @param {File} file Archivo a cargar (foto, PDF, etc.)
 */
export async function uploadVisitAttachment(id, file) {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`/visits/${id}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/**
 * Consulta los soportes y archivos adjuntos de una visita.
 * @param {number|string} id Identificador de la visita
 */
export async function getVisitAttachments(id) {
  return api.get(`/visits/${id}/attachments`);
}

/**
 * Elimina un soporte adjunto de la visita.
 * @param {number|string} id Identificador de la visita
 * @param {number|string} attachmentId Identificador del archivo adjunto
 */
export async function deleteVisitAttachment(id, attachmentId) {
  return api.delete(`/visits/${id}/attachments/${attachmentId}`);
}

/**
 * Consulta los seguimientos programados del asesor comercial.
 * @param {Object} options
 * @param {'day'|'week'} options.period Período de consulta
 * @param {string} [options.date] Fecha de referencia
 * @param {string} [options.status] Estado ('PENDING' o 'COMPLETED')
 */
export async function getFollowUpAgenda({ period = "day", date, status } = {}) {
  const params = { period };
  if (date) params.date = date;
  if (status) params.status = status;
  return api.get("/follow-ups/agenda", { params });
}

/**
 * Marca un seguimiento como completado.
 * @param {number|string} id Identificador del seguimiento
 */
export async function completeFollowUp(id) {
  return api.patch(`/follow-ups/${id}/complete`);
}

/**
 * Obtiene el avance de la meta semanal de visitas del asesor comercial.
 * @param {string} [date] Fecha de referencia YYYY-MM-DD
 */
export async function getWeeklyGoal(date) {
  const params = {};
  if (date) params.date = date;
  return api.get("/indicators/weekly-goal", { params });
}
