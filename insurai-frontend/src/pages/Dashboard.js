import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserDashboard from "./UserDashboard";
import AgentDashboardAdvanced from "./AgentDashboardAdvanced";
import AdminDashboardEnterprise from "./AdminDashboardEnterprise";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  return null;
}
