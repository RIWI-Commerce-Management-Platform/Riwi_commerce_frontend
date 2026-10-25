import { useState } from "react";
import { GitBranch, Plus, RefreshCw, AlertCircle } from "lucide-react";
import useRoutes from "../hooks/useRoutes";
import RouteFilters from "../components/RouteFilters/RouteFilters";
import RoutesTable from "../components/RoutesTable/RoutesTable";
import RouteWizardModal from "../components/RouteWizard/RouteWizardModal";
import RouteDetailModal from "../components/RouteDetailModal/RouteDetailModal";
import styles from "./RoutesPage.module.css";

export default function RoutesPage() {
  const {
    routes,
    zones,
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

  const [wizardOpen, setWizardOpen] = useState(false);
  const [routeToEdit, setRouteToEdit] = useState(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const handleOpenCreateWizard = () => {
    setRouteToEdit(null);
    setWizardOpen(true);
  };

  const handleOpenEditWizard = (route) => {
    setRouteToEdit(route);
    setWizardOpen(true);
  };

  const handleOpenDetailModal = (route) => {
    setSelectedRoute(route);
    setDetailModalOpen(true);
  };

  return (
    <div className={styles.container}>
      {/* Cabecera del módulo */}
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Planeación de Rutas Comerciales</h1>
          <p className={styles.subtitle}>
            Diseño de itinerarios semanales, secuenciamiento de paradas con cálculo de distancia
            (Haversine) y asignación a asesores (HU-17 a HU-22).
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
            onClick={handleOpenCreateWizard}
          >
            <Plus size={18} />
            <span>Nueva Ruta (Wizard)</span>
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

      {/* Barra de Filtros */}
      <RouteFilters
        filters={filters}
        zones={zones}
        onFilterChange={setFilter}
        onReset={resetFilters}
      />

      {/* Tabla de Rutas */}
      <RoutesTable
        routes={routes}
        zones={zones}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
        onViewRoute={handleOpenDetailModal}
        onEditRoute={handleOpenEditWizard}
        onToggleStatus={handleToggleStatus}
      />

      {/* Asistente Wizard de 3 Pasos */}
      <RouteWizardModal
        isOpen={wizardOpen}
        route={routeToEdit}
        zones={zones}
        onClose={() => setWizardOpen(false)}
        onSuccess={refresh}
      />

      {/* Modal de Detalle con Mapa Leaflet de la ruta */}
      <RouteDetailModal
        isOpen={detailModalOpen}
        route={selectedRoute}
        onClose={() => setDetailModalOpen(false)}
      />
    </div>
  );
}
