import { Search, RotateCcw } from "lucide-react";
import styles from "./RouteFilters.module.css";

const DAYS = [
  { value: "MONDAY", label: "Lunes" },
  { value: "TUESDAY", label: "Martes" },
  { value: "WEDNESDAY", label: "Miércoles" },
  { value: "THURSDAY", label: "Jueves" },
  { value: "FRIDAY", label: "Viernes" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
];

const FREQUENCIES = [
  { value: "WEEKLY", label: "Semanal" },
  { value: "BIWEEKLY", label: "Quincenal" },
  { value: "MONTHLY", label: "Mensual" },
];

const STATUSES = [
  { value: "ASSIGNED", label: "Asignada" },
  { value: "DRAFT", label: "Borrador" },
  { value: "INACTIVE", label: "Inactiva" },
];

export default function RouteFilters({
  filters,
  zones = [],
  advisors = [],
  onFilterChange,
  onReset,
}) {
  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.zoneId) ||
    Boolean(filters.advisorId) ||
    Boolean(filters.status) ||
    Boolean(filters.dayOfWeek) ||
    Boolean(filters.frequency) ||
    filters.isActive !== "";

  return (
    <section className={styles.container} aria-label="Filtros de rutas comerciales">
      <div className={styles.grid}>
        {/* Búsqueda por texto */}
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por nombre de ruta..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
          />
        </div>

        {/* Zona */}
        <select
          className={styles.select}
          value={filters.zoneId}
          onChange={(e) => onFilterChange("zoneId", e.target.value)}
          aria-label="Filtrar por zona territorial"
        >
          <option value="">Todas las Zonas</option>
          {zones.map((zone) => (
            <option key={zone.id} value={String(zone.id)}>
              {zone.name}
            </option>
          ))}
        </select>

        {/* Asesor */}
        <select
          className={styles.select}
          value={filters.advisorId || ""}
          onChange={(e) => onFilterChange("advisorId", e.target.value)}
          aria-label="Filtrar por asesor comercial"
        >
          <option value="">Todos los Asesores</option>
          {advisors.map((adv) => (
            <option key={adv.userId || adv.id} value={String(adv.userId || adv.id)}>
              {adv.name}
            </option>
          ))}
        </select>

        {/* Estado */}
        <select
          className={styles.select}
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los Estados</option>
          {STATUSES.map((st) => (
            <option key={st.value} value={st.value}>
              {st.label}
            </option>
          ))}
        </select>

        {/* Día de la semana */}
        <select
          className={styles.select}
          value={filters.dayOfWeek}
          onChange={(e) => onFilterChange("dayOfWeek", e.target.value)}
          aria-label="Filtrar por día de atención"
        >
          <option value="">Cualquier Día</option>
          {DAYS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        {/* Frecuencia */}
        <select
          className={styles.select}
          value={filters.frequency}
          onChange={(e) => onFilterChange("frequency", e.target.value)}
          aria-label="Filtrar por frecuencia"
        >
          <option value="">Cualquier Frecuencia</option>
          {FREQUENCIES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        {/* Limpiar */}
        {hasActiveFilters && (
          <button
            type="button"
            className={styles.resetBtn}
            onClick={onReset}
            title="Limpiar filtros"
          >
            <RotateCcw size={15} />
            <span>Limpiar</span>
          </button>
        )}
      </div>
    </section>
  );
}
