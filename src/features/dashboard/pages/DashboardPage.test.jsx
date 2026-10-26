import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import DashboardPage from "./DashboardPage";
import useDashboardKpis from "../hooks/useDashboardKpis";
import { mondayOf, shiftWeek } from "../utils/dashboardFormat";

vi.mock("../hooks/useDashboardKpis");

// Respuesta real del backend con el seed demo (semana 2026-10-19, todos los territorios).
const kpis = {
  weekStart: "2026-10-19",
  weekEnd: "2026-10-25",
  territoryId: null,
  scheduledVisits: 18,
  completedVisits: 6,
  effectiveness: 33.3,
  quotedAmount: "2204000.00",
  closedOrders: 1,
  revenue: null,
};

const render = (state) => {
  useDashboardKpis.mockReturnValue({
    weekStart: "2026-10-19",
    territoryId: "",
    territories: [{ id: 1, name: "Barranquilla Norte" }],
    kpis: null,
    loading: false,
    error: null,
    ...state,
  });
  // Intl usa espacios no separables; se normalizan para comparar.
  return renderToStaticMarkup(<DashboardPage />).replace(/\s/g, " ");
};

describe("DashboardPage", () => {
  it("muestra las seis tarjetas con los datos del backend", () => {
    const html = render({ kpis });

    expect(html.match(/<article/g)).toHaveLength(6);
    expect(html).toContain("Visitas programadas");
    expect(html).toContain(">18<");
    expect(html).toContain("De 18 programadas");
    expect(html).toContain("33,3 %");
    expect(html).toContain("$ 2.204.000");
    expect(html).toContain("Pedidos cerrados");
    expect(html).toContain("No disponible");
  });

  it("muestra los filtros de semana y territorio", () => {
    const html = render({ kpis });

    expect(html).toContain('type="date"');
    expect(html).toContain('value="2026-10-19"');
    expect(html).toContain("Todos los territorios");
    expect(html).toContain("Barranquilla Norte");
  });

  it("muestra la carga y el error", () => {
    expect(render({ loading: true })).toContain("Cargando indicadores");

    const html = render({ error: { status: 401, message: "Tu sesión expiró." } });
    expect(html).toContain('role="alert"');
    expect(html).toContain("Ir a iniciar sesión");
    expect(html).not.toContain("<article");
  });

  it("muestra efectividad vacía cuando no hay visitas", () => {
    const html = render({ kpis: { ...kpis, scheduledVisits: 0, completedVisits: 0, effectiveness: null } });

    expect(html).toContain("Sin visitas programadas");
  });

  it("avisa al director que solo ve su territorio", () => {
    expect(render({ kpis: { ...kpis, territoryId: 1 } })).toContain("solo ves los indicadores de tu territorio");
  });
});

describe("dashboardFormat", () => {
  it("calcula el lunes y cambia de semana", () => {
    expect(mondayOf(new Date(2026, 9, 25))).toBe("2026-10-19");
    expect(mondayOf(new Date(2026, 9, 26))).toBe("2026-10-26");
    expect(shiftWeek("2026-12-28", 1)).toBe("2027-01-04");
  });
});
