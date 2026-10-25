import { useState } from "react";
import { UserCheck, Calendar, MapPin, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import styles from "./RouteWizardModal.module.css";

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

export default function Step3AssignAdvisor({
  routeData,
  stops = [],
  metrics,
  advisors = [],
  loading = false,
  onBack,
  onSubmit,
}) {
  const [selectedAdvisorId, setSelectedAdvisorId] = useState(
    routeData?.advisorId ? String(routeData.advisorId) : advisors[0]?.userId ? String(advisors[0].userId) : "1"
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAdvisorId) return;
    onSubmit(Number(selectedAdvisorId));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.stepForm}>
      <div className={styles.sectionNotice}>
        <p>
          <strong>Paso 3:</strong> Revisa el itinerario consolidado y asigna el asesor comercial
          responsable. Al confirmar, el sistema programará automáticamente las visitas en su agenda
          operativa.
        </p>
      </div>

      {/* Resumen de la Ruta */}
      <div className={styles.summaryCard}>
        <h4 className={styles.summaryTitle}>
          <ShieldCheck size={18} className={styles.summaryIcon} />
          <span>Resumen de la Ruta Comercial</span>
        </h4>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Ruta:</span>
            <strong className={styles.summaryValue}>{routeData?.name}</strong>
          </div>

          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Día y Frecuencia:</span>
            <span className={styles.summaryValue}>
              {DAY_LABELS[routeData?.dayOfWeek] || routeData?.dayOfWeek} &bull;{" "}
              {FREQUENCY_LABELS[routeData?.frequency] || routeData?.frequency}
            </span>
          </div>

          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Horario Estimado:</span>
            <span className={styles.summaryValue}>
              {routeData?.startTime ? routeData.startTime.slice(0, 5) : "08:00"} -{" "}
              {routeData?.endTime ? routeData.endTime.slice(0, 5) : "17:00"}
            </span>
          </div>

          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Paradas:</span>
            <span className={styles.summaryValue}>{stops.length} clientes en el recorrido</span>
          </div>

          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Distancia Recorrido:</span>
            <span className={styles.summaryValue}>
              {metrics.totalDistanceKm != null
                ? `${Number(metrics.totalDistanceKm).toFixed(1)} km (Haversine)`
                : "0.0 km"}
            </span>
          </div>

          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Tiempo Estimado:</span>
            <span className={styles.summaryValue}>
              {metrics.estimatedDurationMinutes != null
                ? `${metrics.estimatedDurationMinutes} minutos`
                : "0 min"}
            </span>
          </div>
        </div>
      </div>

      {/* Selector de Asesor */}
      <div className={styles.advisorSelectionCard}>
        <div className={styles.advisorHeader}>
          <UserCheck size={20} className={styles.advisorIcon} />
          <div>
            <h4 className={styles.advisorTitle}>Asignar Asesor Comercial Responsable *</h4>
            <p className={styles.advisorSubtitle}>
              Selecciona el asesor que ejecutará las visitas en terreno
            </p>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="advisorSelect">Asesor Comercial *</label>
          {advisors.length > 0 ? (
            <select
              id="advisorSelect"
              value={selectedAdvisorId}
              onChange={(e) => setSelectedAdvisorId(e.target.value)}
              required
            >
              <option value="">Selecciona un asesor comercial</option>
              {advisors.map((adv) => (
                <option key={adv.userId || adv.id} value={adv.userId || adv.id}>
                  {adv.name || adv.user?.name || `Asesor #${adv.userId || adv.id}`}
                  {adv.weeklyVisitGoal ? ` &bull; Meta semanal: ${adv.weeklyVisitGoal} visitas` : ""}
                </option>
              ))}
            </select>
          ) : (
            <div className={styles.advisorFallbackWrapper}>
              <select
                id="advisorSelect"
                value={selectedAdvisorId}
                onChange={(e) => setSelectedAdvisorId(e.target.value)}
                required
              >
                <option value="1">Alejandro Villanueva Orozco (Asesor Comercial)</option>
                <option value="2">Laura Martinez (Asesor Comercial)</option>
                <option value="3">Andres Pacheco (Asesor Comercial)</option>
              </select>
            </div>
          )}
        </div>

        {/* Alerta de Programación Automática */}
        <div className={styles.scheduleNotice}>
          <Calendar size={18} className={styles.scheduleNoticeIcon} />
          <div>
            <strong>Generación Automática de Agenda (Épica E4):</strong>
            <p>
              Al hacer clic en el botón de abajo, el backend proyectará las fechas correspondientes
              para el día de la semana y frecuencia estipuladas, e insertará automáticamente las
              visitas con estado <strong>Pendiente</strong> en la agenda del asesor.
            </p>
          </div>
        </div>
      </div>

      <footer className={styles.stepFooter}>
        <button type="button" className={styles.secondaryBtn} onClick={onBack} disabled={loading}>
          ← Volver a Paradas y Mapa
        </button>
        <button type="submit" className={styles.confirmBtn} disabled={!selectedAdvisorId || loading}>
          {loading ? "Programando visitas..." : "Confirmar Asignación y Programar Visitas ✓"}
        </button>
      </footer>
    </form>
  );
}
