const moneyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

/** El backend envía los montos decimales como string ("2204000.00"). */
export function formatMoney(value) {
  if (value == null || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  return moneyFormatter.format(num);
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const QUOTE_STATUS_LABELS = {
  DRAFT: "Borrador",
  SENT: "Enviada",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

export const QUOTE_STATUS_STYLES = {
  DRAFT: { bg: "#f1f5f9", color: "#475569" },
  SENT: { bg: "#eff6ff", color: "#1d4ed8" },
  APPROVED: { bg: "#dcfce7", color: "#166534" },
  REJECTED: { bg: "#fef2f2", color: "#b91c1c" },
};

export const ORDER_STATUS_LABELS = {
  CREATED: "Creado",
  DISPATCHED: "Despachado",
  DELIVERED: "Entregado",
  CANCELLED: "Anulado",
};

export const ORDER_STATUS_STYLES = {
  CREATED: { bg: "#eff6ff", color: "#1d4ed8" },
  DISPATCHED: { bg: "#fffbeb", color: "#b45309" },
  DELIVERED: { bg: "#dcfce7", color: "#166534" },
  CANCELLED: { bg: "#fef2f2", color: "#b91c1c" },
};
