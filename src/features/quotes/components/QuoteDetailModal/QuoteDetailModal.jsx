import { useState, useEffect, useRef } from "react";
import { X, AlertCircle, CheckCircle2, FileText, Upload, ExternalLink, Send } from "lucide-react";
import * as quotesService from "../../services/quotesService";
import { formatMoney, formatDate, QUOTE_STATUS_LABELS, QUOTE_STATUS_STYLES } from "../../utils/quotesFormat";
import styles from "./QuoteDetailModal.module.css";

export default function QuoteDetailModal({ isOpen, quoteId, clientName, onClose, onChanged }) {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !quoteId) return;
    setLoading(true);
    setError(null);
    setFeedback(null);

    quotesService
      .getQuoteById(quoteId)
      .then(setQuote)
      .catch((err) => setError(err.message || "No se pudo cargar la cotización."))
      .finally(() => setLoading(false));
  }, [isOpen, quoteId]);

  if (!isOpen) return null;

  const runAction = async (action, successMessage) => {
    setActionLoading(true);
    setError(null);
    try {
      const updated = await action();
      setQuote(updated);
      setFeedback(successMessage);
      onChanged?.();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setError(err.message || "No se pudo completar la acción.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeStatus = (status, message) =>
    runAction(() => quotesService.changeQuoteStatus(quoteId, status), message);

  const handleConvert = () =>
    runAction(
      () => quotesService.convertQuoteToOrder(quoteId).then((order) => ({ ...quote, convertedOrder: order })),
      "Cotización convertida a pedido exitosamente."
    );

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await runAction(() => quotesService.attachQuoteDocument(quoteId, file), "Documento adjuntado correctamente.");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const statusStyle = quote ? QUOTE_STATUS_STYLES[quote.status] || QUOTE_STATUS_STYLES.DRAFT : null;

  return (
    <div className={styles.overlay} onClick={onClose} aria-hidden="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>
              {quote?.quoteNumber || "Cotización"}
              {quote && (
                <span
                  className={styles.statusPill}
                  style={{ background: statusStyle.bg, color: statusStyle.color }}
                >
                  {QUOTE_STATUS_LABELS[quote.status] || quote.status}
                </span>
              )}
            </h2>
            <p className={styles.subtitle}>{clientName || `Cliente #${quote?.clientId || ""}`}</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </header>

        {error && (
          <div className={styles.errorAlert} role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {feedback && (
          <div className={styles.successAlert} role="status">
            <CheckCircle2 size={16} />
            <span>{feedback}</span>
          </div>
        )}

        {loading ? (
          <div className={styles.loadingBlock}>Cargando información de la cotización...</div>
        ) : quote ? (
          <div className={styles.body}>
            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Precio unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>{formatMoney(item.unitPrice)}</td>
                    <td>{formatMoney(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className={styles.totalLabel}>Total</td>
                  <td className={styles.totalValue}>{formatMoney(quote.total)}</td>
                </tr>
              </tfoot>
            </table>

            {quote.notes && (
              <div className={styles.notesBox}>
                <strong>Notas:</strong> {quote.notes}
              </div>
            )}

            <div className={styles.metaRow}>
              <span>Creada: {formatDate(quote.createdAt)}</span>
              <span>Última actualización: {formatDate(quote.updatedAt)}</span>
            </div>

            <div className={styles.documentSection}>
              <div className={styles.documentInfo}>
                <FileText size={16} />
                {quote.documentUrl ? (
                  <a href={quote.documentUrl} target="_blank" rel="noopener noreferrer" className={styles.documentLink}>
                    Ver documento adjunto
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <span>Sin documento adjunto</span>
                )}
              </div>
              <label className={styles.uploadBtn}>
                <Upload size={14} />
                <span>{quote.documentUrl ? "Reemplazar" : "Adjuntar"} archivo</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileSelected}
                  disabled={actionLoading}
                  hidden
                />
              </label>
            </div>
          </div>
        ) : null}

        {quote && (
          <footer className={styles.footer}>
            {quote.status === "DRAFT" && (
              <>
                <button
                  type="button"
                  className={styles.rejectBtn}
                  onClick={() => handleChangeStatus("REJECTED", "Cotización rechazada.")}
                  disabled={actionLoading}
                >
                  Rechazar
                </button>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => handleChangeStatus("SENT", "Cotización marcada como enviada.")}
                  disabled={actionLoading}
                >
                  <Send size={14} />
                  <span>Enviar cotización</span>
                </button>
              </>
            )}

            {quote.status === "SENT" && (
              <>
                <button
                  type="button"
                  className={styles.rejectBtn}
                  onClick={() => handleChangeStatus("REJECTED", "Cotización rechazada.")}
                  disabled={actionLoading}
                >
                  Rechazar
                </button>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => handleChangeStatus("APPROVED", "Cotización aprobada.")}
                  disabled={actionLoading}
                >
                  Aprobar
                </button>
              </>
            )}

            {quote.status === "APPROVED" && !quote.convertedOrder && (
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleConvert}
                disabled={actionLoading}
              >
                {actionLoading ? "Procesando..." : "Convertir a pedido"}
              </button>
            )}

            {quote.convertedOrder && (
              <span className={styles.convertedNotice}>
                Convertida en pedido {quote.convertedOrder.orderNumber}
              </span>
            )}

            <button type="button" className={styles.closeActionBtn} onClick={onClose}>
              Cerrar
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
