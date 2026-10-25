import { LoginPage } from "@/features/auth";
import { DashboardPage } from "@/features/dashboard";

// Sin router todavía: /#/dashboard abre el dashboard y cualquier otra URL el login.
export default function App() {
  return window.location.hash === "#/dashboard" ? <DashboardPage /> : <LoginPage />;
}
