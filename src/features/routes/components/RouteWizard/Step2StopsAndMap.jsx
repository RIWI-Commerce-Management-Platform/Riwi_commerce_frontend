import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Navigation,
  Clock,
  AlertCircle,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./RouteWizardModal.module.css";

export default function Step2StopsAndMap({
  stops = [],
  zoneClients = [],
  metrics,
  loading = false,
  clientsLoading = false,
  onAddStop,
  onRemoveStop,
  onMoveStop,
  onBack,
  onNext,
}) {
  const [selectedClientId, setSelectedClientId] = useState("");
  const [suggestedTime, setSuggestedTime] = useState("09:00:00");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Filtrar clientes de la zona que aún no están en la ruta
  const existingClientIds = new Set(stops.map((s) => s.clientId));
  const availableClients = zoneClients.filter((c) => !existingClientIds.has(c.id));

  // Inicialización y actualización del mapa interactivo con Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [10.96854, -74.78132], // Default Barranquilla
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Limpia capas anteriores (marcadores y líneas)
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    const latLngs = [];

    // Pintar pines numerados y acumular coordenadas para la polilínea
    stops.forEach((stop, idx) => {
      const client = stop.client;
      const lat = client?.latitude != null ? Number(client.latitude) : null;
      const lng = client?.longitude != null ? Number(client.longitude) : null;

      if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
        latLngs.push([lat, lng]);

        const orderNum = stop.visitOrder || idx + 1;
        const numberIcon = L.divIcon({
          className: styles.numberedMarkerWrapper,
          html: `
            <div class="${styles.routePin}">
              <span class="${styles.routePinNumber}">${orderNum}</span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        const marker = L.marker([lat, lng], { icon: numberIcon }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px;">
            <strong style="color: #ea580c; font-size: 14px;">Parada #${orderNum}: ${client.commercialName}</strong>
            <p style="margin: 4px 0 2px; color: #475569;">📍 ${client.address}</p>
            <span style="font-size: 11.5px; color: #64748b;">Llegada sugerida: ${stop.suggestedTime ? stop.suggestedTime.slice(0, 5) : "Por definir"}</span>
          </div>
        `);
      }
    });

    // Dibujar polilínea secuencial si hay al menos 2 puntos con coordenadas
    if (latLngs.length >= 2) {
      L.polyline(latLngs, {
        color: "#f97316",
        weight: 4,
        opacity: 0.85,
        dashArray: "6, 8",
        lineJoin: "round",
      }).addTo(map);
    }

    // Ajustar zoom para encuadrar todas las paradas
    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => clearTimeout(timer);
  }, [stops]);

  // Cleanup map instance al desmontar componente
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!selectedClientId) return;
    onAddStop(selectedClientId, suggestedTime, durationMinutes);
    setSelectedClientId("");
  };

  return (
    <div className={styles.step2Container}>
      <div className={styles.sectionNotice}>
        <p>
          <strong>Paso 2:</strong> Selecciona clientes de la zona y agrégalos al recorrido. Puedes
          cambiar el orden con las flechas arriba/abajo; el mapa trazará la secuencia y el sistema
          recalculará automáticamente la distancia en kilómetros y el tiempo estimado.
        </p>
      </div>

      <div className={styles.step2Grid}>
        {/* Columna Izquierda: Agregar y Listar Paradas */}
        <div className={styles.stopsColumn}>
          {/* Formulario de agregar parada */}
          <form onSubmit={handleAddSubmit} className={styles.addStopCard}>
            <h4 className={styles.addStopTitle}>
              <Plus size={16} />
              <span>Agregar Cliente a la Ruta</span>
            </h4>

            <div className={styles.field}>
              <label htmlFor="clientSelect">Seleccionar Cliente de la Zona *</label>
              <select
                id="clientSelect"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                disabled={clientsLoading || availableClients.length === 0}
              >
                <option value="">
                  {clientsLoading
                    ? "Cargando clientes..."
                    : availableClients.length === 0
                    ? "No hay más clientes en esta zona"
                    : "Elige un cliente para agregar..."}
                </option>
                {availableClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.commercialName} &bull; {client.address}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.addStopRow}>
              <div className={styles.field}>
                <label htmlFor="suggestedTime">Hora Sugerida</label>
                <input
                  id="suggestedTime"
                  type="time"
                  value={suggestedTime.slice(0, 5)}
                  onChange={(e) =>
                    setSuggestedTime(e.target.value ? `${e.target.value}:00` : "09:00:00")
                  }
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="durationMin">Atención (Minutos)</label>
                <input
                  id="durationMin"
                  type="number"
                  min="5"
                  max="240"
                  step="5"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                />
              </div>

              <button
                type="submit"
                className={styles.addStopBtn}
                disabled={!selectedClientId || loading}
              >
                <Plus size={16} />
                <span>Agregar</span>
              </button>
            </div>
          </form>

          {/* Listado ordenado de paradas */}
          <div className={styles.stopsListWrapper}>
            <h4 className={styles.stopsListTitle}>
              Secuencia de Paradas ({stops.length})
            </h4>

            {stops.length === 0 ? (
              <div className={styles.emptyStops}>
                <AlertCircle size={24} className={styles.emptyStopsIcon} />
                <p>No has agregado ninguna parada aún.</p>
                <span>Selecciona un cliente arriba para iniciar el trazado de la ruta.</span>
              </div>
            ) : (
              <ul className={styles.stopsList}>
                {stops.map((stop, idx) => {
                  const client = stop.client;
                  const orderNum = stop.visitOrder || idx + 1;
                  const isFirst = idx === 0;
                  const isLast = idx === stops.length - 1;

                  return (
                    <li key={stop.clientId} className={styles.stopItem}>
                      <span className={styles.stopNumberPill}>{orderNum}</span>

                      <div className={styles.stopInfo}>
                        <strong className={styles.stopClientName}>
                          {client?.commercialName || `Cliente #${stop.clientId}`}
                        </strong>
                        <span className={styles.stopAddress}>
                          📍 {client?.address || "Dirección física"}
                        </span>
                        <div className={styles.stopMeta}>
                          <span className={styles.stopTime}>
                            <Clock size={11} />
                            {stop.suggestedTime ? stop.suggestedTime.slice(0, 5) : "Sugerida: 09:00"}
                          </span>
                          <span>&bull;</span>
                          <span>{stop.estimatedDurationMinutes || 30} min</span>
                        </div>
                      </div>

                      {/* Controles de orden y eliminar */}
                      <div className={styles.stopActions}>
                        <button
                          type="button"
                          className={styles.reorderBtn}
                          disabled={isFirst || loading}
                          onClick={() => onMoveStop(idx, idx - 1)}
                          title="Subir de posición en el recorrido"
                          aria-label="Mover arriba"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          className={styles.reorderBtn}
                          disabled={isLast || loading}
                          onClick={() => onMoveStop(idx, idx + 1)}
                          title="Bajar de posición en el recorrido"
                          aria-label="Mover abajo"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          className={styles.deleteStopBtn}
                          disabled={loading}
                          onClick={() => onRemoveStop(stop.clientId)}
                          title="Eliminar parada de la ruta"
                          aria-label="Eliminar parada"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Columna Derecha: Métricas y Mapa */}
        <div className={styles.mapColumn}>
          {/* Métricas HUD */}
          <div className={styles.metricsBar}>
            <div className={styles.metricItem}>
              <span className={styles.metricLabel}>Total Paradas</span>
              <span className={styles.metricValue}>{stops.length}</span>
            </div>
            <div className={styles.metricItem}>
              <span className={styles.metricLabel}>Distancia Recorrido</span>
              <span className={styles.metricValue}>
                {metrics.totalDistanceKm != null
                  ? `${Number(metrics.totalDistanceKm).toFixed(1)} km`
                  : "0.0 km"}
              </span>
            </div>
            <div className={styles.metricItem}>
              <span className={styles.metricLabel}>Tiempo Estimado</span>
              <span className={styles.metricValue}>
                {metrics.estimatedDurationMinutes != null
                  ? `${metrics.estimatedDurationMinutes} min`
                  : "0 min"}
              </span>
            </div>
          </div>

          {/* Contenedor del Mapa interactivo */}
          <div className={styles.wizardMapWrapper}>
            <div ref={mapContainerRef} className={styles.wizardMap} />
          </div>
        </div>
      </div>

      <footer className={styles.stepFooter}>
        <button type="button" className={styles.secondaryBtn} onClick={onBack} disabled={loading}>
          ← Volver a Datos Generales
        </button>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={onNext}
          disabled={stops.length === 0 || loading}
        >
          Continuar a Asignación de Asesor (Paso 3) →
        </button>
      </footer>
    </div>
  );
}
