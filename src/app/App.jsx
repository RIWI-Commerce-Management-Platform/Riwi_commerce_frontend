import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, LoginPage, useAuth, ROLES } from "@/features/auth";
import { DashboardPage } from "@/features/dashboard";
import { ClientsPage } from "@/features/clients";
import { RoutesPage, AssignedRoutesPage } from "@/features/routes";
import AppLayout from "@/shared/layout/AppLayout";
import ProtectedRoute from "@/shared/components/ProtectedRoute/ProtectedRoute";
import PlaceholderPage from "@/shared/components/PlaceholderPage/PlaceholderPage";

// Redirecciona usuarios autenticados fuera del login directamente al Dashboard
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta Pública: Login */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />

          {/* Rutas Privadas dentro del Layout Principal con Sidebar */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard / KPIs */}
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Módulo de Clientes (HU-11 a HU-13) */}
            <Route path="clientes" element={<ClientsPage />} />

            {/* Planeación de Rutas Comerciales (HU-17 a HU-22) */}
            <Route
              path="rutas"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DIRECTOR_REGIONAL, ROLES.ASESOR]}>
                  <RoutesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="rutas/asignadas"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DIRECTOR_REGIONAL, ROLES.ASESOR]}>
                  <AssignedRoutesPage />
                </ProtectedRoute>
              }
            />

            {/* Agenda y Registro de Visitas */}
            <Route
              path="visitas"
              element={
                <PlaceholderPage
                  title="Agenda y Registro de Visitas"
                  description="Agenda operativa diaria y semanal para asesores comerciales, inicio de visita en terreno, registro de resultado tipificado, reprogramación y compromisos."
                  moduleCode="Épica E4 (HU-23 a HU-28)"
                  targetEndpoints={[
                    "GET /visits/agenda (Agenda diaria del asesor)",
                    "POST /visits/:id/start (Iniciar atención presencial)",
                    "POST /visits/:id/result (Registrar resultado comercial)",
                    "PATCH /visits/:id/reschedule (Reprogramar fecha/hora)",
                    "POST /visits/:id/not-visited (Marcar no visitado con motivo)",
                    "POST /visits/:id/attachments (Cargar soportes/fotos en S3)",
                  ]}
                />
              }
            />

            {/* Mapa Interactivo de Visitas (ADMIN y DIRECTOR_REGIONAL) */}
            <Route
              path="mapa"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DIRECTOR_REGIONAL]}>
                  <PlaceholderPage
                    title="Mapa Interactivo de Visitas y Cobertura"
                    description="Visualización geoespacial de clientes y estado de visitas en tiempo real sobre OpenStreetMap y Leaflet por territorio."
                    moduleCode="Épica E6 & E7 (HU-36 y HU-37)"
                    targetEndpoints={[
                      "GET /visit-map (Pines georreferenciados con estado)",
                      "GET /visit-map/advisor/:advisorId (Itinerario del asesor)",
                    ]}
                  />
                </ProtectedRoute>
              }
            />

            {/* Cotizaciones y Pedidos */}
            <Route
              path="cotizaciones"
              element={
                <PlaceholderPage
                  title="Gestión Comercial de Cotizaciones y Pedidos"
                  description="Creación de cotizaciones con productos y cálculo automático, adjuntos en S3, aprobación de cotizaciones y conversión a pedidos oficiales."
                  moduleCode="Épica E5 (HU-30 a HU-34)"
                  targetEndpoints={[
                    "POST /quotes (Crear cotización COT-0001)",
                    "GET /quotes (Listado con filtros y estados)",
                    "PATCH /quotes/:id/status (Aprobar o rechazar con bitácora)",
                    "POST /quotes/:id/document (Adjuntar PDF/soporte en S3)",
                    "POST /quotes/:id/convert-to-order (Convertir a PED-0001)",
                    "GET /orders (Listado de pedidos generados)",
                  ]}
                />
              }
            />

            {/* Gestión de Asesores (Solo ADMIN) */}
            <Route
              path="asesores"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <PlaceholderPage
                    title="Administración de Asesores Comerciales"
                    description="Directorio y alta de asesores comerciales, vinculación a cuentas de usuario y control de estado activo/inactivo."
                    moduleCode="Épica E1 (HU-07)"
                    targetEndpoints={[
                      "GET /advisors (Directorio con filtros y zonas)",
                      "POST /advisors (Crear asesor y vincular usuario)",
                      "PATCH /advisors/:id (Actualizar datos)",
                      "PATCH /advisors/:id/status (Activar/Desactivar)",
                    ]}
                  />
                </ProtectedRoute>
              }
            />

            {/* Catálogos y Parámetros (Solo ADMIN) */}
            <Route
              path="catalogos"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <PlaceholderPage
                    title="Catálogos y Parámetros del Sistema"
                    description="Mantenimiento de zonas comerciales, clasificaciones de cliente, potenciales y resultados de visitas para parametrizar la plataforma."
                    moduleCode="Épica E2 (HU-14)"
                    targetEndpoints={[
                      "GET /catalogs (Todos los catálogos agrupados)",
                      "GET /zones (Zonas territoriales)",
                      "POST /catalogs/:type (Crear parámetro)",
                      "PATCH /catalogs/:type/:id (Modificar parámetro)",
                    ]}
                  />
                </ProtectedRoute>
              }
            />

            {/* Reportes CSV (ADMIN y DIRECTOR_REGIONAL) */}
            <Route
              path="reportes"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DIRECTOR_REGIONAL]}>
                  <PlaceholderPage
                    title="Centro de Exportación de Reportes CSV"
                    description="Descarga en un clic de la información comercial consolidada en formato CSV estándar compatible con Excel y BI."
                    moduleCode="Épica E6 & E7 (HU-38)"
                    targetEndpoints={[
                      "GET /reports/visits/csv (Reporte de visitas)",
                      "GET /reports/clients/csv (Reporte de clientes)",
                      "GET /reports/quotes/csv (Reporte de cotizaciones)",
                      "GET /reports/orders/csv (Reporte de pedidos)",
                    ]}
                  />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

