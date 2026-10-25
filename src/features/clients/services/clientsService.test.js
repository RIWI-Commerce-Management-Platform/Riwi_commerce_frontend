import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/config/env", () => ({ API_URL: "/api" }));
const clientsService = await import("./clientsService");

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

describe("clientsService", () => {
  it("consulta listado de clientes con filtros y parámetros de paginación", async () => {
    const mockData = {
      items: [{ id: 1, commercialName: "Tienda San Pedro" }],
      total: 1,
      page: 1,
      limit: 10,
    };
    const fetchMock = respond(200, mockData);
    vi.stubGlobal("fetch", fetchMock);

    const result = await clientsService.getClients({
      search: "San Pedro",
      zoneId: "1",
      page: 1,
      limit: 10,
    });

    expect(result).toEqual(mockData);
    expect(fetchMock.mock.calls[0][0]).toContain("/api/clients?page=1&limit=10&search=San+Pedro&zoneId=1");
  });

  it("crea un nuevo cliente mediante POST /clients", async () => {
    const payload = {
      nit: "900999888-1",
      businessName: "Comercio Ejemplo S.A.S.",
      commercialName: "Comercio Ejemplo",
      address: "Calle 10 # 20-30",
      department: "Atlántico",
      municipality: "Barranquilla",
      neighborhood: "Centro",
      phone: "+573001234567",
      email: "info@ejemplo.com",
      zoneId: 1,
      clientTypeId: 1,
      potentialId: 1,
      clientStatusId: 1,
      visitFrequencyDays: 15,
    };

    const fetchMock = respond(201, { id: 10, ...payload });
    vi.stubGlobal("fetch", fetchMock);

    const result = await clientsService.createClient(payload);
    expect(result.id).toBe(10);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/clients",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      })
    );
  });

  it("establece un contacto como principal mediante PATCH /clients/:id/contacts/:id/primary", async () => {
    const fetchMock = respond(200, { success: true });
    vi.stubGlobal("fetch", fetchMock);

    const result = await clientsService.setPrimaryContact(5, 12);
    expect(result).toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/clients/5/contacts/12/primary",
      expect.objectContaining({
        method: "PATCH",
        credentials: "include",
      })
    );
  });

  it("obtiene los catálogos y los almacena en caché en memoria", async () => {
    const catalogData = {
      zones: [{ id: 1, name: "Barranquilla Norte" }],
      clientTypes: [{ id: 1, name: "Mayorista" }],
      potentials: [{ id: 1, name: "Alto" }],
    };
    const fetchMock = respond(200, catalogData);
    vi.stubGlobal("fetch", fetchMock);

    const data1 = await clientsService.getCatalogs(true); // forceRefresh
    expect(data1.zones).toHaveLength(1);

    // Segunda llamada usa la caché
    const data2 = await clientsService.getCatalogs();
    expect(data2).toBe(data1);
  });
});
