import { useEffect, useState, useCallback } from "react";
import { analyticsService } from '../services/analyticsService';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import {
    PieChart, Pie, Cell, LineChart, Line, Legend, Tooltip, ResponsiveContainer, CartesianGrid, XAxis, YAxis
} from 'recharts';
import api from '../services/api';

// New Enterprise Components
import NotificationCenter from '../components/NotificationCenter';
import RoleSwitcher from '../components/RoleSwitcher';
import SearchFilterExport from '../components/SearchFilterExport';
import { SLADashboard } from '../components/SLATimer';

export default function AdminDashboardEnterprise() {
    const { user } = useAuth();
    const { notify } = useNotification();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [systemHealth, setSystemHealth] = useState('Stable');
    const [viewRole, setViewRole] = useState('ADMIN'); // For role switcher

    // Executive Metrics
    const [metrics, setMetrics] = useState({
        totalUsers: 0,
        totalAgents: 0,
        policiesIssued: 0,
        fraudAlerts: 0
    });

    // Conversion Funnel
    const [funnelData, setFunnelData] = useState({
        users: 0,
        appointments: 0,
        consulted: 0,
        approved: 0,
        issued: 0
    });

    // Risk Distribution
    const [riskDistribution, setRiskDistribution] = useState([
        { name: 'Low', value: 72, color: '#10b981' },
        { name: 'Medium', value: 21, color: '#f59e0b' },
        { name: 'High', value: 7, color: '#ef4444' }
    ]);

    // Agent Leaderboard
    const [leaderboard, setLeaderboard] = useState([]);

    // Audit Log
    const [auditLog, setAuditLog] = useState([]);

    // Revenue Trends
    const [revenueTrends, setRevenueTrends] = useState([]);

    // SLA Items
    const [slaItems, setSlaItems] = useState([]);

    const loadAdminData = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch all data in parallel
            const [analyticsData, dashboardStatsRes, plansRes] = await Promise.all([
                analyticsService.getAllData(),
                api.get('/admin/dashboard-stats').catch(e => null),
                api.get('/policies').catch(e => ({ data: [] }))
            ]);

            const { users, agents, bookings, issuedPolicies } = analyticsData;
            const dashboardStats = dashboardStatsRes ? dashboardStatsRes.data : null;
            const totalPlans = plansRes ? plansRes.data.length : 0;

            // Calculate SLA Items (Fallback to local calc if backend fails, or override)
            if (dashboardStats && dashboardStats.slaMetrics) {
                setSlaItems(dashboardStats.slaMetrics.urgentTasks || []);
            } else {
                // Fallback local calc
                const now = new Date();
                const bookingSLA = bookings
                    .filter(b => ['PENDING', 'CONFIRMED'].includes(b.status))
                    .map(b => {
                        const deadline = new Date(new Date(b.createdAt).getTime() + 24 * 60 * 60 * 1000);
                        const hoursLeft = (deadline - now) / (1000 * 60 * 60);
                        return {
                            id: `booking-${b.id}`,
                            taskName: `Consultation - ${b.user?.name || 'User'}`,
                            deadline: deadline.toISOString(),
                            priority: hoursLeft < 4 ? 'HIGH' : 'MEDIUM',
                            assignedTo: b.agent?.name || 'Unassigned'
                        };
                    });
                setSlaItems(bookingSLA.slice(0, 5));
            }

            // Executive Metrics
            const totalUsers = users.filter(u => u.role === 'USER').length;
            const totalAgents = agents.length;
            const policiesIssued = issuedPolicies.length;
            const fraudAlerts = (dashboardStats && dashboardStats.fraudAlerts !== undefined)
                ? dashboardStats.fraudAlerts
                : calculateFraudAlerts(bookings, issuedPolicies);

            setMetrics({
                totalUsers,
                totalAgents,
                policiesIssued,
                fraudAlerts,
                totalPlans
            });

            // Conversion Funnel
            const totalUserCount = totalUsers;
            const appointmentsCount = bookings.length;
            const consultedCount = bookings.filter(b =>
                ['CONFIRMED', 'APPROVED', 'COMPLETED'].includes(b.status)
            ).length;
            const approvedCount = bookings.filter(b =>
                ['APPROVED', 'COMPLETED'].includes(b.status)
            ).length;

            setFunnelData({
                users: totalUserCount,
                appointments: appointmentsCount,
                consulted: consultedCount,
                approved: approvedCount,
                issued: policiesIssued
            });

            // Agent Leaderboard
            if (dashboardStats && dashboardStats.agentLeaderboard) {
                setLeaderboard(dashboardStats.agentLeaderboard.map(a => ({
                    id: a.agentId,
                    name: a.agentName,
                    approvalRate: Math.round(a.approvalRate),
                    avgTime: Math.round(a.averageResponseTime)
                })));
            } else {
                const agentStats = calculateAgentStats(agents, bookings);
                setLeaderboard(agentStats.slice(0, 10));
            }

            // Risk Distribution
            if (dashboardStats && dashboardStats.claimRiskDistribution) {
                const map = dashboardStats.claimRiskDistribution;
                const total = (map.Low || 0) + (map.Medium || 0) + (map.High || 0) || 1;
                setRiskDistribution([
                    { name: 'Low', value: Math.round(((map.Low || 0) / total) * 100), color: '#10b981' },
                    { name: 'Medium', value: Math.round(((map.Medium || 0) / total) * 100), color: '#f59e0b' },
                    { name: 'High', value: Math.round(((map.High || 0) / total) * 100), color: '#ef4444' }
                ]);
            } else {
                const riskDist = calculateRiskDistribution(bookings, issuedPolicies);
                setRiskDistribution(riskDist);
            }

            // Audit Log
            const recentAudit = generateAuditLog(bookings, issuedPolicies, agents);
            setAuditLog(recentAudit.slice(0, 10));

            // Revenue Trends (last 7 days)
            const trends = calculateRevenueTrends(issuedPolicies);
            setRevenueTrends(trends);

            // System Health
            setSystemHealth(calculateSystemHealth(bookings, agents));

        } catch (err) {
            console.error("Admin dashboard load error:", err);
            notify("Failed to load admin dashboard", "error");
        } finally {
            setLoading(false);
        }
    }, [notify]);

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        loadAdminData();
    }, [user, navigate, loadAdminData]);

    const calculateFraudAlerts = (bookings, policies) => {
        // Mock fraud detection logic
        let alerts = 0;

        // Check for duplicate bookings
        const userBookingCounts = {};
        bookings.forEach(b => {
            const userId = b.user?.id;
            if (userId) {
                userBookingCounts[userId] = (userBookingCounts[userId] || 0) + 1;
            }
        });

        // Flag users with > 5 bookings
        alerts += Object.values(userBookingCounts).filter(count => count > 5).length;

        // Check for high-value policies
        alerts += policies.filter(p => p.premium > 100000).length;

        return Math.min(alerts, 10); // Cap at 10 for demo
    };

    const calculateAgentStats = (agents, bookings) => {
        return agents.map(agent => {
            const agentBookings = bookings.filter(b => b.agent?.id === agent.id);
            const totalBookings = agentBookings.length;
            const approvedBookings = agentBookings.filter(b =>
                ['APPROVED', 'CONFIRMED', 'COMPLETED'].includes(b.status)
            ).length;

            const approvalRate = totalBookings > 0
                ? Math.round((approvedBookings / totalBookings) * 100)
                : 0;

            // Mock average decision time (10-25 mins)
            const avgTime = Math.floor(Math.random() * 15) + 10;

            return {
                id: agent.id,
                name: agent.name,
                approvalRate,
                avgTime,
                totalBookings
            };
        })
            .filter(a => a.totalBookings > 0)
            .sort((a, b) => b.approvalRate - a.approvalRate);
    };

    const calculateRiskDistribution = (bookings, policies) => {
        const total = policies.length || 1;

        // Mock risk calculation
        const lowRisk = Math.floor(total * 0.72);
        const mediumRisk = Math.floor(total * 0.21);
        const highRisk = total - lowRisk - mediumRisk;

        return [
            { name: 'Low', value: Math.round((lowRisk / total) * 100), count: lowRisk, color: '#10b981' },
            { name: 'Medium', value: Math.round((mediumRisk / total) * 100), count: mediumRisk, color: '#f59e0b' },
            { name: 'High', value: Math.round((highRisk / total) * 100), count: highRisk, color: '#ef4444' }
        ];
    };

    const generateAuditLog = (bookings, policies, agents) => {
        const events = [];

        // Booking Events
        bookings.forEach(b => {
            // Created
            events.push({
                type: 'booking',
                icon: '📅',
                message: `New consultation booked by ${b.user?.name || 'User'}`,
                timestamp: b.createdAt,
                severity: 'info'
            });

            // Completed/Approved
            if (b.status === 'APPROVED' || b.status === 'COMPLETED') {
                events.push({
                    type: 'approval',
                    icon: '✅',
                    message: `Agent ${b.agent?.name || 'System'} approved/completed booking #${b.id}`,
                    timestamp: b.completedAt || b.reviewedAt || b.createdAt,
                    severity: 'success'
                });
            }

            // Rejected
            if (b.status === 'REJECTED') {
                events.push({
                    type: 'rejection',
                    icon: '❌',
                    message: `Booking #${b.id} rejected by agent`,
                    timestamp: b.reviewedAt || b.createdAt,
                    severity: 'error'
                });
            }
        });

        // Policy Events
        policies.forEach(p => {
            events.push({
                type: 'policy',
                icon: '📄',
                message: `Policy #${p.id} issued to user ${p.user?.name || 'User'}`,
                timestamp: p.startDate || new Date().toISOString(),
                severity: 'success'
            });
        });

        // Agent Events (Deactivations)
        agents.forEach(a => {
            if (!a.isActive && a.deactivatedAt) {
                events.push({
                    type: 'system',
                    icon: '🚫',
                    message: `Agent ${a.name} was deactivated: ${a.deactivationReason || 'No reason'}`,
                    timestamp: a.deactivatedAt,
                    severity: 'warning'
                });
            }
        });

        // Sort by timestamp descending
        return events
            .filter(e => e.timestamp) // Ensure timestamp exists
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    };

    const calculateRevenueTrends = (policies) => {
        const last7Days = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const dateKey = date.toISOString().split('T')[0];

            // Aggregate real data
            const dayPolicies = policies.filter(p =>
                (p.startDate || p.createdAt || '').startsWith(dateKey)
            );

            const revenue = dayPolicies.reduce((sum, p) => sum + (p.policy?.premium || p.premium || 0), 0);
            const count = dayPolicies.length;

            last7Days.push({
                date: dateStr,
                revenue: revenue / 100000, // In lakhs
                policies: count
            });
        }

        return last7Days;
    };

    const calculateSystemHealth = (bookings, agents) => {
        const activeAgents = agents.filter(a => a.available).length;
        const totalAgents = agents.length;
        const agentAvailability = totalAgents > 0 ? (activeAgents / totalAgents) * 100 : 0;

        if (agentAvailability > 70) return 'Stable';
        if (agentAvailability > 40) return 'Warning';
        return 'Critical';
    };

    const getHealthColor = (health) => {
        switch (health) {
            case 'Stable': return '#10b981';
            case 'Warning': return '#f59e0b';
            case 'Critical': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getHealthIcon = (health) => {
        switch (health) {
            case 'Stable': return '🟢';
            case 'Warning': return '🟡';
            case 'Critical': return '🔴';
            default: return '⚪';
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto', width: 50, height: 50, border: '4px solid rgba(79, 70, 229, 0.1)', borderTop: '4px solid #4f46e5', borderRadius: '50%' }}></div>
                <p style={{ marginTop: 20, color: 'var(--text-muted)' }}>Loading admin control center...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', maxWidth: '1800px', margin: '0 auto' }}>
            {/* Control Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 40 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="text-gradient" style={{ margin: 0, fontSize: '2.8rem' }}>
                            🛠️ Admin Control Center
                        </h1>
                        <p style={{ marginTop: 10, color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                            Total system visibility and strategic insights
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <NotificationCenter userRole="ADMIN" />
                        <RoleSwitcher
                            currentRole={viewRole}
                            onRoleSwitch={(role) => {
                                setViewRole(role);
                                notify(`Switched to ${role} view`, 'info');
                                // In a real app, this would navigate to the appropriate dashboard
                                if (role === 'USER') navigate('/dashboard');
                                if (role === 'AGENT') navigate('/agent/dashboard');
                            }}
                        />
                        <div style={{
                            padding: '15px 30px',
                            background: `linear - gradient(135deg, ${getHealthColor(systemHealth)}20, ${getHealthColor(systemHealth)}10)`,
                            borderRadius: 20,
                            border: `2px solid ${getHealthColor(systemHealth)} `,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>{getHealthIcon(systemHealth)}</span>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                                    System Health
                                </div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: getHealthColor(systemHealth) }}>
                                    {systemHealth}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ height: 2, background: 'linear-gradient(90deg, #4f46e5, transparent)', marginTop: 15 }}></div>
            </motion.div>

            {/* Executive Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 40 }}>
                {[
                    { icon: '👥', title: 'Total Users', value: metrics.totalUsers, color: '#3b82f6', trend: '+12%', link: '/admin/users' },
                    { icon: '🧑‍💼', title: 'Agents', value: metrics.totalAgents, color: '#8b5cf6', trend: '+3', link: '/admin/agents' },
                    { icon: '📄', title: 'Policies Issued', value: metrics.policiesIssued, color: '#10b981', trend: '+8%', link: '/admin/policies' },
                    { icon: '🛡️', title: 'Manage Plans', value: metrics.totalPlans || 0, color: '#ec4899', trend: 'Edit', link: '/admin/plans' },
                    { icon: '💬', title: 'Feedback', value: 'View', color: '#f97316', trend: '→', link: '/admin/feedback' },
                    { icon: '⚠️', title: 'Fraud Alerts', value: metrics.fraudAlerts, color: '#ef4444', trend: '-2', link: '/admin/exceptions' }
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        onClick={() => {
                            if (metric.link) navigate(metric.link);
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        className="card"
                        style={{
                            borderTop: `4px solid ${metric.color} `,
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ position: 'absolute', top: 10, right: 10, fontSize: '4rem', opacity: 0.05 }}>
                            {metric.icon}
                        </div>
                        <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>{metric.icon}</div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 8 }}>
                            {metric.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: metric.color }}>
                                {metric.value.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: metric.trend.startsWith('+') ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                {metric.trend}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Conversion Funnel */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ marginBottom: 40, padding: 0, overflow: 'hidden' }}
            >
                <div style={{ padding: '25px 30px', background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', color: 'white' }}>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>🔄 Conversion Funnel</h3>
                    <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '0.95rem' }}>Track user journey from registration to policy issuance</p>
                </div>

                <div style={{ padding: 40 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20 }}>
                        {[
                            { label: 'Users', value: funnelData.users, color: '#3b82f6', height: 100 },
                            { label: 'Appointments', value: funnelData.appointments, color: '#8b5cf6', height: 80 },
                            { label: 'Consulted', value: funnelData.consulted, color: '#ec4899', height: 70 },
                            { label: 'Approved', value: funnelData.approved, color: '#f59e0b', height: 60 },
                            { label: 'Issued', value: funnelData.issued, color: '#10b981', height: 50 }
                        ].map((stage, idx) => {
                            const conversionRate = idx > 0
                                ? Math.round((stage.value / funnelData.users) * 100)
                                : 100;

                            return (
                                <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${stage.height}% ` }}
                                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                                        style={{
                                            background: `linear - gradient(180deg, ${stage.color}, ${stage.color}80)`,
                                            borderRadius: '12px 12px 0 0',
                                            minHeight: 100,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-end',
                                            padding: '20px 10px',
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>
                                            {stage.value}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                                            {conversionRate}%
                                        </div>
                                    </motion.div>
                                    <div style={{ marginTop: 15, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                        {stage.label}
                                    </div>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        color: idx < 4 ? 'var(--text-muted)' : 'transparent',
                                        marginTop: 5
                                    }}>
                                        →
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            {/* Fraud & Risk + Agent Leaderboard */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginBottom: 40 }}>

                {/* Fraud & Risk Dashboard */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card"
                >
                    <h3 style={{ marginBottom: 20, fontSize: '1.4rem' }}>🚨 Fraud & Risk Dashboard</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 25 }}>Claims Risk Distribution</p>

                    <div style={{ marginBottom: 30 }}>
                        {riskDistribution.map((risk, idx) => (
                            <div key={idx} style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: risk.color }}></div>
                                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                            {risk.name} Risk
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: risk.color }}>
                                        {risk.value}%
                                    </span>
                                </div>
                                <div style={{ height: 12, background: '#1e293b', borderRadius: 6, overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${risk.value}% ` }}
                                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                                        style={{
                                            height: '100%',
                                            background: risk.color,
                                            borderRadius: 6
                                        }}
                                    ></motion.div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={riskDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {riskDistribution.map((entry, index) => (
                                    <Cell key={`cell - ${index} `} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>

                    <button
                        className="primary-btn"
                        onClick={() => navigate('/admin/exceptions')}
                        style={{ width: '100%', marginTop: 20, fontSize: '0.95rem' }}
                    >
                        View High-Risk Claims →
                    </button>
                </motion.div>

                {/* Agent Leaderboard */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card"
                    style={{ padding: 0, overflow: 'hidden' }}
                >
                    <div style={{ padding: '25px 30px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white' }}>
                        <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'white' }}>🧑‍💼 Agent Leaderboard</h3>
                        <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>Top performing agents this month</p>
                    </div>

                    {leaderboard.length === 0 ? (
                        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 15 }}>🏆</div>
                            <p>No agent data available</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <tr>
                                        <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Rank</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Agent Name</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Approval</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Avg Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.slice(0, 5).map((agent, idx) => (
                                        <motion.tr
                                            key={agent.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                                            className="hover-row"
                                        >
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{
                                                    width: 35,
                                                    height: 35,
                                                    borderRadius: '50%',
                                                    background: idx === 0 ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'rgba(255,255,255,0.05)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 800,
                                                    fontSize: '1rem',
                                                    color: idx === 0 ? 'white' : 'var(--text-main)'
                                                }}>
                                                    {idx === 0 ? '🏆' : idx + 1}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-main)' }}>
                                                {agent.name}
                                            </td>
                                            <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '6px 12px',
                                                    borderRadius: 12,
                                                    fontSize: '0.85rem',
                                                    fontWeight: 700,
                                                    background: agent.approvalRate >= 90 ? '#10b98120' : '#f59e0b20',
                                                    color: agent.approvalRate >= 90 ? '#10b981' : '#f59e0b'
                                                }}>
                                                    {agent.approvalRate}%
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-main)', fontFamily: 'monospace' }}>
                                                {agent.avgTime} mins
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Revenue Trends + Audit Log */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 30 }}>

                {/* Revenue Trends */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                >
                    <h3 style={{ marginBottom: 20, fontSize: '1.4rem' }}>📈 Revenue Trends</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 25 }}>Last 7 days performance</p>

                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={revenueTrends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="date" stroke="var(--text-muted)" />
                            <YAxis stroke="var(--text-muted)" />
                            <Tooltip
                                contentStyle={{
                                    background: '#0f172a',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: 8
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#10b981"
                                strokeWidth={3}
                                name="Revenue (₹ Lakhs)"
                            />
                            <Line
                                type="monotone"
                                dataKey="policies"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                name="Policies Issued"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Audit & Compliance Log */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                >
                    <h3 style={{ marginBottom: 20, fontSize: '1.4rem' }}>🧾 Audit & Compliance Log</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 25 }}>Recent system events</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 15, maxHeight: 300, overflowY: 'auto' }}>
                        {auditLog.map((event, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                style={{
                                    display: 'flex',
                                    gap: 12,
                                    padding: 12,
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: 8,
                                    borderLeft: `3px solid ${event.severity === 'error' ? '#ef4444' :
                                        event.severity === 'warning' ? '#f59e0b' :
                                            event.severity === 'success' ? '#10b981' : '#3b82f6'
                                        } `
                                }}
                            >
                                <div style={{ fontSize: '1.3rem' }}>{event.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: 3 }}>
                                        {event.message}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {formatTime(event.timestamp)}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* SLA Dashboard */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 40 }}
            >
                <SLADashboard
                    slaItems={slaItems}
                />
            </motion.div>

            {/* Search, Filter & Export */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <SearchFilterExport
                    data={[
                        ...leaderboard.map(agent => ({
                            id: agent.id,
                            name: agent.name,
                            type: 'Agent',
                            approvalRate: `${agent.approvalRate}% `,
                            avgTime: `${agent.avgTime} mins`,
                            totalBookings: agent.totalBookings,
                            status: agent.approvalRate >= 90 ? 'Excellent' : 'Good'
                        })),
                        ...auditLog.map((event, idx) => ({
                            id: idx + 1000,
                            name: event.message,
                            type: event.type,
                            timestamp: event.timestamp,
                            severity: event.severity,
                            status: event.severity
                        }))
                    ]}
                    columns={[
                        { key: 'id', label: 'ID' },
                        { key: 'name', label: 'Name/Description' },
                        { key: 'type', label: 'Type' },
                        { key: 'status', label: 'Status' }
                    ]}
                    onExport={(type, data) => {
                        notify(`Exported ${data.length} records as ${type} `, 'success');
                    }}
                />
            </motion.div>
        </div>
    );
}
