import { AlertCircle, MapPin } from "lucide-react";
import useVisitMap from "../hooks/useVisitMap";
import VisitMapFilters from "../components/VisitMapFilters/VisitMapFilters";
import VisitMapView, {
  MAP_STATUS_COLORS,
  MAP_STATUS_LABELS,
} from "../components/VisitMapView/VisitMapView";
import styles from "./VisitMapPage.module.css";

const STATUS_ORDER = ["PENDING", "VISITED", "ORDER_CLOSED", "RESCHEDULED", "NOT_VISITED"];

export default function VisitMapPage() {
  const {
    date,
    setDate,
    territoryId,
    setTerritoryId,
    advisorId,
    setAdvisorId,
    zones,
    advisors,
    map,
    loading,
    error,
    refresh,
  } = useVisitMap();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Mapa Interactivo de Visitas y Cobertura</h1>
          <p className={styles.subtitle}>
            Visualización geoespacial de clientes y estado de visitas en tiempo real sobre
            OpenStreetMap, por territorio y asesor.
          </p>
        </div>
      </header>

      {error && (
        <div className={styles.errorAlert} role="alert">
          <AlertCircle size={18} />
          <span>{error.message || "No se pudo cargar el mapa de visitas."}</span>
          <button type="button" onClick={refresh} className={styles.retryBtn}>
            Reintentar
          </button>
        </div>
      )}

      <VisitMapFilters
        date={date}
        onDateChange={setDate}
        territoryId={territoryId}
        onTerritoryChange={setTerritoryId}
        zones={zones}
        advisorId={advisorId}
        onAdvisorChange={setAdvisorId}
        advisors={advisors}
        onRefresh={refresh}
        loading={loading}
      />

      {map && (
        <div className={styles.summaryBar}>
          <div className={styles.summaryChip}>
            <MapPin size={14} />
            <span>
              <strong>{map.total}</strong> visitas el {map.date}
            </span>
          </div>
          {STATUS_ORDER.map((status) => (
            <div key={status} className={styles.summaryChip}>
              <span
                className={styles.summaryDot}
                style={{ backgroundColor: MAP_STATUS_COLORS[status] }}
              />
              <span>
                <strong>{map.counts?.[status] ?? 0}</strong> {MAP_STATUS_LABELS[status]}
              </span>
            </div>
          ))}
          {map.withoutLocation > 0 && (
            <div className={`${styles.summaryChip} ${styles.summaryChipWarning}`}>
              <AlertCircle size={13} />
              <span>
                <strong>{map.withoutLocation}</strong> sin coordenadas
              </span>
            </div>
          )}
        </div>
      )}

      <div className={styles.mapCard}>
        <VisitMapView markers={map?.data || []} />
        {!loading && map && map.data.length === 0 && (
          <div className={styles.emptyOverlay}>
            <p>No hay visitas programadas para los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
