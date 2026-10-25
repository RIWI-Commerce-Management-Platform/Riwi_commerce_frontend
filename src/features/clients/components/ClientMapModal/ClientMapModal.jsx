import { useEffect, useRef, useState } from "react";
import { X, MapPin, ExternalLink, Copy, Check, Navigation, AlertTriangle } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./ClientMapModal.module.css";

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function ClientMapModal({ isOpen, client, onClose }) {
  const [copied, setCopied] = useState(false);
  const mapContainerRef = useRef(null);

  const hasCoordinates =
    client &&
    client.latitude != null &&
    client.longitude != null &&
    !isNaN(Number(client.latitude)) &&
    !isNaN(Number(client.longitude));

  useEffect(() => {
    if (!isOpen || !hasCoordinates || !mapContainerRef.current) {
      return;
    }

    const lat = Number(client.latitude);
    const lng = Number(client.longitude);

    // Pin personalizado de alta visibilidad Comercial 360
    const customPin = L.divIcon({
      className: styles.markerWrapper,
      html: `
        <div class="${styles.pinContainer}">
          <div class="${styles.pinPulse}"></div>
          <div class="${styles.pinCircle}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38],
    });

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng], { icon: customPin }).addTo(map);

    const popupHtml = `
      <div style="font-family: inherit; font-size: 13px; line-height: 1.4; color: #0b2545;">
        <strong style="font-size: 14px; display: block; margin-bottom: 4px; color: #ea580c;">
          ${escapeHtml(client.commercialName || "Cliente")}
        </strong>
        <div style="color: #475569; margin-bottom: 2px;">
          📍 ${escapeHtml(client.address || "")}
        </div>
        <div style="font-size: 11.5px; color: #64748b;">
          ${escapeHtml(client.neighborhood ? client.neighborhood + ", " : "")}${escapeHtml(client.municipality || "")}
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml).openPopup();

    // Invalida tamaño para asegurar renderizado correcto al abrir el modal
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
    };
  }, [isOpen, hasCoordinates, client]);

  if (!isOpen || !client) return null;

  const handleCopyCoords = () => {
    if (hasCoordinates) {
      navigator.clipboard.writeText(`${client.latitude}, ${client.longitude}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${client.latitude},${client.longitude}`
    : null;

  const osmUrl = hasCoordinates
    ? `https://www.openstreetmap.org/?mlat=${client.latitude}&mlon=${client.longitude}#map=16/${client.latitude}/${client.longitude}`
    : null;

  return (
    <div className={styles.overlay} onClick={onClose} aria-hidden="true">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="map-modal-title"
      >
        {/* Cabecera del modal */}
        <header className={styles.header}>
          <div className={styles.titleInfo}>
            <div className={styles.iconCircle}>
              <MapPin size={22} className={styles.headerIcon} />
            </div>
            <div>
              <h2 id="map-modal-title" className={styles.title}>
                Ubicación Georreferenciada
              </h2>
              <p className={styles.subtitle}>
                {client.commercialName} &middot; NIT: {client.nit}
              </p>
            </div>
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

        {/* Barra superior de información de ubicación */}
        <section className={styles.infoBar}>
          <div className={styles.addressBlock}>
            <span className={styles.addressLabel}>Dirección física registrada:</span>
            <span className={styles.addressText}>
              {client.address}
              {client.neighborhood ? ` (${client.neighborhood})` : ""},{" "}
              {client.municipality}, {client.department}
            </span>
          </div>

          {hasCoordinates ? (
            <div className={styles.coordsBlock}>
              <div className={styles.coordsBadge}>
                <span className={styles.coordItem}>
                  <strong>Lat:</strong> {Number(client.latitude).toFixed(6)}
                </span>
                <span className={styles.coordSeparator}>&bull;</span>
                <span className={styles.coordItem}>
                  <strong>Lon:</strong> {Number(client.longitude).toFixed(6)}
                </span>
              </div>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={handleCopyCoords}
                title="Copiar coordenadas al portapapeles"
              >
                {copied ? <Check size={14} className={styles.copyCheck} /> : <Copy size={14} />}
                <span>{copied ? "¡Copiado!" : "Copiar"}</span>
              </button>
            </div>
          ) : (
            <div className={styles.noCoordsAlert}>
              <AlertTriangle size={15} />
              <span>Cliente sin coordenadas GPS calculadas.</span>
            </div>
          )}
        </section>

        {/* Contenedor del Mapa interactivo o fallback si no hay coordenadas */}
        <div className={styles.mapContainerWrapper}>
          {hasCoordinates ? (
            <div ref={mapContainerRef} className={styles.mapView} />
          ) : (
            <div className={styles.emptyMapState}>
              <AlertTriangle size={40} className={styles.emptyIcon} />
              <h3>Coordenadas no disponibles</h3>
              <p>
                Este cliente no cuenta con latitud y longitud almacenadas. Puedes editar sus
                datos para ingresar las coordenadas manualmente o verificar la dirección física.
              </p>
            </div>
          )}
        </div>

        {/* Pie de acciones del modal */}
        <footer className={styles.footer}>
          <div className={styles.externalLinks}>
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalBtn}
              >
                <Navigation size={15} />
                <span>Cómo llegar (Google Maps)</span>
                <ExternalLink size={13} />
              </a>
            )}
            {osmUrl && (
              <a
                href={osmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalBtnGhost}
              >
                <span>Ver en OpenStreetMap</span>
                <ExternalLink size={13} />
              </a>
            )}
          </div>

          <button type="button" className={styles.closeActionBtn} onClick={onClose}>
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
}
