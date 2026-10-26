import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/config/env", () => ({ API_URL: "/api" }));
const { getWeeklyKpis } = await import("./dashboardService");

const respond = (status, body = {}) =>
  vi.fn().mockResolvedValue({ ok: status < 400, status, json: () => Promise.resolve(body) });

afterEach(() => vi.unstubAllGlobals());

describe("dashboardService", () => {
  it("llama al endpoint real con los filtros y la cookie de sesión", async () => {
    const fetchMock = respond(200, { scheduledVisits: 6 });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getWeeklyKpis({ weekStart: "2026-10-19", territoryId: "1" })).resolves.toEqual({ scheduledVisits: 6 });
    expect(fetchMock).toHaveBeenCalledWith("/api/dashboard/kpis?weekStart=2026-10-19&territoryId=1", { credentials: "include" });
  });

  it("omite el territorio cuando son todos", async () => {
    const fetchMock = respond(200);
    vi.stubGlobal("fetch", fetchMock);

    await getWeeklyKpis({ weekStart: "2026-10-19", territoryId: "" });
    expect(fetchMock.mock.calls[0][0]).toBe("/api/dashboard/kpis?weekStart=2026-10-19");
  });

  it.each([
    [401, "Tu sesión no es válida o expiró. Inicia sesión de nuevo."],
    [403, "No tienes permiso para ver el dashboard."],
    [500, "Ocurrió un error en el servidor. Intenta de nuevo."],
  ])("convierte HTTP %i en un mensaje para el usuario", async (status, message) => {
    vi.stubGlobal("fetch", respond(status));

    await expect(getWeeklyKpis({ weekStart: "2026-10-19" })).rejects.toMatchObject({ status, message });
  });

  it("informa si el servidor no responde", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(getWeeklyKpis({ weekStart: "2026-10-19" })).rejects.toThrow("No se pudo conectar con el servidor.");
  });
});
