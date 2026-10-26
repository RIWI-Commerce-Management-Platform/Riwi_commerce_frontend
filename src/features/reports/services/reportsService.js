import { api } from "@/shared/services/apiClient";

const REPORT_LABELS = {
  visits: "visitas",
  clients: "clientes",
  quotes: "cotizaciones",
  orders: "pedidos",
};

/**
 * Descarga el reporte CSV indicado con los filtros activos (HU-38).
 * El cliente HTTP ya convierte automáticamente la respuesta text/csv en Blob.
 */
export async function downloadReportCsv(type, filters = {}) {
  const params = {};
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  if (filters.zoneId) params.zoneId = filters.zoneId;
  if (filters.separator) params.separator = filters.separator;

  const blob = await api.get(`/reports/${type}.csv`, { params });

  const today = new Date().toISOString().split("T")[0];
  const filename = `${REPORT_LABELS[type] || type}_${today}.csv`;
  triggerBlobDownload(blob, filename);
}

/**
 * Dispara la descarga de un Blob en el navegador vía un enlace sintético.
 * Necesario porque las rutas de reportes requieren la cookie de sesión
 * (credentials: "include"), algo que un <a href> cross-origin no puede enviar.
 */
export function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
