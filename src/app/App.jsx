import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, LoginPage, useAuth, ROLES } from "@/features/auth";
import { DashboardPage } from "@/features/dashboard";
import { ClientsPage } from "@/features/clients";
import { RoutesPage, AssignedRoutesPage } from "@/features/routes";
import { RegisterVisitPage, AgendaPage } from "@/features/visits";
import { VisitMapPage } from "@/features/visit-map";
import { QuotesPage, OrdersPage } from "@/features/quotes";
import { ReportsPage } from "@/features/reports";
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

            {/* Agenda de Asesores Comerciales */}
            <Route
              path="agenda"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DIRECTOR_REGIONAL, ROLES.ASESOR]}>
                  <AgendaPage />
                </ProtectedRoute>
              }
            />

            {/* Registro y Gestión de Visitas */}
            <Route
              path="visitas"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DIRECTOR_REGIONAL, ROLES.ASESOR]}>
                  <RegisterVisitPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="visitas/registrar"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DIRECTOR_REGIONAL, ROLES.ASESOR]}>
                  <RegisterVisitPage />
                </ProtectedRoute>
              }
            />

            {/* Mapa Interactivo de Visitas (ADMIN y DIRECTOR_REGIONAL) */}
            <Route
              path="mapa"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DIRECTOR_REGIONAL]}>
                  <VisitMapPage />
                </ProtectedRoute>
              }
            />

            {/* Cotizaciones (HU-30 a HU-32) */}
            <Route path="cotizaciones" element={<QuotesPage />} />

            {/* Pedidos (HU-33 y HU-34) */}
            <Route path="pedidos" element={<OrdersPage />} />

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
                  <ReportsPage />
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

