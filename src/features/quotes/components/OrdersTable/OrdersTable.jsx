import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMoney, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "../../utils/quotesFormat";
import styles from "./OrdersTable.module.css";

const NEXT_STATUS_OPTIONS = {
  CREATED: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export default function OrdersTable({
  orders = [],
  clientsById = {},
  loading = false,
  pagination,
  onPageChange,
  onChangeStatus,
}) {
  if (loading && orders.length === 0) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
        <p>Cargando pedidos...</p>
      </div>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <div className={styles.emptyWrapper}>
        <p className={styles.emptyTitle}>No se encontraron pedidos</p>
        <p className={styles.emptySubtitle}>
          Los pedidos se generan al convertir una cotización aprobada.
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
              <th>Número</th>
              <th>Cliente</th>
              <th>Cotización origen</th>
              <th>Estado</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Fecha</th>
              <th className={styles.thActions}>Cambiar estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const client = clientsById[order.clientId];
              const statusStyle = ORDER_STATUS_STYLES[order.status] || ORDER_STATUS_STYLES.CREATED;
              const nextOptions = NEXT_STATUS_OPTIONS[order.status] || [];

              return (
                <tr key={order.id}>
                  <td className={styles.tdNumber}>{order.orderNumber}</td>
                  <td>
                    <span className={styles.clientName}>
                      {client?.commercialName || `Cliente #${order.clientId}`}
                    </span>
                  </td>
                  <td className={styles.tdMuted}>COT-{String(order.quoteId).padStart(4, "0")}</td>
                  <td>
                    <span
                      className={styles.statusPill}
                      style={{ background: statusStyle.bg, color: statusStyle.color }}
                    >
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td className={styles.tdMuted}>
                    {order.items?.length || 0} {order.items?.length === 1 ? "ítem" : "ítems"}
                  </td>
                  <td className={styles.tdTotal}>{formatMoney(order.total)}</td>
                  <td className={styles.tdMuted}>{formatDate(order.createdAt)}</td>
                  <td>
                    {nextOptions.length > 0 ? (
                      <select
                        className={styles.statusSelect}
                        value=""
                        onChange={(e) => {
                          if (e.target.value) onChangeStatus(order, e.target.value);
                          e.target.value = "";
                        }}
                      >
                        <option value="">Actualizar a...</option>
                        {nextOptions.map((status) => (
                          <option key={status} value={status}>
                            {ORDER_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={styles.tdMuted}>Estado final</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className={styles.pagination}>
        <span className={styles.pageInfo}>
          Mostrando página <strong>{pagination.page}</strong> de{" "}
          <strong>{pagination.totalPages}</strong> ({pagination.total} pedidos en total)
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
