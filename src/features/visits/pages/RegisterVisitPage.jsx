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
} from "lucide-react";
import { useAuth } from "@/features/auth";
import * as visitsService from "../services/visitsService";
import { getClients, getCatalogs } from "@/features/clients/services/clientsService";
import { getRoutes, getAvailableAdvisors } from "@/features/routes/services/routesService";
import styles from "./RegisterVisitPage.module.css";

// Formatea fecha a YYYY-MM-DD
function toDateInputString(date) {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

// Obtiene el número de semana del año
function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
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
  const [visitDate, setVisitDate] = useState(toDateInputString(today));
  const [startTime, setStartTime] = useState("10:15");
  const [endTime, setEndTime] = useState("11:30");
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState("1");
  const [weekNumber, setWeekNumber] = useState(String(getWeekNumber(today)));
  const [dayOfWeek, setDayOfWeek] = useState("Martes");
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
          setSelectedRouteId(String(list[0].id));
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
          const schDate = new Date(visit.scheduledAt);
          setVisitDate(toDateInputString(schDate));
          setWeekNumber(String(getWeekNumber(schDate)));
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

  // Manejo de selección de cliente
  const selectClient = (client) => {
    if (!client) return;
    setSelectedClientId(String(client.id));
    setClientSearch(client.commercialName);
    setClientCode(client.nit || `CLI-${String(client.id).padStart(5, "0")}`);
    setClientMunicipality(client.municipality || "Barranquilla");

    const matchedType =
      catalogs.clientTypes.find((t) => t.id === client.clientTypeId)?.name ||
      client.clientType ||
      "Industrial";
    setClientType(matchedType);

    // Si tiene contactos asignados
    if (client.contacts?.length > 0) {
      const primary = client.contacts.find((c) => c.isPrimary) || client.contacts[0];
      setContactName(primary.name || "");
      setContactPhone(primary.phone || primary.mobile || client.phone || "");
      setContactPosition(primary.position || "Jefe de Compras");
    } else {
      setContactName("Carlos Julio Mendoza");
      setContactPhone(client.phone || "300 123 4567");
      setContactPosition("Jefe de Compras");
    }

    if (client.potentialId) {
      const pot = catalogs.potentials.find((p) => p.id === client.potentialId);
      if (pot) setClientPotential(pot.name);
    }
  };

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
                    onChange={(e) => setVisitDate(e.target.value)}
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
                  onChange={(e) => setSelectedRouteId(e.target.value)}
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

            <ul className={styles.interactionsList}>
              <li className={styles.interactionItem}>
                <div className={`${styles.interactionIconCircle} ${styles.iconCircleGreen}`}>
                  <Check size={14} />
                </div>
                <div className={styles.interactionDetails}>
                  <span className={styles.interactionDateRow}>14/05/2024</span>
                  <strong className={styles.interactionTitle}>Visita realizada</strong>
                  <span className={styles.interactionSubtitle}>Resultado: Interesado</span>
                </div>
              </li>

              <li className={styles.interactionItem}>
                <div className={`${styles.interactionIconCircle} ${styles.iconCircleBlue}`}>
                  <FileText size={14} />
                </div>
                <div className={styles.interactionDetails}>
                  <span className={styles.interactionDateRow}>07/05/2024</span>
                  <strong className={styles.interactionTitle}>Cotización enviada</strong>
                  <span className={styles.interactionSubtitle}>COT-1241 | $ 12,600,000</span>
                </div>
              </li>

              <li className={styles.interactionItem}>
                <div className={`${styles.interactionIconCircle} ${styles.iconCircleOrange}`}>
                  <Clock size={14} />
                </div>
                <div className={styles.interactionDetails}>
                  <span className={styles.interactionDateRow}>30/04/2024</span>
                  <strong className={styles.interactionTitle}>Seguimiento telefónico</strong>
                  <span className={styles.interactionSubtitle}>Pendiente de respuesta</span>
                </div>
              </li>
            </ul>

            <button
              type="button"
              className={styles.viewHistoryLink}
              onClick={() => alert("Historial completo de interacciones comerciales")}
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
    </div>
  );
}
