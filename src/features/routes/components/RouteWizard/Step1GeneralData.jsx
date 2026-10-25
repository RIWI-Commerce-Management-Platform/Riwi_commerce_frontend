import { useState, useEffect } from "react";
import styles from "./RouteWizardModal.module.css";

const DAYS = [
  { value: "MONDAY", label: "Lunes" },
  { value: "TUESDAY", label: "Martes" },
  { value: "WEDNESDAY", label: "Miércoles" },
  { value: "THURSDAY", label: "Jueves" },
  { value: "FRIDAY", label: "Viernes" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
];

const FREQUENCIES = [
  { value: "WEEKLY", label: "Semanal" },
  { value: "BIWEEKLY", label: "Quincenal" },
  { value: "MONTHLY", label: "Mensual" },
];

export default function Step1GeneralData({
  routeData,
  zones = [],
  onSubmit,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    zoneId: "",
    dayOfWeek: "MONDAY",
    frequency: "WEEKLY",
    startTime: "08:00:00",
    endTime: "17:00:00",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  useEffect(() => {
    if (routeData) {
      setFormData({
        name: routeData.name || "",
        description: routeData.description || "",
        zoneId: routeData.zoneId ? String(routeData.zoneId) : zones[0]?.id ? String(zones[0].id) : "",
        dayOfWeek: routeData.dayOfWeek || "MONDAY",
        frequency: routeData.frequency || "WEEKLY",
        startTime: routeData.startTime || "08:00:00",
        endTime: routeData.endTime || "17:00:00",
        startDate: routeData.startDate || new Date().toISOString().split("T")[0],
        endDate: routeData.endDate || "",
      });
    } else if (zones.length > 0) {
      setFormData((prev) => ({
        ...prev,
        zoneId: prev.zoneId || String(zones[0].id),
      }));
    }
  }, [routeData, zones]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      zoneId: Number(formData.zoneId),
      dayOfWeek: formData.dayOfWeek,
      frequency: formData.frequency,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      startDate: formData.startDate,
      endDate: formData.endDate ? formData.endDate : undefined,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.stepForm}>
      <div className={styles.sectionNotice}>
        <p>
          <strong>Paso 1:</strong> Define los parámetros logísticos y territoriales de la ruta
          comercial. Al guardar, quedará registrada en estado <strong>Borrador</strong> para
          comenzar a seleccionar sus paradas.
        </p>
      </div>

      <div className={styles.formGrid}>
        {/* Nombre de la Ruta */}
        <div className={`${styles.field} ${styles.colSpan2}`}>
          <label htmlFor="routeName">Nombre de la Ruta Comercial *</label>
          <input
            id="routeName"
            name="name"
            type="text"
            required
            maxLength={150}
            placeholder="Ej: Ruta Norte - Clientes Mayoristas Semanal"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        {/* Zona Territorial */}
        <div className={styles.field}>
          <label htmlFor="routeZoneId">Zona / Territorio *</label>
          <select
            id="routeZoneId"
            name="zoneId"
            required
            value={formData.zoneId}
            onChange={handleChange}
          >
            <option value="">Selecciona una zona</option>
            {zones.map((z) => (
              <option key={z.id} value={String(z.id)}>
                {z.name}
              </option>
            ))}
          </select>
        </div>

        {/* Día de Atención */}
        <div className={styles.field}>
          <label htmlFor="routeDayOfWeek">Día de Atención en Semana *</label>
          <select
            id="routeDayOfWeek"
            name="dayOfWeek"
            required
            value={formData.dayOfWeek}
            onChange={handleChange}
          >
            {DAYS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Frecuencia */}
        <div className={styles.field}>
          <label htmlFor="routeFrequency">Frecuencia de Repetición *</label>
          <select
            id="routeFrequency"
            name="frequency"
            required
            value={formData.frequency}
            onChange={handleChange}
          >
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha de Inicio */}
        <div className={styles.field}>
          <label htmlFor="routeStartDate">Fecha de Inicio de Operación *</label>
          <input
            id="routeStartDate"
            name="startDate"
            type="date"
            required
            value={formData.startDate}
            onChange={handleChange}
          />
        </div>

        {/* Horario de Jornada */}
        <div className={styles.field}>
          <label htmlFor="routeStartTime">Hora Estimada de Inicio</label>
          <input
            id="routeStartTime"
            name="startTime"
            type="time"
            value={formData.startTime.slice(0, 5)}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                startTime: e.target.value ? `${e.target.value}:00` : "",
              }))
            }
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="routeEndTime">Hora Estimada de Finalización</label>
          <input
            id="routeEndTime"
            name="endTime"
            type="time"
            value={formData.endTime.slice(0, 5)}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                endTime: e.target.value ? `${e.target.value}:00` : "",
              }))
            }
          />
        </div>

        {/* Fecha Fin Opcional */}
        <div className={styles.field}>
          <label htmlFor="routeEndDate">Fecha Fin (Opcional)</label>
          <input
            id="routeEndDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
          />
        </div>

        {/* Descripción */}
        <div className={`${styles.field} ${styles.colSpan2}`}>
          <label htmlFor="routeDesc">Objetivo Comercial / Observaciones</label>
          <textarea
            id="routeDesc"
            name="description"
            rows={2}
            maxLength={500}
            placeholder="Ej: Cobertura prioritaria de tiendas y supermercados en el sector norte de Barranquilla."
            value={formData.description}
            onChange={handleChange}
          />
        </div>
      </div>

      <footer className={styles.stepFooter}>
        <div />
        <button type="submit" className={styles.primaryBtn} disabled={loading}>
          {loading ? "Guardando borrador..." : "Continuar a Paradas y Mapa →"}
        </button>
      </footer>
    </form>
  );
}
