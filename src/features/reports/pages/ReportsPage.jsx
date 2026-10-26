import { useEffect, useState } from "react";
import {
  Download,
  AlertCircle,
  Users,
  ClipboardList,
  FileText,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import { downloadReportCsv } from "../services/reportsService";
import { getCatalogs } from "@/features/clients/services/clientsService";
import styles from "./ReportsPage.module.css";

const REPORTS = [
  {
    type: "visits",
    title: "Reporte de Visitas",
    description: "Historial de visitas con cliente, asesor, estado y resultado comercial.",
    icon: ClipboardList,
  },
  {
    type: "clients",
    title: "Reporte de Clientes",
    description: "Directorio de clientes con zona, clasificación y datos de contacto.",
    icon: Users,
  },
  {
    type: "quotes",
    title: "Reporte de Cotizaciones",
    description: "Cotizaciones generadas con estado, totales y asesor responsable.",
    icon: FileText,
  },
  {
    type: "orders",
    title: "Reporte de Pedidos",
    description: "Pedidos confirmados con totales y estado de despacho.",
    icon: ShoppingCart,
  },
];

export default function ReportsPage() {
  const [zones, setZones] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    zoneId: "",
    separator: "comma",
  });
  const [status, setStatus] = useState({}); // { [type]: "loading" | "success" | errorMessage }

  useEffect(() => {
    getCatalogs()
      .then((data) => {
        if (Array.isArray(data?.zones)) setZones(data.zones);
      })
      .catch(() => setZones([]));
  }, []);

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const handleDownload = async (type) => {
    setStatus((prev) => ({ ...prev, [type]: "loading" }));
    try {
      await downloadReportCsv(type, filters);
      setStatus((prev) => ({ ...prev, [type]: "success" }));
      setTimeout(() => setStatus((prev) => ({ ...prev, [type]: null })), 3000);
    } catch (err) {
      setStatus((prev) => ({ ...prev, [type]: err.message || "Error al generar el reporte." }));
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Centro de Exportación de Reportes CSV</h1>
          <p className={styles.subtitle}>
            Descarga en un clic de la información comercial consolidada en formato CSV estándar
            compatible con Excel y BI.
          </p>
        </div>
      </header>

      <section className={styles.filtersCard} aria-label="Filtros de los reportes">
        <div className={styles.filtersGrid}>
          <div className={styles.field}>
            <label htmlFor="reportStartDate">Desde</label>
            <input
              id="reportStartDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilter("startDate", e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="reportEndDate">Hasta</label>
            <input
              id="reportEndDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilter("endDate", e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="reportZone">Zona</label>
            <select
              id="reportZone"
              value={filters.zoneId}
              onChange={(e) => setFilter("zoneId", e.target.value)}
            >
              <option value="">Todas las zonas</option>
              {zones.map((zone) => (
                <option key={zone.id} value={String(zone.id)}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="reportSeparator">Separador CSV</label>
            <select
              id="reportSeparator"
              value={filters.separator}
              onChange={(e) => setFilter("separator", e.target.value)}
            >
              <option value="comma">Coma (,)</option>
              <option value="semicolon">Punto y coma (;) — Excel ES-CO</option>
            </select>
          </div>
        </div>
      </section>

      <section className={styles.cardsGrid}>
        {REPORTS.map(({ type, title, description, icon: Icon }) => {
          const current = status[type];
          const isLoading = current === "loading";
          const isSuccess = current === "success";
          const isError = current && current !== "loading" && current !== "success";

          return (
            <article key={type} className={styles.card}>
              <div className={styles.cardIcon}>
                <Icon size={22} />
              </div>
              <h2 className={styles.cardTitle}>{title}</h2>
              <p className={styles.cardDescription}>{description}</p>

              {isError && (
                <div className={styles.cardError}>
                  <AlertCircle size={13} />
                  <span>{current}</span>
                </div>
              )}
              {isSuccess && (
                <div className={styles.cardSuccess}>
                  <CheckCircle2 size={13} />
                  <span>Descarga iniciada.</span>
                </div>
              )}

              <button
                type="button"
                className={styles.downloadBtn}
                onClick={() => handleDownload(type)}
                disabled={isLoading}
              >
                <Download size={15} />
                <span>{isLoading ? "Generando..." : "Descargar CSV"}</span>
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}
