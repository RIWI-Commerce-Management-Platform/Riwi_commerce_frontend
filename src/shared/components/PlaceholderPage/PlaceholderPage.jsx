import { AlertCircle, Clock } from "lucide-react";

export default function PlaceholderPage({ title, description, moduleCode, targetEndpoints = [] }) {
  return (
    <div style={{
      padding: "32px",
      maxWidth: "900px",
      margin: "0 auto",
      fontFamily: "var(--font, sans-serif)",
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "36px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 14px",
          background: "rgba(255, 106, 0, 0.1)",
          color: "var(--orange, #ff6a00)",
          borderRadius: "20px",
          fontSize: "13px",
          fontWeight: 700,
          marginBottom: "16px",
        }}>
          <Clock size={16} />
          <span>{moduleCode} · En desarrollo de interfaz</span>
        </div>

        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--navy, #0b2545)", margin: "0 0 12px" }}>
          {title}
        </h1>
        <p style={{ fontSize: "16px", color: "var(--muted, #64748b)", margin: "0 0 28px", lineHeight: 1.6 }}>
          {description}
        </p>

        {targetEndpoints.length > 0 && (
          <div style={{
            background: "#f8fafc",
            border: "1px solid #edf2f7",
            borderRadius: "12px",
            padding: "20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <AlertCircle size={18} color="#0b2545" />
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#0b2545", margin: 0 }}>
                Endpoints de Backend ya listos para conectar:
              </h3>
            </div>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "#475569", fontSize: "13px", lineHeight: 1.8 }}>
              {targetEndpoints.map((ep, i) => (
                <li key={i}>
                  <code style={{
                    background: "#e2e8f0",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontWeight: 600,
                    color: "#0f172a",
                  }}>
                    {ep}
                  </code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
