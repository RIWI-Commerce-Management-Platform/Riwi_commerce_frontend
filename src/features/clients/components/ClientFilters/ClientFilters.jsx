import { Search, RotateCcw } from "lucide-react";
import styles from "./ClientFilters.module.css";

export default function ClientFilters({
  filters,
  catalogs,
  onFilterChange,
  onReset,
}) {
  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.zoneId) ||
    Boolean(filters.clientTypeId) ||
    Boolean(filters.potentialId) ||
    filters.isActive !== "";

  return (
    <section className={styles.container} aria-label="Filtros de clientes">
      <div className={styles.grid}>
        {/* Búsqueda por texto */}
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por NIT o nombre comercial..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
          />
        </div>

        {/* Filtro por Zona */}
        <select
          className={styles.select}
          value={filters.zoneId}
          onChange={(e) => onFilterChange("zoneId", e.target.value)}
          aria-label="Filtrar por territorio"
        >
          <option value="">Todas las Zonas</option>
          {catalogs.zones.map((zone) => (
            <option key={zone.id} value={String(zone.id)}>
              {zone.name}
            </option>
          ))}
        </select>

        {/* Filtro por Tipo de Cliente */}
        <select
          className={styles.select}
          value={filters.clientTypeId}
          onChange={(e) => onFilterChange("clientTypeId", e.target.value)}
          aria-label="Filtrar por tipo de cliente"
        >
          <option value="">Todos los Tipos</option>
          {catalogs.clientTypes.map((type) => (
            <option key={type.id} value={String(type.id)}>
              {type.name}
            </option>
          ))}
        </select>

        {/* Filtro por Potencial */}
        <select
          className={styles.select}
          value={filters.potentialId}
          onChange={(e) => onFilterChange("potentialId", e.target.value)}
          aria-label="Filtrar por potencial de venta"
        >
          <option value="">Todos los Potenciales</option>
          {catalogs.potentials.map((pot) => (
            <option key={pot.id} value={String(pot.id)}>
              Potencial: {pot.name}
            </option>
          ))}
        </select>

        {/* Filtro por Estado */}
        <select
          className={styles.select}
          value={filters.isActive}
          onChange={(e) => onFilterChange("isActive", e.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los Estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>

        {/* Botón reset */}
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
