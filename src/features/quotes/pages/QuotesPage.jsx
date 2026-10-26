import { useState } from "react";
import { Plus, AlertCircle, RefreshCw } from "lucide-react";
import useQuotes from "../hooks/useQuotes";
import QuoteFilters from "../components/QuoteFilters/QuoteFilters";
import QuotesTable from "../components/QuotesTable/QuotesTable";
import QuoteFormModal from "../components/QuoteFormModal/QuoteFormModal";
import QuoteDetailModal from "../components/QuoteDetailModal/QuoteDetailModal";
import styles from "./QuotesPage.module.css";

export default function QuotesPage() {
  const {
    quotes,
    clientsById,
    filters,
    pagination,
    loading,
    error,
    setFilter,
    resetFilters,
    setPage,
    refresh,
  } = useQuotes();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailQuote, setDetailQuote] = useState(null);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Gestión Comercial de Cotizaciones</h1>
          <p className={styles.subtitle}>
            Creación de cotizaciones con cálculo automático, aprobación y conversión a pedidos
            oficiales.
          </p>
        </div>

        <div className={styles.actionsBlock}>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={refresh}
            title="Recargar cotizaciones"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? styles.spinning : ""} />
            <span>Actualizar</span>
          </button>

          <button type="button" className={styles.createBtn} onClick={() => setFormModalOpen(true)}>
            <Plus size={17} />
            <span>Nueva Cotización</span>
          </button>
        </div>
      </header>

      {error && (
        <div className={styles.errorAlert} role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={refresh} className={styles.retryBtn}>
            Reintentar
          </button>
        </div>
      )}

      <QuoteFilters filters={filters} onFilterChange={setFilter} onReset={resetFilters} />

      <QuotesTable
        quotes={quotes}
        clientsById={clientsById}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
        onViewQuote={(quote) => setDetailQuote(quote)}
      />

      <QuoteFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSuccess={refresh}
      />

      <QuoteDetailModal
        isOpen={Boolean(detailQuote)}
        quoteId={detailQuote?.id}
        clientName={clientsById[detailQuote?.clientId]?.commercialName}
        onClose={() => setDetailQuote(null)}
        onChanged={refresh}
      />
    </div>
  );
}
