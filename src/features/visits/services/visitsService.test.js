import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/config/env", () => ({ API_URL: "/api" }));
const visitsService = await import("./visitsService");

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

describe("visitsService", () => {
  it("consulta agenda de visitas con filtros de periodo y fecha", async () => {
    const mockVisits = [
      { id: 1, clientId: 2, status: "PENDING", scheduledAt: "2026-10-27T09:00:00Z" },
    ];
    const fetchMock = respond(200, mockVisits);
    vi.stubGlobal("fetch", fetchMock);

    const result = await visitsService.getVisitAgenda({ period: "day", date: "2026-10-27" });

    expect(result).toEqual(mockVisits);
    expect(fetchMock.mock.calls[0][0]).toContain("/api/visits/agenda?period=day&date=2026-10-27");
  });

  it("inicia la visita mediante PATCH /visits/:id/start", async () => {
    const fetchMock = respond(200, { id: 1, status: "IN_PROGRESS" });
    vi.stubGlobal("fetch", fetchMock);

    const result = await visitsService.startVisit(1);
    expect(result.status).toBe("IN_PROGRESS");
    expect(fetchMock.mock.calls[0][0]).toContain("/api/visits/1/start");
  });

  it("registra el resultado comercial mediante PATCH /visits/:id/result", async () => {
    const payload = {
      endTime: "11:30:00",
      observations: "Cliente interesado en compras recurrentes",
      results: [{ id: 1, observation: "Venta exitosa" }],
    };
    const fetchMock = respond(200, { id: 1, status: "VISITED", ...payload });
    vi.stubGlobal("fetch", fetchMock);

    const result = await visitsService.registerVisitResult(1, payload);
    expect(result.status).toBe("VISITED");
    expect(fetchMock.mock.calls[0][0]).toContain("/api/visits/1/result");
  });

  it("registra la gestión comercial (cotización/pedido)", async () => {
    const payload = { quoteGenerated: true, orderGenerated: false };
    const fetchMock = respond(200, { id: 1, ...payload });
    vi.stubGlobal("fetch", fetchMock);

    const result = await visitsService.registerCommercialOutcome(1, payload);
    expect(result.quoteGenerated).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toContain("/api/visits/1/commercial-outcome");
  });

  it("crea un compromiso o seguimiento con POST /visits/:id/follow-ups", async () => {
    const payload = {
      dueDate: "2026-10-28T10:00:00Z",
      activity: "Enviar propuesta formal",
      responsibleId: 2,
    };
    const fetchMock = respond(201, { id: 101, ...payload, status: "PENDING" });
    vi.stubGlobal("fetch", fetchMock);

    const result = await visitsService.createFollowUp(1, payload);
    expect(result.id).toBe(101);
    expect(fetchMock.mock.calls[0][0]).toContain("/api/visits/1/follow-ups");
  });

  it("consulta la meta semanal mediante GET /indicators/weekly-goal", async () => {
    const mockGoal = { goal: 24, completed: 19, progressPercentage: 78 };
    const fetchMock = respond(200, mockGoal);
    vi.stubGlobal("fetch", fetchMock);

    const result = await visitsService.getWeeklyGoal("2026-10-27");
    expect(result.progressPercentage).toBe(78);
    expect(fetchMock.mock.calls[0][0]).toContain("/api/indicators/weekly-goal?date=2026-10-27");
  });
});
