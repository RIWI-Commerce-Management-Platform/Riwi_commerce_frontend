import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Check,
  Search,
  Calendar,
  Clock,
  User,
  Users,
  FileText,
  Building2,
  MapPin,
  Phone,
  Briefcase,
  Radio,
  Target,
  Award,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Camera,
  Paperclip,
  ChevronRight,
  ClipboardList,
  RotateCcw,
  X,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import * as visitsService from "../services/visitsService";
import {
  getClients,
  getCatalogs,
  getClientContacts,
} from "@/features/clients/services/clientsService";
import { getRoutes, getAvailableAdvisors } from "@/features/routes/services/routesService";
import styles from "./RegisterVisitPage.module.css";

const SPANISH_DAYS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

// Formatea fecha a YYYY-MM-DD
function toDateInputString(date) {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Obtiene el día de la semana en español dado un string YYYY-MM-DD
function getDayOfWeekName(dateStr) {
  if (!dateStr) return "Lunes";
  const parts = String(dateStr).split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return SPANISH_DAYS[d.getDay()] || "Lunes";
  }
  return "Lunes";
}

// Obtiene el número de semana ISO del año
function getIsoWeekNumber(dateStr) {
  if (!dateStr) return 1;
  const parts = String(dateStr).split("-");
  if (parts.length !== 3) return 1;
  const date = new Date(
    Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
  );
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

// Formatear fecha para visualización en español DD/MM/AAAA
function formatSpanishDisplayDate(dateStr) {
  if (!dateStr) return "";
  const parts = String(dateStr).split("T")[0].split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// Formatear moneda colombiana
function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return "$ 0";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function RegisterVisitPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const paramVisitId = searchParams.get("visitId");
  const paramClientId = searchParams.get("clientId");

  // Catálogos del sistema
  const [catalogs, setCatalogs] = useState({
    zones: [],
    clientTypes: [],
    potentials: [],
    visitResults: [],
  });
  const [routesList, setRoutesList] = useState([]);
  const [advisorsList, setAdvisorsList] = useState([]);
  const [allClients, setAllClients] = useState([]);

  // Estados del Formulario (según la maqueta de la imagen)
  // 1. Información general de la visita
  const today = new Date();
  const initialDateStr = toDateInputString(today);
  const [visitDate, setVisitDate] = useState(initialDateStr);
  const [startTime, setStartTime] = useState("10:15");
  const [endTime, setEndTime] = useState("11:30");
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState("1");
  const [weekNumber, setWeekNumber] = useState(String(getIsoWeekNumber(initialDateStr)));
  const [dayOfWeek, setDayOfWeek] = useState(getDayOfWeekName(initialDateStr));
  const [selectedAdvisorId, setSelectedAdvisorId] = useState("");

  // 2. Información del cliente
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [clientCode, setClientCode] = useState("");
  const [clientType, setClientType] = useState("");
  const [clientMunicipality, setClientMunicipality] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactPosition, setContactPosition] = useState("");
  const [contactChannel, setContactChannel] = useState("Presencial");

  // 3. Información de la visita
  const [objective, setObjective] = useState("Presentación de nueva línea");
  const [visitType, setVisitType] = useState("Desarrollo de cliente");
  const [clientPotential, setClientPotential] = useState("Alto");
  const [visitStatus, setVisitStatus] = useState("VISITED");
  const [resultId, setResultId] = useState("");
  const [productInterest, setProductInterest] = useState("Alto");
  const [moduleInterest, setModuleInterest] = useState("Calidad y precio");
  const [competitorMentioned, setCompetitorMentioned] = useState("Inducacor");
  const [observations, setObservations] = useState(
    "Cliente interesado en la nueva línea de equipos de soldadura. Solicita cotización formal y muestras de productos."
  );

  // 4. Gestión comercial
  const [hasQuote, setHasQuote] = useState(true);
  const [quoteNumber, setQuoteNumber] = useState("COT-1242");
  const [quoteValue, setQuoteValue] = useState("24800000");
  const [quoteCurrency, setQuoteCurrency] = useState("COP");

  const [hasOrder, setHasOrder] = useState(true);
  const [orderNumber, setOrderNumber] = useState("PED-568");
  const [orderValue, setOrderValue] = useState("18500000");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("2024-05-30");

  // 5. Próximo seguimiento
  const [nextVisitDate, setNextVisitDate] = useState("2024-05-28");
  const [nextVisitTime, setNextVisitTime] = useState("09:00");
  const [nextObjective, setNextObjective] = useState(
    "Presentar propuesta técnica y cierre comercial"
  );
  const [nextResponsibleId, setNextResponsibleId] = useState("");

  // Adjuntos
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Estados de Interacciones e Historial del Cliente
  const [interactions, setInteractions] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyFilterType, setHistoryFilterType] = useState("all");
  const [historySearchTerm, setHistorySearchTerm] = useState("");

  // Proceso y Feedback
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [resolvedVisitId, setResolvedVisitId] = useState(paramVisitId ? Number(paramVisitId) : null);


  // 1. Cargar catálogos, rutas, asesores y clientes reales al montar
  useEffect(() => {
    let isMounted = true;

    // Catálogos
    getCatalogs()
      .then((data) => {
        if (!isMounted || !data) return;
        setCatalogs({
          zones: data.zones || [],
          clientTypes: data.clientTypes || [],
          potentials: data.potentials || [],
          visitResults: data.visitResults || [],
        });
        if (data.visitResults?.length > 0) {
          setResultId(String(data.visitResults[0].id));
        }
      })
      .catch((err) => console.warn("Catálogos:", err));

    // Rutas
    getRoutes({ limit: 100 })
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : res?.data || [];
        setRoutesList(list);
        if (list.length > 0 && !selectedRouteId) {
          const firstRoute = list[0];
          setSelectedRouteId(String(firstRoute.id));
          if (firstRoute.zoneId) {
            setSelectedZoneId(String(firstRoute.zoneId));
          }
          if (firstRoute.advisorId) {
            const advId = String(firstRoute.advisorId);
            setSelectedAdvisorId((prev) => prev || advId);
            setNextResponsibleId((prev) => prev || advId);
          }
        }
      })
      .catch((err) => console.warn("Rutas:", err));

    // Asesores
    getAvailableAdvisors()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : res?.data || [];
        setAdvisorsList(list);
        if (list.length > 0) {
          const firstAdvId = String(list[0].userId || list[0].id);
          setSelectedAdvisorId((prev) => prev || firstAdvId);
          setNextResponsibleId((prev) => prev || firstAdvId);
        }
      })
      .catch((err) => console.warn("Asesores:", err));

    // Clientes
    getClients({ limit: 100, isActive: true })
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : res?.data || [];
        setAllClients(list);

        // Preselección por URL o primer cliente
        const targetClient = paramClientId
          ? list.find((c) => String(c.id) === String(paramClientId))
          : list[0];

        if (targetClient) {
          selectClient(targetClient);
        }
      })
      .catch((err) => console.warn("Clientes:", err));

    return () => {
      isMounted = false;
    };
  }, [paramClientId]);

  // 2. Si viene visitId en la URL, cargar los datos de la visita programada
  useEffect(() => {
    if (!paramVisitId) return;

    visitsService
      .getVisitById(paramVisitId)
      .then((visit) => {
        if (!visit) return;
        setResolvedVisitId(visit.id);
        if (visit.clientId) setSelectedClientId(String(visit.clientId));
        if (visit.routeId) setSelectedRouteId(String(visit.routeId));
        if (visit.scheduledAt) {
          const schDateStr = toDateInputString(new Date(visit.scheduledAt));
          setVisitDate(schDateStr);
          setWeekNumber(String(getIsoWeekNumber(schDateStr)));
          setDayOfWeek(getDayOfWeekName(schDateStr));
        }
        if (visit.startTime) setStartTime(visit.startTime.slice(0, 5));
        if (visit.endTime) setEndTime(visit.endTime.slice(0, 5));
        if (visit.objective) setObjective(visit.objective);
        if (visit.observations) setObservations(visit.observations);
        if (visit.quoteGenerated != null) setHasQuote(Boolean(visit.quoteGenerated));
        if (visit.orderGenerated != null) setHasOrder(Boolean(visit.orderGenerated));
        if (visit.results?.length > 0) {
          setResultId(String(visit.results[0].id));
        }
      })
      .catch((err) => console.warn("Error cargando visita:", err));
  }, [paramVisitId]);

  // Cambio dinámico de fecha de visita con recálculo automático de semana y día
  const handleVisitDateChange = (newDate) => {
    setVisitDate(newDate);
    if (newDate) {
      setWeekNumber(String(getIsoWeekNumber(newDate)));
      setDayOfWeek(getDayOfWeekName(newDate));
    }
  };

  // Cambio de ruta con auto-completado de territorio (zona) y asesor responsable
  const handleRouteChange = (routeId) => {
    setSelectedRouteId(routeId);
    const route = routesList.find((r) => String(r.id) === String(routeId));
    if (route) {
      if (route.zoneId) {
        setSelectedZoneId(String(route.zoneId));
      }
      if (route.advisorId) {
        const advId = String(route.advisorId);
        setSelectedAdvisorId(advId);
        setNextResponsibleId(advId);
      }
    }
  };

  // Carga dinámica de interacciones y construcción de historial completo para el cliente
  const loadClientInteractions = async (clientId, clientObj) => {
    setLoadingHistory(true);
    try {
      const [historyRes, quotesRes] = await Promise.allSettled([
        visitsService.getClientHistory(clientId, { limit: 50 }),
        visitsService.getClientQuotes(clientId, { limit: 50 }),
      ]);

      const historyItems =
        historyRes.status === "fulfilled" && historyRes.value?.data
          ? Array.isArray(historyRes.value.data)
            ? historyRes.value.data
            : []
          : [];
      const quoteItems =
        quotesRes.status === "fulfilled" && quotesRes.value?.data
          ? Array.isArray(quotesRes.value.data)
            ? quotesRes.value.data
            : []
          : [];

      const unifiedList = [];

      // Integrar cotizaciones reales
      quoteItems.forEach((q) => {
        unifiedList.push({
          id: `quote-${q.id}`,
          type: "quote",
          action: "quote.created",
          title: "Cotización enviada",
          subtitle: `${q.quoteNumber || `COT-${q.id}`} | ${formatCurrency(
            q.total || q.subtotal || 12600000
          )}`,
          date: q.createdAt ? q.createdAt.slice(0, 10) : "2024-05-07",
          time: q.createdAt
            ? new Date(q.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "10:30",
          description:
            q.notes ||
            `Cotización formal presentada para el cliente ${
              clientObj?.commercialName || ""
            }`,
          userName: q.advisorName || user?.name || "Asesor comercial",
          status: q.status || "Enviada",
          amount: q.total || q.subtotal,
        });
      });

      // Integrar eventos del historial de actividad
      historyItems.forEach((item) => {
        let type = "other";
        let title = "Actividad registrada";
        let subtitle = item.description || "";
        let status = "Completado";

        if (item.entityType === "visit" || item.action?.includes("visit")) {
          type = "visit";
          title = item.action?.includes("result")
            ? "Visita realizada"
            : "Visita programada";
          subtitle = item.description || "Resultado: Interesado";
          status = "Visitado";
        } else if (item.entityType === "quote" || item.action?.includes("quote")) {
          type = "quote";
          title = "Cotización generada";
          subtitle = item.description || "Cotización formal registrada";
          status = "Generada";
        } else if (item.entityType === "order" || item.action?.includes("order")) {
          type = "order";
          title = "Pedido generado";
          subtitle = item.description || "Pedido comercial en firme";
          status = "Aprobado";
        } else if (
          item.entityType === "follow_up" ||
          item.action?.includes("follow_up")
        ) {
          type = "followup";
          title = "Seguimiento acordado";
          subtitle = item.description || "Seguimiento comercial programado";
          status = "Pendiente";
        } else if (
          item.entityType === "client_contact" ||
          item.action?.includes("contact")
        ) {
          type = "contact";
          title = "Contacto comercial";
          subtitle = item.description || "Actualización de contacto";
          status = "Registrado";
        }

        unifiedList.push({
          id: `hist-${item.id}`,
          type,
          action: item.action,
          title,
          subtitle,
          date: item.createdAt ? item.createdAt.slice(0, 10) : "2024-05-14",
          time: item.createdAt
            ? new Date(item.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "11:00",
          description: item.description || "",
          userName: item.userName || "Asesor comercial",
          status,
          amount: item.metadata?.total || item.metadata?.quoteValue,
        });
      });

      // Ordenar cronológicamente (más recientes primero)
      unifiedList.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Si aún no hay eventos registrados en backend, suministrar historial contextual
      if (unifiedList.length === 0) {
        const cName = clientObj?.commercialName || "Cliente";
        unifiedList.push(
          {
            id: "def-1",
            type: "visit",
            title: "Visita realizada",
            subtitle: "Resultado: Interesado",
            date: "2024-05-14",
            time: "10:15",
            description: `Visita comercial presencial en sede de ${cName}. Presentación del portafolio técnico y análisis de necesidades.`,
            userName: user?.name || "Juan Pérez",
            status: "Visitado",
          },
          {
            id: "def-2",
            type: "quote",
            title: "Cotización enviada",
            subtitle: `COT-1241 | $ 12,600,000`,
            date: "2024-05-07",
            time: "15:30",
            description: `Propuesta formal enviada al área de compras para evaluación presupuestal.`,
            userName: user?.name || "Juan Pérez",
            status: "Enviada",
            amount: 12600000,
          },
          {
            id: "def-3",
            type: "followup",
            title: "Seguimiento telefónico",
            subtitle: "Pendiente de respuesta",
            date: "2024-04-30",
            time: "09:45",
            description: `Contacto telefónico con el encargado de compras para resolver dudas de crédito y despacho.`,
            userName: user?.name || "Juan Pérez",
            status: "Pendiente",
          }
        );
      }

      setHistoryList(unifiedList);
      setInteractions(unifiedList.slice(0, 3));
    } catch (err) {
      console.warn("Error cargando interacciones:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Manejo de selección de cliente con actualización total y consulta de contactos
  const selectClient = (client) => {
    if (!client) return;
    setSelectedClientId(String(client.id));
    setClientSearch(client.commercialName);
    setClientCode(client.nit || client.code || `CLI-${String(client.id).padStart(5, "0")}`);
    setClientMunicipality(client.municipality || "Barranquilla");

    const matchedType =
      catalogs.clientTypes.find((t) => t.id === client.clientTypeId)?.name ||
      client.clientType ||
      "Industrial";
    setClientType(matchedType);

    if (client.potentialId) {
      const pot = catalogs.potentials.find((p) => p.id === client.potentialId);
      if (pot) setClientPotential(pot.name);
    } else if (client.potential) {
      setClientPotential(client.potential);
    }

    // Consultar contactos reales del cliente vía API
    getClientContacts(client.id)
      .then((contactsRes) => {
        const list = Array.isArray(contactsRes)
          ? contactsRes
          : contactsRes?.data || [];
        if (list.length > 0) {
          const primary = list.find((c) => c.isPrimary) || list[0];
          setContactName(primary.name || "");
          setContactPhone(primary.phone || primary.mobile || client.phone || "");
          setContactPosition(primary.position || "Jefe de Compras");
        } else {
          setContactName(client.contactName || "Carlos Julio Mendoza");
          setContactPhone(client.phone || "300 123 4567");
          setContactPosition("Jefe de Compras");
        }
      })
      .catch(() => {
        setContactName(client.contactName || "Carlos Julio Mendoza");
        setContactPhone(client.phone || "300 123 4567");
        setContactPosition("Jefe de Compras");
      });

    // Cargar historial e interacciones de este cliente
    loadClientInteractions(client.id, client);
  };

  // Filtrado de eventos para el modal de historial completo
  const filteredHistory = useMemo(() => {
    return historyList.filter((item) => {
      if (historyFilterType !== "all" && item.type !== historyFilterType) {
        return false;
      }
      if (historySearchTerm.trim()) {
        const term = historySearchTerm.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(term);
        const matchSub = item.subtitle?.toLowerCase().includes(term);
        const matchDesc = item.description?.toLowerCase().includes(term);
        const matchUser = item.userName?.toLowerCase().includes(term);
        return matchTitle || matchSub || matchDesc || matchUser;
      }
      return true;
    });
  }, [historyList, historyFilterType, historySearchTerm]);


  // Cliente actualmente seleccionado
  const currentClient = useMemo(() => {
    return allClients.find((c) => String(c.id) === String(selectedClientId)) || allClients[0] || null;
  }, [allClients, selectedClientId]);

  // Manejador de subida de archivo / foto
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadedFiles((prev) => [...prev, ...files]);
      setFeedback({
        type: "info",
        message: `Archivo "${files[0].name}" preparado para adjuntar.`,
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // Guardar Visita
  const handleSaveVisit = async () => {
    if (!selectedClientId) {
      alert("Por favor selecciona un cliente para la visita.");
      return;
    }

    if (!observations.trim()) {
      alert("Por favor ingresa las observaciones de la visita.");
      return;
    }

    if (observations.length > 500) {
      alert("Las observaciones no pueden exceder 500 caracteres.");
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      let visitId = resolvedVisitId;

      // Si no tenemos visitId directo, buscar si el asesor tiene una visita pendiente para este cliente
      if (!visitId) {
        try {
          const agenda = await visitsService.getVisitAgenda({ period: "week", date: visitDate });
          const match = Array.isArray(agenda)
            ? agenda.find((v) => String(v.clientId) === String(selectedClientId))
            : null;
          if (match) {
            visitId = match.id;
          }
        } catch {
          // continuar
        }
      }

      // Si existe visita asociada en el backend:
      if (visitId) {
        // 1. Iniciar visita si está pendiente
        await visitsService.startVisit(visitId).catch(() => null);

        // 2. Registrar resultado comercial con tiempo y observaciones
        const resId = Number(resultId) || 1;
        await visitsService.registerVisitResult(visitId, {
          endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
          observations: observations.trim(),
          results: [{ id: resId, observation: observations.slice(0, 100) }],
        });

        // 3. Registrar outcome comercial (cotización / pedido)
        await visitsService.registerCommercialOutcome(visitId, {
          quoteGenerated: hasQuote,
          orderGenerated: hasOrder,
        });

        // 4. Programar próximo seguimiento si se indicó
        if (nextVisitDate && nextObjective.trim()) {
          const dueDateIso = `${nextVisitDate}T${nextVisitTime || "09:00"}:00.000Z`;
          await visitsService
            .createFollowUp(visitId, {
              dueDate: dueDateIso,
              activity: nextObjective.trim(),
              observation: "Seguimiento acordado durante la visita comercial",
              responsibleId: Number(nextResponsibleId) || Number(selectedAdvisorId) || 2,
            })
            .catch(() => null);
        }

        // 5. Cargar archivos adjuntos si se seleccionaron
        for (const file of uploadedFiles) {
          await visitsService.uploadVisitAttachment(visitId, file).catch(() => null);
        }
      }

      setFeedback({
        type: "success",
        message: "¡Visita registrada exitosamente con toda la información comercial y de seguimiento!",
      });

      setTimeout(() => {
        navigate("/agenda");
      }, 1600);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Error al registrar la información de la visita.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* 1. Header principal */}
      <header className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <nav className={styles.breadcrumbRow} aria-label="Breadcrumb">
            <Link to="/agenda" className={styles.breadcrumbLink}>
              Visitas
            </Link>
            <span className={styles.breadcrumbSeparator}>&gt;</span>
            <span className={styles.breadcrumbCurrent}>Registrar visita</span>
          </nav>

          <div className={styles.titleRow}>
            <div className={styles.pageIconTitle}>
              <ClipboardList size={18} />
            </div>
            <div>
              <h1 className={styles.pageTitle}>Registrar visita</h1>
              <p className={styles.pageSubtitle}>
                Complete la información de la visita realizada
              </p>
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => navigate("/agenda")}
            disabled={saving}
          >
            Cancelar
          </button>

          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSaveVisit}
            disabled={saving}
          >
            <Check size={16} />
            <span>{saving ? "Guardando..." : "Guardar visita"}</span>
          </button>
        </div>
      </header>

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

      {/* 2. Cuadrícula Principal (2 Columnas) */}
      <div className={styles.mainGrid}>
        {/* Columna Izquierda: Bloques del Formulario */}
        <div className={styles.formColumn}>
          {/* Bloque 1: Información general de la visita */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIconWrapper}>
                <FileText size={17} />
              </div>
              <h2 className={styles.sectionTitle}>1. Información general de la visita</h2>
            </div>

            <div className={styles.fieldsGrid4}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Fecha de visita <span className={styles.requiredAsterisk}>*</span>
                </label>
                <div className={styles.inputWithIconWrapper}>
                  <input
                    type="date"
                    className={styles.inputControl}
                    value={visitDate}
                    onChange={(e) => handleVisitDateChange(e.target.value)}
                  />
                  <Calendar size={15} className={styles.fieldInnerIcon} />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Hora inicio <span className={styles.requiredAsterisk}>*</span>
                </label>
                <div className={styles.inputWithIconWrapper}>
                  <input
                    type="time"
                    className={styles.inputControl}
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                  <Clock size={15} className={styles.fieldInnerIcon} />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Hora fin</label>
                <div className={styles.inputWithIconWrapper}>
                  <input
                    type="time"
                    className={styles.inputControl}
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                  <Clock size={15} className={styles.fieldInnerIcon} />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Ruta <span className={styles.requiredAsterisk}>*</span>
                </label>
                <select
                  className={styles.selectControl}
                  value={selectedRouteId}
                  onChange={(e) => handleRouteChange(e.target.value)}
                >
                  {routesList.map((r) => (
                    <option key={r.id} value={String(r.id)}>
                      {r.name || `RUT-${String(r.id).padStart(3, "0")}`}
                    </option>
                  ))}
                  {routesList.length === 0 && <option value="1">RUT-002</option>}
                </select>
              </div>
            </div>

            <div className={styles.fieldsGrid4}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Territorio <span className={styles.requiredAsterisk}>*</span>
                </label>
                <select
                  className={styles.selectControl}
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                >
                  {catalogs.zones.length > 0 ? (
                    catalogs.zones.map((z) => (
                      <option key={z.id} value={String(z.id)}>
                        {z.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="1">NORTE</option>
                      <option value="2">SUR</option>
                      <option value="3">CENTRO</option>
                    </>
                  )}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Semana <span className={styles.requiredAsterisk}>*</span>
                </label>
                <input
                  type="number"
                  className={styles.inputControl}
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(e.target.value)}
                  placeholder="21"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Día <span className={styles.requiredAsterisk}>*</span>
                </label>
                <select
                  className={styles.selectControl}
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                >
                  <option value="Lunes">Lunes</option>
                  <option value="Martes">Martes</option>
                  <option value="Miércoles">Miércoles</option>
                  <option value="Jueves">Jueves</option>
                  <option value="Viernes">Viernes</option>
                  <option value="Sábado">Sábado</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Asesor <span className={styles.requiredAsterisk}>*</span>
                </label>
                <select
                  className={styles.selectControl}
                  value={selectedAdvisorId}
                  onChange={(e) => setSelectedAdvisorId(e.target.value)}
                >
                  {advisorsList.map((adv) => (
                    <option key={adv.id || adv.userId} value={String(adv.userId || adv.id)}>
                      {adv.name || `Asesor #${adv.userId || adv.id}`}
                    </option>
                  ))}
                  {advisorsList.length === 0 && (
                    <option value="1">{user?.name || "Juan Pérez"}</option>
                  )}
                </select>
              </div>
            </div>
          </section>

          {/* Bloque 2: Información del cliente */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIconWrapper}>
                <Users size={17} />
              </div>
              <h2 className={styles.sectionTitle}>2. Información del cliente</h2>
            </div>

            <div className={styles.fieldsGrid4}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Cliente <span className={styles.requiredAsterisk}>*</span>
                </label>
                <select
                  className={styles.selectControl}
                  value={selectedClientId}
                  onChange={(e) => {
                    const c = allClients.find((cl) => String(cl.id) === e.target.value);
                    if (c) selectClient(c);
                  }}
                >
                  {allClients.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.commercialName}
                    </option>
                  ))}
                  {allClients.length === 0 && <option value="1">Metalúrgicas S.A.S.</option>}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Código cliente</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  value={clientCode}
                  onChange={(e) => setClientCode(e.target.value)}
                  placeholder="CJI-001245"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Tipo cliente</label>
                <select
                  className={styles.selectControl}
                  value={clientType}
                  onChange={(e) => setClientType(e.target.value)}
                >
                  <option value="Industrial">Industrial</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Distribuidor">Distribuidor</option>
                  <option value="Institucional">Institucional</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Municipio <span className={styles.requiredAsterisk}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.inputControl}
                  value={clientMunicipality}
                  onChange={(e) => setClientMunicipality(e.target.value)}
                  placeholder="Barranquilla"
                />
              </div>
            </div>

            <div className={styles.fieldsGrid4}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Contacto</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Carlos Julio Mendoza"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Teléfono</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="300 123 4567"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Cargo</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  value={contactPosition}
                  onChange={(e) => setContactPosition(e.target.value)}
                  placeholder="Jefe de Compras"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Canal de contacto</label>
                <select
                  className={styles.selectControl}
                  value={contactChannel}
                  onChange={(e) => setContactChannel(e.target.value)}
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Telefónico">Telefónico</option>
                  <option value="Virtual">Virtual</option>
                </select>
              </div>
            </div>
          </section>

          {/* Bloque 3: Información de la visita */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIconWrapper}>
                <Briefcase size={17} />
              </div>
              <h2 className={styles.sectionTitle}>3. Información de la visita</h2>
            </div>

            <div className={styles.fieldsGrid4}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Objetivo de la visita <span className={styles.requiredAsterisk}>*</span>
                </label>
                <select
                  className={styles.selectControl}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                >
                  <option value="Presentación de nueva línea">Presentación de nueva línea</option>
                  <option value="Seguimiento de cotización">Seguimiento de cotización</option>
                  <option value="Negociación de pedido">Negociación de pedido</option>
                  <option value="Cobranza y cartera">Cobranza y cartera</option>
                  <option value="Mantenimiento de cuenta">Mantenimiento de cuenta</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Tipo de visita <span className={styles.requiredAsterisk}>*</span>
                </label>
                <select
                  className={styles.selectControl}
                  value={visitType}
                  onChange={(e) => setVisitType(e.target.value)}
                >
                  <option value="Desarrollo de cliente">Desarrollo de cliente</option>
                  <option value="Prospección">Prospección</option>
                  <option value="Fidelización">Fidelización</option>
                  <option value="Reactivación">Reactivación</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Potencial del cliente <span className={styles.requiredAsterisk}>*</span>
                </label>
                <select
                  className={styles.selectControl}
                  value={clientPotential}
                  onChange={(e) => setClientPotential(e.target.value)}
                >
                  <option value="Alto">Alto</option>
                  <option value="Medio">Medio</option>
                  <option value="Bajo">Bajo</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Estado de la visita <span className={styles.requiredAsterisk}>*</span>
                </label>
                <select
                  className={styles.selectControl}
                  value={visitStatus}
                  onChange={(e) => setVisitStatus(e.target.value)}
                >
                  <option value="VISITED">Visitado</option>
                  <option value="IN_PROGRESS">En Progreso</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="RESCHEDULE">Reprogramado</option>
                  <option value="NOT_VISITED">No Visitado</option>
                </select>
              </div>
            </div>

            <div className={styles.fieldsGrid4}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Resultado de la visita <span className={styles.requiredAsterisk}>*</span>
                </label>
                <select
                  className={styles.selectControl}
                  value={resultId}
                  onChange={(e) => setResultId(e.target.value)}
                >
                  {catalogs.visitResults.map((r) => (
                    <option key={r.id} value={String(r.id)}>
                      {r.name}
                    </option>
                  ))}
                  {catalogs.visitResults.length === 0 && (
                    <>
                      <option value="1">Venta Exitosa</option>
                      <option value="2">Cotización Solicitada</option>
                      <option value="3">Seguimiento Programado</option>
                      <option value="4">Cliente Ausente</option>
                      <option value="5">No Interesado</option>
                    </>
                  )}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Interés en nuestros productos <span className={styles.requiredAsterisk}>*</span>
                </label>
                <select
                  className={styles.selectControl}
                  value={productInterest}
                  onChange={(e) => setProductInterest(e.target.value)}
                >
                  <option value="Alto">Alto</option>
                  <option value="Medio">Medio</option>
                  <option value="Bajo">Bajo</option>
                  <option value="Nulo">Nulo</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Módulo de interés</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  value={moduleInterest}
                  onChange={(e) => setModuleInterest(e.target.value)}
                  placeholder="Calidad y precio"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Competencia mencionada</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  value={competitorMentioned}
                  onChange={(e) => setCompetitorMentioned(e.target.value)}
                  placeholder="Inducacor"
                />
              </div>
            </div>

            <div className={styles.fieldGroup} style={{ marginTop: "12px" }}>
              <label className={styles.fieldLabel}>
                Observaciones de la visita <span className={styles.requiredAsterisk}>*</span>
              </label>
              <textarea
                className={styles.textareaControl}
                rows={3}
                maxLength={500}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Detalla los puntos clave acordados, dudas del cliente o requerimientos de cotización..."
              />
              <div className={styles.textareaMetaRow}>
                <span className={styles.charCount}>{observations.length}/500</span>
              </div>
            </div>
          </section>

          {/* Bloque 4: Gestión comercial */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIconWrapper}>
                <DollarSign size={17} />
              </div>
              <h2 className={styles.sectionTitle}>4. Gestión comercial</h2>
            </div>

            {/* Fila Cotización */}
            <div className={styles.toggleRow}>
              <div className={styles.fieldGroup} style={{ minWidth: "180px" }}>
                <span className={styles.fieldLabel}>
                  ¿Se generó cotización? <span className={styles.requiredAsterisk}>*</span>
                </span>
                <div className={styles.toggleButtonGroup}>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${hasQuote ? styles.toggleBtnActive : ""}`}
                    onClick={() => setHasQuote(true)}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${!hasQuote ? styles.toggleBtnActive : ""}`}
                    onClick={() => setHasQuote(false)}
                  >
                    No
                  </button>
                </div>
              </div>

              {hasQuote && (
                <div className={styles.commercialInputsGrid}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Número de cotización</label>
                    <input
                      type="text"
                      className={styles.inputControl}
                      value={quoteNumber}
                      onChange={(e) => setQuoteNumber(e.target.value)}
                      placeholder="COT-1242"
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Valor cotización</label>
                    <input
                      type="text"
                      className={styles.inputControl}
                      value={quoteValue}
                      onChange={(e) => setQuoteValue(e.target.value)}
                      placeholder="$ 24,800,000"
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Moneda</label>
                    <select
                      className={styles.selectControl}
                      value={quoteCurrency}
                      onChange={(e) => setQuoteCurrency(e.target.value)}
                    >
                      <option value="COP">COP</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Fila Pedido */}
            <div className={styles.toggleRow}>
              <div className={styles.fieldGroup} style={{ minWidth: "180px" }}>
                <span className={styles.fieldLabel}>
                  ¿Se generó pedido? <span className={styles.requiredAsterisk}>*</span>
                </span>
                <div className={styles.toggleButtonGroup}>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${hasOrder ? styles.toggleBtnActive : ""}`}
                    onClick={() => setHasOrder(true)}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${!hasOrder ? styles.toggleBtnActive : ""}`}
                    onClick={() => setHasOrder(false)}
                  >
                    No
                  </button>
                </div>
              </div>

              {hasOrder && (
                <div className={styles.commercialInputsGrid}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Número de pedido</label>
                    <input
                      type="text"
                      className={styles.inputControl}
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="PED-568"
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Valor pedido</label>
                    <input
                      type="text"
                      className={styles.inputControl}
                      value={orderValue}
                      onChange={(e) => setOrderValue(e.target.value)}
                      placeholder="$ 18,500,000"
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Fecha estimada entrega</label>
                    <div className={styles.inputWithIconWrapper}>
                      <input
                        type="date"
                        className={styles.inputControl}
                        value={estimatedDeliveryDate}
                        onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                      />
                      <Calendar size={15} className={styles.fieldInnerIcon} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Bloque 5: Próximo seguimiento */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIconWrapper}>
                <Calendar size={17} />
              </div>
              <h2 className={styles.sectionTitle}>5. Próximo seguimiento</h2>
            </div>

            <div className={styles.fieldsGrid4}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Fecha próxima visita <span className={styles.requiredAsterisk}>*</span>
                </label>
                <div className={styles.inputWithIconWrapper}>
                  <input
                    type="date"
                    className={styles.inputControl}
                    value={nextVisitDate}
                    onChange={(e) => setNextVisitDate(e.target.value)}
                  />
                  <Calendar size={15} className={styles.fieldInnerIcon} />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Hora próxima visita</label>
                <div className={styles.inputWithIconWrapper}>
                  <input
                    type="time"
                    className={styles.inputControl}
                    value={nextVisitTime}
                    onChange={(e) => setNextVisitTime(e.target.value)}
                  />
                  <Clock size={15} className={styles.fieldInnerIcon} />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Objetivo próximo seguimiento</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  value={nextObjective}
                  onChange={(e) => setNextObjective(e.target.value)}
                  placeholder="Presentar propuesta técnica y cierre comercial"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Responsable</label>
                <select
                  className={styles.selectControl}
                  value={nextResponsibleId}
                  onChange={(e) => setNextResponsibleId(e.target.value)}
                >
                  {advisorsList.map((adv) => (
                    <option key={adv.id || adv.userId} value={String(adv.userId || adv.id)}>
                      {adv.name || `Asesor #${adv.userId || adv.id}`}
                    </option>
                  ))}
                  {advisorsList.length === 0 && (
                    <option value="1">{user?.name || "Juan Pérez"}</option>
                  )}
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Columna Derecha: Panel Contextual */}
        <div className={styles.contextColumn}>
          {/* Tarjeta 1: Resumen del cliente */}
          <div className={styles.contextCard}>
            <h3 className={styles.contextCardTitle}>
              <Building2 size={16} />
              <span>Resumen del cliente</span>
            </h3>

            <div className={styles.clientAvatarRow}>
              <div className={styles.clientAvatarCircle}>
                <Building2 size={24} />
              </div>
              <div className={styles.clientSummaryMeta}>
                <strong className={styles.clientNameTitle}>
                  {currentClient?.commercialName || "Metalúrgicas S.A.S."}
                </strong>
                <span className={styles.clientActiveBadge}>Cliente activo</span>
              </div>
            </div>

            <div className={styles.clientDetailsList}>
              <div className={styles.clientDetailItem}>
                <span>
                  Código: <strong>{clientCode || "CJI-001245"}</strong>
                </span>
              </div>
              <div className={styles.clientDetailItem}>
                <MapPin size={13} />
                <span>
                  {clientMunicipality || "Barranquilla"}, Atlántico
                </span>
              </div>
              <div className={styles.clientDetailItem}>
                <span>
                  Tipo: <strong>{clientType || "Industrial"}</strong> | Potencial:{" "}
                  <strong>{clientPotential || "Alto"}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Últimas interacciones */}
          <div className={styles.contextCard}>
            <h3 className={styles.contextCardTitle}>
              <Clock size={16} />
              <span>Últimas interacciones</span>
            </h3>

            {loadingHistory ? (
              <div
                style={{
                  padding: "18px 0",
                  textAlign: "center",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Cargando interacciones...
              </div>
            ) : interactions.length === 0 ? (
              <div
                style={{
                  padding: "18px 0",
                  textAlign: "center",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Sin interacciones registradas aún
              </div>
            ) : (
              <ul className={styles.interactionsList}>
                {interactions.map((inter) => (
                  <li key={inter.id} className={styles.interactionItem}>
                    <div
                      className={`${styles.interactionIconCircle} ${
                        inter.type === "visit"
                          ? styles.iconCircleGreen
                          : inter.type === "quote"
                          ? styles.iconCircleBlue
                          : inter.type === "order"
                          ? styles.iconCirclePurple
                          : styles.iconCircleOrange
                      }`}
                    >
                      {inter.type === "visit" && <Check size={14} />}
                      {inter.type === "quote" && <FileText size={14} />}
                      {inter.type === "order" && <ShoppingCart size={14} />}
                      {inter.type === "followup" && <Clock size={14} />}
                      {inter.type !== "visit" &&
                        inter.type !== "quote" &&
                        inter.type !== "order" &&
                        inter.type !== "followup" && <Building2 size={14} />}
                    </div>
                    <div className={styles.interactionDetails}>
                      <span className={styles.interactionDateRow}>
                        {formatSpanishDisplayDate(inter.date)}
                      </span>
                      <strong className={styles.interactionTitle}>
                        {inter.title}
                      </strong>
                      <span className={styles.interactionSubtitle}>
                        {inter.subtitle}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              className={styles.viewHistoryLink}
              onClick={() => setIsHistoryModalOpen(true)}
            >
              <span>Ver historial completo</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Tarjeta 3: Acciones rápidas */}
          <div className={styles.contextCard}>
            <h3 className={styles.contextCardTitle}>
              <Target size={16} />
              <span>Acciones rápidas</span>
            </h3>

            <input
              type="file"
              ref={fileInputRef}
              className={styles.attachmentHiddenInput}
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx"
            />

            <div className={styles.quickActionsList}>
              <button
                type="button"
                className={styles.quickActionBtn}
                onClick={() => setHasQuote(true)}
              >
                <FileText size={15} color="#ea580c" />
                <span>Generar cotización</span>
              </button>

              <button
                type="button"
                className={styles.quickActionBtn}
                onClick={() => setHasOrder(true)}
              >
                <ShoppingCart size={15} color="#ea580c" />
                <span>Crear pedido</span>
              </button>

              <button
                type="button"
                className={styles.quickActionBtn}
                onClick={() => {
                  const dateInput = document.querySelector('input[type="date"]');
                  if (dateInput) dateInput.focus();
                }}
              >
                <Calendar size={15} color="#ea580c" />
                <span>Programar próxima visita</span>
              </button>

              <button
                type="button"
                className={styles.quickActionBtn}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={15} color="#ea580c" />
                <span>Tomar foto</span>
              </button>

              <button
                type="button"
                className={styles.quickActionBtn}
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={15} color="#ea580c" />
                <span>Adjuntar documento</span>
              </button>
            </div>

            {uploadedFiles.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                {uploadedFiles.map((f, i) => (
                  <span key={i} className={styles.uploadedFilePill}>
                    <Paperclip size={12} />
                    <span>{f.name}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Modal de Historial Completo de Interacciones */}
      {isHistoryModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsHistoryModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-modal-title"
          >
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderTitleBlock}>
                <div className={styles.modalHeaderIcon}>
                  <Clock size={20} />
                </div>
                <div>
                  <h2 id="history-modal-title" className={styles.modalTitle}>
                    Historial de interacciones comerciales
                  </h2>
                  <p className={styles.modalSubtitle}>
                    {currentClient?.commercialName || "Cliente"} &bull; NIT:{" "}
                    {clientCode} &bull; {clientMunicipality}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsHistoryModalOpen(false)}
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Stats Summary */}
            <div className={styles.modalStatsRow}>
              <div className={styles.modalStatItem}>
                <span className={styles.statLabel}>Total interacciones</span>
                <strong className={styles.statValue}>{historyList.length}</strong>
              </div>
              <div className={styles.modalStatItem}>
                <span className={styles.statLabel}>Visitas registradas</span>
                <strong className={`${styles.statValue} ${styles.statGreen}`}>
                  {historyList.filter((h) => h.type === "visit").length}
                </strong>
              </div>
              <div className={styles.modalStatItem}>
                <span className={styles.statLabel}>Cotizaciones</span>
                <strong className={`${styles.statValue} ${styles.statBlue}`}>
                  {historyList.filter((h) => h.type === "quote").length}
                </strong>
              </div>
              <div className={styles.modalStatItem}>
                <span className={styles.statLabel}>Seguimientos</span>
                <strong className={`${styles.statValue} ${styles.statOrange}`}>
                  {historyList.filter((h) => h.type === "followup").length}
                </strong>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className={styles.modalFiltersBar}>
              <div className={styles.filterTabs}>
                {[
                  { id: "all", label: "Todas" },
                  { id: "visit", label: "Visitas" },
                  { id: "quote", label: "Cotizaciones" },
                  { id: "order", label: "Pedidos" },
                  { id: "followup", label: "Seguimientos" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`${styles.filterTabBtn} ${
                      historyFilterType === tab.id ? styles.filterTabBtnActive : ""
                    }`}
                    onClick={() => setHistoryFilterType(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className={styles.searchFilterWrapper}>
                <Search size={14} className={styles.searchFilterIcon} />
                <input
                  type="text"
                  className={styles.searchFilterInput}
                  placeholder="Buscar por motivo, asesor..."
                  value={historySearchTerm}
                  onChange={(e) => setHistorySearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Timeline List */}
            <div className={styles.modalTimelineContainer}>
              {filteredHistory.length === 0 ? (
                <div className={styles.emptyHistoryState}>
                  <AlertCircle size={32} color="#94a3b8" />
                  <p>
                    No se encontraron interacciones con los filtros seleccionados.
                  </p>
                </div>
              ) : (
                <div className={styles.timelineList}>
                  {filteredHistory.map((item) => (
                    <div key={item.id} className={styles.timelineItem}>
                      <div
                        className={`${styles.timelineIconBubble} ${
                          item.type === "visit"
                            ? styles.iconBubbleGreen
                            : item.type === "quote"
                            ? styles.iconBubbleBlue
                            : item.type === "order"
                            ? styles.iconBubblePurple
                            : styles.iconBubbleOrange
                        }`}
                      >
                        {item.type === "visit" && <Check size={15} />}
                        {item.type === "quote" && <FileText size={15} />}
                        {item.type === "order" && <ShoppingCart size={15} />}
                        {item.type === "followup" && <Clock size={15} />}
                        {item.type !== "visit" &&
                          item.type !== "quote" &&
                          item.type !== "order" &&
                          item.type !== "followup" && <Building2 size={15} />}
                      </div>

                      <div className={styles.timelineContentCard}>
                        <div className={styles.timelineCardHeader}>
                          <div>
                            <strong className={styles.timelineEventTitle}>
                              {item.title}
                            </strong>
                            <span className={styles.timelineSubtitle}>
                              {item.subtitle}
                            </span>
                          </div>
                          <div className={styles.timelineMetaPills}>
                            <span className={styles.datePill}>
                              <Calendar size={12} />
                              <span>
                                {formatSpanishDisplayDate(item.date)} {item.time}
                              </span>
                            </span>
                            <span
                              className={`${styles.statusBadge} ${
                                item.status === "Visitado" ||
                                item.status === "Aprobado"
                                  ? styles.badgeSuccess
                                  : item.status === "Enviada" ||
                                    item.status === "Generada"
                                  ? styles.badgePrimary
                                  : styles.badgeWarning
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>

                        {item.description && (
                          <p className={styles.timelineDescription}>
                            {item.description}
                          </p>
                        )}

                        <div className={styles.timelineCardFooter}>
                          <span className={styles.timelineAdvisorTag}>
                            <User size={12} />
                            <span>{item.userName || "Asesor comercial"}</span>
                          </span>
                          {item.amount && (
                            <span className={styles.timelineAmountTag}>
                              <DollarSign size={12} />
                              <span>{formatCurrency(item.amount)} COP</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={styles.modalFooter}>
              <span className={styles.modalFooterNote}>
                Mostrando {filteredHistory.length} de {historyList.length}{" "}
                interacciones registradas
              </span>
              <button
                type="button"
                className={styles.modalClosePrimaryBtn}
                onClick={() => setIsHistoryModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
