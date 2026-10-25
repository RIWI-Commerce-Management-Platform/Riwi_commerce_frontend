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
│   ├── layout/                   # Layout responsive unificado (AppLayout, Sidebar con micro-interacciones, Header)
│   └── services/
│       └── apiClient.js          # Cliente HTTP reutilizable con credentials: "include" y manejo de errores
└── features/
    ├── auth/                     # Módulo de Autenticación (HU-05, HU-08)
    │   ├── context/AuthContext   # Estado global de sesión, roles (ADMIN, DIRECTOR_REGIONAL, ASESOR) y verificación de GET /auth/me
    │   ├── pages/LoginPage       # Vista de login con diseño responsivo split-panel
    │   └── services/authService  # Integración con POST /auth/login y GET /auth/me
    ├── dashboard/                # Módulo de Dashboard Comercial (HU-35)
    │   ├── pages/DashboardPage   # Tarjetas de KPIs y filtros por semana/territorio
    │   └── services/             # Integración con GET /dashboard/kpis
    ├── clients/                  # Directorio y Gestión de Clientes (HU-11, HU-12, HU-13)
    │   ├── pages/ClientsPage     # Vista principal de clientes con búsqueda y filtros
    │   ├── components/
    │   │   ├── ClientsTable      # Tabla con paginación, estados y botón de mapa interactivo
    │   │   ├── ClientFilters     # Barra de filtros (NIT, Zona, Tipo, Potencial, Estado)
    │   │   ├── ClientFormModal   # Modal de creación/edición con soporte GPS manual y automático
    │   │   ├── ClientContactsModal # Gestión de contactos y contacto principal (HU-13)
    │   │   └── ClientMapModal    # Visualizador de mapa interactivo con Leaflet y OpenStreetMap
    │   └── services/             # Integración con endpoints /clients y /catalogs
    └── routes/                   # Planeación de Rutas Comerciales (Épica E3: HU-17 a HU-22)
        ├── pages/RoutesPage      # Vista de supervisión de rutas y botón de nuevo asistente
        ├── components/
        │   ├── RoutesTable       # Tabla de rutas con estados (DRAFT, ASSIGNED), métricas y acciones
        │   ├── RouteFilters      # Filtros por zona, estado, día de semana y frecuencia
        │   ├── RouteWizard/      # Asistente guiado de 3 pasos (Wizard):
        │   │   ├── Step1GeneralData   # Paso 1: Datos logísticos, territorio, fechas y horario
        │   │   ├── Step2StopsAndMap   # Paso 2: Selección de paradas, reordenamiento, distancias Haversine y mapa con polilíneas
        │   │   └── Step3AssignAdvisor # Paso 3: Asignación a asesor y programación automática de visitas
        │   └── RouteDetailModal  # Vista de inspección con mapa interactivo y secuencia de visitas
        ├── hooks/
        │   ├── useRoutes         # Paginación, consulta y cambio de estado
        │   └── useRouteWizard    # Máquina de estados del asistente y cálculo de métricas
        └── services/             # Integración con endpoints REST /routes
```

---

## 🗺️ Planeación de Rutas con Mapa Interactivo (Wizard)

- **Paso 1 (HU-17):** Creación del borrador con nombre, zona territorial, día de atención, frecuencia de repetición y horario de jornada comercial.
- **Paso 2 (HU-18, HU-19, HU-22):** Selección de clientes de la zona, definición de horarios sugeridos de llegada y minutos de atención. Permite mover arriba/abajo las paradas. El sistema recalcula la **distancia total en km** (algoritmo geodésico Haversine con factor urbano 1.3x) y el **tiempo estimado** en minutos, renderizando en tiempo real el mapa con pines numerados (`1`, `2`, `3`...) y polilíneas conectadas.
- **Paso 3 (HU-20):** Asignación al asesor comercial y confirmación final, lo que inserta automáticamente las visitas en estado `Pendiente` en la agenda operativa.

---

## 🔐 Autenticación y Control de Roles

La aplicación utiliza **Better Auth** con cookies HttpOnly gestionadas automáticamente:
- **`ADMIN`**: Acceso global al Dashboard, Asesores, Clientes, Planeación de Rutas, Cotizaciones, Catálogos y Reportes.
- **`DIRECTOR_REGIONAL`**: Acceso al Dashboard de su zona, Clientes, Planeación de Rutas (Wizard), Visitas de su territorio y Reportes.
- **`ASESOR`**: Acceso operativo a su Agenda de Visitas diaria, Clientes asignados, Cotizaciones/Pedidos y Dashboard.

---

## 📱 Diseño Responsivo Móvil

- **Pantalla de Login:** En pantallas móviles (`<= 960px`), el panel ilustrativo lateral se oculta de forma fluida, centrando la tarjeta de acceso.
- **Sidebar & Layout:** En pantallas grandes se mantiene fija a la izquierda con animaciones táctiles (*hover zoom*). En dispositivos móviles (`<= 960px`), se transforma en un **menú lateral desplegable (Drawer)** accesible desde el botón de hamburguesa en la cabecera.
