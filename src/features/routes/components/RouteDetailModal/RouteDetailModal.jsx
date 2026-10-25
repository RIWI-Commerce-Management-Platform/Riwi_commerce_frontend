import { useEffect, useRef, useState } from "react";
import {
  X,
  Compass,
  MapPin,
  Calendar,
  Clock,
  User,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import * as routesService from "../../services/routesService";
import styles from "./RouteDetailModal.module.css";

const DAY_LABELS = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

const FREQUENCY_LABELS = {
  WEEKLY: "Semanal",
  BIWEEKLY: "Quincenal",
  MONTHLY: "Mensual",
};

export default function RouteDetailModal({ isOpen, route, onClose }) {
  const [detailedRoute, setDetailedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !route?.id) {
      setDetailedRoute(null);
      return;
    }

    setLoading(true);
    routesService
      .getRouteById(route.id)
      .then((data) => setDetailedRoute(data))
      .catch((err) => console.warn("Error cargando detalle de ruta:", err))
      .finally(() => setLoading(false));
  }, [isOpen, route]);

  // Inicialización del Mapa
  useEffect(() => {
    if (!detailedRoute || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [10.96854, -74.78132],
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

    // Limpia capas anteriores
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    const stops = detailedRoute.stops || [];
    const latLngs = [];

    stops.forEach((stop, idx) => {
      const client = stop.client;
      const lat = client?.latitude != null ? Number(client.latitude) : null;
      const lng = client?.longitude != null ? Number(client.longitude) : null;

      if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
        latLngs.push([lat, lng]);

        const orderNum = stop.visitOrder || idx + 1;
        const numberIcon = L.divIcon({
          className: styles.markerWrapper,
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
            <span style="font-size: 11.5px; color: #64748b;">Llegada sugerida: ${stop.suggestedTime ? stop.suggestedTime.slice(0, 5) : "Por definir"} &bull; ${stop.estimatedDurationMinutes || 30} min</span>
          </div>
        `);
      }
    });

    if (latLngs.length >= 2) {
      L.polyline(latLngs, {
        color: "#2563eb",
        weight: 4,
        opacity: 0.85,
        dashArray: "6, 8",
        lineJoin: "round",
      }).addTo(map);
    }

    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => clearTimeout(timer);
  }, [detailedRoute]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (!isOpen || !route) return null;

  const current = detailedRoute || route;
  const stops = current.stops || [];

  return (
    <div className={styles.overlay} onClick={onClose} aria-hidden="true">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="route-detail-title"
      >
        <header className={styles.header}>
          <div className={styles.titleInfo}>
            <div className={styles.iconCircle}>
              <Compass size={22} className={styles.headerIcon} />
            </div>
            <div>
              <h2 id="route-detail-title" className={styles.title}>
                {current.name}
              </h2>
              <p className={styles.subtitle}>
                Itinerario comercial &bull; {DAY_LABELS[current.dayOfWeek] || current.dayOfWeek} (
                {FREQUENCY_LABELS[current.frequency] || current.frequency})
              </p>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </header>

        {/* Métricas y resumen superior */}
        <section className={styles.infoBar}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Total Paradas</span>
            <strong className={styles.metricVal}>{stops.length}</strong>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Distancia Recorrido</span>
            <strong className={styles.metricVal}>
              {current.totalDistanceKm != null ? `${Number(current.totalDistanceKm).toFixed(1)} km` : "0.0 km"}
            </strong>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Tiempo Estimado</span>
            <strong className={styles.metricVal}>
              {current.estimatedDurationMinutes != null ? `${current.estimatedDurationMinutes} min` : "0 min"}
            </strong>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Horario Jornada</span>
            <strong className={styles.metricVal}>
              {current.startTime ? current.startTime.slice(0, 5) : "08:00"} -{" "}
              {current.endTime ? current.endTime.slice(0, 5) : "17:00"}
            </strong>
          </div>
        </section>

        {/* Cuerpo: Mapa y Lista de Paradas */}
        <div className={styles.bodyGrid}>
          {/* Mapa Leaflet */}
          <div className={styles.mapContainer}>
            <div ref={mapContainerRef} className={styles.map} />
          </div>

          {/* Lista de Secuencia */}
          <div className={styles.stopsPanel}>
            <h3 className={styles.stopsTitle}>Secuencia de Visitas Programadas</h3>
            {stops.length === 0 ? (
              <p className={styles.noStops}>Esta ruta no tiene paradas registradas aún.</p>
            ) : (
              <ol className={styles.stopsTimeline}>
                {stops.map((stop, idx) => (
                  <li key={stop.clientId} className={styles.timelineItem}>
                    <span className={styles.timelineNumber}>{stop.visitOrder || idx + 1}</span>
                    <div className={styles.timelineContent}>
                      <strong className={styles.clientName}>
                        {stop.client?.commercialName || `Cliente #${stop.clientId}`}
                      </strong>
                      <span className={styles.clientAddress}>
                        📍 {stop.client?.address || "Dirección registrada"}
                      </span>
                      <div className={styles.timeBadge}>
                        <Clock size={11} />
                        <span>
                          {stop.suggestedTime ? stop.suggestedTime.slice(0, 5) : "09:00"} &bull;{" "}
                          {stop.estimatedDurationMinutes || 30} min
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <footer className={styles.footer}>
          <div />
          <button type="button" className={styles.closeActionBtn} onClick={onClose}>
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
}
