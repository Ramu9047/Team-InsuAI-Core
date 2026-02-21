import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
// import Agents from "./pages/Agents";
import ChooseAgent from "./pages/ChooseAgent";
// AdminDashboardEnterprise removed

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
import AdminUsers from './pages/AdminUsers';
import AdminPolicies from './pages/AdminPolicies';
import AdminPlans from './pages/AdminPlans';
import Notifications from './pages/Notifications';
import AgentAppointmentsEnhanced from './pages/AgentAppointmentsEnhanced';
import MyAppointmentsEnhanced from './pages/MyAppointmentsEnhanced';
import CompanyDashboard from './pages/CompanyDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import UserFeedbackPage from './pages/UserFeedbackPage';
import AdminFeedbackDashboard from "./pages/AdminFeedbackDashboard";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import RequireAuth from "./components/RequireAuth";

import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

import PolicyWorkflowPage from './pages/PolicyWorkflowPage';

import { ToastProvider } from './components/ToastSystem';

// Main App Component
export default function App() {
    return (
        <ToastProvider>
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
                                <Route element={<RequireAuth allowedRoles={['USER', 'AGENT', 'SUPER_ADMIN', 'COMPANY', 'COMPANY_ADMIN']} />}>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/notifications" element={<Notifications />} />
                                    <Route path="/plans" element={<Plans />} />
                                    <Route path="/plans-enhanced" element={<PlansEnhanced />} />
                                </Route>

                                {/* User Routes */}
                                <Route element={<RequireAuth allowedRoles={['USER', 'AGENT']} />}>
                                    <Route path="/choose-agent" element={<ChooseAgent />} />
                                    <Route path="/schedule" element={<ScheduleAppointment />} />
                                    <Route path="/my-bookings" element={<MyBookings />} />
                                    <Route path="/my-policies" element={<MyPolicies />} />
                                    <Route path="/claims" element={<MyClaims />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/feedback" element={<UserFeedbackPage />} />
                                </Route>

                                {/* Agent Routes */}
                                <Route element={<RequireAuth allowedRoles={['AGENT']} />}>
                                    <Route path="/agent/requests" element={<AgentRequests />} />
                                    <Route path="/agent/consultations" element={<AgentConsultations />} />
                                    <Route path="/agent/performance" element={<AgentPerformance />} />
                                    <Route path="/agent/appointments-enhanced" element={<AgentAppointmentsEnhanced />} />
                                </Route>

                                {/* User Enhanced Routes */}
                                <Route element={<RequireAuth allowedRoles={['USER']} />}>
                                    <Route path="/my-appointments-enhanced" element={<MyAppointmentsEnhanced />} />
                                </Route>

                                {/* Shared Admin Routes */}
                                <Route element={<RequireAuth allowedRoles={['SUPER_ADMIN', 'COMPANY', 'COMPANY_ADMIN']} />}>
                                    <Route path="/analytics" element={<AdminAnalytics />} />
                                    <Route path="/agents-list" element={<AgentGovernance />} />
                                    <Route path="/exceptions" element={<ExceptionHandling />} />
                                    <Route path="/users" element={<AdminUsers />} />
                                    <Route path="/issued-policies" element={<AdminPolicies />} />
                                    <Route path="/plans-admin" element={<AdminPlans />} />
                                    <Route path="/feedback-list" element={<AdminFeedbackDashboard />} />

                                    <Route path="/my-consultations" element={<PolicyWorkflowPage />} />
                                </Route>

                                {/* Company Routes */}
                                <Route element={<RequireAuth allowedRoles={['COMPANY', 'COMPANY_ADMIN']} />}>
                                    <Route path="/company" element={<CompanyDashboard />} />
                                </Route>

                                {/* Super Admin Routes */}
                                <Route element={<RequireAuth allowedRoles={['SUPER_ADMIN']} />}>
                                    <Route path="/super-admin" element={<SuperAdminDashboard />} />
                                </Route>
                            </Routes>
                        </Layout>
                    </BrowserRouter>
                </NotificationProvider>
            </AuthProvider>
        </ToastProvider>
    );
}
