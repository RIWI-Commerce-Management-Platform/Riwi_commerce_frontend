import { useState } from "react";
import { AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import useOrders from "../hooks/useOrders";
import * as ordersService from "../services/ordersService";
import OrderFilters from "../components/OrderFilters/OrderFilters";
import OrdersTable from "../components/OrdersTable/OrdersTable";
import { ORDER_STATUS_LABELS } from "../utils/quotesFormat";
import styles from "./OrdersPage.module.css";

export default function OrdersPage() {
  const {
    orders,
    clientsById,
    filters,
    pagination,
    loading,
    error,
    setFilter,
    resetFilters,
    setPage,
    refresh,
  } = useOrders();

  const [feedback, setFeedback] = useState(null);
  const [actionError, setActionError] = useState(null);

  const handleChangeStatus = async (order, newStatus) => {
    setActionError(null);
    try {
      await ordersService.changeOrderStatus(order.id, newStatus);
      setFeedback(`Pedido ${order.orderNumber} actualizado a "${ORDER_STATUS_LABELS[newStatus]}".`);
      refresh();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setActionError(err.message || "No se pudo actualizar el estado del pedido.");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Gestión de Pedidos</h1>
          <p className={styles.subtitle}>
            Pedidos oficiales generados a partir de cotizaciones aprobadas y su seguimiento de
            despacho.
          </p>
        </div>

        <button
          type="button"
          className={styles.refreshBtn}
          onClick={refresh}
          title="Recargar pedidos"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? styles.spinning : ""} />
          <span>Actualizar</span>
        </button>
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

      {actionError && (
        <div className={styles.errorAlert} role="alert">
          <AlertCircle size={18} />
          <span>{actionError}</span>
        </div>
      )}

      {feedback && (
        <div className={styles.successAlert} role="status">
          <CheckCircle2 size={18} />
          <span>{feedback}</span>
        </div>
      )}

      <OrderFilters filters={filters} onFilterChange={setFilter} onReset={resetFilters} />

      <OrdersTable
        orders={orders}
        clientsById={clientsById}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
        onChangeStatus={handleChangeStatus}
      />
    </div>
  );
}
