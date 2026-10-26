import { RefreshCw } from "lucide-react";
import styles from "./VisitMapFilters.module.css";

export default function VisitMapFilters({
  date,
  onDateChange,
  territoryId,
  onTerritoryChange,
  zones,
  advisorId,
  onAdvisorChange,
  advisors,
  onRefresh,
  loading,
}) {
  return (
    <section className={styles.container} aria-label="Filtros del mapa de visitas">
      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="mapDate">Día de operación</label>
          <input
            id="mapDate"
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="mapTerritory">Territorio / Zona</label>
          <select
            id="mapTerritory"
            value={territoryId}
            onChange={(e) => onTerritoryChange(e.target.value)}
          >
            <option value="">Todas las zonas</option>
            {zones.map((zone) => (
              <option key={zone.id} value={String(zone.id)}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="mapAdvisor">Asesor comercial</label>
          <select
            id="mapAdvisor"
            value={advisorId}
            onChange={(e) => onAdvisorChange(e.target.value)}
          >
            <option value="">Todos los asesores</option>
            {advisors.map((adv) => (
              <option key={adv.id || adv.userId} value={String(adv.userId || adv.id)}>
                {adv.name || `Asesor #${adv.userId || adv.id}`}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className={styles.refreshBtn}
          onClick={onRefresh}
          disabled={loading}
          title="Recargar mapa"
        >
          <RefreshCw size={15} className={loading ? styles.spinning : ""} />
          <span>Actualizar</span>
        </button>
      </div>
    </section>
  );
}
