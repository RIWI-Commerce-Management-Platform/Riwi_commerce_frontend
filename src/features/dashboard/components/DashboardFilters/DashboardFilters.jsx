import { mondayOf, shiftWeek } from "../../utils/dashboardFormat";
import styles from "./DashboardFilters.module.css";

export default function DashboardFilters({ weekStart, onWeekChange, territories, territoryId, onTerritoryChange }) {
  return (
    <section className={styles.filters} aria-label="Filtros">
      <div className={styles.field}>
        <label htmlFor="dashboard-week" className={styles.label}>Semana (desde el lunes)</label>
        <div className={styles.week}>
          <button type="button" className={styles.button} onClick={() => onWeekChange(shiftWeek(weekStart, -1))} aria-label="Semana anterior">‹</button>
          <input
            id="dashboard-week"
            type="date"
            className={styles.input}
            value={weekStart}
            onChange={(e) => e.target.value && onWeekChange(mondayOf(new Date(`${e.target.value}T00:00`)))}
          />
          <button type="button" className={styles.button} onClick={() => onWeekChange(shiftWeek(weekStart, 1))} aria-label="Semana siguiente">›</button>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="dashboard-territory" className={styles.label}>Territorio</label>
        <select id="dashboard-territory" className={styles.input} value={territoryId} onChange={(e) => onTerritoryChange(e.target.value)}>
          <option value="">Todos los territorios</option>
          {territories.map((zone) => (
            <option key={zone.id} value={String(zone.id)}>{zone.name}</option>
          ))}
        </select>
      </div>
    </section>
  );
}
