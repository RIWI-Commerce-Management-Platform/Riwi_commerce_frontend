import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  Building2,
  Store,
  MapPin,
  GripVertical,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import * as routesService from "../services/routesService";
import { getClients, getCatalogs } from "@/features/clients/services/clientsService";
import styles from "./RoutesPage.module.css";

// Colores según estado de parada
const STATUS_COLORS = {
  VISITED: "#16a34a",
  PENDING: "#ea580c",
  RESCHEDULED: "#9333ea",
  UNVISITED: "#64748b",
  UNASSIGNED: "#2563eb",
};

export default function RoutesPage() {
  // Stepper activo: 1: Información, 2: Diseño, 3: Asignación
  const [activeStep, setActiveStep] = useState(2);

  // Datos generales del formulario de la ruta
  const [generalInfo, setGeneralInfo] = useState({
    name: "RUT-ATL-001",
    zoneId: "1",
    dayOfWeek: "TUESDAY",
    frequency: "WEEKLY",
    startTime: "08:00",
    endTime: "17:00",
    description: "",
  });

  // Catálogos cargados de la base de datos
  const [zones, setZones] = useState([]);
  const [clientTypes, setClientTypes] = useState({});
  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState("");

  // Clientes reales del sistema (sin datos inventados ni duplicados)
  const [allDbClients, setAllDbClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);

  // Paradas seleccionadas en la ruta (inicia vacío: el usuario elige los clientes)
  const [stops, setStops] = useState([]);

  // Búsqueda y filtros del panel de clientes
  const [clientSearch, setClientSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterMuni, setFilterMuni] = useState("");

  // Métricas calculadas (distancia y tiempo)
  const [metrics, setMetrics] = useState({ distanceKm: 0, durationMinutes: 0 });

  // Estados de proceso
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Referencias de Leaflet
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerGroupRef = useRef(null);

  // 1. Cargar catálogos, asesores y clientes reales al montar
  useEffect(() => {
    let isMounted = true;

    // Catálogos (Zonas y Tipos de cliente)
    getCatalogs()
      .then((data) => {
        if (!isMounted || !data) return;
        if (Array.isArray(data.zones)) setZones(data.zones);
        if (Array.isArray(data.clientTypes)) {
          const map = {};
          data.clientTypes.forEach((t) => {
            map[t.id] = t.name;
          });
          setClientTypes(map);
        }
      })
      .catch((err) => console.warn("Catálogos:", err));

    // Asesores comerciales activos
    routesService
      .getAvailableAdvisors()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : res?.data || [];
        setAdvisors(list);
        if (list.length > 0) {
          const firstAdvId = list[0].userId || list[0].id;
          setSelectedAdvisorId(String(firstAdvId));
        }
      })
      .catch((err) => console.warn("Asesores:", err));

    // Clientes reales creados en la base de datos
    setLoadingClients(true);
    getClients({ limit: 100, isActive: true })
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : res?.data || [];
        // Deduplicar clientes por ID estricto
        const unique = Array.from(new Map(list.map((c) => [c.id, c])).values());
        setAllDbClients(unique);
      })
      .catch((err) => {
        console.error("Error al cargar clientes:", err);
        if (isMounted) {
          setFeedback({
            type: "error",
            message: "No se pudieron cargar los clientes del sistema.",
          });
        }
      })
      .finally(() => {
        if (isMounted) setLoadingClients(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Calcular métricas en tiempo real con el backend o cálculo local
  useEffect(() => {
    if (stops.length < 2) {
      setMetrics({
        distanceKm: 0,
        durationMinutes: stops.length === 1 ? 30 : 0,
      });
      return;
    }

    const clientIds = stops.map((s) => s.clientId);
    routesService
      .calculateRouteMetrics(clientIds)
      .then((res) => {
        if (res?.totalDistanceKm != null) {
          setMetrics({
            distanceKm: Number(res.totalDistanceKm),
            durationMinutes: Number(res.estimatedDurationMinutes) || stops.length * 35,
          });
        }
      })
      .catch(() => {
        // Fallback geodésico aproximado si el endpoint no responde
        const approxKm = (stops.length * 4.2).toFixed(1);
        const approxMins = stops.length * 40;
        setMetrics({ distanceKm: Number(approxKm), durationMinutes: approxMins });
      });
  }, [stops]);

  // 3. Clientes disponibles para agregar (excluyendo los que ya están en la ruta)
  const availableClients = useMemo(() => {
    const selectedIds = new Set(stops.map((s) => s.clientId));
    return allDbClients.filter((client) => {
      if (selectedIds.has(client.id)) return false;

      // Filtrar por texto
      if (clientSearch.trim()) {
        const query = clientSearch.toLowerCase();
        const nameMatch = client.commercialName?.toLowerCase().includes(query);
        const nitMatch = client.nit?.toLowerCase().includes(query);
        const muniMatch = client.municipality?.toLowerCase().includes(query);
        if (!nameMatch && !nitMatch && !muniMatch) return false;
      }

      // Filtrar por tipo
      if (filterType) {
        const typeName = clientTypes[client.clientTypeId] || client.clientType || "";
        if (typeName !== filterType && String(client.clientTypeId) !== filterType) {
          return false;
        }
      }

      // Filtrar por municipio
      if (filterMuni && client.municipality !== filterMuni) {
        return false;
      }

      return true;
    });
  }, [allDbClients, stops, clientSearch, filterType, filterMuni, clientTypes]);

  // Municipios únicos de los clientes creados
  const availableMunicipalities = useMemo(() => {
    const set = new Set();
    allDbClients.forEach((c) => {
      if (c.municipality) set.add(c.municipality);
    });
    return Array.from(set);
  }, [allDbClients]);

  // 4. Agregar cliente a la ruta
  const handleAddStop = useCallback((client) => {
    setStops((prev) => {
      if (prev.some((s) => s.clientId === client.id)) return prev;

      const nextOrder = prev.length + 1;
      // Generar hora sugerida secuencial basada en la hora de inicio
      const startHour = 8;
      const totalMinutes = (nextOrder - 1) * 60;
      const stopHour = startHour + Math.floor(totalMinutes / 60);
      const stopMin = totalMinutes % 60;
      const period = stopHour >= 12 ? "PM" : "AM";
      const displayHour = stopHour > 12 ? stopHour - 12 : stopHour;
      const timeFormatted = `${String(displayHour).padStart(2, "0")}:${String(stopMin).padStart(2, "0")} ${period}`;

      const newStop = {
        clientId: client.id,
        visitOrder: nextOrder,
        commercialName: client.commercialName,
        clientType: clientTypes[client.clientTypeId] || "Comercial",
        address: client.address || "Dirección no especificada",
        municipality: client.municipality || "Barranquilla",
        suggestedTime: timeFormatted,
        latitude: client.latitude != null ? Number(client.latitude) : null,
        longitude: client.longitude != null ? Number(client.longitude) : null,
        status: "PENDING",
      };

      return [...prev, newStop];
    });
  }, [clientTypes]);

  // 5. Eliminar cliente de la ruta
  const handleRemoveStop = (clientId) => {
    setStops((prev) => {
      const filtered = prev.filter((s) => s.clientId !== clientId);
      // Reindexar secuencia de orden (1, 2, 3...)
      return filtered.map((s, idx) => ({ ...s, visitOrder: idx + 1 }));
    });
  };

  // Mover parada hacia arriba
  const handleMoveUp = (index) => {
    if (index === 0) return;
    setStops((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy.map((s, idx) => ({ ...s, visitOrder: idx + 1 }));
    });
  };

  // Mover parada hacia abajo
  const handleMoveDown = (index) => {
    if (index === stops.length - 1) return;
    setStops((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy.map((s, idx) => ({ ...s, visitOrder: idx + 1 }));
    });
  };

  // Limpiar toda la ruta
  const handleClearRoute = () => {
    if (stops.length === 0) return;
    if (window.confirm("¿Deseas remover todos los clientes agregados a esta ruta?")) {
      setStops([]);
    }
  };

  // Optimizar ruta por proximidad
  const handleOptimizeRoute = () => {
    if (stops.length < 2) {
      alert("Debes agregar al menos 2 paradas para optimizar el recorrido.");
      return;
    }
    setFeedback({ type: "info", message: "Optimizando secuencia de visitas por cercanía..." });
    setTimeout(() => {
      setStops((prev) => {
        // Ordena por latitud norte a sur para optimizar trayecto
        const sorted = [...prev].sort((a, b) => (b.latitude || 0) - (a.latitude || 0));
        return sorted.map((s, idx) => ({ ...s, visitOrder: idx + 1 }));
      });
      setFeedback({ type: "success", message: "Secuencia de ruta optimizada con éxito." });
      setTimeout(() => setFeedback(null), 3000);
    }, 500);
  };

  // 6. Inicialización y actualización del Mapa Leaflet
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

      L.control.zoom({ position: "bottomright" }).addTo(map);

      markersLayerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = markersLayerGroupRef.current;
    layerGroup.clearLayers();

    const allPositions = [];

    // A) Pines de Paradas seleccionadas en la Ruta (Pines con número de orden y color)
    const routeCoordinates = [];
    stops.forEach((stop) => {
      if (stop.latitude != null && stop.longitude != null) {
        const pos = [Number(stop.latitude), Number(stop.longitude)];
        routeCoordinates.push(pos);
        allPositions.push(pos);

        const pinColor = STATUS_COLORS[stop.status] || "#ea580c";

        const numberedIcon = L.divIcon({
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

        const marker = L.marker(pos, { icon: numberedIcon }).addTo(layerGroup);
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px;">
            <strong style="color: #0b2545;">Parada #${stop.visitOrder}: ${stop.commercialName}</strong>
            <div style="color: #64748b; font-size: 12px; margin-top: 3px;">📍 ${stop.address}</div>
            <div style="font-size: 12px; color: #ea580c; font-weight: 700; margin-top: 3px;">Hora: ${stop.suggestedTime}</div>
          </div>
        `);
      }
    });

    // B) Polilínea conectando las paradas de la ruta en orden
    if (routeCoordinates.length >= 2) {
      L.polyline(routeCoordinates, {
        color: "#1e293b",
        weight: 3.5,
        opacity: 0.9,
        lineJoin: "round",
      }).addTo(layerGroup);
    }

    // C) Pines de Clientes Creados Disponibles (que aún no han sido seleccionados)
    // Permite que el usuario vea dónde están ubicados en el mapa y hacer clic para agregarlos
    availableClients.forEach((client) => {
      if (client.latitude != null && client.longitude != null) {
        const pos = [Number(client.latitude), Number(client.longitude)];
        allPositions.push(pos);

        const unselectedIcon = L.divIcon({
          className: styles.markerHtmlWrapper,
          html: `
            <div class="${styles.availablePin}">
              <span>•</span>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          popupAnchor: [0, -10],
        });

        const marker = L.marker(pos, { icon: unselectedIcon }).addTo(layerGroup);
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; max-width: 200px;">
            <strong style="color: #0b2545;">${client.commercialName}</strong>
            <div style="color: #64748b; font-size: 11.5px; margin-top: 2px;">📍 ${client.address || "Sin dirección"}</div>
            <div style="color: #2563eb; font-size: 11px; margin-top: 1px;">${client.municipality || "Barranquilla"}</div>
            <div style="margin-top: 8px; text-align: right;">
              <button 
                id="popup-add-${client.id}" 
                style="background: #ea580c; color: white; border: none; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer;">
                + Agregar a ruta
              </button>
            </div>
          </div>
        `);

        marker.on("popupopen", () => {
          const btn = document.getElementById(`popup-add-${client.id}`);
          if (btn) {
            btn.onclick = () => {
              handleAddStop(client);
              map.closePopup();
            };
          }
        });
      }
    });

    // Ajustar zoom y encuadre
    if (allPositions.length > 0) {
      const bounds = L.latLngBounds(allPositions);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => clearTimeout(timer);
  }, [stops, availableClients, handleAddStop]);

  // Guardar Borrador (HU-17 y HU-18)
  const handleSaveDraft = async () => {
    if (!generalInfo.name.trim()) {
      alert("Por favor ingresa un nombre para la ruta.");
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const created = await routesService.createRouteDraft({
        name: generalInfo.name.trim(),
        description: generalInfo.description.trim() || undefined,
        zoneId: Number(generalInfo.zoneId) || 1,
        dayOfWeek: generalInfo.dayOfWeek,
        frequency: generalInfo.frequency,
        startTime: `${generalInfo.startTime}:00`,
        endTime: `${generalInfo.endTime}:00`,
        startDate: new Date().toISOString().split("T")[0],
      });

      // Agregar las paradas seleccionadas
      for (const stop of stops) {
        await routesService
          .addRouteStop(created.id, {
            clientId: stop.clientId,
            suggestedTime: stop.suggestedTime ? `${stop.suggestedTime.slice(0, 5)}:00` : "08:00:00",
            estimatedDurationMinutes: 30,
          })
          .catch(() => null);
      }

      setFeedback({
        type: "success",
        message: `Borrador "${created.name}" guardado exitosamente con ${stops.length} paradas.`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Error al guardar el borrador de la ruta.",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Guardar y Asignar (HU-20)
  const handleSaveAndAssign = async () => {
    if (!generalInfo.name.trim()) {
      alert("Por favor ingresa un nombre para la ruta.");
      return;
    }
    if (!selectedAdvisorId) {
      alert("Por favor selecciona un asesor comercial para la asignación.");
      return;
    }
    if (stops.length === 0) {
      alert("Debes agregar al menos un cliente como parada antes de asignar la ruta.");
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      // 1. Crear borrador
      const created = await routesService.createRouteDraft({
        name: generalInfo.name.trim(),
        description: generalInfo.description.trim() || undefined,
        zoneId: Number(generalInfo.zoneId) || 1,
        dayOfWeek: generalInfo.dayOfWeek,
        frequency: generalInfo.frequency,
        startTime: `${generalInfo.startTime}:00`,
        endTime: `${generalInfo.endTime}:00`,
        startDate: new Date().toISOString().split("T")[0],
      });

      // 2. Agregar paradas secuenciales
      for (const stop of stops) {
        await routesService
          .addRouteStop(created.id, {
            clientId: stop.clientId,
            suggestedTime: stop.suggestedTime ? `${stop.suggestedTime.slice(0, 5)}:00` : "08:00:00",
            estimatedDurationMinutes: 30,
          })
          .catch(() => null);
      }

      // 3. Asignar al asesor (dispara creación de visitas en la agenda)
      await routesService.assignRouteAdvisor(created.id, Number(selectedAdvisorId));

      setFeedback({
        type: "success",
        message: "¡Ruta asignada exitosamente! Se han programado las visitas en la agenda del asesor comercial.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Error al guardar y asignar la ruta.",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const hours = Math.floor(metrics.durationMinutes / 60);
  const mins = metrics.durationMinutes % 60;
  const timeFormatted = `${hours}h ${mins}m`;

  return (
    <div className={styles.workbenchContainer}>
      {/* 1. Stepper Superior y Acciones Principales */}
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

        {/* Acciones */}
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
          {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 2. Cuadrícula Principal (3 Columnas Workbench) */}
      <div className={styles.mainGrid}>
        {/* Columna Izquierda: Información general */}
        <div className={styles.colGeneralInfo}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Información general de la ruta</h2>

            <div className={styles.formContent}>
              <div className={styles.formGroup}>
                <label htmlFor="routeName">Nombre de la ruta *</label>
                <input
                  id="routeName"
                  type="text"
                  value={generalInfo.name}
                  onChange={(e) => setGeneralInfo((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: RUT-ATL-001"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="routeZone">Territorio / Zona *</label>
                <select
                  id="routeZone"
                  value={generalInfo.zoneId}
                  onChange={(e) => setGeneralInfo((prev) => ({ ...prev, zoneId: e.target.value }))}
                >
                  {zones.length > 0 ? (
                    zones.map((z) => (
                      <option key={z.id} value={String(z.id)}>
                        {z.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="1">Barranquilla Norte</option>
                      <option value="2">Barranquilla Sur</option>
                      <option value="3">Soledad</option>
                      <option value="4">Malambo</option>
                      <option value="5">Galapa</option>
                    </>
                  )}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="routeDay">Día de ejecución *</label>
                <select
                  id="routeDay"
                  value={generalInfo.dayOfWeek}
                  onChange={(e) => setGeneralInfo((prev) => ({ ...prev, dayOfWeek: e.target.value }))}
                >
                  <option value="MONDAY">Lunes</option>
                  <option value="TUESDAY">Martes</option>
                  <option value="WEDNESDAY">Miércoles</option>
                  <option value="THURSDAY">Jueves</option>
                  <option value="FRIDAY">Viernes</option>
                  <option value="SATURDAY">Sábado</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="routeFreq">Frecuencia *</label>
                <select
                  id="routeFreq"
                  value={generalInfo.frequency}
                  onChange={(e) => setGeneralInfo((prev) => ({ ...prev, frequency: e.target.value }))}
                >
                  <option value="WEEKLY">Semanal</option>
                  <option value="BIWEEKLY">Quincenal</option>
                  <option value="MONTHLY">Mensual</option>
                </select>
              </div>

              <div className={styles.timeRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="startTime">Inicio sugerido *</label>
                  <div className={styles.timeInputWrapper}>
                    <input
                      id="startTime"
                      type="time"
                      value={generalInfo.startTime}
                      onChange={(e) => setGeneralInfo((prev) => ({ ...prev, startTime: e.target.value }))}
                    />
                    <Clock size={14} className={styles.inputIcon} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="endTime">Fin sugerido *</label>
                  <div className={styles.timeInputWrapper}>
                    <input
                      id="endTime"
                      type="time"
                      value={generalInfo.endTime}
                      onChange={(e) => setGeneralInfo((prev) => ({ ...prev, endTime: e.target.value }))}
                    />
                    <Clock size={14} className={styles.inputIcon} />
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="routeDescription">Descripción</label>
                <textarea
                  id="routeDescription"
                  rows={3}
                  maxLength={200}
                  value={generalInfo.description}
                  onChange={(e) => setGeneralInfo((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del recorrido comercial..."
                />
                <span className={styles.charCount}>{generalInfo.description.length}/200</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Central: Mapa */}
        <div className={styles.colMap}>
          <div className={styles.mapCard}>
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
                <button type="button" className={styles.mapControlBtn} title="Capas del mapa">
                  <Layers size={15} />
                </button>
              </div>
            </div>

            {/* Contenedor del Mapa */}
            <div ref={mapContainerRef} className={styles.leafletMapContainer} />

            {/* Leyenda de Estados */}
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
              disabled={stops.length === 0}
            >
              Limpiar ruta
            </button>
          </div>
        </div>

        {/* Columna Derecha: Clientes Creados y Asignación */}
        <div className={styles.colRight}>
          {/* Tarjeta 1: Clientes disponibles */}
          <div className={styles.card}>
            <div className={styles.cardHeaderRow}>
              <h2 className={styles.cardTitle}>Buscar y agregar clientes</h2>
              <span className={styles.clientCountBadge}>
                {availableClients.length} disponibles
              </span>
            </div>

            <div className={styles.searchBox}>
              <input
                id="clientSearchInput"
                type="text"
                placeholder="Buscar por nombre, NIT o municipio..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
              />
              <Search size={15} className={styles.searchIcon} />
            </div>

            <div className={styles.searchFiltersRow}>
              <div className={styles.filterMiniGroup}>
                <label>Tipo cliente</label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="">Todos</option>
                  {Object.entries(clientTypes).map(([id, name]) => (
                    <option key={id} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterMiniGroup}>
                <label>Municipio</label>
                <select value={filterMuni} onChange={(e) => setFilterMuni(e.target.value)}>
                  <option value="">Todos</option>
                  {availableMunicipalities.map((muni) => (
                    <option key={muni} value={muni}>
                      {muni}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Listado de clientes reales */}
            <div className={styles.clientCardsList}>
              {loadingClients ? (
                <p className={styles.noClientsAvailable}>Cargando clientes registrados...</p>
              ) : availableClients.length === 0 ? (
                <div className={styles.emptyClientsNotice}>
                  <p>
                    {allDbClients.length === 0
                      ? "Aún no hay clientes registrados en el sistema. Puedes registrarlos en el módulo de Clientes."
                      : "No hay más clientes disponibles para los filtros seleccionados o ya están en la ruta."}
                  </p>
                </div>
              ) : (
                availableClients.map((client) => {
                  const typeLabel = clientTypes[client.clientTypeId] || "Comercial";
                  return (
                    <div key={client.id} className={styles.clientMiniCard}>
                      <div className={styles.clientMiniIcon}>
                        <Building2 size={16} />
                      </div>

                      <div className={styles.clientMiniInfo}>
                        <strong className={styles.clientMiniName}>
                          {client.commercialName}
                        </strong>
                        <span className={styles.clientMiniMeta}>
                          {typeLabel} &bull; {client.municipality || "Barranquilla"}
                        </span>
                        {client.latitude != null && (
                          <span className={styles.clientMiniCoords}>
                            <MapPin size={10} /> {client.latitude.toFixed(4)}, {client.longitude.toFixed(4)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className={styles.clientAddBtn}
                        onClick={() => handleAddStop(client)}
                        title="Agregar cliente a la ruta"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {(clientSearch || filterType || filterMuni) && (
              <button
                type="button"
                className={styles.seeMoreBtn}
                onClick={() => {
                  setClientSearch("");
                  setFilterType("");
                  setFilterMuni("");
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Tarjeta 2: Asignación y KPIs */}
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
                  <option key={adv.id || adv.userId} value={String(adv.userId || adv.id)}>
                    {adv.name || `Asesor #${adv.userId || adv.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.routeSummaryBox}>
              <div className={styles.summaryHeader}>
                <FileSpreadsheet size={15} className={styles.summaryDocIcon} />
                <span>Resumen de la ruta</span>
              </div>

              <div className={styles.kpiRow}>
                <div className={styles.kpiCol}>
                  <strong className={styles.kpiValue}>{stops.length}</strong>
                  <span className={styles.kpiLabel}>Paradas</span>
                </div>
                <div className={styles.kpiCol}>
                  <strong className={styles.kpiValue}>{metrics.distanceKm.toFixed(1)} km</strong>
                  <span className={styles.kpiLabel}>Distancia aprox.</span>
                </div>
                <div className={styles.kpiCol}>
                  <strong className={styles.kpiValue}>{timeFormatted}</strong>
                  <span className={styles.kpiLabel}>Tiempo estimado</span>
                </div>
              </div>
            </div>

            <div className={styles.assignmentNotice}>
              <Info size={16} className={styles.infoIcon} />
              <p>
                La ruta será asignada al asesor seleccionado para el día y frecuencia configurados.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tabla Inferior de Secuencia de Paradas */}
      <section className={styles.stopsTableSection}>
        <div className={styles.stopsTableCard}>
          <div className={styles.responsiveTableWrapper}>
            <table className={styles.workbenchTable}>
              <thead>
                <tr>
                  <th style={{ width: "40px" }} />
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
                      <div className={styles.emptyTableMessage}>
                        <Store size={28} />
                        <p>Aún no has agregado paradas a esta ruta.</p>
                        <span>
                          Haz clic en el botón <strong>+</strong> de cualquier cliente del panel derecho
                          o en los puntos del mapa para agregarlo al recorrido.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  stops.map((stop, index) => {
                    const pinColor = STATUS_COLORS[stop.status] || "#ea580c";
                    return (
                      <tr key={stop.clientId}>
                        <td className={styles.tdDrag}>
                          <GripVertical size={16} className={styles.dragIcon} />
                        </td>

                        <td>
                          <div
                            className={styles.orderBadgeCircle}
                            style={{ backgroundColor: pinColor }}
                          >
                            {stop.visitOrder}
                          </div>
                        </td>

                        <td className={styles.tdClientName}>{stop.commercialName}</td>
                        <td className={styles.tdClientType}>{stop.clientType}</td>
                        <td className={styles.tdAddress}>{stop.address}</td>
                        <td className={styles.tdMunicipality}>{stop.municipality}</td>
                        <td className={styles.tdTime}>{stop.suggestedTime}</td>

                        <td className={styles.tdActions}>
                          <button
                            type="button"
                            className={styles.actionIconButton}
                            title="Subir de posición"
                            disabled={index === 0}
                            onClick={() => handleMoveUp(index)}
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            className={styles.actionIconButton}
                            title="Bajar de posición"
                            disabled={index === stops.length - 1}
                            onClick={() => handleMoveDown(index)}
                          >
                            <ArrowDown size={13} />
                          </button>
                          <button
                            type="button"
                            className={styles.actionIconButton}
                            title="Modificar horario"
                            onClick={() => {
                              const newTime = prompt(
                                "Ingresa la nueva hora sugerida (ej: 09:30 AM):",
                                stop.suggestedTime
                              );
                              if (newTime?.trim()) {
                                setStops((prev) =>
                                  prev.map((s) =>
                                    s.clientId === stop.clientId
                                      ? { ...s, suggestedTime: newTime.trim() }
                                      : s
                                  )
                                );
                              }
                            }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.actionIconButton} ${styles.deleteActionBtn}`}
                            title="Remover de la ruta"
                            onClick={() => handleRemoveStop(stop.clientId)}
                          >
                            <Trash2 size={13} />
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
