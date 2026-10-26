import { X, GitBranch, AlertCircle, Check } from "lucide-react";
import useRouteWizard from "../../hooks/useRouteWizard";
import Step1GeneralData from "./Step1GeneralData";
import Step2StopsAndMap from "./Step2StopsAndMap";
import Step3AssignAdvisor from "./Step3AssignAdvisor";
import styles from "./RouteWizardModal.module.css";

export default function RouteWizardModal({
  isOpen,
  route = null,
  zones = [],
  onClose,
  onSuccess,
}) {
  const {
    step,
    setStep,
    routeData,
    stops,
    zoneClients,
    advisors,
    metrics,
    loading,
    clientsLoading,
    error,
    setError,
    submitStep1,
    handleAddStop,
    handleRemoveStop,
    handleMoveStop,
    proceedToStep3,
    submitStep3,
  } = useRouteWizard({ route, onSuccess, onClose });

  if (!isOpen) return null;

  const isEditing = Boolean(route);

  return (
    <div className={styles.overlay} onClick={onClose} aria-hidden="true">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-modal-title"
      >
        {/* Cabecera del Wizard */}
        <header className={styles.header}>
          <div className={styles.titleInfo}>
            <div className={styles.iconCircle}>
              <GitBranch size={22} className={styles.headerIcon} />
            </div>
            <div>
              <h2 id="wizard-modal-title" className={styles.title}>
                {isEditing ? "Modificar Ruta Comercial" : "Asistente de Planeación de Rutas (Wizard)"}
              </h2>
              <p className={styles.subtitle}>
                Diseña el recorrido comercial semanal, secuencia las paradas y programa las visitas
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar asistente"
          >
            <X size={20} />
          </button>
        </header>

        {/* Stepper horizontal indicador de progreso */}
        <div className={styles.stepper}>
          <div className={`${styles.stepIndicator} ${step >= 1 ? styles.stepActive : ""}`}>
            <span className={styles.stepBadge}>
              {step > 1 ? <Check size={14} /> : "1"}
            </span>
            <span className={styles.stepLabel}>Datos Generales</span>
          </div>
          <div className={styles.stepConnector} />

          <div className={`${styles.stepIndicator} ${step >= 2 ? styles.stepActive : ""}`}>
            <span className={styles.stepBadge}>
              {step > 2 ? <Check size={14} /> : "2"}
            </span>
            <span className={styles.stepLabel}>Paradas y Recorrido</span>
          </div>
          <div className={styles.stepConnector} />

          <div className={`${styles.stepIndicator} ${step >= 3 ? styles.stepActive : ""}`}>
            <span className={styles.stepBadge}>3</span>
            <span className={styles.stepLabel}>Asignación a Asesor</span>
          </div>
        </div>

        {/* Alerta de Error si ocurre */}
        {error && (
          <div className={styles.errorAlert} role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Contenido según el paso activo */}
        <div className={styles.wizardBody}>
          {step === 1 && (
            <Step1GeneralData
              routeData={routeData}
              zones={zones}
              onSubmit={submitStep1}
              loading={loading}
            />
          )}

          {step === 2 && (
            <Step2StopsAndMap
              stops={stops}
              zoneClients={zoneClients}
              metrics={metrics}
              loading={loading}
              clientsLoading={clientsLoading}
              onAddStop={handleAddStop}
              onRemoveStop={handleRemoveStop}
              onMoveStop={handleMoveStop}
              onBack={() => setStep(1)}
              onNext={proceedToStep3}
            />
          )}

          {step === 3 && (
            <Step3AssignAdvisor
              routeData={routeData}
              stops={stops}
              metrics={metrics}
              advisors={advisors}
              loading={loading}
              onBack={() => setStep(2)}
              onSubmit={submitStep3}
            />
          )}
        </div>
      </div>
    </div>
  );
}
