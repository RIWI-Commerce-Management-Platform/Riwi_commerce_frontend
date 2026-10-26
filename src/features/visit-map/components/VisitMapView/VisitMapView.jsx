import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./VisitMapView.module.css";

// Colores según categoría de leyenda (mapStatus) devuelta por GET /visit-map (HU-36)
export const MAP_STATUS_COLORS = {
  VISITED: "#16a34a",
  PENDING: "#ea580c",
  NOT_VISITED: "#64748b",
  ORDER_CLOSED: "#2563eb",
  RESCHEDULED: "#9333ea",
};

export const MAP_STATUS_LABELS = {
  VISITED: "Visitado",
  PENDING: "Pendiente",
  NOT_VISITED: "Sin visitar",
  ORDER_CLOSED: "Pedido generado",
  RESCHEDULED: "Reprogramado",
};

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const BARRANQUILLA_CENTER = [10.96854, -74.78132];

export default function VisitMapView({ markers = [] }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerGroupRef = useRef(null);

  // Crear el mapa una sola vez y redibujar los pines cuando cambian los datos
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: BARRANQUILLA_CENTER,
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      markersLayerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = markersLayerGroupRef.current;
    layerGroup.clearLayers();

    const positions = [];

    markers.forEach((marker) => {
      if (!marker.location) return;

      const pos = [Number(marker.location.latitude), Number(marker.location.longitude)];
      positions.push(pos);

      const color = MAP_STATUS_COLORS[marker.mapStatus] || "#64748b";

      const icon = L.divIcon({
        className: styles.markerHtmlWrapper,
        html: `<div class="${styles.pin}" style="background-color: ${color}"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -11],
      });

      const time = marker.scheduledAt
        ? new Date(marker.scheduledAt).toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";

      const leafletMarker = L.marker(pos, { icon }).addTo(layerGroup);
      leafletMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; max-width: 230px;">
          <strong style="color: #0b2545; display: block; margin-bottom: 2px;">
            ${escapeHtml(marker.client?.commercialName || "Cliente")}
          </strong>
          <div style="color: #475569; margin-bottom: 2px;">📍 ${escapeHtml(marker.client?.address || "")}</div>
          <div style="font-size: 11.5px; color: #64748b; margin-bottom: 6px;">
            ${escapeHtml(marker.client?.municipality || "")} &middot; ${escapeHtml(marker.zone?.name || "")}
          </div>
          <div style="font-size: 12px; color: #334155; margin-bottom: 2px;">
            <strong>Asesor:</strong> ${escapeHtml(marker.advisor?.name || "Sin asignar")}
          </div>
          <div style="font-size: 12px; color: #334155; margin-bottom: 6px;">
            <strong>Hora:</strong> ${time || "No programada"}
          </div>
          <span style="display: inline-block; padding: 2px 9px; border-radius: 10px; font-size: 11px; font-weight: 700; color: #fff; background: ${color};">
            ${escapeHtml(MAP_STATUS_LABELS[marker.mapStatus] || marker.mapStatus)}
          </span>
        </div>
      `);
    });

    if (positions.length > 0) {
      map.fitBounds(L.latLngBounds(positions), { padding: [40, 40], maxZoom: 15 });
    } else {
      map.setView(BARRANQUILLA_CENTER, 12);
    }

    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [markers]);

  // Destruir la instancia del mapa solo al desmontar la página (evita
  // "Map container is already initialized" al navegar fuera y volver).
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerGroupRef.current = null;
      }
    };
  }, []);

  return <div ref={mapContainerRef} className={styles.mapContainer} />;
}
