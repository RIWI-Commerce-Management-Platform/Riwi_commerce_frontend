import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth";

/**
 * Componente guardián que restringe el acceso a usuarios autenticados
 * y opcionalmente valida si el usuario cuenta con los roles permitidos.
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--bg, #f8fafc)",
        color: "var(--navy, #0b2545)",
        fontFamily: "var(--font, sans-serif)",
        gap: "16px",
      }}>
        <div style={{
          width: "42px",
          height: "42px",
          border: "4px solid rgba(255, 106, 0, 0.2)",
          borderTopColor: "var(--orange, #ff6a00)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ fontWeight: 600, fontSize: "15px" }}>Verificando credenciales...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div style={{
        padding: "48px 24px",
        textAlign: "center",
        maxWidth: "500px",
        margin: "60px auto",
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
      }}>
        <h2 style={{ color: "var(--navy, #0b2545)", marginBottom: "8px" }}>Acceso no autorizado</h2>
        <p style={{ color: "var(--muted, #64748b)", marginBottom: "20px" }}>
          Tu perfil con rol <strong>{role}</strong> no tiene permisos para acceder a esta sección.
        </p>
        <a
          href="/dashboard"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            background: "var(--orange, #ff6a00)",
            color: "#fff",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Volver al Dashboard
        </a>
      </div>
    );
  }

  return children;
}
