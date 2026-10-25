# Comercial 360 – Frontend

React + Vite. Arquitectura **por features** con **CSS Modules**.

## Uso
```bash
npm install
cp .env.example .env   # opcional: define VITE_API_URL
npm run dev            # http://localhost:5173
npm run build
```

## Arquitectura
```
src/
├── main.jsx                      # punto de entrada
├── app/App.jsx                   # composición de la app (aquí irá el router)
├── config/env.js                 # variables de entorno
├── styles/                       # tokens (colores, tipografía) y estilos globales
├── shared/components/            # UI reutilizable, sin lógica de negocio
│   ├── Button  TextField  Checkbox  Divider  Logo  Footer
│   └── icons/
└── features/
    └── auth/                     # todo lo de autenticación vive aquí
        ├── pages/LoginPage       # layout de la pantalla
        ├── components/           # BrandPanel, LoginCard, LoginForm, MicrosoftButton, BackgroundDecoration
        ├── hooks/useLoginForm    # estado + validación del formulario
        ├── services/authService  # llamadas a la API
        └── index.js              # API pública del feature
```

Reglas: `shared` no importa de `features`; cada feature expone solo lo que sale en su `index.js`;
la lógica va en `hooks/` y las llamadas HTTP en `services/`. Para agregar un módulo
(rutas, clientes, etc.) crea `features/<nombre>/` con la misma estructura.

Imports con alias `@` → `src/`.


## Dashboard de KPI (HU-35)
`features/dashboard/` en `#/dashboard`: seis tarjetas (visitas programadas y realizadas, efectividad,
valor cotizado, pedidos cerrados y facturación) filtradas por semana y territorio, desde
`GET /dashboard/kpis` del backend. Requiere sesión de admin o director regional.

```bash
# backend en http://localhost:3015; Vite reenvía /api a esa URL (API_PROXY_TARGET para cambiarla)
VITE_API_URL=/api npm run dev   # abre http://localhost:5173/#/dashboard
npm test
```

## Pendiente
- Conectar `authService.login` con tu API (`VITE_API_URL`).
- Integrar MSAL en `loginWithMicrosoft`.
- Agregar React Router cuando existan más pantallas.
