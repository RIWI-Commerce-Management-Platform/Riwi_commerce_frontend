import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  RefreshCw,
  GitBranch,
  CheckCircle2,
  FileEdit,
  Route as RouteIcon,
  AlertCircle,
} from "lucide-react";
import useRoutes from "../hooks/useRoutes";
import RouteFilters from "../components/RouteFilters/RouteFilters";
import RoutesTable from "../components/RoutesTable/RoutesTable";
import RouteDetailModal from "../components/RouteDetailModal/RouteDetailModal";
import styles from "./AssignedRoutesPage.module.css";

export default function AssignedRoutesPage() {
  const navigate = useNavigate();

  const {
    routes,
    zones,
    advisors,
    filters,
    pagination,
    loading,
    error,
    setFilter,
    resetFilters,
    setPage,
    refresh,
    handleToggleStatus,
  } = useRoutes();

  // Estado del modal de detalle con mapa
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleOpenDetail = (route) => {
    setSelectedRoute(route);
    setDetailModalOpen(true);
  };

  const handleEditRoute = (route) => {
    // Redirigir a la mesa de trabajo de diseño de rutas
    navigate(`/rutas?id=${route.id}`);
  };

  // KPIs calculados
  const totalRoutesCount = pagination.total || routes.length;
  const assignedCount = routes.filter((r) => r.status === "ASSIGNED").length;
  const draftCount = routes.filter((r) => r.status === "DRAFT").length;
  const totalDistanceKm = routes
    .reduce((acc, curr) => acc + (Number(curr.totalDistanceKm) || 0), 0)
    .toFixed(1);

  return (
    <div className={styles.container}>
      {/* 1. Cabecera principal */}
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Rutas Asignadas</h1>
          <p className={styles.subtitle}>
            Supervisión integral de itinerarios comerciales, asignación a asesores y seguimiento geográfico.
          </p>
        </div>

        <div className={styles.actionsBlock}>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={refresh}
            title="Recargar rutas"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? styles.spinning : ""} />
            <span>Actualizar</span>
          </button>

          <button
            type="button"
            className={styles.createBtn}
            onClick={() => navigate("/rutas")}
          >
            <Plus size={17} />
            <span>Nueva Ruta</span>
          </button>
        </div>
      </header>

      {/* Alerta de Error si ocurre */}
      {error && (
        <div className={styles.errorAlert} role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={refresh} className={styles.retryBtn}>
            Reintentar
          </button>
        </div>
      )}

      {/* 2. Tarjetas de Resumen y KPIs Superiores */}
      <section className={styles.kpiGrid} aria-label="Métricas de rutas comerciales">
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.iconTotal}`}>
            <GitBranch size={22} />
          </div>
          <div className={styles.kpiTexts}>
            <span className={styles.kpiLabel}>Total de rutas</span>
            <strong className={styles.kpiNumber}>{totalRoutesCount}</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.iconAssigned}`}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.kpiTexts}>
            <span className={styles.kpiLabel}>Rutas asignadas</span>
            <strong className={styles.kpiNumber}>{assignedCount}</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.iconDraft}`}>
            <FileEdit size={22} />
          </div>
          <div className={styles.kpiTexts}>
            <span className={styles.kpiLabel}>Borradores</span>
            <strong className={styles.kpiNumber}>{draftCount}</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.iconDistance}`}>
            <RouteIcon size={22} />
          </div>
          <div className={styles.kpiTexts}>
            <span className={styles.kpiLabel}>Distancia total</span>
            <strong className={styles.kpiNumber}>{totalDistanceKm} km</strong>
          </div>
        </div>
      </section>

      {/* 3. Barra de Filtros Dinámicos */}
      <RouteFilters
        filters={filters}
        zones={zones}
        advisors={advisors}
        onFilterChange={setFilter}
        onReset={resetFilters}
      />

      {/* 4. Tabla de Rutas Asignadas con Paginación */}
      <RoutesTable
        routes={routes}
        zones={zones}
        advisors={advisors}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
        onViewRoute={handleOpenDetail}
        onEditRoute={handleEditRoute}
        onToggleStatus={handleToggleStatus}
      />

      {/* 5. Modal de Detalle de Ruta con Mapa Interactivo Leaflet */}
      <RouteDetailModal
        isOpen={detailModalOpen}
        route={selectedRoute}
        onClose={() => setDetailModalOpen(false)}
        onEdit={(routeToEdit) => {
          setDetailModalOpen(false);
          handleEditRoute(routeToEdit);
        }}
      />
    </div>
  );
}
