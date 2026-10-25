// En desarrollo con Vite, el proxy redirige /api a http://localhost:3015 sin problemas de CORS ni cookies
export const API_URL = import.meta.env.VITE_API_URL || "/api";
