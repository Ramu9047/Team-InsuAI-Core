// Main Dashboard Component
import { useAuth } from "../context/AuthContext";
import UserDashboard from "./UserDashboard";
import AgentDashboardAdvanced from "./AgentDashboardAdvanced";
import AdminDashboardEnterprise from "./AdminDashboardEnterprise";
import { Navigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  // Render role-specific dashboards
  if (user.role === 'ADMIN') {
    return <AdminDashboardEnterprise />;
  }

  if (user.role === 'AGENT') {
    return <AgentDashboardAdvanced />;
  }

  if (user.role === 'USER') {
    return <UserDashboard />;
  }

  if (user.role === 'COMPANY') {
    return <Navigate to="/company" replace />;
  }

  if (user.role === 'SUPER_ADMIN') {
    return <Navigate to="/super-admin" replace />;
  }

  return null;
}
