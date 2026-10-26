import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { formatMoney, formatDate, QUOTE_STATUS_LABELS, QUOTE_STATUS_STYLES } from "../../utils/quotesFormat";
import styles from "./QuotesTable.module.css";

export default function QuotesTable({
  quotes = [],
  clientsById = {},
  loading = false,
  pagination,
  onPageChange,
  onViewQuote,
}) {
  if (loading && quotes.length === 0) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
        <p>Cargando cotizaciones...</p>
      </div>
    );
  }

  if (!loading && quotes.length === 0) {
    return (
      <div className={styles.emptyWrapper}>
        <p className={styles.emptyTitle}>No se encontraron cotizaciones</p>
        <p className={styles.emptySubtitle}>
          Ajusta los filtros de búsqueda o crea una nueva cotización.
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
              <th>Estado</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Fecha</th>
              <th className={styles.thActions}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => {
              const client = clientsById[quote.clientId];
              const statusStyle = QUOTE_STATUS_STYLES[quote.status] || QUOTE_STATUS_STYLES.DRAFT;

              return (
                <tr key={quote.id}>
                  <td className={styles.tdNumber}>{quote.quoteNumber}</td>
                  <td>
                    <span className={styles.clientName}>
                      {client?.commercialName || `Cliente #${quote.clientId}`}
                    </span>
                  </td>
                  <td>
                    <span
                      className={styles.statusPill}
                      style={{ background: statusStyle.bg, color: statusStyle.color }}
                    >
                      {QUOTE_STATUS_LABELS[quote.status] || quote.status}
                    </span>
                  </td>
                  <td className={styles.tdMuted}>
                    {quote.items?.length || 0} {quote.items?.length === 1 ? "ítem" : "ítems"}
                  </td>
                  <td className={styles.tdTotal}>{formatMoney(quote.total)}</td>
                  <td className={styles.tdMuted}>{formatDate(quote.createdAt)}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => onViewQuote(quote)}
                        title="Ver detalle"
                      >
                        <Eye size={15} />
                        <span>Detalle</span>
                      </button>
                    </div>
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
          <strong>{pagination.totalPages}</strong> ({pagination.total} cotizaciones en total)
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
