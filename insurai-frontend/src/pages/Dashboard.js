// Main Dashboard Component
import { useAuth } from "../context/AuthContext";
import UserDashboard from "./UserDashboard";
import AgentDashboardAdvanced from "./AgentDashboardAdvanced";
import { Navigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  // Render role-specific dashboards
  // ADMIN role removed

  if (user.role === 'AGENT') {
    return <AgentDashboardAdvanced />;
  }

  if (user.role === 'USER') {
    return <UserDashboard />;
  }

  if (user.role === 'COMPANY' || user.role === 'COMPANY_ADMIN') {
    return <Navigate to="/company" replace />;
  }

  if (user.role === 'SUPER_ADMIN') {
    return <Navigate to="/super-admin" replace />;
  }

  return null;
}
