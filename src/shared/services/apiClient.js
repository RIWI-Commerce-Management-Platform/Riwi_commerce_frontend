import { API_URL } from "@/config/env";

export class ApiError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const DEFAULT_MESSAGES = {
  400: "Los filtros seleccionados no son válidos.",
  401: "Tu sesión no es válida o expiró. Inicia sesión de nuevo.",
  403: "No tienes permiso para ver el dashboard.",
  404: "El recurso solicitado no fue encontrado.",
  409: "Ya existe un registro con estos datos.",
  500: "Ocurrió un error en el servidor. Intenta de nuevo.",
};

/**
 * Cliente HTTP reutilizable con soporte para cookies de sesión (Better Auth),
 * transformación de JSON y manejo uniforme de errores.
 */
export async function apiFetch(endpoint, options = {}) {
  const { params, headers, body, method, ...customConfig } = options;

  let url = endpoint.startsWith("http")
    ? endpoint
    : `${API_URL.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const isFormData = body instanceof FormData;
  const config = {
    credentials: "include", // Envía y recibe cookies HttpOnly automáticamente
    ...customConfig,
  };

  // Solo incluir method si no es GET (fetch por defecto es GET)
  if (method && method.toUpperCase() !== "GET") {
    config.method = method.toUpperCase();
  }

  // Solo agregar headers si existen o si hay body JSON
  if (headers || (!isFormData && body)) {
    config.headers = {
      ...(!isFormData && body ? { "Content-Type": "application/json" } : {}),
      ...(headers || {}),
    };
  }

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, config);
  } catch {
    throw new ApiError(0, "No se pudo conectar con el servidor.");
  }

  // Manejo de respuestas vacías (204 No Content)
  if (res?.status === 204) {
    return null;
  }

  const contentType = res?.headers?.get ? res.headers.get("content-type") || "" : "";
  let data = null;
  if (contentType.includes("application/json")) {
    data = await res.json().catch(() => null);
  } else if (res?.json) {
    data = await res.json().catch(() => null);
  } else if (contentType.includes("text/csv") || contentType.includes("application/octet-stream")) {
    data = await res.blob();
  }

  if (!res?.ok) {
    const errorMessage =
      data?.message ||
      (Array.isArray(data?.message) ? data.message.join(", ") : null) ||
      DEFAULT_MESSAGES[res?.status] ||
      "Ocurrió un error en el servidor. Intenta de nuevo.";

    throw new ApiError(res?.status || 500, errorMessage, data);
  }

  return data;
}

export const api = {
  get: (endpoint, options) => apiFetch(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options) => apiFetch(endpoint, { method: "POST", body, ...options }),
  patch: (endpoint, body, options) => apiFetch(endpoint, { method: "PATCH", body, ...options }),
  put: (endpoint, body, options) => apiFetch(endpoint, { method: "PUT", body, ...options }),
  delete: (endpoint, options) => apiFetch(endpoint, { method: "DELETE", ...options }),
};
