import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  XCircle,
  Building2,
  MapPin,
  RefreshCw,
  GitBranch,
} from "lucide-react";
import * as visitsService from "../services/visitsService";
import { getClients } from "@/features/clients/services/clientsService";
import { getRoutes } from "@/features/routes/services/routesService";
import styles from "./AgendaPage.module.css";

function toDateInputString(date) {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

export default function AgendaPage() {
  const navigate = useNavigate();

  const [period, setPeriod] = useState("day");
  const [selectedDate, setSelectedDate] = useState(toDateInputString(new Date()));
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mapeos para enriquecer datos en la vista
  const [clientsMap, setClientsMap] = useState(new Map());
  const [routesMap, setRoutesMap] = useState(new Map());

  // Modales
  const [rescheduleModal, setRescheduleModal] = useState({ open: false, visit: null, date: "", reason: "" });
  const [notVisitedModal, setNotVisitedModal] = useState({ open: false, visit: null, reason: "" });
  const [actionLoading, setActionLoading] = useState(false);

  // Carga clientes y rutas para nombres
  useEffect(() => {
    getClients({ limit: 100 })
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setClientsMap(new Map(list.map((c) => [c.id, c])));
      })
      .catch(() => null);

    getRoutes({ limit: 100 })
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setRoutesMap(new Map(list.map((r) => [r.id, r])));
      })
      .catch(() => null);
  }, []);

  // Carga la agenda según periodo y fecha
  const loadAgenda = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await visitsService.getVisitAgenda({
        period,
        date: selectedDate,
      });
      setVisits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar agenda:", err);
      setError("No se pudieron cargar las visitas programadas para este periodo.");
    } finally {
      setLoading(false);
    }
  }, [period, selectedDate]);

  useEffect(() => {
    loadAgenda();
  }, [loadAgenda]);

  // Iniciar visita en terreno
  const handleStartVisit = async (visitId) => {
    try {
      await visitsService.startVisit(visitId);
      loadAgenda();
    } catch (err) {
      alert(err.message || "Error al iniciar la visita.");
    }
  };

  // Reprogramar visita
  const handleConfirmReschedule = async () => {
    if (!rescheduleModal.date) {
      alert("Por favor selecciona una fecha futura.");
      return;
    }
    setActionLoading(true);
    try {
      await visitsService.rescheduleVisit(rescheduleModal.visit.id, {
        scheduledAt: new Date(rescheduleModal.date).toISOString(),
        reason: rescheduleModal.reason || undefined,
      });
      setRescheduleModal({ open: false, visit: null, date: "", reason: "" });
      loadAgenda();
    } catch (err) {
      alert(err.message || "Error al reprogramar la visita.");
    } finally {
      setActionLoading(false);
    }
  };

  // Marcar como no visitada
  const handleConfirmNotVisited = async () => {
    if (!notVisitedModal.reason?.trim()) {
      alert("Por favor indica el motivo.");
      return;
    }
    setActionLoading(true);
    try {
      await visitsService.markVisitNotVisited(notVisitedModal.visit.id, {
        reason: notVisitedModal.reason.trim(),
      });
      setNotVisitedModal({ open: false, visit: null, reason: "" });
      loadAgenda();
    } catch (err) {
      alert(err.message || "Error al marcar como no visitada.");
    } finally {
      setActionLoading(false);
    }
  };

  // KPIs
  const totalVisits = visits.length;
  const inProgressCount = visits.filter((v) => v.status === "IN_PROGRESS").length;
  const visitedCount = visits.filter((v) => v.status === "VISITED").length;
  const pendingCount = visits.filter((v) => v.status === "PENDING" || v.status === "RESCHEDULE").length;

  return (
    <div className={styles.container}>
      {/* 1. Header */}
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Agenda de Asesores</h1>
          <p className={styles.subtitle}>
            Gestión operativa de visitas comerciales, atención en terreno y registro de resultados.
          </p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.periodToggleGroup}>
            <button
              type="button"
              className={`${styles.periodBtn} ${period === "day" ? styles.periodBtnActive : ""}`}
              onClick={() => setPeriod("day")}
            >
              Día
            </button>
            <button
              type="button"
              className={`${styles.periodBtn} ${period === "week" ? styles.periodBtnActive : ""}`}
              onClick={() => setPeriod("week")}
            >
              Semana
            </button>
          </div>

          <input
            type="date"
            className={styles.dateInput}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <button
            type="button"
            className={styles.registerVisitBtn}
            onClick={() => navigate("/visitas/registrar")}
          >
            <Plus size={16} />
            <span>Registrar visita</span>
          </button>
        </div>
      </header>

      {/* Alerta de Error si ocurre */}
      {error && (
        <div className={styles.emptyState}>
          <AlertCircle size={24} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>{error}</p>
          <button type="button" onClick={loadAgenda} className={styles.startBtn} style={{ marginTop: "8px" }}>
            <RefreshCw size={14} /> Reintentar
          </button>
        </div>
      )}

      {/* 2. KPIs */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconBox} ${styles.kpiIconBlue}`}>
            <Calendar size={20} />
          </div>
          <div className={styles.kpiContent}>
            <strong className={styles.kpiValue}>{totalVisits}</strong>
            <span className={styles.kpiLabel}>Visitas agendadas</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconBox} ${styles.kpiIconOrange}`}>
            <Clock size={20} />
          </div>
          <div className={styles.kpiContent}>
            <strong className={styles.kpiValue}>{inProgressCount}</strong>
            <span className={styles.kpiLabel}>En progreso hoy</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconBox} ${styles.kpiIconGreen}`}>
            <CheckCircle2 size={20} />
          </div>
          <div className={styles.kpiContent}>
            <strong className={styles.kpiValue}>{visitedCount}</strong>
            <span className={styles.kpiLabel}>Visitas realizadas</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconBox} ${styles.kpiIconPurple}`}>
            <RotateCcw size={20} />
          </div>
          <div className={styles.kpiContent}>
            <strong className={styles.kpiValue}>{pendingCount}</strong>
            <span className={styles.kpiLabel}>Pendientes / Por visitar</span>
          </div>
        </div>
      </div>

      {/* 3. Lista de visitas */}
      <section className={styles.visitsListSection}>
        <div className={styles.sectionTitleRow}>
          <h2 className={styles.sectionTitle}>
            Visitas {period === "day" ? "del día" : "de la semana"}
          </h2>
          <span className={styles.visitsCountBadge}>{visits.length} programadas</span>
        </div>

        {loading ? (
          <div className={styles.emptyState}>
            <Clock size={28} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>Cargando agenda de visitas...</p>
          </div>
        ) : visits.length === 0 ? (
          <div className={styles.emptyState}>
            <Calendar size={36} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No hay visitas programadas para este periodo.</p>
            <p className={styles.emptyText}>
              Selecciona otra fecha en el calendario o haz clic en "Registrar visita" para ingresar una visita comercial.
            </p>
          </div>
        ) : (
          <div className={styles.visitsCardsGrid}>
            {visits.map((visit) => {
              const client = clientsMap.get(visit.clientId);
              const route = routesMap.get(visit.routeId);
              const dateObj = new Date(visit.scheduledAt);
              const timeStr = dateObj.toLocaleTimeString("es-CO", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });
              const parts = timeStr.split(" ");

              let statusLabel = "Pendiente";
              let statusClass = styles.statusPending;
              if (visit.status === "IN_PROGRESS") {
                statusLabel = "En Progreso";
                statusClass = styles.statusInProgress;
              } else if (visit.status === "VISITED") {
                statusLabel = "Visitado";
                statusClass = styles.statusVisited;
              } else if (visit.status === "RESCHEDULE") {
                statusLabel = "Reprogramado";
                statusClass = styles.statusReschedule;
              } else if (visit.status === "NOT_VISITED") {
                statusLabel = "No Visitado";
                statusClass = styles.statusNotVisited;
              }

              return (
                <div key={visit.id} className={styles.visitCard}>
                  <div className={styles.visitCardLeft}>
                    <div className={styles.timeBox}>
                      <span className={styles.timeHour}>{parts[0] || "09:00"}</span>
                      <span className={styles.timePeriod}>{parts[1] || "AM"}</span>
                    </div>

                    <div className={styles.visitInfo}>
                      <h3 className={styles.clientName}>
                        {client?.commercialName || `Cliente #${visit.clientId}`}
                      </h3>

                      <div className={styles.clientMeta}>
                        <span>
                          <MapPin size={12} /> {client?.address || "Dirección registrada"} &bull;{" "}
                          {client?.municipality || "Barranquilla"}
                        </span>
                        {route && (
                          <span className={styles.routeBadge}>
                            <GitBranch size={11} />
                            {route.name}
                          </span>
                        )}
                        <span className={`${styles.statusBadge} ${statusClass}`}>{statusLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    {visit.status === "PENDING" && (
                      <button
                        type="button"
                        className={styles.startBtn}
                        onClick={() => handleStartVisit(visit.id)}
                        title="Iniciar atención en terreno"
                      >
                        <Play size={13} />
                        <span>Iniciar</span>
                      </button>
                    )}

                    <button
                      type="button"
                      className={styles.recordBtn}
                      onClick={() =>
                        navigate(`/visitas/registrar?visitId=${visit.id}&clientId=${visit.clientId}`)
                      }
                      title="Registrar formulario y resultado comercial"
                    >
                      <CheckCircle2 size={14} />
                      <span>Registrar visita</span>
                    </button>

                    {visit.status !== "VISITED" && visit.status !== "NOT_VISITED" && (
                      <>
                        <button
                          type="button"
                          className={styles.moreActionBtn}
                          onClick={() =>
                            setRescheduleModal({
                              open: true,
                              visit,
                              date: toDateInputString(new Date(Date.now() + 86400000)),
                              reason: "",
                            })
                          }
                          title="Reprogramar visita"
                        >
                          <RotateCcw size={14} />
                        </button>
                        <button
                          type="button"
                          className={styles.moreActionBtn}
                          onClick={() =>
                            setNotVisitedModal({
                              open: true,
                              visit,
                              reason: "Cliente no se encontraba en el establecimiento comercial",
                            })
                          }
                          title="Marcar no visitado"
                        >
                          <XCircle size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal Reprogramar */}
      {rescheduleModal.open && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalBox}>
            <h3 className={styles.modalTitle}>Reprogramar Visita</h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Selecciona la nueva fecha para la visita con{" "}
              <strong>
                {clientsMap.get(rescheduleModal.visit?.clientId)?.commercialName || "el cliente"}
              </strong>
              .
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569" }}>
                Nueva fecha programada *
              </label>
              <input
                type="date"
                className={styles.dateInput}
                value={rescheduleModal.date}
                onChange={(e) =>
                  setRescheduleModal((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569" }}>
                Motivo de la reprogramación
              </label>
              <textarea
                rows={2}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  fontFamily: "inherit",
                }}
                value={rescheduleModal.reason}
                onChange={(e) =>
                  setRescheduleModal((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder="Solicitud expresa del cliente para la próxima semana..."
              />
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.startBtn}
                onClick={() => setRescheduleModal({ open: false, visit: null, date: "", reason: "" })}
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.recordBtn}
                onClick={handleConfirmReschedule}
                disabled={actionLoading}
              >
                {actionLoading ? "Reprogramando..." : "Confirmar reprogramación"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Marcar no visitado */}
      {notVisitedModal.open && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalBox}>
            <h3 className={styles.modalTitle}>Marcar Visita como No Realizada</h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Indica la causa por la cual no fue posible efectuar la visita a{" "}
              <strong>
                {clientsMap.get(notVisitedModal.visit?.clientId)?.commercialName || "el cliente"}
              </strong>
              .
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569" }}>
                Motivo justificado *
              </label>
              <textarea
                rows={3}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  fontFamily: "inherit",
                }}
                value={notVisitedModal.reason}
                onChange={(e) =>
                  setNotVisitedModal((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder="Local cerrado en horario de visita / Contacto fuera de la ciudad..."
              />
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.startBtn}
                onClick={() => setNotVisitedModal({ open: false, visit: null, reason: "" })}
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.recordBtn}
                style={{ backgroundColor: "#dc2626" }}
                onClick={handleConfirmNotVisited}
                disabled={actionLoading}
              >
                {actionLoading ? "Guardando..." : "Registrar no visitado"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
