# Comercial 360 — Frontend

Plataforma Web de Gestión Comercial construida con **React 18**, **Vite** y **CSS Modules**, siguiendo una arquitectura modular por características (**Feature-Driven Architecture**) y diseño responsivo para escritorio, tablets y dispositivos móviles.

---

## 📋 Requisitos Previos

- **Node.js**: Versión 20 o superior.
- **Backend Comercial 360**: Corriendo en `http://localhost:3015` (vía `docker compose up` o `npm run start:dev`).

---

## 🚀 Inicio Rápido e Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar el archivo de entorno:**
   Copia el archivo de ejemplo a `.env`:
   ```bash
   cp .env.example .env
   ```
   *Nota: Por defecto, `.env` contiene `VITE_API_URL=/api`. Esto activa el proxy interno de Vite que redirige las peticiones hacia el backend en `http://localhost:3015` sin problemas de CORS ni cookies de sesión.*

3. **Iniciar el servidor de desarrollo:**
   ```powershell
   npm run dev
   ```
   La aplicación abrirá automáticamente en `http://localhost:5173/login`.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```

5. **Ejecutar pruebas unitarias:**
   ```bash
   npm test
   ```

---

## 🏛️ Estructura del Proyecto

```
src/
├── app/
│   └── App.jsx                   # Router principal con BrowserRouter y AuthProvider
├── config/
│   └── env.js                    # Sanitización y exportación de VITE_API_URL
├── styles/
│   ├── tokens.css                # Variables de diseño (colores navy, orange, tipografía)
│   └── global.css                # Reseteo y estilos base globales
├── shared/
│   ├── components/               # Componentes atómicos de UI (Button, TextField, Checkbox, etc.)
│   ├── layout/                   # Layout responsive unificado (AppLayout, Sidebar con drawer móvil, Header)
│   └── services/
│       └── apiClient.js          # Cliente HTTP reutilizable con credentials: "include" y manejo de errores
└── features/
    ├── auth/                     # Módulo de Autenticación (HU-05, HU-08)
    │   ├── context/AuthContext   # Estado global de sesión, roles (ADMIN, DIRECTOR_REGIONAL, ASESOR) y verificación de GET /auth/me
    │   ├── pages/LoginPage       # Vista de login con diseño responsivo split-panel
    │   ├── components/           # BrandPanel, LoginCard, LoginForm, MicrosoftButton
    │   ├── hooks/useLoginForm    # Validación y llamada al login
    │   └── services/authService  # Integración con POST /auth/login y GET /auth/me
    └── dashboard/                # Módulo de Dashboard Comercial (HU-35)
        ├── pages/DashboardPage   # Tarjetas de KPIs y filtros por semana/territorio
        ├── components/           # DashboardFilters, KpiCard
        └── services/             # Integración con GET /dashboard/kpis
```

---

## 🔐 Autenticación y Control de Roles

La aplicación utiliza **Better Auth** con cookies HttpOnly gestionadas automáticamente:
- **`ADMIN`**: Acceso global al Dashboard, Asesores, Clientes, Rutas, Cotizaciones, Catálogos y Reportes.
- **`DIRECTOR_REGIONAL`**: Acceso al Dashboard de su zona, Clientes, Planeación de Rutas (Wizard), Visitas de su territorio y Reportes.
- **`ASESOR`**: Acceso operativo a su Agenda de Visitas diaria, Clientes asignados, Cotizaciones/Pedidos y Dashboard.

---

## 📱 Diseño Responsivo Móvil

- **Pantalla de Login:** En pantallas móviles (`<= 960px`), el panel ilustrativo lateral se oculta de forma fluida, centrando la tarjeta de acceso para que el usuario pueda ingresar de inmediato sin desplazamientos innecesarios.
- **Sidebar & Layout:** En pantallas grandes se mantiene fija a la izquierda. En dispositivos móviles (`<= 960px`), se transforma en un **menú lateral desplegable (Drawer)** accesible desde el botón de hamburguesa en la cabecera.
