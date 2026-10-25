import Logo from "@/shared/components/Logo/Logo";
import DashboardFilters from "../components/DashboardFilters/DashboardFilters";
import KpiCard from "../components/KpiCard/KpiCard";
import useDashboardKpis from "../hooks/useDashboardKpis";
import { formatMoney, formatPercent } from "../utils/dashboardFormat";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  const { weekStart, setWeekStart, territoryId, setTerritoryId, territories, kpis, loading, error } = useDashboardKpis();

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Logo />
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Dashboard comercial</h1>
        <p className={styles.subtitle}>Indicadores de la semana (lunes a domingo, hora de Colombia).</p>

        <DashboardFilters
          weekStart={weekStart}
          onWeekChange={setWeekStart}
          territories={territories}
          territoryId={territoryId}
          onTerritoryChange={setTerritoryId}
        />

        {kpis?.territoryId != null && String(kpis.territoryId) !== territoryId && (
          <p className={styles.status}>Como director regional solo ves los indicadores de tu territorio.</p>
        )}

        {loading && <p className={styles.status} role="status">Cargando indicadores…</p>}

        {error && (
          <p className={styles.error} role="alert">
            {error.message} {error.status === 401 && <a href="/">Ir a iniciar sesión</a>}
          </p>
        )}

        {kpis && !error && (
          <section className={styles.grid} aria-label="Indicadores de la semana">
            <KpiCard label="Visitas programadas" value={kpis.scheduledVisits} />
            <KpiCard label="Visitas realizadas" value={kpis.completedVisits} hint={`De ${kpis.scheduledVisits} programadas`} />
            <KpiCard
              label="Efectividad"
              value={formatPercent(kpis.effectiveness)}
              hint={kpis.effectiveness == null ? "Sin visitas programadas" : "Realizadas / programadas"}
            />
            <KpiCard label="Valor cotizado" value={formatMoney(kpis.quotedAmount)} hint="Cotizaciones creadas en la semana" />
            <KpiCard label="Pedidos cerrados" value={kpis.closedOrders} hint="Pedidos creados, sin anulados" />
            <KpiCard
              label="Facturación"
              value={kpis.revenue == null ? "No disponible" : formatMoney(kpis.revenue)}
              hint={kpis.revenue == null ? "Aún no existe una fuente de facturación" : null}
            />
          </section>
        )}
      </main>
    </div>
  );
}
