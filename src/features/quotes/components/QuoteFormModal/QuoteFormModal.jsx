import { useState, useEffect } from "react";
import { X, AlertCircle, Plus, Trash2 } from "lucide-react";
import * as quotesService from "../../services/quotesService";
import { getClients } from "@/features/clients/services/clientsService";
import { formatMoney } from "../../utils/quotesFormat";
import styles from "./QuoteFormModal.module.css";

function emptyItem() {
  return { productName: "", quantity: 1, unitPrice: "" };
}

export default function QuoteFormModal({ isOpen, onClose, onSuccess }) {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([emptyItem()]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setClientId("");
    setNotes("");
    setItems([emptyItem()]);
    setError(null);

    getClients({ limit: 200, isActive: true })
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setClients(list);
      })
      .catch(() => setClients([]));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleAddItem = () => setItems((prev) => [...prev, emptyItem()]);

  const handleRemoveItem = (index) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const total = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!clientId) {
      setError("Debes seleccionar un cliente.");
      return;
    }

    const validItems = items.filter((item) => item.productName.trim());
    if (validItems.length === 0) {
      setError("Debes agregar al menos un producto con nombre.");
      return;
    }
    for (const item of validItems) {
      if (!Number(item.quantity) || Number(item.quantity) <= 0) {
        setError(`La cantidad de "${item.productName}" debe ser mayor a cero.`);
        return;
      }
      if (item.unitPrice === "" || Number(item.unitPrice) < 0) {
        setError(`El precio unitario de "${item.productName}" no es válido.`);
        return;
      }
    }

    setLoading(true);
    try {
      await quotesService.createQuote({
        clientId: Number(clientId),
        notes,
        items: validItems.map((item) => ({
          productName: item.productName.trim(),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Error al crear la cotización.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} aria-hidden="true">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>Nueva Cotización</h2>
            <p className={styles.subtitle}>
              Selecciona el cliente y agrega los productos a cotizar
            </p>
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

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.scrollArea}>
            <div className={styles.field}>
              <label htmlFor="quoteClient">Cliente *</label>
              <select
                id="quoteClient"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
              >
                <option value="">Selecciona un cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.commercialName} — NIT {c.nit}
                  </option>
                ))}
              </select>
            </div>

            <h3 className={styles.sectionTitle}>Productos</h3>

            <div className={styles.itemsList}>
              <div className={styles.itemsHeaderRow}>
                <span>Producto</span>
                <span>Cantidad</span>
                <span>Precio unitario</span>
                <span>Subtotal</span>
                <span />
              </div>

              {items.map((item, index) => {
                const subtotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                return (
                  <div key={index} className={styles.itemRow}>
                    <input
                      type="text"
                      placeholder="Nombre del producto"
                      value={item.productName}
                      onChange={(e) => handleItemChange(index, "productName", e.target.value)}
                    />
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                    />
                    <span className={styles.itemSubtotal}>{formatMoney(subtotal)}</span>
                    <button
                      type="button"
                      className={styles.removeItemBtn}
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length === 1}
                      title="Quitar producto"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>

            <button type="button" className={styles.addItemBtn} onClick={handleAddItem}>
              <Plus size={14} />
              <span>Agregar producto</span>
            </button>

            <div className={styles.totalRow}>
              <span>Total estimado</span>
              <strong>{formatMoney(total)}</strong>
            </div>

            <div className={styles.field}>
              <label htmlFor="quoteNotes">Notas / Observaciones</label>
              <textarea
                id="quoteNotes"
                rows={3}
                placeholder="Ej: Entrega estimada en 5 días hábiles tras confirmación"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <footer className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Creando..." : "Crear Cotización"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
