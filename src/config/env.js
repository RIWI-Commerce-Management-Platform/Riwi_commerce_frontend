// En desarrollo con Vite, el proxy redirige /api a http://localhost:3015 sin problemas de CORS ni cookies
const rawApiUrl = (import.meta.env.VITE_API_URL || "/api").trim();
export const API_URL = rawApiUrl.split(/\s+/)[0];
