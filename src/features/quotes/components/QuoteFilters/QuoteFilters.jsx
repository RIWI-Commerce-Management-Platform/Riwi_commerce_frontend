import { RotateCcw } from "lucide-react";
import styles from "./QuoteFilters.module.css";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Borrador" },
  { value: "SENT", label: "Enviada" },
  { value: "APPROVED", label: "Aprobada" },
  { value: "REJECTED", label: "Rechazada" },
];

export default function QuoteFilters({ filters, onFilterChange, onReset }) {
  const hasActiveFilters =
    Boolean(filters.clientId) ||
    Boolean(filters.status) ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate);

  return (
    <section className={styles.container} aria-label="Filtros de cotizaciones">
      <div className={styles.grid}>
        <select
          className={styles.select}
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los Estados</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className={styles.field}>
          <label htmlFor="quoteStartDate">Desde</label>
          <input
            id="quoteStartDate"
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange("startDate", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="quoteEndDate">Hasta</label>
          <input
            id="quoteEndDate"
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange("endDate", e.target.value)}
          />
        </div>

        {hasActiveFilters && (
          <button type="button" className={styles.resetBtn} onClick={onReset} title="Limpiar filtros">
            <RotateCcw size={15} />
            <span>Limpiar</span>
          </button>
        )}
      </div>
    </section>
  );
}
