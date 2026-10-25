const pad = (n) => String(n).padStart(2, "0");

/** Fecha local en formato 'YYYY-MM-DD'. */
export const toIsoDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Lunes (YYYY-MM-DD) de la semana de `date`. */
export const mondayOf = (date = new Date()) => {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return toIsoDate(monday);
};

/** Suma semanas a un lunes 'YYYY-MM-DD'. */
export const shiftWeek = (iso, weeks) => {
  const [y, m, d] = iso.split("-").map(Number);
  return toIsoDate(new Date(y, m - 1, d + 7 * weeks));
};

const money = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** El backend envía los montos como texto decimal exacto ("2204000.00"). */
export const formatMoney = (value) => (value == null ? "—" : money.format(Number(value)));
export const formatPercent = (value) => (value == null ? "—" : `${percent.format(value)} %`);
