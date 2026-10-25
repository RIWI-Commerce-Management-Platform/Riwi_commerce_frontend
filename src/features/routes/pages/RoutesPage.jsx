import { useState, useEffect, useRef, useMemo } from "react";
import {
  Check,
  Search,
  Plus,
  Trash2,
  Edit2,
  Maximize2,
  Layers,
  Sparkles,
  Info,
  Clock,
  ChevronDown,
  Building2,
  Users,
  Store,
  Package,
  FileSpreadsheet,
  GripVertical,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import * as routesService from "../services/routesService";
import { getClients, getCatalogs } from "@/features/clients/services/clientsService";
import styles from "./RoutesPage.module.css";

// Muestra inicial de clientes representativos para enriquecer la experiencia visual del mockup
const INITIAL_DEMO_CLIENTS = [
  {
    id: 101,
    commercialName: "Induacero S.A.S",
    clientType: "Industrial",
    address: "Cra 38 # 74-120",
    municipality: "Barranquilla",
    latitude: 10.998,
    longitude: -74.815,
    icon: Building2,
    iconColor: "#ea580c",
    iconBg: "#fff7ed",
  },
  {
    id: 102,
    commercialName: "Ferretería Central",
    clientType: "Distribuidor",
    address: "Calle 84 # 42-15",
    municipality: "Barranquilla",
    latitude: 11.008,
    longitude: -74.821,
    icon: Users,
    iconColor: "#2563eb",
    iconBg: "#eff6ff",
  },
  {
    id: 103,
    commercialName: "Prodeco Ltda.",
    clientType: "Industrial",
    address: "Cra 21 # 30-45",
    municipality: "Soledad",
    latitude: 10.925,
    longitude: -74.772,
    icon: Store,
    iconColor: "#16a34a",
    iconBg: "#f0fdf4",
  },
  {
    id: 104,
    commercialName: "Suministros del Caribe",
    clientType: "Distribuidor",
    address: "Cra 5 # 18-60",
    municipality: "Malambo",
    latitude: 10.865,
    longitude: -74.771,
    icon: Package,
    iconColor: "#0284c7",
    iconBg: "#f0f9ff",
  },
  {
    id: 105,
    commercialName: "Comercializadora J&J",
    clientType: "Industrial",
    address: "Calle 16 # 9-30",
    municipality: "Galapa",
    latitude: 10.898,
    longitude: -74.885,
    icon: FileSpreadsheet,
    iconColor: "#dc2626",
    iconBg: "#fef2f2",
  },
];

// Colores de pines según estado de parada
const STATUS_COLORS = {
  VISITED: "#16a34a", // Verde
  PENDING: "#ea580c", // Naranja
  RESCHEDULED: "#9333ea", // Morado
  UNVISITED: "#64748b", // Gris
  UNASSIGNED: "#2563eb", // Azul
};

export default function RoutesPage() {
  // Stepper activo: 1: Información, 2: Diseño, 3: Asignación
  const [activeStep, setActiveStep] = useState(2);

  // Datos generales del formulario
  const [generalInfo, setGeneralInfo] = useState({
    name: "RUT-ATL-001",
    zoneId: "1",
    dayOfWeek: "TUESDAY",
    frequency: "WEEKLY",
    startTime: "08:00",
    endTime: "17:00",
    description: "Ruta para atención de clientes industriales en el Atlántico Este.",
  });

  // Catálogos
  const [zones, setZones] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState("");

  // Lista de clientes agregados a la ruta
  const [stops, setStops] = useState([
    {
      clientId: 1,
      visitOrder: 1,
      commercialName: "Metalúrgicas S.A.S",
      clientType: "Industrial",
      address: "Cra 38 # 74-120",
      municipality: "Barranquilla",
      suggestedTime: "08:30 AM",
      latitude: 10.998,
      longitude: -74.815,
      status: "VISITED",
    },
    {
      clientId: 2,
      visitOrder: 2,
      commercialName: "Ferretería del Norte",
      clientType: "Distribuidor",
      address: "Calle 84 # 42-15",
      municipality: "Barranquilla",
      suggestedTime: "10:00 AM",
      latitude: 11.008,
      longitude: -74.821,
      status: "VISITED",
    },
    {
      clientId: 3,
      visitOrder: 3,
      commercialName: "Aceros del Caribe",
      clientType: "Industrial",
      address: "Vía 40 # 65-200",
      municipality: "Barranquilla",
      suggestedTime: "11:30 AM",
      latitude: 11.018,
      longitude: -74.805,
      status: "VISITED",
    },
    {
      clientId: 4,
      visitOrder: 4,
      commercialName: "Soluciones Industriales",
      clientType: "Industrial",
      address: "Cra 21 # 30-45",
      municipality: "Soledad",
      suggestedTime: "01:30 PM",
      latitude: 10.925,
      longitude: -74.772,
      status: "VISITED",
    },
    {
      clientId: 5,
      visitOrder: 5,
      commercialName: "ConstruInnova",
      clientType: "Industrial",
      address: "Calle 30 # 12-50",
      municipality: "Soledad",
      suggestedTime: "03:00 PM",
      latitude: 10.938,
      longitude: -74.765,
      status: "PENDING",
    },
    {
      clientId: 6,
      visitOrder: 6,
      commercialName: "Distribuciones JM",
      clientType: "Distribuidor",
      address: "Cra 5 # 18-60",
      municipality: "Malambo",
      suggestedTime: "04:00 PM",
      latitude: 10.865,
      longitude: -74.771,
      status: "UNASSIGNED",
    },
    {
      clientId: 7,
      visitOrder: 7,
      commercialName: "Ferretería La 14",
      clientType: "Retail",
      address: "Calle 16 # 9-30",
      municipality: "Malambo",
      suggestedTime: "04:45 PM",
      latitude: 10.858,
      longitude: -74.765,
      status: "RESCHEDULED",
    },
  ]);

  // Búsqueda y catálogo de clientes del panel derecho
  const [clientSearch, setClientSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterMuni, setFilterMuni] = useState("");
  const [availableClients, setAvailableClients] = useState(INITIAL_DEMO_CLIENTS);

  // Estado de guardado y feedback
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Referencias de Leaflet
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Carga inicial de zonas y clientes reales desde el backend
  useEffect(() => {
    getCatalogs()
      .then((data) => {
        if (data?.zones) setZones(data.zones);
      })
      .catch((err) => console.warn("Catálogos:", err));

    routesService
      .getAvailableAdvisors()
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setAdvisors(list);
        if (list.length > 0) setSelectedAdvisorId(String(list[0].userId || list[0].id));
      })
      .catch(() => {
        setAdvisors([
          { id: 1, name: "Richard Lopez" },
          { id: 2, name: "Laura Martinez" },
          { id: 3, name: "Alejandro Villanueva" },
        ]);
        setSelectedAdvisorId("1");
      });

    // Cargar clientes registrados en base de datos para integrarlos al panel
    getClients({ limit: 50, isActive: true })
      .then((res) => {
        const dbClients = Array.isArray(res) ? res : res?.data || [];
        if (dbClients.length > 0) {
          const mapped = dbClients.map((c, i) => ({
            id: c.id,
            commercialName: c.commercialName,
            clientType: "Comercial",
            address: c.address,
            municipality: c.municipality || "Barranquilla",
            latitude: c.latitude != null ? Number(c.latitude) : 11.002,
            longitude: c.longitude != null ? Number(c.longitude) : -74.815,
            icon: i % 2 === 0 ? Building2 : Store,
            iconColor: "#ea580c",
            iconBg: "#fff7ed",
          }));
          // Unir clientes de DB con los de demo asegurando variedad
          setAvailableClients((prev) => [...mapped, ...prev]);
        }
      })
      .catch((err) => console.warn("Clientes DB:", err));
  }, []);

  // Inicialización y renderizado del mapa interactivo
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [10.96854, -74.78132],
        zoom: 12,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Control de zoom en la esquina inferior derecha como en el diseño
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Limpia capas anteriores (marcadores y polilíneas)
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    const latLngs = [];

    // Pintar pines circulares numerados idénticos al diseño
    stops.forEach((stop) => {
      if (stop.latitude != null && stop.longitude != null) {
        const pos = [Number(stop.latitude), Number(stop.longitude)];
        latLngs.push(pos);

        const pinColor = STATUS_COLORS[stop.status] || "#ea580c";

        const pinIcon = L.divIcon({
          className: styles.markerHtmlWrapper,
          html: `
            <div class="${styles.roundPin}" style="background-color: ${pinColor}">
              <span>${stop.visitOrder}</span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        });

        const marker = L.marker(pos, { icon: pinIcon }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px;">
            <strong style="color: #0b2545;">#${stop.visitOrder} - ${stop.commercialName}</strong>
            <div style="color: #64748b; font-size: 12px; margin-top: 3px;">📍 ${stop.address}</div>
            <div style="font-size: 11px; color: #ea580c; font-weight: 600; margin-top: 2px;">Hora: ${stop.suggestedTime}</div>
          </div>
        `);
      }
    });

    // Trazar polilínea oscura en bucle como en el diseño
    if (latLngs.length >= 2) {
      // Si hay al menos 3 puntos, cerramos el bucle al primer punto para formar el recorrido completo
      const loopPoints = latLngs.length >= 3 ? [...latLngs, latLngs[0]] : latLngs;

      L.polyline(loopPoints, {
        color: "#1e293b",
        weight: 3.5,
        opacity: 0.9,
        lineJoin: "round",
      }).addTo(map);

      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => clearTimeout(timer);
  }, [stops]);

  // Manejo de cambios en el formulario de información general
  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Agregar cliente al recorrido
  const handleAddStop = (client) => {
    // Evitar duplicar cliente en la misma ruta
    if (stops.some((s) => s.clientId === client.id)) {
      alert("Este cliente ya se encuentra en el recorrido de la ruta.");
      return;
    }

    const nextOrder = stops.length + 1;
    const hour = 8 + Math.floor((nextOrder * 45) / 60);
    const min = (nextOrder * 45) % 60;
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour;
    const timeFormatted = `${String(displayHour).padStart(2, "0")}:${String(min).padStart(2, "0")} ${period}`;

    const newStop = {
      clientId: client.id,
      visitOrder: nextOrder,
      commercialName: client.commercialName,
      clientType: client.clientType || "Comercial",
      address: client.address || "Dirección registrada",
      municipality: client.municipality || "Barranquilla",
      suggestedTime: timeFormatted,
      latitude: client.latitude != null ? Number(client.latitude) : 10.998 + (nextOrder * 0.01),
      longitude: client.longitude != null ? Number(client.longitude) : -74.815 - (nextOrder * 0.01),
      status: nextOrder % 3 === 0 ? "PENDING" : "VISITED",
    };

    setStops((prev) => [...prev, newStop]);
  };

  // Eliminar cliente del recorrido
  const handleRemoveStop = (clientId) => {
    setStops((prev) => {
      const filtered = prev.filter((s) => s.clientId !== clientId);
      // Reindexar secuencia de orden
      return filtered.map((s, idx) => ({ ...s, visitOrder: idx + 1 }));
    });
  };

  // Limpiar toda la ruta
  const handleClearRoute = () => {
    if (window.confirm("¿Deseas remover todos los clientes y reiniciar el trazado de la ruta?")) {
      setStops([]);
    }
  };

  // Optimizar ruta (simulación de ordenamiento inteligente de paradas)
  const handleOptimizeRoute = () => {
    setFeedback({ type: "info", message: "Optimizando secuencia de visitas por proximidad geográfica..." });
    setTimeout(() => {
      setStops((prev) => {
        // Ordena por latitud para simular algoritmo TSP
        const sorted = [...prev].sort((a, b) => (b.latitude || 0) - (a.latitude || 0));
        return sorted.map((s, idx) => ({ ...s, visitOrder: idx + 1 }));
      });
      setFeedback({ type: "success", message: "Ruta optimizada con éxito." });
      setTimeout(() => setFeedback(null), 3000);
    }, 600);
  };

  // Guardar Borrador
  const handleSaveDraft = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await routesService.createRouteDraft({
        name: generalInfo.name,
        description: generalInfo.description,
        zoneId: Number(generalInfo.zoneId) || 1,
        dayOfWeek: generalInfo.dayOfWeek,
        frequency: generalInfo.frequency,
        startTime: `${generalInfo.startTime}:00`,
        endTime: `${generalInfo.endTime}:00`,
        startDate: new Date().toISOString().split("T")[0],
      });
      setFeedback({ type: "success", message: "Borrador de ruta guardado exitosamente." });
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Error al guardar el borrador." });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // Guardar y Asignar
  const handleSaveAndAssign = async () => {
    if (!selectedAdvisorId) {
      alert("Por favor selecciona un asesor comercial antes de guardar y asignar.");
      return;
    }
    if (stops.length === 0) {
      alert("Debes agregar al menos una parada al recorrido de la ruta.");
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      // 1. Crea borrador
      const created = await routesService.createRouteDraft({
        name: generalInfo.name,
        description: generalInfo.description,
        zoneId: Number(generalInfo.zoneId) || 1,
        dayOfWeek: generalInfo.dayOfWeek,
        frequency: generalInfo.frequency,
        startTime: `${generalInfo.startTime}:00`,
        endTime: `${generalInfo.endTime}:00`,
        startDate: new Date().toISOString().split("T")[0],
      });

      // 2. Agrega paradas
      for (const stop of stops) {
        await routesService.addRouteStop(created.id, {
          clientId: stop.clientId,
          suggestedTime: stop.suggestedTime ? `${stop.suggestedTime.slice(0, 5)}:00` : "09:00:00",
          estimatedDurationMinutes: 30,
        }).catch(() => null);
      }

      // 3. Asigna asesor y genera visitas
      await routesService.assignRouteAdvisor(created.id, Number(selectedAdvisorId));

      setFeedback({
        type: "success",
        message: "¡Ruta asignada exitosamente! Se han programado las visitas en la agenda del asesor.",
      });
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Error al asignar la ruta." });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Clientes filtrados para el panel de búsqueda
  const filteredClients = useMemo(() => {
    const existingIds = new Set(stops.map((s) => s.clientId));
    return availableClients.filter((c) => {
      if (existingIds.has(c.id)) return false;
      if (clientSearch.trim()) {
        const query = clientSearch.toLowerCase();
        const matchesName = c.commercialName.toLowerCase().includes(query);
        const matchesCode = String(c.id).includes(query);
        if (!matchesName && !matchesCode) return false;
      }
      if (filterType && c.clientType !== filterType) return false;
      if (filterMuni && c.municipality !== filterMuni) return false;
      return true;
    });
  }, [availableClients, stops, clientSearch, filterType, filterMuni]);

  // Métricas calculadas
  const totalStopsCount = stops.length;
  const totalDistanceAprox = (totalStopsCount * 9.8).toFixed(1); // aprox. km
  const totalMinutes = totalStopsCount * 70; // 30 min visita + 40 min traslado
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const timeFormatted = `${hours}h ${minutes}m`;

  return (
    <div className={styles.workbenchContainer}>
      {/* 1. Barra de Pasos Superior (Stepper) y Acciones */}
      <section className={styles.stepperHeader} aria-label="Progreso de creación de ruta">
        <div className={styles.stepperTabs}>
          {/* Paso 1 */}
          <div
            className={`${styles.stepTab} ${activeStep === 1 ? styles.stepTabActive : ""}`}
            onClick={() => setActiveStep(1)}
          >
            <div className={styles.stepCircle}>1</div>
            <div className={styles.stepTexts}>
              <strong className={styles.stepTitle}>Información de la ruta</strong>
              <span className={styles.stepDesc}>Configura los datos generales</span>
            </div>
          </div>

          {/* Paso 2 */}
          <div
            className={`${styles.stepTab} ${activeStep === 2 ? styles.stepTabActive : ""}`}
            onClick={() => setActiveStep(2)}
          >
            <div className={styles.stepCircleActive}>2</div>
            <div className={styles.stepTexts}>
              <strong className={styles.stepTitleActive}>Diseño de la ruta</strong>
              <span className={styles.stepDesc}>Agrega clientes y ordena las paradas</span>
            </div>
          </div>

          {/* Paso 3 */}
          <div
            className={`${styles.stepTab} ${activeStep === 3 ? styles.stepTabActive : ""}`}
            onClick={() => setActiveStep(3)}
          >
            <div className={styles.stepCircle}>3</div>
            <div className={styles.stepTexts}>
              <strong className={styles.stepTitle}>Asignación</strong>
              <span className={styles.stepDesc}>Asigna la ruta a un asesor</span>
            </div>
          </div>
        </div>

        {/* Botones de acción principales */}
        <div className={styles.headerActions}>
          <button type="button" className={styles.cancelBtn} onClick={() => window.history.back()}>
            Cancelar
          </button>
          <button
            type="button"
            className={styles.draftBtn}
            onClick={handleSaveDraft}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar borrador"}
          </button>
          <button
            type="button"
            className={styles.assignPrimaryBtn}
            onClick={handleSaveAndAssign}
            disabled={saving}
          >
            <Check size={16} />
            <span>{saving ? "Procesando..." : "Guardar y asignar"}</span>
          </button>
        </div>
      </section>

      {/* Alerta de Notificación / Feedback */}
      {feedback && (
        <div
          className={`${styles.feedbackBanner} ${
            feedback.type === "success"
              ? styles.feedbackSuccess
              : feedback.type === "error"
              ? styles.feedbackError
              : styles.feedbackInfo
          }`}
          role="alert"
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 2. Cuadrícula Principal (3 Columnas Workbench) */}
      <div className={styles.mainGrid}>
        {/* Columna Izquierda: Información general de la ruta */}
        <div className={styles.colGeneralInfo}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Información general de la ruta</h2>

            <div className={styles.formContent}>
              {/* Nombre de la ruta */}
              <div className={styles.formGroup}>
                <label htmlFor="routeName">Nombre de la ruta *</label>
                <input
                  id="routeName"
                  name="name"
                  type="text"
                  value={generalInfo.name}
                  onChange={handleGeneralChange}
                  placeholder="Ej: RUT-ATL-001"
                />
              </div>

              {/* Territorio / Zona */}
              <div className={styles.formGroup}>
                <label htmlFor="routeZone">Territorio / Zona *</label>
                <select
                  id="routeZone"
                  name="zoneId"
                  value={generalInfo.zoneId}
                  onChange={handleGeneralChange}
                >
                  <option value="1">Atlántico Este</option>
                  <option value="2">Barranquilla Norte</option>
                  <option value="3">Barranquilla Sur</option>
                  <option value="4">Soledad</option>
                </select>
              </div>

              {/* Día de ejecución */}
              <div className={styles.formGroup}>
                <label htmlFor="routeDay">Día de ejecución *</label>
                <select
                  id="routeDay"
                  name="dayOfWeek"
                  value={generalInfo.dayOfWeek}
                  onChange={handleGeneralChange}
                >
                  <option value="MONDAY">Lunes</option>
                  <option value="TUESDAY">Martes</option>
                  <option value="WEDNESDAY">Miércoles</option>
                  <option value="THURSDAY">Jueves</option>
                  <option value="FRIDAY">Viernes</option>
                  <option value="SATURDAY">Sábado</option>
                </select>
              </div>

              {/* Frecuencia */}
              <div className={styles.formGroup}>
                <label htmlFor="routeFreq">Frecuencia *</label>
                <select
                  id="routeFreq"
                  name="frequency"
                  value={generalInfo.frequency}
                  onChange={handleGeneralChange}
                >
                  <option value="WEEKLY">Semanal</option>
                  <option value="BIWEEKLY">Quincenal</option>
                  <option value="MONTHLY">Mensual</option>
                </select>
              </div>

              {/* Horario Inicio y Fin */}
              <div className={styles.timeRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="startTime">Inicio sugerido *</label>
                  <div className={styles.timeInputWrapper}>
                    <input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={generalInfo.startTime}
                      onChange={handleGeneralChange}
                    />
                    <Clock size={14} className={styles.inputIcon} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="endTime">Fin sugerido *</label>
                  <div className={styles.timeInputWrapper}>
                    <input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={generalInfo.endTime}
                      onChange={handleGeneralChange}
                    />
                    <Clock size={14} className={styles.inputIcon} />
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className={styles.formGroup}>
                <label htmlFor="routeDescription">Descripción</label>
                <textarea
                  id="routeDescription"
                  name="description"
                  rows={3}
                  maxLength={200}
                  value={generalInfo.description}
                  onChange={handleGeneralChange}
                  placeholder="Descripción del recorrido comercial..."
                />
                <span className={styles.charCount}>
                  {generalInfo.description.length}/200
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Central: Mapa interactivo de recorrido */}
        <div className={styles.colMap}>
          <div className={styles.mapCard}>
            {/* Controles flotantes sobre el mapa */}
            <div className={styles.mapOverlayTop}>
              <button
                type="button"
                className={styles.optimizeBtn}
                onClick={handleOptimizeRoute}
                title="Optimizar recorrido por distancia"
              >
                <Sparkles size={14} />
                <span>Optimizar ruta</span>
              </button>

              <div className={styles.mapControlsRight}>
                <button
                  type="button"
                  className={styles.mapControlBtn}
                  title="Pantalla completa"
                  onClick={() => {
                    if (mapContainerRef.current) {
                      if (!document.fullscreenElement) {
                        mapContainerRef.current.requestFullscreen().catch(() => null);
                      } else {
                        document.exitFullscreen().catch(() => null);
                      }
                    }
                  }}
                >
                  <Maximize2 size={15} />
                </button>
                <button
                  type="button"
                  className={styles.mapControlBtn}
                  title="Capas del mapa"
                >
                  <Layers size={15} />
                </button>
              </div>
            </div>

            {/* Contenedor Leaflet */}
            <div ref={mapContainerRef} className={styles.leafletMapContainer} />

            {/* Pastilla flotante inferior con Leyenda de Estados */}
            <div className={styles.mapLegendBar}>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.dotVisited}`} />
                <span>Visitado</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.dotPending}`} />
                <span>Pendiente</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.dotRescheduled}`} />
                <span>Reprogramado</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.dotUnvisited}`} />
                <span>Sin visitar</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.dotUnassigned}`} />
                <span>No asignado</span>
              </div>
            </div>
          </div>

          {/* Botones inferiores del mapa */}
          <div className={styles.mapBottomBar}>
            <button
              type="button"
              className={styles.addClientBtn}
              onClick={() => {
                const searchEl = document.getElementById("clientSearchInput");
                if (searchEl) searchEl.focus();
              }}
            >
              <Plus size={15} />
              <span>Agregar cliente</span>
            </button>
            <button
              type="button"
              className={styles.clearRouteBtn}
              onClick={handleClearRoute}
            >
              Limpiar ruta
            </button>
          </div>
        </div>

        {/* Columna Derecha: Buscar clientes y Asignar asesor */}
        <div className={styles.colRight}>
          {/* Card 1: Buscar y agregar clientes */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Buscar y agregar clientes</h2>

            {/* Buscador */}
            <div className={styles.searchBox}>
              <input
                id="clientSearchInput"
                type="text"
                placeholder="Buscar cliente por nombre o código..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
              />
              <Search size={15} className={styles.searchIcon} />
            </div>

            {/* Filtros selectores */}
            <div className={styles.searchFiltersRow}>
              <div className={styles.filterMiniGroup}>
                <label>Tipo de cliente</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Distribuidor">Distribuidor</option>
                  <option value="Retail">Retail</option>
                  <option value="Comercial">Comercial</option>
                </select>
              </div>

              <div className={styles.filterMiniGroup}>
                <label>Municipio</label>
                <select
                  value={filterMuni}
                  onChange={(e) => setFilterMuni(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="Barranquilla">Barranquilla</option>
                  <option value="Soledad">Soledad</option>
                  <option value="Malambo">Malambo</option>
                  <option value="Galapa">Galapa</option>
                </select>
              </div>
            </div>

            {/* Lista de clientes disponibles */}
            <div className={styles.clientCardsList}>
              {filteredClients.length === 0 ? (
                <p className={styles.noClientsAvailable}>
                  No se encontraron clientes disponibles para los filtros aplicados.
                </p>
              ) : (
                filteredClients.slice(0, 5).map((client) => {
                  const IconComp = client.icon || Building2;
                  return (
                    <div key={client.id} className={styles.clientMiniCard}>
                      <div
                        className={styles.clientMiniIcon}
                        style={{
                          backgroundColor: client.iconBg || "#fff7ed",
                          color: client.iconColor || "#ea580c",
                        }}
                      >
                        <IconComp size={16} />
                      </div>

                      <div className={styles.clientMiniInfo}>
                        <strong className={styles.clientMiniName}>
                          {client.commercialName}
                        </strong>
                        <span className={styles.clientMiniMeta}>
                          {client.clientType} &bull; {client.municipality}
                        </span>
                      </div>

                      <button
                        type="button"
                        className={styles.clientAddBtn}
                        onClick={() => handleAddStop(client)}
                        title="Agregar cliente al itinerario"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <button
              type="button"
              className={styles.seeMoreBtn}
              onClick={() => {
                setClientSearch("");
                setFilterType("");
                setFilterMuni("");
              }}
            >
              Ver más clientes
            </button>
          </div>

          {/* Card 2: Asignar ruta a asesor */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Asignar ruta a asesor</h2>

            <div className={styles.formGroup}>
              <label htmlFor="advisorSelector">Asesor comercial *</label>
              <select
                id="advisorSelector"
                value={selectedAdvisorId}
                onChange={(e) => setSelectedAdvisorId(e.target.value)}
              >
                <option value="">Seleccionar asesor</option>
                {advisors.map((adv) => (
                  <option key={adv.id || adv.userId} value={String(adv.id || adv.userId)}>
                    {adv.name || `Asesor #${adv.id || adv.userId}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Resumen de la ruta (KPIs) */}
            <div className={styles.routeSummaryBox}>
              <div className={styles.summaryHeader}>
                <FileSpreadsheet size={15} className={styles.summaryDocIcon} />
                <span>Resumen de la ruta</span>
              </div>

              <div className={styles.kpiRow}>
                <div className={styles.kpiCol}>
                  <strong className={styles.kpiValue}>{totalStopsCount}</strong>
                  <span className={styles.kpiLabel}>Paradas</span>
                </div>
                <div className={styles.kpiCol}>
                  <strong className={styles.kpiValue}>{totalDistanceAprox} km</strong>
                  <span className={styles.kpiLabel}>Distancia aprox.</span>
                </div>
                <div className={styles.kpiCol}>
                  <strong className={styles.kpiValue}>{timeFormatted}</strong>
                  <span className={styles.kpiLabel}>Tiempo estimado</span>
                </div>
              </div>
            </div>

            {/* Nota informativa */}
            <div className={styles.assignmentNotice}>
              <Info size={16} className={styles.infoIcon} />
              <p>
                La ruta será asignada al asesor seleccionado para el día y frecuencia configurados.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Fila Inferior: Tabla de Secuencia de Paradas (Idéntica al diseño) */}
      <section className={styles.stopsTableSection}>
        <div className={styles.stopsTableCard}>
          <div className={styles.responsiveTableWrapper}>
            <table className={styles.workbenchTable}>
              <thead>
                <tr>
                  <th style={{ width: "36px" }} />
                  <th style={{ width: "70px" }}>Orden</th>
                  <th>Cliente</th>
                  <th>Tipo cliente</th>
                  <th>Dirección</th>
                  <th>Municipio</th>
                  <th>Hora sugerida</th>
                  <th style={{ textAlign: "right", paddingRight: "24px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {stops.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={styles.emptyTableTd}>
                      No hay paradas en el recorrido. Agrega clientes desde el panel derecho.
                    </td>
                  </tr>
                ) : (
                  stops.map((stop) => {
                    const pinColor = STATUS_COLORS[stop.status] || "#ea580c";
                    return (
                      <tr key={stop.clientId}>
                        {/* Drag Handle */}
                        <td className={styles.tdDrag}>
                          <GripVertical size={16} className={styles.dragIcon} />
                        </td>

                        {/* Orden con pastilla circular de color */}
                        <td>
                          <div
                            className={styles.orderBadgeCircle}
                            style={{ backgroundColor: pinColor }}
                          >
                            {stop.visitOrder}
                          </div>
                        </td>

                        {/* Cliente */}
                        <td className={styles.tdClientName}>{stop.commercialName}</td>

                        {/* Tipo de cliente */}
                        <td className={styles.tdClientType}>{stop.clientType}</td>

                        {/* Dirección */}
                        <td className={styles.tdAddress}>{stop.address}</td>

                        {/* Municipio */}
                        <td className={styles.tdMunicipality}>{stop.municipality}</td>

                        {/* Hora sugerida */}
                        <td className={styles.tdTime}>{stop.suggestedTime}</td>

                        {/* Acciones */}
                        <td className={styles.tdActions}>
                          <button
                            type="button"
                            className={styles.actionIconButton}
                            title="Modificar horario"
                            onClick={() => {
                              const newTime = prompt("Ingresa la nueva hora sugerida:", stop.suggestedTime);
                              if (newTime) {
                                setStops((prev) =>
                                  prev.map((s) =>
                                    s.clientId === stop.clientId ? { ...s, suggestedTime: newTime } : s
                                  )
                                );
                              }
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.actionIconButton} ${styles.deleteActionBtn}`}
                            title="Remover de la ruta"
                            onClick={() => handleRemoveStop(stop.clientId)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
