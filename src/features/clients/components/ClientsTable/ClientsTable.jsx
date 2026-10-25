import { MapPin, Users, Edit2, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import styles from "./ClientsTable.module.css";

function getPotentialBadge(potentialId, catalogs) {
  const pot = catalogs.potentials?.find((p) => p.id === potentialId);
  const name = pot?.name || "Estándar";
  const lower = name.toLowerCase();

  let badgeClass = styles.potentialMedium;
  if (lower.includes("alto") || lower.includes("alta")) {
    badgeClass = styles.potentialHigh;
  } else if (lower.includes("bajo") || lower.includes("baja")) {
    badgeClass = styles.potentialLow;
  }

  return <span className={`${styles.badge} ${badgeClass}`}>{name}</span>;
}

function getZoneName(zoneId, catalogs) {
  const zone = catalogs.zones?.find((z) => z.id === zoneId);
  return zone?.name || `Zona ${zoneId}`;
}

function getClientTypeName(typeId, catalogs) {
  const type = catalogs.clientTypes?.find((t) => t.id === typeId);
  return type?.name || "-";
}

export default function ClientsTable({
  clients = [],
  catalogs,
  loading = false,
  pagination,
  onPageChange,
  onEditClient,
  onManageContacts,
  onToggleStatus,
  onOpenMap,
}) {
  if (loading && clients.length === 0) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
        <p>Cargando clientes...</p>
      </div>
    );
  }

  if (!loading && clients.length === 0) {
    return (
      <div className={styles.emptyWrapper}>
        <p className={styles.emptyTitle}>No se encontraron clientes</p>
        <p className={styles.emptySubtitle}>
          Intenta ajustar los filtros de búsqueda o registra un nuevo cliente.
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
              <th>Cliente / NIT</th>
              <th>Ubicación</th>
              <th>Zona y Clasificación</th>
              <th>Potencial</th>
              <th>Frecuencia</th>
              <th>Estado</th>
              <th className={styles.thActions}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const hasGps = client.latitude != null && client.longitude != null;
              return (
                <tr key={client.id} className={!client.isActive ? styles.rowInactive : ""}>
                  {/* Identificación */}
                  <td>
                    <div className={styles.clientCell}>
                      <span className={styles.commercialName}>{client.commercialName}</span>
                      <span className={styles.businessName}>{client.businessName}</span>
                      <span className={styles.nit}>NIT: {client.nit}</span>
                    </div>
                  </td>

                  {/* Ubicación y Coordenadas */}
                  <td>
                    <div className={styles.locationCell}>
                      <span>{client.address}</span>
                      <span className={styles.municipality}>
                        {client.neighborhood ? `${client.neighborhood}, ` : ""}
                        {client.municipality}
                      </span>
                      <button
                        type="button"
                        className={`${styles.gpsButton} ${hasGps ? styles.gpsActive : styles.gpsMissing}`}
                        onClick={() => (hasGps ? onOpenMap?.(client) : onEditClient?.(client))}
                        title={
                          hasGps
                            ? `Haz clic para ver la ubicación en el mapa (Lat: ${client.latitude}, Lon: ${client.longitude})`
                            : "Sin coordenadas calculadas. Haz clic para editar."
                        }
                      >
                        <MapPin size={12} />
                        <span>{hasGps ? "Geolocalizado" : "Sin GPS"}</span>
                      </button>
                    </div>
                  </td>

                  {/* Zona y Tipo */}
                  <td>
                    <div className={styles.metaCell}>
                      <span className={styles.zoneTag}>{getZoneName(client.zoneId, catalogs)}</span>
                      <span className={styles.clientType}>{getClientTypeName(client.clientTypeId, catalogs)}</span>
                    </div>
                  </td>

                  {/* Potencial */}
                  <td>{getPotentialBadge(client.potentialId, catalogs)}</td>

                  {/* Frecuencia de Visita */}
                  <td>
                    <span className={styles.frequency}>
                      Cada {client.visitFrequencyDays || 15} días
                    </span>
                  </td>

                  {/* Estado con switch/toggle */}
                  <td>
                    <button
                      type="button"
                      className={`${styles.statusPill} ${client.isActive ? styles.statusActive : styles.statusInactive}`}
                      onClick={() => onToggleStatus(client)}
                      title={`Haz clic para ${client.isActive ? "desactivar" : "activar"}`}
                    >
                      {client.isActive ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>Activo</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={13} />
                          <span>Inactivo</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Acciones */}
                  <td>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => onManageContacts(client)}
                        title="Gestionar contactos"
                        aria-label="Gestionar contactos"
                      >
                        <Users size={16} />
                        <span>Contactos</span>
                      </button>
                      <button
                        type="button"
                        className={styles.actionBtnEdit}
                        onClick={() => onEditClient(client)}
                        title="Editar cliente"
                        aria-label="Editar cliente"
                      >
                        <Edit2 size={16} />
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
          Mostrando página <strong>{pagination.page}</strong> de <strong>{pagination.totalPages}</strong> ({pagination.total} clientes en total)
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
