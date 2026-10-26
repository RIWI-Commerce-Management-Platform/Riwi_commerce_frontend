import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/config/env", () => ({ API_URL: "/api" }));
const routesService = await import("./routesService");

const respond = (status, body = {}) =>
  vi.fn().mockResolvedValue({
    ok: status < 400,
    status,
    headers: { get: () => "application/json" },
    json: () => Promise.resolve(body),
  });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("routesService", () => {
  it("consulta listado de rutas con filtros y paginación", async () => {
    const mockData = {
      data: [{ id: 1, name: "Ruta Barranquilla Norte", status: "DRAFT" }],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };
    const fetchMock = respond(200, mockData);
    vi.stubGlobal("fetch", fetchMock);

    const result = await routesService.getRoutes({
      search: "Norte",
      zoneId: "1",
      status: "DRAFT",
      page: 1,
      limit: 10,
    });

    expect(result).toEqual(mockData);
    expect(fetchMock.mock.calls[0][0]).toContain("/api/routes?page=1&limit=10&search=Norte&zoneId=1&status=DRAFT");
  });

  it("crea un borrador de ruta mediante POST /routes", async () => {
    const payload = {
      name: "Ruta Semanal Mayoristas",
      zoneId: 1,
      dayOfWeek: "MONDAY",
      frequency: "WEEKLY",
      startDate: "2026-10-26",
    };
    const fetchMock = respond(201, { id: 10, ...payload, status: "DRAFT" });
    vi.stubGlobal("fetch", fetchMock);

    const result = await routesService.createRouteDraft(payload);
    expect(result.id).toBe(10);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/routes",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      })
    );
  });

  it("agrega una parada a la ruta y recalcula métricas", async () => {
    const stopData = { clientId: 5, suggestedTime: "09:00:00", estimatedDurationMinutes: 30 };
    const fetchMock = respond(201, { id: 10, stopsCount: 1, totalDistanceKm: 3.5 });
    vi.stubGlobal("fetch", fetchMock);

    const result = await routesService.addRouteStop(10, stopData);
    expect(result.stopsCount).toBe(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/routes/10/stops",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      })
    );
  });

  it("reordena paradas de la ruta mediante PATCH /routes/:id/stops/reorder", async () => {
    const fetchMock = respond(200, { id: 10, stopsCount: 3 });
    vi.stubGlobal("fetch", fetchMock);

    const result = await routesService.reorderRouteStops(10, [12, 5, 8]);
    expect(result.stopsCount).toBe(3);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/routes/10/stops/reorder",
      expect.objectContaining({
        method: "PATCH",
        credentials: "include",
      })
    );
  });

  it("asigna un asesor y programa visitas mediante POST /routes/:id/assign", async () => {
    const fetchMock = respond(200, { id: 10, advisorId: 2, status: "ASSIGNED" });
    vi.stubGlobal("fetch", fetchMock);

    const result = await routesService.assignRouteAdvisor(10, 2);
    expect(result.status).toBe("ASSIGNED");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/routes/10/assign",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      })
    );
  });
});
