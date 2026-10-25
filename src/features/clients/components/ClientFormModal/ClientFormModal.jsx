import { useState, useEffect } from "react";
import { X, MapPin, AlertCircle } from "lucide-react";
import * as clientsService from "../../services/clientsService";
import styles from "./ClientFormModal.module.css";

export default function ClientFormModal({
  isOpen,
  client = null,
  catalogs,
  onClose,
  onSuccess,
}) {
  const isEditing = Boolean(client);

  const [formData, setFormData] = useState({
    nit: "",
    businessName: "",
    commercialName: "",
    address: "",
    department: "Atlántico",
    municipality: "Barranquilla",
    neighborhood: "",
    phone: "",
    email: "",
    zoneId: "",
    clientTypeId: "",
    potentialId: "",
    clientStatusId: 1,
    visitFrequencyDays: 15,
    latitude: "",
    longitude: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (client) {
      setFormData({
        nit: client.nit || "",
        businessName: client.businessName || "",
        commercialName: client.commercialName || "",
        address: client.address || "",
        department: client.department || "Atlántico",
        municipality: client.municipality || "Barranquilla",
        neighborhood: client.neighborhood || "",
        phone: client.phone || "",
        email: client.email || "",
        zoneId: client.zoneId ? String(client.zoneId) : "",
        clientTypeId: client.clientTypeId ? String(client.clientTypeId) : "",
        potentialId: client.potentialId ? String(client.potentialId) : "",
        clientStatusId: client.clientStatusId || 1,
        visitFrequencyDays: client.visitFrequencyDays || 15,
        latitude: client.latitude != null ? String(client.latitude) : "",
        longitude: client.longitude != null ? String(client.longitude) : "",
      });
    } else {
      setFormData({
        nit: "",
        businessName: "",
        commercialName: "",
        address: "",
        department: "Atlántico",
        municipality: "Barranquilla",
        neighborhood: "",
        phone: "",
        email: "",
        zoneId: catalogs.zones[0]?.id ? String(catalogs.zones[0].id) : "",
        clientTypeId: catalogs.clientTypes[0]?.id ? String(catalogs.clientTypes[0].id) : "",
        potentialId: catalogs.potentials[0]?.id ? String(catalogs.potentials[0].id) : "",
        clientStatusId: 1,
        visitFrequencyDays: 15,
        latitude: "",
        longitude: "",
      });
    }
    setError(null);
  }, [client, catalogs, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones básicas
    if (!formData.nit.trim()) {
      setError("El NIT es obligatorio.");
      return;
    }
    if (!formData.commercialName.trim() || !formData.businessName.trim()) {
      setError("Debes ingresar la Razón Social y el Nombre Comercial.");
      return;
    }
    if (!formData.address.trim()) {
      setError("La dirección física es obligatoria para la geocodificación.");
      return;
    }

    const payload = {
      ...formData,
      zoneId: Number(formData.zoneId),
      clientTypeId: Number(formData.clientTypeId),
      potentialId: Number(formData.potentialId),
      clientStatusId: Number(formData.clientStatusId),
      visitFrequencyDays: Number(formData.visitFrequencyDays) || 15,
      latitude: formData.latitude !== "" && !isNaN(Number(formData.latitude)) ? Number(formData.latitude) : null,
      longitude: formData.longitude !== "" && !isNaN(Number(formData.longitude)) ? Number(formData.longitude) : null,
    };

    setLoading(true);
    try {
      if (isEditing) {
        await clientsService.updateClient(client.id, payload);
      } else {
        await clientsService.createClient(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Error al guardar el cliente.");
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
            <h2 className={styles.title}>
              {isEditing ? "Editar Cliente" : "Registrar Nuevo Cliente"}
            </h2>
            <p className={styles.subtitle}>
              {isEditing
                ? `Actualiza la información de ${client.commercialName}`
                : "Ingresa los datos del cliente corporativo"}
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

        {error && (
          <div className={styles.errorAlert} role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.scrollArea}>
            {/* Sección 1: Identificación */}
            <h3 className={styles.sectionTitle}>1. Identificación y Razón Social</h3>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label htmlFor="nit">NIT (Identificación Tributaria) *</label>
                <input
                  id="nit"
                  name="nit"
                  type="text"
                  required
                  placeholder="Ej: 900123456-1"
                  value={formData.nit}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="commercialName">Nombre Comercial *</label>
                <input
                  id="commercialName"
                  name="commercialName"
                  type="text"
                  required
                  placeholder="Ej: Supermercado El Norte"
                  value={formData.commercialName}
                  onChange={handleChange}
                />
              </div>

              <div className={`${styles.field} ${styles.colSpan2}`}>
                <label htmlFor="businessName">Razón Social Legal *</label>
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  required
                  placeholder="Ej: Distribuidora y Comercio El Norte S.A.S."
                  value={formData.businessName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Sección 2: Ubicación Física */}
            <h3 className={styles.sectionTitle}>2. Ubicación y Georreferenciación</h3>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label htmlFor="department">Departamento *</label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  required
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="municipality">Municipio / Ciudad *</label>
                <input
                  id="municipality"
                  name="municipality"
                  type="text"
                  required
                  value={formData.municipality}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="neighborhood">Barrio *</label>
                <input
                  id="neighborhood"
                  name="neighborhood"
                  type="text"
                  required
                  placeholder="Ej: El Prado"
                  value={formData.neighborhood}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="address">Dirección de Entrega / Visita *</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  placeholder="Ej: Cra 54 # 72 - 142"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Coordenadas GPS Opcionales / Manuales */}
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label htmlFor="latitude">Latitud GPS (Opcional)</label>
                <input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  placeholder="Ej: 11.01019"
                  value={formData.latitude}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="longitude">Longitud GPS (Opcional)</label>
                <input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  placeholder="Ej: -74.82318"
                  value={formData.longitude}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Aviso de Geocodificación Automática */}
            <div className={styles.geoNotice}>
              <MapPin size={16} className={styles.geoIcon} />
              <span>
                <strong>Georreferenciación Inteligente:</strong> Puedes ingresar las coordenadas GPS manualmente o dejarlas vacías para que el sistema las calcule automáticamente a partir de la dirección ingresada (OpenStreetMap).
              </span>
            </div>

            {/* Sección 3: Contacto y Clasificación */}
            <h3 className={styles.sectionTitle}>3. Contacto y Clasificación Comercial</h3>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label htmlFor="phone">Teléfono de Contacto *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="Ej: +57 300 123 4567"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="email">Correo Electrónico *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Ej: compras@elnorte.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="zoneId">Zona / Territorio *</label>
                <select
                  id="zoneId"
                  name="zoneId"
                  required
                  value={formData.zoneId}
                  onChange={handleChange}
                >
                  <option value="">Selecciona una zona</option>
                  {catalogs.zones.map((z) => (
                    <option key={z.id} value={String(z.id)}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="clientTypeId">Tipo de Cliente *</label>
                <select
                  id="clientTypeId"
                  name="clientTypeId"
                  required
                  value={formData.clientTypeId}
                  onChange={handleChange}
                >
                  <option value="">Selecciona tipo</option>
                  {catalogs.clientTypes.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="potentialId">Potencial de Venta *</label>
                <select
                  id="potentialId"
                  name="potentialId"
                  required
                  value={formData.potentialId}
                  onChange={handleChange}
                >
                  <option value="">Selecciona potencial</option>
                  {catalogs.potentials.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="visitFrequencyDays">Frecuencia de Visita (Días) *</label>
                <input
                  id="visitFrequencyDays"
                  name="visitFrequencyDays"
                  type="number"
                  min="1"
                  max="365"
                  required
                  value={formData.visitFrequencyDays}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <footer className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Actualizar Cliente" : "Crear Cliente"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
