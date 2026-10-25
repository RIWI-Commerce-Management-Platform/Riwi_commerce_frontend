import { useState } from "react";
import { UserPlus, AlertCircle, RefreshCw } from "lucide-react";
import useClients from "../hooks/useClients";
import ClientFilters from "../components/ClientFilters/ClientFilters";
import ClientsTable from "../components/ClientsTable/ClientsTable";
import ClientFormModal from "../components/ClientFormModal/ClientFormModal";
import ClientContactsModal from "../components/ClientContactsModal/ClientContactsModal";
import ClientMapModal from "../components/ClientMapModal/ClientMapModal";
import styles from "./ClientsPage.module.css";

export default function ClientsPage() {
  const {
    clients,
    catalogs,
    filters,
    pagination,
    loading,
    error,
    setFilter,
    resetFilters,
    setPage,
    refresh,
    handleToggleStatus,
  } = useClients();

  // Estados de los modales
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);

  const [contactsModalOpen, setContactsModalOpen] = useState(false);
  const [clientForContacts, setClientForContacts] = useState(null);

  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [clientForMap, setClientForMap] = useState(null);

  const handleOpenMapModal = (client) => {
    setClientForMap(client);
    setMapModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setClientToEdit(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (client) => {
    setClientToEdit(client);
    setFormModalOpen(true);
  };

  const handleOpenContactsModal = (client) => {
    setClientForContacts(client);
    setContactsModalOpen(true);
  };

  return (
    <div className={styles.container}>
      {/* Cabecera del módulo */}
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Directorio de Clientes</h1>
          <p className={styles.subtitle}>
            Administración centralizada de cuentas corporativas, geocodificación y contactos (HU-11 a HU-13).
          </p>
        </div>

        <div className={styles.actionsBlock}>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={refresh}
            title="Recargar clientes"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? styles.spinning : ""} />
            <span>Actualizar</span>
          </button>

          <button
            type="button"
            className={styles.createBtn}
            onClick={handleOpenCreateModal}
          >
            <UserPlus size={17} />
            <span>Nuevo Cliente</span>
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
      <ClientFilters
        filters={filters}
        catalogs={catalogs}
        onFilterChange={setFilter}
        onReset={resetFilters}
      />

      {/* Tabla de Clientes con paginación */}
      <ClientsTable
        clients={clients}
        catalogs={catalogs}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
        onEditClient={handleOpenEditModal}
        onManageContacts={handleOpenContactsModal}
        onToggleStatus={handleToggleStatus}
        onOpenMap={handleOpenMapModal}
      />

      {/* Modal de Creación / Edición de Cliente */}
      <ClientFormModal
        isOpen={formModalOpen}
        client={clientToEdit}
        catalogs={catalogs}
        onClose={() => setFormModalOpen(false)}
        onSuccess={refresh}
      />

      {/* Modal de Gestión de Contactos (HU-13) */}
      <ClientContactsModal
        isOpen={contactsModalOpen}
        client={clientForContacts}
        onClose={() => setContactsModalOpen(false)}
      />

      {/* Modal de Visualización de Ubicación y Mapa Interactivo */}
      <ClientMapModal
        isOpen={mapModalOpen}
        client={clientForMap}
        onClose={() => setMapModalOpen(false)}
      />
    </div>
  );
}
