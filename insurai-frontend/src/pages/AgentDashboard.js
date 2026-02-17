import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import {
    PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function AgentDashboard() {
    const { user } = useAuth();
    const { notify } = useNotification();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [isAvailable, setIsAvailable] = useState(false);
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        completed: 0,
        rejected: 0,
        total: 0,
        todayAppointments: 0,
        weeklyEarnings: 0,
        conversionRate: 0
    });

    const [performanceData, setPerformanceData] = useState([]);
    const [statusBreakdown, setStatusBreakdown] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);

    const loadAgentData = useCallback(async () => {
        try {
            setLoading(true);
            setIsAvailable(user.available || false);

            const res = await api.get("/agents/appointments");
            const appts = res.data || [];

            // Calculate stats
            const pending = appts.filter(a => a.status === 'PENDING').length;
            const approved = appts.filter(a => a.status === 'APPROVED' || a.status === 'CONFIRMED').length;
            const completed = appts.filter(a => a.status === 'COMPLETED').length;
            const rejected = appts.filter(a => a.status === 'REJECTED').length;
            const expired = appts.filter(a => a.status === 'EXPIRED').length;

            const today = new Date().toDateString();
            const todayAppointments = appts.filter(a =>
                new Date(a.startTime).toDateString() === today
            ).length;

            // Fetch correct performance data
            const perfRes = await api.get("/agents/performance").catch(() => ({ data: {} }));
            const perf = perfRes.data || {};

            // Fetch Today's Metrics (Real-time)
            const todayRes = await api.get("/agents/dashboard/today-metrics").catch(() => ({ data: { approvedToday: 0, rejectedToday: 0, approvalRate: 0 } }));
            const todayMetrics = todayRes.data;

            setStats({
                pending,
                approved: todayMetrics.approvedToday,
                completed,
                rejected: todayMetrics.rejectedToday,
                expired,
                total: appts.length,
                todayAppointments,
                weeklyEarnings: completed * 500,
                conversionRate: todayMetrics.approvalRate
            });

            // Status breakdown for pie chart
            setStatusBreakdown([
                { name: 'Completed', value: completed, color: '#10b981' },
                { name: 'Approved', value: approved, color: '#3b82f6' }, // Lifetime
                { name: 'Pending', value: pending, color: '#f59e0b' },
                { name: 'Rejected', value: rejected, color: '#ef4444' }, // Lifetime
                { name: 'Expired', value: expired, color: '#6b7280' }
            ].filter(item => item.value > 0));

            // Upcoming appointments (next 3)
            const upcoming = appts
                .filter(a => new Date(a.startTime) > new Date() && ['PENDING', 'APPROVED', 'CONFIRMED'].includes(a.status))
                .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                .slice(0, 3);
            setUpcomingAppointments(upcoming);





            const generatePerformanceData = (appts) => {
                const last7Days = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                    const dayAppts = appts.filter(a => {
                        const apptDate = new Date(a.startTime).toDateString();
                        return apptDate === date.toDateString();
                    });

                    last7Days.push({
                        date: dateStr,
                        appointments: dayAppts.length,
                        completed: dayAppts.filter(a => a.status === 'COMPLETED').length,
                        pending: dayAppts.filter(a => a.status === 'PENDING').length
                    });
                }
                setPerformanceData(last7Days);
            };

            const generateRecentActivities = (appts) => {
                const activities = [];
                const sorted = [...appts]
                    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                    .slice(0, 5);

                sorted.forEach(appt => {
                    const timeAgo = formatTimeAgo(new Date(appt.startTime));
                    let icon = '📅'; let text = ''; let color = '#6b7280';

                    if (appt.status === 'COMPLETED') {
                        icon = '✅'; text = `Completed consultation with ${appt.user?.name || 'Client'}`; color = '#10b981';
                    } else if (appt.status === 'APPROVED' || appt.status === 'CONFIRMED') {
                        icon = '🎯'; text = `Appointment confirmed with ${appt.user?.name || 'Client'}`; color = '#3b82f6';
                    } else if (appt.status === 'PENDING') {
                        icon = '⏳'; text = `New appointment request from ${appt.user?.name || 'Client'}`; color = '#f59e0b';
                    } else if (appt.status === 'REJECTED') {
                        icon = '❌'; text = `Appointment declined for ${appt.user?.name || 'Client'}`; color = '#ef4444';
                    } else if (appt.status === 'EXPIRED') {
                        icon = '⚠️'; text = `Request expired for ${appt.user?.name || 'Client'}`; color = '#6b7280';
                    }

                    if (text) {
                        activities.push({ id: appt.id, icon, text, time: timeAgo, color });
                    }
                });

                if (activities.length === 0) {
                    activities.push({ id: 0, icon: '😊', text: 'No recent activity', time: 'Just now', color: '#10b981' });
                }
                setRecentActivities(activities);
            };

            // Calculate Metrics
            generatePerformanceData(appts);
            generateRecentActivities(appts);

        } catch (err) {
            console.error("Agent dashboard load error:", err);
            notify("Failed to load dashboard data", "error");
        } finally {
            setLoading(false);
        }
    }, [user, notify]); // Dependencies

    useEffect(() => {
        if (!user || user.role !== 'AGENT') return;
        loadAgentData();
    }, [user, loadAgentData]);

    const formatTimeAgo = (date) => {
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    };

    const toggleAvailability = async () => {
        try {
            const newState = !isAvailable;
            await api.patch(`/agents/${user.id}/availability`, { available: newState });
            setIsAvailable(newState);
            notify(`You are now ${newState ? 'Online 🟢' : 'Offline 🔴'}`, "success");
        } catch (e) {
            notify("Failed to update status", "error");
        }
    };

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto', width: 50, height: 50, border: '4px solid rgba(79, 70, 229, 0.1)', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ marginTop: 20, color: 'var(--text-muted)' }}>Loading agent workspace...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 40 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="text-gradient" style={{ margin: 0, fontSize: '2.5rem' }}>
                            Agent Workspace 🎯
                        </h1>
                        <p style={{ margin: '10px 0 0 0', color: 'var(--text-muted)' }}>
                            Welcome back, {user.name.split(' ')[0]}! Here's your performance overview.
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleAvailability}
                        style={{
                            background: isAvailable ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                            padding: '15px 30px',
                            color: 'white',
                            borderRadius: 30,
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        }}
                    >
                        <div style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: 'white',
                            boxShadow: '0 0 10px rgba(255,255,255,0.5)'
                        }}></div>
                        {isAvailable ? "You are Online 🟢" : "You are Offline 🔴"}
                    </motion.button>
                </div>
                <div style={{ height: 2, background: 'linear-gradient(90deg, #4f46e5, transparent)', marginTop: 15 }}></div>
            </motion.div>

            {/* Key Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
                {[
                    { icon: '⏳', title: 'Pending Requests', value: stats.pending, color: '#f59e0b', action: () => navigate('/agent/requests') },
                    { icon: '✅', title: 'Approved Today', value: stats.approved, color: '#3b82f6', action: () => navigate('/agent/requests') },
                    { icon: '🎯', title: 'Completed', value: stats.completed, color: '#10b981', action: () => navigate('/agent/consultations') },
                    { icon: '❌', title: 'Rejected Today', value: stats.rejected, color: '#ef4444', action: () => navigate('/agent/requests') },
                    { icon: '💰', title: 'Weekly Earnings', value: `₹${stats.weeklyEarnings}`, color: '#ec4899', action: () => navigate('/agent/performance') },
                    { icon: '📈', title: 'Approval Rate', value: `${stats.conversionRate}%`, color: '#06b6d4', action: () => navigate('/agent/performance') }
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}
                        className="card"
                        onClick={metric.action}
                        style={{
                            cursor: 'pointer',
                            borderTop: `4px solid ${metric.color}`,
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ position: 'absolute', top: -10, right: -10, fontSize: '4rem', opacity: 0.05 }}>{metric.icon}</div>
                        <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>{metric.icon}</div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 8 }}>{metric.title}</div>
                        <div style={{ fontSize: '2.2rem', fontWeight: 800, color: metric.color }}>{metric.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 30, marginBottom: 40 }}>

                {/* Performance Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card"
                >
                    <h3 style={{ marginBottom: 20, fontSize: '1.3rem' }}>📊 Weekly Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={performanceData}>
                            <defs>
                                <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--card-border)',
                                    borderRadius: 8,
                                    color: 'var(--text-main)'
                                }}
                            />
                            <Area type="monotone" dataKey="appointments" stroke="#4f46e5" fillOpacity={1} fill="url(#colorAppointments)" strokeWidth={2} />
                            <Area type="monotone" dataKey="completed" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginTop: 15 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 12, height: 12, borderRadius: 2, background: '#4f46e5' }}></div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Appointments</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 12, height: 12, borderRadius: 2, background: '#10b981' }}></div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Completed</span>
                        </div>
                    </div>
                </motion.div>

                {/* Status Breakdown */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card"
                >
                    <h3 style={{ marginBottom: 20, fontSize: '1.3rem' }}>📈 Status Breakdown</h3>
                    {statusBreakdown.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={statusBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ marginTop: 20 }}>
                                {statusBreakdown.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.color }}></div>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{item.name}</span>
                                        </div>
                                        <span style={{ fontWeight: 700, color: item.color }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 10 }}>📭</div>
                            <p>No appointments yet</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Upcoming Appointments & Recent Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>

                {/* Upcoming Appointments */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                >
                    <h3 style={{ marginBottom: 20, fontSize: '1.3rem' }}>📅 Upcoming Appointments</h3>
                    {upcomingAppointments.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 10 }}>🎉</div>
                            <p>No upcoming appointments</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                            {upcomingAppointments.map((appt, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    style={{
                                        padding: 15,
                                        background: 'rgba(79, 70, 229, 0.05)',
                                        borderRadius: 8,
                                        border: '1px solid rgba(79, 70, 229, 0.2)',
                                        cursor: 'pointer'
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => navigate('/agent/requests')}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{appt.user?.name || 'Client'}</div>
                                        <div style={{
                                            padding: '4px 10px',
                                            borderRadius: 12,
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            background: appt.status === 'CONFIRMED' || appt.status === 'APPROVED' ? '#dcfce7' : '#fef9c3',
                                            color: appt.status === 'CONFIRMED' || appt.status === 'APPROVED' ? '#15803d' : '#854d0e'
                                        }}>
                                            {appt.status}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        📅 {new Date(appt.startTime).toLocaleString()}
                                    </div>
                                    {appt.policy && (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 5 }}>
                                            📋 {appt.policy.name}
                                        </div>
                                    )}
                                    {appt.meetingLink && (
                                        <div style={{ marginTop: 10 }}>
                                            <a
                                                href={appt.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="primary-btn"
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    display: 'block',
                                                    textAlign: 'center',
                                                    fontSize: '0.8rem',
                                                    padding: '6px',
                                                    background: '#22c55e',
                                                    borderColor: '#22c55e',
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                🎥 Join Google Meet
                                            </a>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                    <button
                        className="secondary-btn"
                        onClick={() => navigate('/agent/requests')}
                        style={{ width: '100%', marginTop: 15 }}
                    >
                        View All Appointments →
                    </button>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                >
                    <h3 style={{ marginBottom: 20, fontSize: '1.3rem' }}>🔔 Recent Activity</h3>
                    {recentActivities.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 10 }}>📭</div>
                            <p>No recent activity</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {recentActivities.map((activity, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '12px 0',
                                        borderBottom: idx < recentActivities.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                                    }}
                                >
                                    <div style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: activity.color,
                                        boxShadow: `0 0 8px ${activity.color}`
                                    }}></div>
                                    <div style={{ fontSize: '1.3rem' }}>{activity.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{activity.text}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{activity.time}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div >

            {/* Quick Actions */}
            < motion.div
                initial={{ opacity: 0, y: 20 }
                }
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ marginTop: 30 }}
            >
                <h3 style={{ marginBottom: 20, fontSize: '1.3rem' }}>⚡ Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
                    <button className="primary-btn" onClick={() => navigate('/agent/requests')}>
                        📋 View All Requests
                    </button>
                    <button className="secondary-btn" onClick={() => navigate('/agent/consultations')}>
                        💬 My Consultations
                    </button>
                    <button className="secondary-btn" onClick={() => navigate('/agent/performance')}>
                        📊 Performance Analytics
                    </button>
                    <button className="secondary-btn" onClick={() => navigate('/plans')}>
                        🛡️ Browse Policies
                    </button>
                </div>
            </motion.div >
        </div >
    );
}
