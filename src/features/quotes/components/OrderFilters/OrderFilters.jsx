import { RotateCcw } from "lucide-react";
import styles from "./OrderFilters.module.css";

const STATUS_OPTIONS = [
  { value: "CREATED", label: "Creado" },
  { value: "DISPATCHED", label: "Despachado" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "CANCELLED", label: "Anulado" },
];

export default function OrderFilters({ filters, onFilterChange, onReset }) {
  const hasActiveFilters =
    Boolean(filters.clientId) ||
    Boolean(filters.status) ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate);

  return (
    <section className={styles.container} aria-label="Filtros de pedidos">
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
          <label htmlFor="orderStartDate">Desde</label>
          <input
            id="orderStartDate"
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange("startDate", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="orderEndDate">Hasta</label>
          <input
            id="orderEndDate"
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
