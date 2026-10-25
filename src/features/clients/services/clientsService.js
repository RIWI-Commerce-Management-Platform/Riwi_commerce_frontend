import { api } from "@/shared/services/apiClient";

let catalogsCache = null;

/**
 * Obtener listado de clientes paginado con filtros dinámicos (HU-12).
 */
export async function getClients({
  search = "",
  zoneId = "",
  clientTypeId = "",
  potentialId = "",
  isActive = "",
  page = 1,
  limit = 10,
} = {}) {
  const params = { page, limit };
  if (search?.trim()) params.search = search.trim();
  if (zoneId) params.zoneId = zoneId;
  if (clientTypeId) params.clientTypeId = clientTypeId;
  if (potentialId) params.potentialId = potentialId;
  if (isActive !== "") params.isActive = isActive;

  return api.get("/clients", { params });
}

/**
 * Obtener detalle de un cliente por su ID (HU-12).
 */
export async function getClientById(id) {
  return api.get(`/clients/${id}`);
}

/**
 * Registrar un nuevo cliente con geocodificación automática (HU-11).
 */
export async function createClient(clientData) {
  return api.post("/clients", clientData);
}

/**
 * Actualizar datos de un cliente existente (HU-11).
 */
export async function updateClient(id, clientData) {
  return api.patch(`/clients/${id}`, clientData);
}

/**
 * Cambiar estado de activación/inactivación lógica (HU-11).
 */
export async function toggleClientStatus(id, isActive) {
  return api.patch(`/clients/${id}/status`, { isActive });
}

/**
 * Obtener los contactos de un cliente (HU-13).
 */
export async function getClientContacts(clientId) {
  return api.get(`/clients/${clientId}/contacts`);
}

/**
 * Crear un nuevo contacto para un cliente (HU-13).
 */
export async function createClientContact(clientId, contactData) {
  return api.post(`/clients/${clientId}/contacts`, contactData);
}

/**
 * Actualizar información de un contacto (HU-13).
 */
export async function updateClientContact(clientId, contactId, contactData) {
  return api.patch(`/clients/${clientId}/contacts/${contactId}`, contactData);
}

/**
 * Establecer un contacto como principal (HU-13).
 * El backend desmarca automáticamente cualquier contacto principal previo.
 */
export async function setPrimaryContact(clientId, contactId) {
  return api.patch(`/clients/${clientId}/contacts/${contactId}/primary`);
}

/**
 * Eliminar (lógicamente) un contacto (HU-13).
 */
export async function deleteClientContact(clientId, contactId) {
  return api.delete(`/clients/${clientId}/contacts/${contactId}`);
}

/**
 * Obtener catálogos del sistema (zonas, tipos, potenciales, estados) para selects.
 */
export async function getCatalogs(forceRefresh = false) {
  if (catalogsCache && !forceRefresh) {
    return catalogsCache;
  }
  const data = await api.get("/catalogs");
  catalogsCache = data;
  return data;
}
