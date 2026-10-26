import {
  GitBranch,
  Calendar,
  Clock,
  MapPin,
  User,
  Compass,
  Edit3,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import styles from "./RoutesTable.module.css";

const DAY_LABELS = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

const FREQUENCY_LABELS = {
  WEEKLY: "Semanal",
  BIWEEKLY: "Quincenal",
  MONTHLY: "Mensual",
};

function getStatusBadge(status) {
  if (status === "ASSIGNED") {
    return <span className={`${styles.badge} ${styles.badgeAssigned}`}>Asignada</span>;
  }
  if (status === "DRAFT") {
    return <span className={`${styles.badge} ${styles.badgeDraft}`}>Borrador</span>;
  }
  return <span className={`${styles.badge} ${styles.badgeInactive}`}>Inactiva</span>;
}

export default function RoutesTable({
  routes = [],
  zones = [],
  advisors = [],
  loading = false,
  pagination,
  onPageChange,
  onViewRoute,
  onEditRoute,
  onToggleStatus,
}) {
  const getZoneName = (zoneId) => {
    const z = zones.find((item) => item.id === zoneId);
    return z?.name || `Zona #${zoneId}`;
  };

  const getAdvisorName = (advisorId) => {
    if (!advisorId) return "Sin asignar";
    const adv = advisors.find((a) => (a.userId || a.id) === advisorId);
    return adv?.name || `Asesor #${advisorId}`;
  };

  if (loading && routes.length === 0) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
        <p>Cargando rutas comerciales...</p>
      </div>
    );
  }

  if (!loading && routes.length === 0) {
    return (
      <div className={styles.emptyWrapper}>
        <div className={styles.emptyIconCircle}>
          <GitBranch size={32} />
        </div>
        <p className={styles.emptyTitle}>No se encontraron rutas comerciales</p>
        <p className={styles.emptySubtitle}>
          Crea tu primera ruta usando el botón "Nueva Ruta" o ajusta los filtros de búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.tableCard}>
      <div className={styles.responsiveWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ruta y Territorio</th>
              <th>Itinerario</th>
              <th>Horario y Vigencia</th>
              <th>Métricas de Recorrido</th>
              <th>Asesor Asignado</th>
              <th>Estado</th>
              <th className={styles.thActions}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => {
              const stopsCount = route.stopsCount ?? route.stops?.length ?? 0;
              const distanceKm =
                route.totalDistanceKm != null ? `${Number(route.totalDistanceKm).toFixed(1)} km` : "0.0 km";
              const durationMin =
                route.estimatedDurationMinutes != null ? `${route.estimatedDurationMinutes} min` : "0 min";

              return (
                <tr key={route.id} className={!route.isActive ? styles.rowInactive : ""}>
                  {/* Nombre y Territorio */}
                  <td>
                    <div className={styles.routeCell}>
                      <span className={styles.routeName}>{route.name}</span>
                      <span className={styles.zoneTag}>{getZoneName(route.zoneId)}</span>
                      {route.description && (
                        <span className={styles.routeDescription}>{route.description}</span>
                      )}
                    </div>
                  </td>

                  {/* Itinerario (Día y Frecuencia) */}
                  <td>
                    <div className={styles.itineraryCell}>
                      <div className={styles.inlineInfo}>
                        <Calendar size={13} className={styles.cellIcon} />
                        <strong>{DAY_LABELS[route.dayOfWeek] || route.dayOfWeek}</strong>
                      </div>
                      <span className={styles.frequencyTag}>
                        {FREQUENCY_LABELS[route.frequency] || route.frequency}
                      </span>
                    </div>
                  </td>

                  {/* Horario y Vigencia */}
                  <td>
                    <div className={styles.scheduleCell}>
                      <div className={styles.inlineInfo}>
                        <Clock size={12} className={styles.cellIcon} />
                        <span>
                          {route.startTime ? route.startTime.slice(0, 5) : "08:00"} -{" "}
                          {route.endTime ? route.endTime.slice(0, 5) : "17:00"}
                        </span>
                      </div>
                      <span className={styles.dateRange}>
                        Desde {route.startDate}
                        {route.endDate ? ` hasta ${route.endDate}` : ""}
                      </span>
                    </div>
                  </td>

                  {/* Métricas */}
                  <td>
                    <div className={styles.metricsCell}>
                      <span className={styles.stopsBadge}>
                        <MapPin size={12} />
                        <strong>{stopsCount}</strong> {stopsCount === 1 ? "parada" : "paradas"}
                      </span>
                      <div className={styles.metricsDetails}>
                        <span title="Distancia acumulada">{distanceKm}</span>
                        <span>&bull;</span>
                        <span title="Tiempo estimado con atención">{durationMin}</span>
                      </div>
                    </div>
                  </td>

                  {/* Asesor Asignado */}
                  <td>
                    <div className={styles.advisorCell}>
                      <User size={13} className={styles.cellIcon} />
                      {route.advisorId ? (
                        <span className={styles.advisorName}>{getAdvisorName(route.advisorId)}</span>
                      ) : (
                        <span className={styles.noAdvisor}>Sin asignar</span>
                      )}
                    </div>
                  </td>

                  {/* Estado */}
                  <td>{getStatusBadge(route.status)}</td>

                  {/* Acciones */}
                  <td>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.actionBtnDetail}
                        onClick={() => onViewRoute(route)}
                        title="Ver mapa y detalle de paradas"
                        aria-label="Ver detalle de ruta"
                      >
                        <Compass size={15} />
                        <span>Mapa</span>
                      </button>

                      <button
                        type="button"
                        className={styles.actionBtnEdit}
                        onClick={() => onEditRoute(route)}
                        title="Editar recorrido"
                        aria-label="Editar ruta"
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        type="button"
                        className={`${styles.statusToggleBtn} ${
                          route.isActive ? styles.toggleActive : styles.toggleInactive
                        }`}
                        onClick={() => onToggleStatus(route)}
                        title={route.isActive ? "Desactivar ruta" : "Activar ruta"}
                        aria-label="Alternar estado"
                      >
                        {route.isActive ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <footer className={styles.pagination}>
        <span className={styles.pageInfo}>
          Página <strong>{pagination.page}</strong> de <strong>{pagination.totalPages}</strong> (
          {pagination.total} {pagination.total === 1 ? "ruta" : "rutas"} en total)
        </span>
        <div className={styles.pageControls}>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={pagination.page <= 1 || loading}
            onClick={() => onPageChange(pagination.page - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
            <span>Anterior</span>
          </button>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => onPageChange(pagination.page + 1)}
            aria-label="Página siguiente"
          >
            <span>Siguiente</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </footer>
    </div>
  );
}
