import { useState, useEffect } from "react";
import { X, Star, Trash2, Plus, Phone, Mail, UserCheck, AlertCircle } from "lucide-react";
import useClientContacts from "../../hooks/useClientContacts";
import styles from "./ClientContactsModal.module.css";

export default function ClientContactsModal({ isOpen, client, onClose }) {
  const {
    contacts,
    loading,
    error,
    fetchContacts,
    addContact,
    promotePrimary,
    removeContact,
  } = useClientContacts(client?.id);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    position: "",
    phone: "",
    mobile: "",
    email: "",
    isPrimary: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (isOpen && client?.id) {
      fetchContacts();
      setShowAddForm(false);
      setFormError(null);
    }
  }, [isOpen, client?.id, fetchContacts]);

  if (!isOpen || !client) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewContact((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!newContact.name.trim()) {
      setFormError("El nombre del contacto es obligatorio.");
      return;
    }
    if (!newContact.phone.trim() && !newContact.mobile.trim()) {
      setFormError("Ingresa al menos un teléfono o celular.");
      return;
    }

    setSubmitting(true);
    try {
      await addContact({
        name: newContact.name.trim(),
        position: newContact.position.trim() || "Contacto Comercial",
        phone: newContact.phone.trim() || "+576053000000",
        mobile: newContact.mobile.trim() || "+573000000000",
        email: newContact.email.trim() || "contacto@empresa.com",
        isPrimary: newContact.isPrimary,
      });

      setNewContact({
        name: "",
        position: "",
        phone: "",
        mobile: "",
        email: "",
        isPrimary: false,
      });
      setShowAddForm(false);
    } catch (err) {
      setFormError(err.message || "Error al agregar contacto.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePromote = async (contactId) => {
    try {
      await promotePrimary(contactId);
    } catch (err) {
      alert(`No se pudo cambiar el contacto principal: ${err.message}`);
    }
  };

  const handleDelete = async (contactId) => {
    if (confirm("¿Estás seguro de eliminar este contacto?")) {
      try {
        await removeContact(contactId);
      } catch (err) {
        alert(`No se pudo eliminar el contacto: ${err.message}`);
      }
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
            <h2 className={styles.title}>Contactos de {client.commercialName}</h2>
            <p className={styles.subtitle}>
              Gestión de interlocutores y regla de contacto principal único (HU-13)
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </header>

        <div className={styles.content}>
          {error && (
            <div className={styles.errorAlert} role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Botón para alternar formulario de nuevo contacto */}
          <div className={styles.toolbar}>
            <span className={styles.contactsCount}>
              Total contactos: <strong>{contacts.length}</strong>
            </span>
            <button
              type="button"
              className={styles.toggleFormBtn}
              onClick={() => setShowAddForm((v) => !v)}
            >
              <Plus size={16} />
              <span>{showAddForm ? "Ocultar formulario" : "Nuevo Contacto"}</span>
            </button>
          </div>

          {/* Formulario para agregar contacto */}
          {showAddForm && (
            <form onSubmit={handleAddSubmit} className={styles.addForm}>
              <h4 className={styles.formTitle}>Registrar nuevo contacto</h4>

              {formError && (
                <div className={styles.formError} role="alert">
                  <AlertCircle size={14} />
                  <span>{formError}</span>
                </div>
              )}

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor="contact-name">Nombre completo *</label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Ej: Laura Sofía Mendoza"
                    value={newContact.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="contact-position">Cargo en la empresa *</label>
                  <input
                    id="contact-position"
                    name="position"
                    type="text"
                    required
                    placeholder="Ej: Gerente de Compras"
                    value={newContact.position}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="contact-mobile">Celular *</label>
                  <input
                    id="contact-mobile"
                    name="mobile"
                    type="tel"
                    placeholder="Ej: +57 300 987 6543"
                    value={newContact.mobile}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="contact-email">Correo corporativo *</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="Ej: lmendoza@cliente.com"
                    value={newContact.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.fieldFull}>
                  <label className={styles.checkboxLabel}>
                    <input
                      name="isPrimary"
                      type="checkbox"
                      checked={newContact.isPrimary}
                      onChange={handleInputChange}
                    />
                    <span>
                      Designar como <strong>Contacto Principal</strong> (desmarcará automáticamente al principal anterior)
                    </span>
                  </label>
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelAddBtn}
                  onClick={() => setShowAddForm(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.saveAddBtn}
                  disabled={submitting}
                >
                  {submitting ? "Guardando..." : "Guardar Contacto"}
                </button>
              </div>
            </form>
          )}

          {/* Lista de contactos */}
          {loading ? (
            <p className={styles.statusMsg}>Cargando contactos...</p>
          ) : contacts.length === 0 ? (
            <div className={styles.emptyContacts}>
              <UserCheck size={32} className={styles.emptyIcon} />
              <p>Este cliente no tiene contactos registrados aún.</p>
              <button
                type="button"
                className={styles.addFirstBtn}
                onClick={() => setShowAddForm(true)}
              >
                Agregar primer contacto
              </button>
            </div>
          ) : (
            <div className={styles.contactsList}>
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`${styles.contactCard} ${contact.isPrimary ? styles.cardPrimary : ""}`}
                >
                  <div className={styles.contactHeader}>
                    <div className={styles.nameBlock}>
                      <span className={styles.contactName}>{contact.name}</span>
                      <span className={styles.contactPosition}>{contact.position}</span>
                    </div>

                    {contact.isPrimary ? (
                      <span className={styles.primaryBadge}>
                        <Star size={13} fill="#d97706" color="#d97706" />
                        <span>Contacto Principal</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className={styles.makePrimaryBtn}
                        onClick={() => handlePromote(contact.id)}
                        title="Hacer contacto principal"
                      >
                        <Star size={13} />
                        <span>Hacer Principal</span>
                      </button>
                    )}
                  </div>

                  <div className={styles.contactDetails}>
                    {(contact.mobile || contact.phone) && (
                      <div className={styles.detailItem}>
                        <Phone size={14} />
                        <span>{contact.mobile || contact.phone}</span>
                      </div>
                    )}
                    {contact.email && (
                      <div className={styles.detailItem}>
                        <Mail size={14} />
                        <span>{contact.email}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(contact.id)}
                      title="Eliminar contacto"
                    >
                      <Trash2 size={14} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className={styles.modalFooter}>
          <button type="button" className={styles.closeModalBtn} onClick={onClose}>
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
}
