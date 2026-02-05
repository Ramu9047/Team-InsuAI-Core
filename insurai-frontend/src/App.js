import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
// import Agents from "./pages/Agents";
import ChooseAgent from "./pages/ChooseAgent";
import AdminDashboard from "./pages/AdminDashboard";

import ScheduleAppointment from "./pages/ScheduleAppointment";
import AgentRequests from "./pages/AgentRequests";
import Plans from "./pages/Plans";
import PlansEnhanced from "./pages/PlansEnhanced";
import MyClaims from "./pages/MyClaims";
import MyBookings from "./pages/MyBookings";
import MyPolicies from "./pages/MyPolicies";
import Profile from "./pages/Profile";
import AgentConsultations from "./pages/AgentConsultations";
import AgentPerformance from "./pages/AgentPerformance";
import AdminAnalytics from "./pages/AdminAnalytics";
import AgentGovernance from "./pages/AgentGovernance";
import ExceptionHandling from "./pages/ExceptionHandling";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import RequireAuth from "./components/RequireAuth";

import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

// Main App Component
export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Routes (Any Authenticated User) */}
              <Route element={<RequireAuth allowedRoles={['USER', 'AGENT', 'ADMIN']} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/plans-enhanced" element={<PlansEnhanced />} />
              </Route>

              {/* User Routes */}
              <Route element={<RequireAuth allowedRoles={['USER', 'AGENT', 'ADMIN']} />}>
                <Route path="/choose-agent" element={<ChooseAgent />} />
                <Route path="/schedule" element={<ScheduleAppointment />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/my-policies" element={<MyPolicies />} />
                <Route path="/claims" element={<MyClaims />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Agent Routes */}
              <Route element={<RequireAuth allowedRoles={['AGENT', 'ADMIN']} />}>
                <Route path="/agent/requests" element={<AgentRequests />} />
                <Route path="/agent/consultations" element={<AgentConsultations />} />
                <Route path="/agent/performance" element={<AgentPerformance />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<RequireAuth allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/agents" element={<AgentGovernance />} />
                <Route path="/admin/exceptions" element={<ExceptionHandling />} />
              </Route>
            </Routes>
          </Layout>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
