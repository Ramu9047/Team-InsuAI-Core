import React, { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import NotificationCenter from '../components/NotificationCenter';
import KPICard from '../components/KPICard';

// ─────────────────────────────────────────────
// SHARED UI PRIMITIVES
// ─────────────────────────────────────────────
const SectionHeader = ({ icon, title, children }) => (
    <div style={{
        padding: '18px 26px',
        background: 'rgba(255,255,255,0.025)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            {icon} {title}
        </h3>
        {children}
    </div>
);

const StatusBadge = ({ status }) => {
    const cfg = {
        ACTIVE: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Active' },
        SUSPENDED: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Suspended' },
        DRAFT: { bg: 'rgba(107,114,128,0.2)', color: '#9ca3af', label: 'Draft' },
        INACTIVE: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Inactive' },
        APPROVED: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Approved' },
        PENDING: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Pending' },
    };
    const c = cfg[status] || cfg.PENDING;
    return (
        <span style={{
            padding: '4px 10px', borderRadius: 20, fontSize: '0.76rem', fontWeight: 700,
            background: c.bg, color: c.color, border: `1px solid ${c.color}30`
        }}>{c.label}</span>
    );
};

const ActionBtn = ({ children, variant = 'ghost', onClick, style: s = {} }) => {
    const styles = {
        ghost: { border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-muted)', background: 'transparent' },
        primary: { border: '1px solid #6366f1', color: '#a5b4fc', background: 'rgba(99,102,241,0.15)' },
        danger: { border: '1px solid rgba(239,68,68,0.5)', color: '#f87171', background: 'rgba(239,68,68,0.1)' },
        success: { border: '1px solid rgba(16,185,129,0.5)', color: '#34d399', background: 'rgba(16,185,129,0.1)' },
        warning: { border: '1px solid rgba(245,158,11,0.5)', color: '#fbbf24', background: 'rgba(245,158,11,0.1)' },
        blue: { border: '1px solid rgba(59,130,246,0.5)', color: '#93c5fd', background: 'rgba(59,130,246,0.1)' },
    };
    return (
        <button onClick={onClick} style={{
            padding: '5px 11px', borderRadius: 8, fontSize: '0.77rem',
            fontWeight: 600, cursor: 'pointer', ...styles[variant], ...s, transition: 'all 0.2s'
        }}>{children}</button>
    );
};

const ProgressBar = ({ value, max, color }) => (
    <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden', height: 5 }}>
        <motion.div
            initial={{ width: 0 }} animate={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ height: '100%', background: color, borderRadius: 4 }}
        />
    </div>
);

const ModalInput = ({ ...props }) => (
    <input {...props} style={{
        padding: '10px 14px', borderRadius: 8, width: '100%', boxSizing: 'border-box',
        border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)',
        color: 'white', fontSize: '0.9rem', outline: 'none', ...props.style
    }} />
);

const InsightCard = ({ type, title, text }) => {
    const cfg = {
        warning: { icon: '⚠️', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
        success: { icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
        suggestion: { icon: '💡', color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)' },
    };
    const c = cfg[type] || cfg.suggestion;
    return (
        <div style={{
            padding: '12px 16px', borderRadius: 10,
            background: c.bg, border: `1px solid ${c.border}`,
            display: 'flex', gap: 12, alignItems: 'flex-start'
        }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{c.icon}</span>
            <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: c.color, marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{text}</div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function CompanyDashboard() {
    const { notify } = useNotification();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [companyName, setCompanyName] = useState('');
    const [salesData, setSalesData] = useState([]);
    const [agents, setAgents] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [claims, setClaims] = useState([]);
    const [aiInsights, setAiInsights] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Modals
    const [policyModal, setPolicyModal] = useState({ isOpen: false, mode: 'add', policy: null });
    const [policyForm, setPolicyForm] = useState({ name: '', type: 'Health', premium: '', coverage: '', description: '', tenure: 1, category: 'Personal' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, policyId: null });
    const [agentModal, setAgentModal] = useState({ isOpen: false });
    const [agentForm, setAgentForm] = useState({ name: '', email: '', password: '' });

    // ── Fetch (resilient: individual failures don't crash the dashboard) ─────
    const fetchData = useCallback(() => {
        setLoading(true);
        setLoadError(false);

        Promise.allSettled([
            api.get('/company/dashboard'),   // [0]
            api.get('/company/agents'),       // [1]
            api.get('/company/policies'),     // [2]
            api.get('/company/claims'),       // [3]
            api.get('/company/audit-logs'),   // [4]
        ]).then(([dashR, agentsR, policiesR, claimsR, logsR]) => {
            // ── Dashboard stats (CRITICAL — if this fails, show error) ──
            if (dashR.status === 'fulfilled') {
                const d = dashR.value.data || {};
                const m = d.metrics || {};
                setStats(m);
                setCompanyName(m.name || 'Your Company');
                setAiInsights(d.aiInsights || []);
                const rawSales = d.salesData || [];
                setSalesData(rawSales.length > 0 ? rawSales : [
                    { name: 'Jan', profit: 4000 }, { name: 'Feb', profit: 3000 },
                    { name: 'Mar', profit: 5000 }, { name: 'Apr', profit: 4500 },
                    { name: 'May', profit: 6200 }, { name: 'Jun', profit: 7100 }
                ]);
            } else {
                const err = dashR.reason;
                const status = err?.response?.status;
                const backendMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message;
                console.error(`[CompanyDashboard] /company/dashboard failed — HTTP ${status}:`, backendMsg, err);
                setLoadError(true);
                let displayMsg = 'Could not load metrics.';
                if (status === 403) {
                    displayMsg = 'Access denied (403). Check your role.';
                    notify('Access denied. Your account may not have company admin privileges.', 'error');
                } else if (status === 401) {
                    displayMsg = 'Session expired. Please log in again.';
                    notify('Session expired. Please log in again.', 'error');
                } else if (!status) {
                    displayMsg = 'Backend unreachable — check if the server is running.';
                    notify('Backend unreachable. Please ensure the server is running.', 'error');
                } else {
                    displayMsg = `Server error (${status}): ${backendMsg || 'Check backend logs.'}`;
                    notify(`Dashboard error (${status}): ${backendMsg || 'Could not load metrics.'}`, 'error');
                }
                setErrorMsg(displayMsg);
            }

            // ── Agents (non-critical) ──
            if (agentsR.status === 'fulfilled') {
                setAgents(Array.isArray(agentsR.value.data) ? agentsR.value.data : []);
            }

            // ── Policies (non-critical) ──
            if (policiesR.status === 'fulfilled') {
                setPolicies(Array.isArray(policiesR.value.data) ? policiesR.value.data : []);
            }

            // ── Claims (non-critical) ──
            if (claimsR.status === 'fulfilled') {
                const raw = Array.isArray(claimsR.value.data) ? claimsR.value.data : [];
                setClaims(raw.map(c => ({
                    id: `C-${c.id}`,
                    policyHolder: c.user?.name || 'Unknown',
                    type: c.claimType || c.policyName || 'General',
                    status: c.status || 'PENDING',
                    date: c.date ? new Date(c.date).toLocaleDateString('en-IN') : 'N/A',
                    amount: `₹${(c.amount || 0).toLocaleString('en-IN')}`
                })));
            }

            // ── Audit logs (non-critical) ──
            if (logsR.status === 'fulfilled') {
                setAuditLogs(Array.isArray(logsR.value.data) ? logsR.value.data.slice(0, 10) : []);
            }
        }).finally(() => setLoading(false));
    }, [notify]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    // ── Policy Handlers ───────────────────────
    const handlePolicySubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...policyForm, premium: parseFloat(policyForm.premium), coverage: parseFloat(policyForm.coverage) };
            if (policyModal.mode === 'add') {
                await api.post('/company/policies', payload);
                notify("Policy created", "success");
            } else {
                await api.put(`/company/policies/${policyModal.policy.id}`, payload);
                notify("Policy updated", "success");
            }
            setPolicyModal({ isOpen: false, mode: 'add', policy: null });
            fetchData();
        } catch (err) {
            notify(err.response?.data?.error || "Operation failed", "error");
        }
    };

    const handleAddAgent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/company/agents', agentForm);
            notify("Agent added successfully", "success");
            setAgentModal({ isOpen: false });
            setAgentForm({ name: '', email: '', password: '' });
            fetchData();
        } catch (err) {
            notify(err.response?.data?.error || "Failed", "error");
        }
    };

    const handleToggleStatus = async () => {
        try {
            const p = policies.find(x => x.id === confirmModal.policyId);
            const newStatus = p?.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
            await api.put(`/company/policies/${confirmModal.policyId}`, { ...p, status: newStatus });
            notify(`Policy ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'}`, "success");
            setConfirmModal({ isOpen: false, action: null, policyId: null });
            fetchData();
        } catch (err) {
            notify("Failed to update status", "error");
        }
    };

    const handleDeletePolicy = async () => {
        try {
            await api.delete(`/company/policies/${confirmModal.policyId}`);
            notify("Policy deleted", "success");
            setConfirmModal({ isOpen: false, action: null, policyId: null });
            fetchData();
        } catch (err) {
            notify("Failed to delete", "error");
        }
    };

    const openEditModal = (p) => {
        setPolicyForm({ name: p.name, type: p.type, premium: p.premium, coverage: p.coverage, description: p.description || '', tenure: p.tenure || 1, category: p.category || 'Personal' });
        setPolicyModal({ isOpen: true, mode: 'edit', policy: p });
    };

    const openAddModal = () => {
        setPolicyForm({ name: '', type: 'Health', premium: '', coverage: '', description: '', tenure: 1, category: 'Personal' });
        setPolicyModal({ isOpen: true, mode: 'add', policy: null });
    };

    const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    // ── Loading Skeleton ───────────────────────
    if (loading && !stats) return (
        <div style={{ padding: '36px 40px', maxWidth: 1700, margin: '0 auto' }}>
            {/* Header skeleton */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 36 }}>
                <div>
                    <div style={{ height: 36, width: 280, borderRadius: 8, background: 'rgba(255,255,255,0.07)', marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <div style={{ height: 16, width: 420, borderRadius: 6, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ height: 36, width: 130, borderRadius: 20, background: 'rgba(255,255,255,0.07)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <div style={{ height: 36, width: 120, borderRadius: 8, background: 'rgba(255,255,255,0.07)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
            </div>
            {/* KPI card skeletons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 18, marginBottom: 36 }}>
                {[...Array(6)].map((_, i) => (
                    <div key={i} style={{
                        height: 120, borderRadius: 16, background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite'
                    }} />
                ))}
            </div>
            {/* Section skeletons */}
            {[...Array(3)].map((_, i) => (
                <div key={i} style={{
                    height: 200, borderRadius: 16, background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24,
                    animation: 'pulse 1.5s ease-in-out infinite'
                }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        </div>
    );

    // ── Critical-data error banner (shown inline, doesn't block UX) ──────────
    const ErrorBanner = () => loadError ? (
        <div style={{
            marginBottom: 24, padding: '14px 20px', borderRadius: 12,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                <div>
                    <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.9rem' }}>Dashboard metrics failed to load</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{errorMsg || 'KPI data may be unavailable. Other sections still loaded.'}</div>
                </div>
            </div>
            <button onClick={fetchData} style={{
                padding: '8px 18px', borderRadius: 8, background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.4)', color: '#f87171',
                fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer'
            }}>↻ Retry</button>
        </div>
    ) : null;

    // ── Derived Data ───────────────────────────
    const kpis = [
        {
            label: 'Company Users', value: (stats?.totalUsers ?? 0).toLocaleString(),
            icon: '👥', color: '#3b82f6', action: () => navigate('/users')
        },
        {
            label: 'Company Agents', value: (stats?.totalAgents ?? agents.length).toLocaleString(),
            icon: '🧑‍💼', color: '#8b5cf6', action: () => navigate('/agents-list')
        },
        {
            label: 'Policies Issued', value: (stats?.policiesSold ?? 0).toLocaleString(),
            icon: '📄', color: '#10b981', action: () => navigate('/issued-policies')
        },
        {
            label: 'Revenue',
            value: `₹${((stats?.revenue ?? 0) / 100000).toFixed(1)}L`,
            icon: '💰', color: '#f59e0b', action: () => navigate('/analytics')
        },
        {
            label: 'Fraud Alerts', value: stats?.fraudAlerts ?? claims.filter(c => c.status === 'FLAGGED').length,
            icon: '⚠️', color: '#ef4444', action: () => navigate('/exceptions')
        },

        {
            label: 'User Feedback', value: (stats?.totalFeedback ?? 0).toLocaleString(),
            icon: '💬', color: '#06b6d4', action: () => navigate('/feedback-list')
        },
    ];

    const companyFeedback = [
        { user: 'Arjun', agent: 'Rahul', policy: 'Health Secure', type: 'Complaint', rating: 2, severity: 'high' },
        { user: 'Priya', agent: 'Meena', policy: 'Term Life Plus', type: 'Suggestion', rating: 4, severity: 'low' },
        { user: 'Suresh', agent: 'Karthik', policy: 'Family Shield', type: 'Praise', rating: 5, severity: 'low' },
        { user: 'Kavya', agent: 'Rahul', policy: 'Health Secure', type: 'Complaint', rating: 2, severity: 'high' },
        { user: 'Deepak', agent: 'Meena', policy: 'Term Life Plus', type: 'Suggestion', rating: 3, severity: 'medium' },
    ];

    const feedbackAnalytics = [
        { label: 'Avg Agent Rating', value: '4.5 ⭐', color: '#f59e0b' },
        { label: 'Complaint Rate', value: '3.2%', color: '#ef4444' },
        { label: 'Policy Clarity Score', value: '82%', color: '#10b981' },
    ];

    const feedbackTypeColor = {
        Complaint: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.25)' },
        Suggestion: { bg: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: 'rgba(99,102,241,0.25)' },
        Praise: { bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.25)' },
    };

    const funnelData = [
        { name: 'Users', value: stats?.totalUsers || 800 },
        { name: 'Appts', value: Math.round((stats?.totalUsers || 800) * 0.65) },
        { name: 'Consulted', value: Math.round((stats?.totalUsers || 800) * 0.60) },
        { name: 'Approved', value: Math.round((stats?.totalUsers || 800) * 0.56) },
        { name: 'Issued', value: stats?.policiesSold || 430 },
    ];

    const riskData = [
        { name: 'Low', value: 70, color: '#10b981' },
        { name: 'Medium', value: 22, color: '#f59e0b' },
        { name: 'High', value: 8, color: '#ef4444' },
    ];

    const mockAuditLogs = auditLogs.length > 0 ? auditLogs : [
        { id: 1, action: 'Policy updated', details: 'Term Life Plus', timestamp: new Date().toISOString() },
        { id: 2, action: 'Agent SLA Breach', details: 'Meena exceeded SLA by 5 mins', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: 3, action: 'AI rule adjusted', details: 'Fraud threshold updated to 0.75', timestamp: new Date(Date.now() - 7200000).toISOString() },
        { id: 4, action: 'Compliance report generated', details: 'Q4 2025 report', timestamp: new Date(Date.now() - 86400000).toISOString() },
    ];

    const defaultInsights = [
        { type: 'success', title: 'High Conversion Segment', text: 'Flexible premium policies convert 23% higher than fixed plans.' },
        { type: 'warning', title: 'Family Shield Rejection', text: 'High rejection rate in Family Shield due to low dependents count.' },
        { type: 'suggestion', title: 'Best Performing Segment', text: 'Age group 22–35 shows 40% higher engagement. Target aggressively.' },
    ];

    const displayInsights = aiInsights.length > 0
        ? aiInsights
        : defaultInsights;

    return (
        <div style={{ padding: '36px 40px', maxWidth: 1700, margin: '0 auto', color: 'var(--text-main)' }}>

            <ErrorBanner />

            {/* ═══════════════════════════════════════
                🏢 COMPANY HEADER
            ═══════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: -18 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    marginBottom: 36,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: 16
                }}
            >
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                        <span style={{ fontSize: '2rem' }}>🏢</span>
                        <h1 className="text-gradient" style={{ margin: 0, fontSize: '2.1rem', fontWeight: 800 }}>
                            {companyName}
                        </h1>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        <span>📜 Compliance Status: <strong style={{ color: '#10b981' }}>✅ Approved</strong></span>
                        <span>🕒 Last Sync: Just now</span>
                        <span>📅 {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        padding: '7px 16px', background: 'rgba(16,185,129,0.1)',
                        borderRadius: 24, border: '1px solid rgba(16,185,129,0.3)',
                        color: '#10b981', fontWeight: 700, fontSize: '0.83rem'
                    }}>
                        🟢 System Health: Stable
                    </div>
                    <NotificationCenter userRole="COMPANY" />
                    <button onClick={openAddModal} className="primary-btn" style={{ padding: '9px 18px', fontWeight: 700 }}>
                        + Add Policy
                    </button>
                    <button onClick={() => setAgentModal({ isOpen: true })} className="secondary-btn" style={{ padding: '9px 18px', color: 'white', borderColor: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>
                        + Invite Agent
                    </button>
                </div>
            </motion.div>

            {/* ── Company KPI Snapshot ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 18, marginBottom: 36 }}>
                {kpis.map((kpi, idx) => (
                    <KPICard
                        key={idx}
                        icon={kpi.icon}
                        label={kpi.label}
                        value={kpi.value}
                        color={kpi.color}
                        onClick={kpi.action}
                        linkText={`View ${kpi.label.split(' ').pop()} →`}
                        idx={idx}
                    />
                ))}
            </div>

            {/* ═══════════════════════════════════════
                📄 POLICY MANAGEMENT PANEL
            ═══════════════════════════════════════ */}
            <motion.div
                id="policy-panel"
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 36, padding: 0, overflow: 'hidden' }}
            >
                <SectionHeader icon="📄" title="Policy Management Panel">
                    <button onClick={openAddModal} style={{
                        background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)',
                        color: '#a5b4fc', padding: '7px 16px', borderRadius: 8, cursor: 'pointer',
                        fontWeight: 600, fontSize: '0.85rem'
                    }}>
                        + New Policy
                    </button>
                </SectionHeader>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.15)' }}>
                                {['Policy Name', 'Type', 'Status', 'Premium', 'Coverage', 'Risk', 'Actions'].map((h, i) => (
                                    <th key={i} style={{
                                        padding: '13px 20px', textAlign: i === 6 ? 'right' : 'left',
                                        color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem',
                                        textTransform: 'uppercase', letterSpacing: '0.04em',
                                        borderBottom: '1px solid rgba(255,255,255,0.07)'
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {policies.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', opacity: 0.6 }}>
                                        No policies yet. Click <strong>+ New Policy</strong> to add one.
                                    </td>
                                </tr>
                            ) : policies.map((p, i) => {
                                const riskColor = p.premium > 5000 ? '#ef4444' : p.premium > 2000 ? '#f59e0b' : '#10b981';
                                const riskLabel = p.premium > 5000 ? '🔴 High' : p.premium > 2000 ? '🟡 Med' : '🟢 Low';
                                return (
                                    <tr
                                        key={p.id}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '15px 20px', fontWeight: 700 }}>{p.name}</td>
                                        <td style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>{p.type}</td>
                                        <td style={{ padding: '15px 20px' }}><StatusBadge status={p.status || 'ACTIVE'} /></td>
                                        <td style={{ padding: '15px 20px', color: '#f59e0b', fontWeight: 700 }}>₹{(p.premium || 0).toLocaleString('en-IN')}</td>
                                        <td style={{ padding: '15px 20px', fontSize: '0.88rem' }}>₹{(p.coverage || 0).toLocaleString('en-IN')}</td>
                                        <td style={{ padding: '15px 20px', color: riskColor, fontWeight: 600 }}>{riskLabel}</td>
                                        <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                <ActionBtn variant="ghost" onClick={() => openEditModal(p)}>Edit</ActionBtn>
                                                <ActionBtn
                                                    variant={p.status === 'ACTIVE' ? 'danger' : 'success'}
                                                    onClick={() => setConfirmModal({ isOpen: true, action: 'toggle', policyId: p.id })}
                                                >
                                                    {p.status === 'ACTIVE' ? 'Disable' : 'Activate'}
                                                </ActionBtn>
                                                <ActionBtn variant="blue" onClick={() => { }}>Performance</ActionBtn>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* ═══════════════════════════════════════
                👨‍💼 AGENT PERFORMANCE MONITOR  +  🔄 CONVERSION FUNNEL
            ═══════════════════════════════════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24, marginBottom: 36 }}>

                {/* 👨‍💼 Agent Performance Monitor */}
                <motion.div
                    id="agent-monitor"
                    className="card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ padding: 0, overflow: 'hidden' }}
                >
                    <SectionHeader icon="👨‍💼" title="Agent Performance Monitor">
                        <div style={{ display: 'flex', gap: 8 }}>
                            <ActionBtn variant="ghost" onClick={() => navigate('/agents-list')}>Agent Reports</ActionBtn>
                            <ActionBtn variant="primary" onClick={() => setAgentModal({ isOpen: true })}>+ Invite Agent</ActionBtn>
                        </div>
                    </SectionHeader>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(0,0,0,0.15)' }}>
                                    {['Agent', 'Rating', 'Approvals', 'Rejections', 'Avg Time', 'Status'].map((h, i) => (
                                        <th key={i} style={{
                                            padding: '12px 18px', textAlign: 'left',
                                            color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.77rem',
                                            textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.07)'
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {agents.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ padding: 30, textAlign: 'center', opacity: 0.5 }}>
                                            No agents yet. Invite one to get started.
                                        </td>
                                    </tr>
                                ) : agents.map((agent, i) => (
                                    <tr
                                        key={i}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '14px 18px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 34, height: 34, borderRadius: '50%',
                                                    background: `hsl(${(i * 60) % 360}, 60%, 50%)`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', fontWeight: 800, fontSize: '0.88rem', flexShrink: 0
                                                }}>{agent.name?.charAt(0) || '?'}</div>
                                                <span style={{ fontWeight: 700 }}>{agent.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 18px', color: '#f59e0b', fontWeight: 700 }}>
                                            ⭐ {agent.rating?.toFixed(1) || '4.5'}
                                        </td>
                                        <td style={{ padding: '14px 18px', color: '#10b981', fontWeight: 700 }}>
                                            {agent.approvals ?? 0}
                                        </td>
                                        <td style={{ padding: '14px 18px', color: '#ef4444', fontWeight: 700 }}>
                                            {agent.rejections ?? 0}
                                        </td>
                                        <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            {agent.avgTime || '15 mins'}
                                        </td>
                                        <td style={{ padding: '14px 18px' }}>
                                            <span style={{
                                                padding: '3px 10px', borderRadius: 16, fontSize: '0.76rem', fontWeight: 700,
                                                background: agent.status === 'Online' ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)',
                                                color: agent.status === 'Online' ? '#10b981' : '#6b7280',
                                                display: 'flex', alignItems: 'center', gap: 5, width: 'fit-content',
                                                border: `1px solid ${agent.status === 'Online' ? 'rgba(16,185,129,0.3)' : 'rgba(107,114,128,0.3)'}`
                                            }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: agent.status === 'Online' ? '#10b981' : '#6b7280' }} />
                                                {agent.status || 'Offline'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* 🔄 Company Conversion Funnel */}
                <motion.div
                    id="conversion-funnel"
                    className="card"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ padding: 0, overflow: 'hidden' }}
                >
                    <SectionHeader icon="🔄" title="Company Conversion Funnel" />
                    <div style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                            {funnelData.map((step, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{step.name}</span>
                                        <span style={{ fontWeight: 800, color: '#6366f1' }}>{step.value.toLocaleString()}</span>
                                    </div>
                                    <ProgressBar value={step.value} max={funnelData[0].value} color={`hsl(${239 - i * 12}, 70%, ${60 - i * 4}%)`} />
                                </div>
                            ))}
                        </div>
                        <div style={{ height: 160 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={funnelData} barCategoryGap="25%">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                                    <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
                                    <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {funnelData.map((_, i) => (
                                            <Cell key={i} fill={`hsl(${239 - i * 12}, 70%, ${60 - i * 4}%)`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ═══════════════════════════════════════
                💬 COMPANY FEEDBACK PANEL
            ═══════════════════════════════════════ */}
            <motion.div
                id="feedback-panel"
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 36, padding: 0, overflow: 'hidden' }}
            >
                <SectionHeader icon="💬" title="Company Feedback & Experience Panel">
                    <div style={{ display: 'flex', gap: 8 }}>
                        <ActionBtn variant="primary" onClick={() => navigate('/feedback-list')}>View All Feedback</ActionBtn>
                        <ActionBtn variant="danger" onClick={() => navigate('/exceptions')}>Escalate to Super Admin</ActionBtn>
                    </div>
                </SectionHeader>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 0 }}>

                    {/* Feedback Table */}
                    <div style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ overflowX: 'auto', maxHeight: 320, overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(0,0,0,0.15)' }}>
                                        {['User', 'Agent', 'Policy', 'Type', 'Rating', 'Actions'].map((h, i) => (
                                            <th key={i} style={{
                                                padding: '12px 18px', textAlign: 'left',
                                                color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.77rem',
                                                textTransform: 'uppercase', letterSpacing: '0.04em',
                                                borderBottom: '1px solid rgba(255,255,255,0.07)',
                                                position: 'sticky', top: 0, background: '#0f172a', zIndex: 1
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {companyFeedback.map((fb, i) => (
                                        <tr
                                            key={i}
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '13px 18px', fontWeight: 700 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{
                                                        width: 28, height: 28, borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: 'white', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0
                                                    }}>{fb.user.charAt(0)}</div>
                                                    {fb.user}
                                                </div>
                                            </td>
                                            <td style={{ padding: '13px 18px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>{fb.agent}</td>
                                            <td style={{ padding: '13px 18px', fontSize: '0.88rem' }}>{fb.policy}</td>
                                            <td style={{ padding: '13px 18px' }}>
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: 12, fontSize: '0.76rem', fontWeight: 700,
                                                    background: (feedbackTypeColor[fb.type] || feedbackTypeColor.Praise).bg,
                                                    color: (feedbackTypeColor[fb.type] || feedbackTypeColor.Praise).color,
                                                    border: `1px solid ${(feedbackTypeColor[fb.type] || feedbackTypeColor.Praise).border}`
                                                }}>{fb.type}</span>
                                            </td>
                                            <td style={{ padding: '13px 18px' }}>
                                                <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1rem' }}>
                                                    {'\u2605'.repeat(fb.rating)}{'\u2606'.repeat(5 - fb.rating)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '13px 18px' }}>
                                                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                                    {fb.type === 'Complaint' && (
                                                        <>
                                                            <ActionBtn variant="danger" onClick={() => navigate('/feedback-list')}>Investigate</ActionBtn>
                                                            <ActionBtn variant="warning" onClick={() => navigate('/agents-list')}>Flag Agent</ActionBtn>
                                                        </>
                                                    )}
                                                    {fb.type === 'Suggestion' && (
                                                        <ActionBtn variant="primary" onClick={() => navigate('/feedback-list')}>Review</ActionBtn>
                                                    )}
                                                    {fb.type === 'Praise' && (
                                                        <ActionBtn variant="success" onClick={() => navigate('/agents-list')}>Highlight</ActionBtn>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Feedback Analytics + Action Controls */}
                    <div style={{ padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* Analytics */}
                        <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 14 }}>
                                📊 Feedback Analytics
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {feedbackAnalytics.map((fa, i) => (
                                    <div key={i} style={{
                                        padding: '14px 16px', borderRadius: 10,
                                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{fa.label}</span>
                                        <span style={{ fontWeight: 800, fontSize: '1rem', color: fa.color }}>{fa.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Controls */}
                        <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 14 }}>
                                🔧 Action Controls
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { label: '🚩 Flag Agent', variant: 'danger' },
                                    { label: '📌 Request Clarification', variant: 'warning' },
                                    { label: '📤 Escalate to Super Admin', variant: 'primary' },
                                    { label: '✏️ Improve Policy Description', variant: 'ghost' },
                                ].map((ctrl, i) => (
                                    <button key={i} onClick={() => {
                                        if (ctrl.label.includes('Escalate')) navigate('/exceptions');
                                        else if (ctrl.label.includes('Flag')) navigate('/agents-list');
                                        else if (ctrl.label.includes('Clarification')) navigate('/feedback-list');
                                        else navigate('/analytics');
                                    }} style={{
                                        padding: '10px 14px', borderRadius: 8, width: '100%', textAlign: 'left',
                                        fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)',
                                        transition: 'all 0.2s'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    >
                                        {ctrl.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ═══════════════════════════════════════
                📈 SALES TREND  +  🚨 FRAUD DASHBOARD  +  🤖 AI INSIGHTS
            ═══════════════════════════════════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 24, marginBottom: 36 }}>

                {/* 📈 Sales & Revenue Trend */}
                <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 0, overflow: 'hidden' }}>
                    <SectionHeader icon="📈" title="Sales & Revenue Trend" />
                    <div style={{ padding: '20px 24px' }}>
                        <div style={{ height: 220 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                                    <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                                    <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                    <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 7 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>

                {/* 🚨 Company Fraud & Risk */}
                <motion.div id="fraud-dashboard" className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 0, overflow: 'hidden' }}>
                    <SectionHeader icon="🚨" title="Fraud & Risk" />
                    <div style={{ padding: '20px 20px' }}>
                        <div style={{ height: 140 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={riskData} cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={3} dataKey="value">
                                        {riskData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                            {riskData.map((r, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', marginBottom: 4 }}>
                                        <span style={{ color: r.color, fontWeight: 600 }}>
                                            {i === 0 ? '🟢' : i === 1 ? '🟡' : '🔴'} {r.name}
                                        </span>
                                        <span style={{ fontWeight: 800 }}>{r.value}%</span>
                                    </div>
                                    <ProgressBar value={r.value} max={100} color={r.color} />
                                </div>
                            ))}
                        </div>
                        <ActionBtn variant="danger" style={{ width: '100%', textAlign: 'center' }} onClick={() => scrollTo('recent-claims')}>
                            View High-Risk Claims
                        </ActionBtn>
                    </div>
                </motion.div>

                {/* 🤖 AI Insights */}
                <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 0, overflow: 'hidden' }}>
                    <SectionHeader icon="🤖" title="AI Insights" />
                    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {displayInsights.map((ins, i) => (
                            <InsightCard key={i} type={ins.type} title={ins.title} text={ins.text} />
                        ))}
                        <ActionBtn variant="primary" style={{ marginTop: 4, textAlign: 'center' }} onClick={() => navigate('/analytics')}>
                            Improve Policy Strategy →
                        </ActionBtn>
                    </div>
                </motion.div>
            </div>

            {/* ═══════════════════════════════════════
                ⚠️ RECENT CLAIMS  +  🧾 AUDIT LOG
            ═══════════════════════════════════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24, marginBottom: 12 }}>

                {/* ⚠️ Recent Claims */}
                <motion.div
                    id="recent-claims"
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: 0, overflow: 'hidden' }}
                >
                    <SectionHeader icon="⚠️" title="Recent Claims & Requests" />
                    <div style={{ overflowX: 'auto', maxHeight: 280, overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(0,0,0,0.15)' }}>
                                    {['Claim ID', 'Policy Holder', 'Type', 'Status', 'Date', 'Amount'].map((h, i) => (
                                        <th key={i} style={{
                                            padding: '11px 18px', textAlign: 'left',
                                            color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.77rem',
                                            textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.07)',
                                            position: 'sticky', top: 0, background: '#0f172a'
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {claims.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ padding: 30, textAlign: 'center', opacity: 0.5 }}>
                                            No claims found for this company's policies.
                                        </td>
                                    </tr>
                                ) : claims.map((c, i) => {
                                    const statusClr = {
                                        APPROVED: '#10b981', PENDING: '#f59e0b', Pending: '#f59e0b',
                                        REJECTED: '#ef4444', Verification: '#3b82f6'
                                    };
                                    return (
                                        <tr
                                            key={i}
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '13px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#6366f1' }}>{c.id}</td>
                                            <td style={{ padding: '13px 18px', fontWeight: 600 }}>{c.policyHolder}</td>
                                            <td style={{ padding: '13px 18px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.type}</td>
                                            <td style={{ padding: '13px 18px' }}>
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: 12, fontSize: '0.77rem', fontWeight: 700,
                                                    background: `${(statusClr[c.status] || '#6b7280')}20`,
                                                    color: statusClr[c.status] || '#6b7280',
                                                    border: `1px solid ${(statusClr[c.status] || '#6b7280')}30`
                                                }}>{c.status}</span>
                                            </td>
                                            <td style={{ padding: '13px 18px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.date}</td>
                                            <td style={{ padding: '13px 18px', fontWeight: 800, color: '#f59e0b' }}>{c.amount}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* 🧾 Audit & Compliance Log */}
                <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 0, overflow: 'hidden' }}>
                    <SectionHeader icon="🧾" title="Audit & Compliance Log" />
                    <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                        {mockAuditLogs.map((log, i) => (
                            <div
                                key={log.id || i}
                                style={{
                                    padding: '13px 20px',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    transition: 'background 0.15s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{ color: '#6366f1', fontWeight: 700 }}>•</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{log.action}</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: 16 }}>
                                    {log.details}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: 16, marginTop: 4, fontFamily: 'monospace', opacity: 0.7 }}>
                                    {new Date(log.timestamp).toLocaleString('en-IN')}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ═══════════════════════════════════════
                MODALS
            ═══════════════════════════════════════ */}

            {/* Policy Modal */}
            <Modal
                isOpen={policyModal.isOpen}
                onClose={() => setPolicyModal({ isOpen: false, mode: 'add', policy: null })}
                title={`${policyModal.mode === 'add' ? '➕ Add New' : '✏️ Edit'} Policy`}
            >
                <form onSubmit={handlePolicySubmit} style={{ display: 'grid', gap: 12, color: 'var(--text-main)' }}>
                    <ModalInput placeholder="Policy Name" value={policyForm.name} onChange={e => setPolicyForm({ ...policyForm, name: e.target.value })} required />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <select value={policyForm.type} onChange={e => setPolicyForm({ ...policyForm, type: e.target.value })}
                            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: 'white', fontSize: '0.9rem' }}>
                            {['Health', 'Life', 'Car', 'Corporate', 'Travel'].map(t => (
                                <option key={t} value={t} style={{ background: '#1e293b' }}>{t}</option>
                            ))}
                        </select>
                        <select value={policyForm.category} onChange={e => setPolicyForm({ ...policyForm, category: e.target.value })}
                            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: 'white', fontSize: '0.9rem' }}>
                            {['Personal', 'Business'].map(c => (
                                <option key={c} value={c} style={{ background: '#1e293b' }}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <ModalInput type="number" placeholder="Premium (₹/month)" value={policyForm.premium} onChange={e => setPolicyForm({ ...policyForm, premium: e.target.value })} required />
                        <ModalInput type="number" placeholder="Coverage Amount (₹)" value={policyForm.coverage} onChange={e => setPolicyForm({ ...policyForm, coverage: e.target.value })} required />
                    </div>
                    <textarea
                        placeholder="Description"
                        value={policyForm.description}
                        onChange={e => setPolicyForm({ ...policyForm, description: e.target.value })}
                        rows={3}
                        style={{
                            padding: '10px 14px', borderRadius: 8, width: '100%', boxSizing: 'border-box',
                            border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)',
                            color: 'white', fontSize: '0.9rem', resize: 'vertical'
                        }}
                    />
                    <button type="submit" className="primary-btn" style={{ padding: '12px', fontWeight: 700 }}>
                        {policyModal.mode === 'add' ? 'Create Policy' : 'Update Policy'}
                    </button>
                </form>
            </Modal>

            {/* Add Agent Modal */}
            <Modal isOpen={agentModal.isOpen} onClose={() => setAgentModal({ isOpen: false })} title="➕ Invite New Agent">
                <form onSubmit={handleAddAgent} style={{ display: 'grid', gap: 12, color: 'var(--text-main)' }}>
                    <ModalInput placeholder="Agent Name" value={agentForm.name} onChange={e => setAgentForm({ ...agentForm, name: e.target.value })} required />
                    <ModalInput type="email" placeholder="Agent Email" value={agentForm.email} onChange={e => setAgentForm({ ...agentForm, email: e.target.value })} required />
                    <ModalInput type="password" placeholder="Temporary Password" value={agentForm.password} onChange={e => setAgentForm({ ...agentForm, password: e.target.value })} required />
                    <button type="submit" className="primary-btn" style={{ padding: '12px', fontWeight: 700, marginTop: 4 }}>
                        Create Agent Account
                    </button>
                </form>
            </Modal>

            {/* Confirm Toggle/Delete Modal */}
            <Modal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, action: null, policyId: null })}
                title="Confirm Action"
            >
                <div style={{ color: 'var(--text-main)', display: 'grid', gap: 16 }}>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                        Are you sure you want to{' '}
                        <strong style={{ color: 'white' }}>
                            {confirmModal.action === 'delete' ? 'permanently DELETE' : 'change the status of'}
                        </strong>{' '}
                        this policy?
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <ActionBtn variant="ghost" onClick={() => setConfirmModal({ isOpen: false, action: null, policyId: null })}>Cancel</ActionBtn>
                        <button
                            onClick={confirmModal.action === 'delete' ? handleDeletePolicy : handleToggleStatus}
                            className="primary-btn"
                            style={{ padding: '8px 20px', background: confirmModal.action === 'delete' ? '#ef4444' : '#6366f1' }}
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </Modal>

        </div>
    );
}
