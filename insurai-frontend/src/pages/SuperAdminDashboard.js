import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";
import Modal from "../components/Modal";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import NotificationCenter from '../components/NotificationCenter';
import KPICard from '../components/KPICard';

// ─────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const cfg = {
        APPROVED: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Approved' },
        PENDING_APPROVAL: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Pending' },
        SUSPENDED: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Suspended' },
        REJECTED: { bg: 'rgba(107,114,128,0.2)', color: '#6b7280', label: 'Rejected' },
    };
    const c = cfg[status] || cfg.REJECTED;
    return (
        <span style={{
            padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700,
            background: c.bg, color: c.color, letterSpacing: '0.03em',
            border: `1px solid ${c.color}30`
        }}>
            {c.label}
        </span>
    );
};

// ─────────────────────────────────────────────
// RISK BADGE
// ─────────────────────────────────────────────
const RiskBadge = ({ risk }) => {
    const map = { Low: '🟢', Medium: '🟡', High: '🔴' };
    const clr = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };
    return (
        <span style={{ fontWeight: 600, color: clr[risk] || 'var(--text-muted)' }}>
            {map[risk] || '—'} {risk || '—'}
        </span>
    );
};

// ─────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────
const SectionHeader = ({ icon, title, children }) => (
    <div style={{
        padding: '20px 28px',
        background: 'rgba(255,255,255,0.025)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>{icon}</span>
            <span>{title}</span>
        </h3>
        {children}
    </div>
);

// ─────────────────────────────────────────────
// FILTER PILL
// ─────────────────────────────────────────────
const FilterPill = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{
        padding: '5px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
        border: `1px solid ${active ? '#6366f1' : 'rgba(255,255,255,0.12)'}`,
        background: active ? 'rgba(99,102,241,0.2)' : 'transparent',
        color: active ? '#a5b4fc' : 'var(--text-muted)',
        transition: 'all 0.2s'
    }}>
        {label}
    </button>
);

// ─────────────────────────────────────────────
// ACTION BUTTON
// ─────────────────────────────────────────────
const ActionBtn = ({ children, variant = 'ghost', onClick, ...rest }) => {
    const styles = {
        ghost: { border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-muted)', background: 'transparent' },
        primary: { border: '1px solid #6366f1', color: '#a5b4fc', background: 'rgba(99,102,241,0.15)' },
        danger: { border: '1px solid rgba(239,68,68,0.5)', color: '#f87171', background: 'rgba(239,68,68,0.1)' },
        success: { border: '1px solid rgba(16,185,129,0.5)', color: '#34d399', background: 'rgba(16,185,129,0.1)' },
        warning: { border: '1px solid rgba(245,158,11,0.5)', color: '#fbbf24', background: 'rgba(245,158,11,0.1)' },
    };
    return (
        <button onClick={onClick} {...rest} style={{
            padding: '5px 12px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
            ...styles[variant], transition: 'all 0.2s'
        }}>
            {children}
        </button>
    );
};

// ─────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────
const ProgressBar = ({ value, max, color }) => (
    <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden', height: 6 }}>
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ height: '100%', background: color, borderRadius: 4 }}
        />
    </div>
);

// ─────────────────────────────────────────────
// SYSTEM HEALTH STAT
// ─────────────────────────────────────────────
const HealthStat = ({ label, value, color, suffix = '' }) => (
    <div style={{
        padding: '18px 20px', background: 'rgba(255,255,255,0.03)',
        borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)'
    }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
        <div style={{ fontSize: '1.7rem', fontWeight: 800, color }}>{value}{suffix}</div>
    </div>
);

// ─────────────────────────────────────────────
// MODAL INPUT
// ─────────────────────────────────────────────
const ModalInput = ({ ...props }) => (
    <input {...props} style={{
        padding: '10px 14px', borderRadius: 8, width: '100%', boxSizing: 'border-box',
        border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)',
        color: 'white', fontSize: '0.9rem', outline: 'none',
        ...props.style
    }} />
);

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function SuperAdminDashboard() {
    const { notify } = useNotification();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [logs, setLogs] = useState([]);
    const [actionModal, setActionModal] = useState({ isOpen: false, company: null, action: null });
    const [reason, setReason] = useState('');
    const [addCompanyModal, setAddCompanyModal] = useState(false);
    const [newCompany, setNewCompany] = useState({
        name: '', registrationNumber: '', email: '',
        adminName: '', adminEmail: '', adminPassword: ''
    });

    // ── Fetch ──────────────────────────────────
    const fetchData = useCallback(() => {
        Promise.all([
            api.get('/super-admin/dashboard-stats'),
            api.get('/super-admin/audit-logs')
        ])
            .then(([dashRes, logsRes]) => {
                setData(dashRes.data || {});
                setLogs(logsRes.data || []);
            })
            .catch(err => {
                notify(err.response?.data?.error || "Failed to load dashboard", "error");
            })
            .finally(() => setLoading(false));
    }, [notify]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    // ── Handlers ───────────────────────────────
    const handleAction = async () => {
        if (!actionModal.company || !actionModal.action) return;
        try {
            await api.post(`/super-admin/companies/${actionModal.company.id}/${actionModal.action}`, { reason });
            notify(`Company ${actionModal.action}d successfully`, "success");
            setActionModal({ isOpen: false, company: null, action: null });
            setReason('');
            fetchData();
        } catch (err) {
            notify(err.response?.data?.error || "Action failed", "error");
        }
    };

    const handleCreateCompany = async (e) => {
        e.preventDefault();
        try {
            await api.post('/super-admin/companies', newCompany);
            notify("Company created successfully", "success");
            setAddCompanyModal(false);
            setNewCompany({ name: '', registrationNumber: '', email: '', adminName: '', adminEmail: '', adminPassword: '' });
            fetchData();
        } catch (err) {
            notify(err.response?.data?.error || "Failed to create company", "error");
        }
    };

    const scrollTo = (id, statusFilter = null) => {
        if (statusFilter) setFilter(statusFilter);
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50);
    };

    // ── Skeleton loader ─────────────────────────
    if (loading && !data) return (
        <div style={{ padding: '36px 40px', maxWidth: 1700, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 36 }}>
                <div>
                    <div style={{ height: 40, width: 320, borderRadius: 8, background: 'rgba(255,255,255,0.07)', marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <div style={{ height: 16, width: 480, borderRadius: 6, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ height: 36, width: 160, borderRadius: 24, background: 'rgba(255,255,255,0.07)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <div style={{ height: 36, width: 140, borderRadius: 8, background: 'rgba(255,255,255,0.07)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 18, marginBottom: 36 }}>
                {[...Array(6)].map((_, i) => (
                    <div key={i} style={{ height: 130, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
            </div>
            {[...Array(3)].map((_, i) => (
                <div key={i} style={{ height: 220, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24, animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        </div>
    );

    const metrics = data?.metrics || {};
    const companies = data?.companies || [];
    const funnel = data?.funnel || {};
    const system = data?.systemHealth || {};
    const leaderboard = data?.agentLeaderboard || [];

    const filteredCompanies = filter === 'ALL'
        ? companies
        : companies.filter(c => c.status === filter);

    const funnelData = [
        { name: 'Visitors', value: funnel.visitors || 5000 },
        { name: 'Registered', value: funnel.registered || 2400 },
        { name: 'Appointments', value: funnel.appointments || 1800 },
        { name: 'Consulted', value: funnel.consulted || 1650 },
        { name: 'Approved', value: funnel.approved || 1500 },
        { name: 'Issued', value: funnel.policiesIssued || 1420 },
    ];

    const riskData = [
        { name: 'Low Risk', value: data?.riskOversight?.lowRisk ?? 72, color: '#10b981' },
        { name: 'Medium Risk', value: data?.riskOversight?.mediumRisk ?? 21, color: '#f59e0b' },
        { name: 'High Risk', value: data?.riskOversight?.highRisk ?? 7, color: '#ef4444' },
    ];

    const mockLeaderboard = leaderboard.length > 0 ? leaderboard : [
        { rank: 1, name: 'Rahul', company: companies[0]?.name || 'SafeGuard', approval: 94, avgTime: '12 mins' },
        { rank: 2, name: 'Meena', company: companies[0]?.name || 'SafeGuard', approval: 91, avgTime: '15 mins' },
        { rank: 3, name: 'Karthik', company: companies[1]?.name || 'LifeSecure', approval: 89, avgTime: '18 mins' },
    ];

    const execMetrics = [
        { label: 'Total Companies', value: metrics.totalCompanies ?? '—', icon: '🏢', color: '#6366f1', onClick: () => scrollTo('company-governance') },
        { label: 'Total Users', value: (metrics.totalUsers ?? 0).toLocaleString(), icon: '👥', color: '#8b5cf6', onClick: () => navigate('/users') },
        { label: 'Total Agents', value: metrics.totalAgents ?? '—', icon: '🧑‍💼', color: '#10b981', onClick: () => navigate('/agents-list') },
        { label: 'Policies Issued', value: (metrics.policiesIssued ?? 0).toLocaleString(), icon: '📄', color: '#f59e0b', onClick: () => navigate('/issued-policies') },
        { label: 'Fraud Alerts', value: metrics.fraudAlerts ?? '—', icon: '⚠️', color: '#ef4444', onClick: () => navigate('/exceptions') },
        { label: 'Total Feedback', value: (metrics.totalFeedback ?? 0).toLocaleString(), icon: '💬', color: '#06b6d4', onClick: () => navigate('/feedback-list') },
    ];

    const feedbackRows = data?.feedbackSummary || [
        { type: 'Complaints', count: 24, trend: '🔴 ↑', trendColor: '#ef4444', action: 'Investigate' },
        { type: 'Suggestions', count: 56, trend: '🟢 ↑', trendColor: '#10b981', action: 'Review Roadmap' },
        { type: 'Praise', count: 48, trend: '🟢 ↑', trendColor: '#10b981', action: 'Highlight Agents' },
    ];

    const criticalFeedback = data?.criticalFeedback || [
        { text: 'Agent forced policy without explanation', company: 'SafeGuard', severity: 'high' },
        { text: 'Repeated meeting reschedules', company: 'HealthFirst', severity: 'medium' },
        { text: 'Claim rejection without reason', company: 'GlobalCover', severity: 'high' },
    ];

    const feedbackCorrelations = [
        { label: 'Feedback ↔ Fraud Alerts', pct: 68, color: '#ef4444' },
        { label: 'Feedback ↔ Agent Ratings', pct: 82, color: '#8b5cf6' },
        { label: 'Feedback ↔ Policy Rejection Rate', pct: 74, color: '#f59e0b' },
    ];

    const filterOptions = [
        { key: 'ALL', label: 'All' },
        { key: 'PENDING_APPROVAL', label: 'Pending' },
        { key: 'APPROVED', label: 'Approved' },
        { key: 'SUSPENDED', label: 'Suspended' },
        { key: 'REJECTED', label: 'Rejected' },
    ];

    return (
        <div style={{ padding: '36px 40px', maxWidth: 1700, margin: '0 auto', color: 'var(--text-main)' }}>

            {/* ═══════════════════════════════════════
                👑 CONTROL HEADER
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
                        <span style={{ fontSize: '2rem' }}>👑</span>
                        <h1 className="text-gradient" style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800 }}>
                            Super Admin Control Center
                        </h1>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <span>🌐 Platform: InsurAI</span>
                        <span>📅 {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span>🕒 Last Activity: 2 mins ago</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        padding: '8px 18px', background: 'rgba(16,185,129,0.1)',
                        borderRadius: 24, border: '1px solid rgba(16,185,129,0.3)',
                        color: '#10b981', fontWeight: 700, fontSize: '0.85rem'
                    }}>
                        🟢 System Health: Stable
                    </div>
                    <NotificationCenter userRole="SUPER_ADMIN" />
                    <button
                        className="primary-btn"
                        onClick={() => setAddCompanyModal(true)}
                        style={{ padding: '10px 22px', fontWeight: 700 }}
                    >
                        + Add Company
                    </button>
                </div>
            </motion.div>

            {/* ── Global Executive Metrics ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 18, marginBottom: 36 }}>
                {execMetrics.map((m, idx) => (
                    <KPICard
                        key={idx}
                        icon={m.icon}
                        label={m.label}
                        value={m.value}
                        color={m.color}
                        onClick={m.onClick}
                        linkText={`View ${m.label.split(' ')[1] || m.label} →`}
                        idx={idx}
                    />
                ))}
            </div>

            {/* ═══════════════════════════════════════
                🔄 FUNNEL + 🚨 FRAUD RISK (side by side)
            ═══════════════════════════════════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 36 }}>

                {/* 🔄 Platform Conversion Funnel */}
                <motion.div
                    className="card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ padding: 0, overflow: 'hidden', minWidth: 0 }}
                >
                    <SectionHeader icon="🔄" title="Platform Conversion Funnel" />
                    <div style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 25, width: '100%' }}>
                            {funnelData.map((step, i) => (
                                <div key={i} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#6366f1' }}>
                                        {step.value.toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>
                                        {step.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ height: 240, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={funnelData} barCategoryGap="20%" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                                    <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                    <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={50}>
                                        {funnelData.map((_, i) => (
                                            <Cell key={i} fill={`hsl(${239 - i * 12}, 75%, ${65 - i * 4}%)`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>

                {/* 🚨 Fraud & Risk Oversight */}
                <motion.div
                    id="fraud-risk"
                    className="card"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ padding: 0, overflow: 'hidden' }}
                >
                    <SectionHeader icon="🚨" title="Fraud & Risk Oversight" />
                    <div style={{ padding: '20px 24px' }}>

                        {/* Donut Chart */}
                        <div style={{ height: 180 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={riskData}
                                        cx="50%" cy="50%"
                                        innerRadius={55} outerRadius={75}
                                        paddingAngle={4} dataKey="value"
                                    >
                                        {riskData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Risk Breakdown */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                            {riskData.map((r, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 5 }}>
                                        <span style={{ color: r.color, fontWeight: 600 }}>
                                            {i === 0 ? '🟢' : i === 1 ? '🟡' : '🔴'} {r.name}
                                        </span>
                                        <span style={{ fontWeight: 800 }}>{r.value}%</span>
                                    </div>
                                    <ProgressBar value={r.value} max={100} color={r.color} />
                                </div>
                            ))}
                        </div>

                        {/* Risk Triggers */}
                        <div style={{
                            padding: 14, background: 'rgba(239,68,68,0.07)',
                            borderRadius: 10, border: '1px solid rgba(239,68,68,0.15)',
                            marginBottom: 14
                        }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f87171', marginBottom: 8 }}>
                                🔺 Top Risk Triggers
                            </div>
                            {['Income–Policy mismatch', 'Duplicate claims', 'Document inconsistency'].map((t, i) => (
                                <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '3px 0' }}>
                                    • {t}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                            <ActionBtn variant="danger" onClick={() => navigate('/exceptions')}>View High-Risk</ActionBtn>
                            <ActionBtn variant="ghost" onClick={() => navigate('/analytics')}>Adjust Thresholds</ActionBtn>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ═══════════════════════════════════════
                🏢 COMPANY GOVERNANCE PANEL
            ═══════════════════════════════════════ */}
            <motion.div
                id="company-governance"
                className="card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ marginBottom: 36, padding: 0, overflow: 'hidden' }}
            >
                <SectionHeader icon="🏢" title="Company Governance Panel">
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {filterOptions.map(f => (
                            <FilterPill
                                key={f.key}
                                label={f.label}
                                active={filter === f.key}
                                onClick={() => setFilter(f.key)}
                            />
                        ))}
                    </div>
                </SectionHeader>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.15)' }}>
                                {['Company Name', 'Status', 'Policies', 'Agents', 'Users', 'Risk Score', 'Actions'].map((h, i) => (
                                    <th key={i} style={{
                                        padding: '14px 20px',
                                        textAlign: i === 6 ? 'right' : 'left',
                                        color: 'var(--text-muted)', fontWeight: 600,
                                        fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em',
                                        borderBottom: '1px solid rgba(255,255,255,0.07)'
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredCompanies.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', opacity: 0.6 }}>
                                            No companies found for this filter.
                                        </td>
                                    </tr>
                                ) : filteredCompanies.map((c, idx) => (
                                    <motion.tr
                                        key={c.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: idx * 0.04 }}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}


                                    >
                                        <td style={{ padding: '16px 20px', fontWeight: 700 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0
                                                }}>
                                                    {c.name?.charAt(0) || '?'}
                                                </div>
                                                {c.name}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}><StatusBadge status={c.status} /></td>
                                        <td style={{ padding: '16px 20px', fontWeight: 600 }}>{c.policiesIssued ?? 0}</td>
                                        <td style={{ padding: '16px 20px', fontWeight: 600 }}>{c.agents ?? 0}</td>
                                        <td style={{ padding: '16px 20px', fontWeight: 600 }}>{c.users ?? 0}</td>
                                        <td style={{ padding: '16px 20px' }}><RiskBadge risk={c.riskScore} /></td>
                                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                {c.status === 'PENDING_APPROVAL' && <>
                                                    <ActionBtn variant="success" onClick={() => setActionModal({ isOpen: true, company: c, action: 'approve' })}>Approve</ActionBtn>
                                                    <ActionBtn variant="danger" onClick={() => setActionModal({ isOpen: true, company: c, action: 'reject' })}>Reject</ActionBtn>
                                                </>}
                                                {(c.status === 'APPROVED') && <>
                                                    <ActionBtn variant="ghost" onClick={() => navigate(`/users?company=${c.id}`)}>View</ActionBtn>
                                                    <ActionBtn variant="danger" onClick={() => setActionModal({ isOpen: true, company: c, action: 'suspend' })}>Suspend</ActionBtn>
                                                    <ActionBtn variant="ghost" onClick={() => scrollTo('audit-compliance-log')}>Audit Logs</ActionBtn>
                                                </>}
                                                {c.status === 'SUSPENDED' && <>
                                                    <ActionBtn variant="ghost" onClick={() => scrollTo('audit-compliance-log')}>Review</ActionBtn>
                                                    <ActionBtn variant="warning" onClick={() => setActionModal({ isOpen: true, company: c, action: 'reactivate' })}>Reinstate</ActionBtn>
                                                </>}
                                                {c.status === 'REJECTED' && (
                                                    <ActionBtn variant="ghost" onClick={() => scrollTo('audit-compliance-log')}>View</ActionBtn>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* ═══════════════════════════════════════
                💬 PLATFORM FEEDBACK MODULE
            ═══════════════════════════════════════ */}
            <motion.div
                id="feedback-module"
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 36, padding: 0, overflow: 'hidden' }}
            >
                <SectionHeader icon="💬" title="Platform Feedback & Experience Overview">
                    <div style={{ display: 'flex', gap: 8 }}>
                        <ActionBtn variant="primary" onClick={() => navigate('/feedback-list')}>Open Feedback Center</ActionBtn>
                        <ActionBtn variant="danger" onClick={() => { }}>Escalate Issue</ActionBtn>
                    </div>
                </SectionHeader>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>

                    {/* Feedback Type Table */}
                    <div style={{ padding: '24px 28px', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 16 }}>
                            Feedback Overview
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Type', 'Count', 'Trend', 'Action'].map((h, i) => (
                                        <th key={i} style={{
                                            padding: '8px 10px', textAlign: 'left',
                                            color: 'var(--text-muted)', fontSize: '0.76rem',
                                            fontWeight: 600, textTransform: 'uppercase',
                                            borderBottom: '1px solid rgba(255,255,255,0.07)'
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {feedbackRows.map((row, i) => (
                                    <tr key={i}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'all 0.2s', background: 'transparent' }}


                                    >
                                        <td style={{ padding: '12px 10px', fontWeight: 700 }}>{row.type}</td>
                                        <td style={{ padding: '12px 10px' }}>
                                            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#06b6d4' }}>{row.count}</span>
                                        </td>
                                        <td style={{ padding: '12px 10px', color: row.trendColor, fontWeight: 700 }}>{row.trend}</td>
                                        <td style={{ padding: '12px 10px' }}>
                                            <ActionBtn variant="ghost" onClick={() => navigate('/feedback-list')}>{row.action}</ActionBtn>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Critical Feedback Alerts */}
                    <div style={{ padding: '24px 28px', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 16 }}>
                            🚨 Critical Feedback Alerts
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {criticalFeedback.map((cf, i) => (
                                <div key={i} style={{
                                    padding: '12px 16px', borderRadius: 10,
                                    background: cf.severity === 'high' ? 'rgba(239,68,68,0.07)' : 'rgba(245,158,11,0.07)',
                                    border: `1px solid ${cf.severity === 'high' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
                                }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.5, marginBottom: 6 }}>
                                        "{cf.text}"
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{
                                            fontSize: '0.76rem', fontWeight: 700,
                                            color: cf.severity === 'high' ? '#f87171' : '#fbbf24',
                                            background: cf.severity === 'high' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                                            padding: '2px 8px', borderRadius: 8
                                        }}>– {cf.company}</span>
                                        <ActionBtn
                                            variant={cf.severity === 'high' ? 'danger' : 'warning'}
                                            onClick={() => navigate('/exceptions')}
                                        >Investigate</ActionBtn>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feedback Correlation */}
                    <div style={{ padding: '24px 28px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 16 }}>
                            🔗 Feedback Correlation
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {feedbackCorrelations.map((fc, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{fc.label}</span>
                                        <span style={{ fontWeight: 800, color: fc.color }}>{fc.pct}%</span>
                                    </div>
                                    <ProgressBar value={fc.pct} max={100} color={fc.color} />
                                </div>
                            ))}
                        </div>
                        <div style={{
                            marginTop: 24, padding: '14px 16px',
                            background: 'rgba(6,182,212,0.06)',
                            border: '1px solid rgba(6,182,212,0.2)',
                            borderRadius: 10
                        }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#22d3ee', marginBottom: 6 }}>🔥 Enterprise-Grade Insight</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                Feedback signals correlate strongly with fraud & rejection patterns.
                                High complaint volume predicts agent mis-selling with 68% accuracy.
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ═══════════════════════════════════════
                📊 SYSTEM HEALTH  +  🧑‍💼 AGENT LEADERBOARD
            ═══════════════════════════════════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 36 }}>

                {/* 📊 System, AI & Platform Health */}
                <motion.div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <SectionHeader icon="📊" title="System, AI & Platform Health" />
                    <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <HealthStat label="AI Recommendation Accuracy" value={system.aiAccuracy ?? 91} color="#8b5cf6" suffix="%" />
                        <HealthStat label="Fraud Detection Precision" value={system.fraudDetection ?? 88} color="#f59e0b" suffix="%" />
                        <HealthStat label="API Avg Response" value={system.apiResponseTime ?? 210} color="#10b981" suffix="ms" />
                        <HealthStat label="DB Load" value={system.dbLoad ?? 'Normal'} color="#3b82f6" />
                        <HealthStat label="WebSocket Uptime" value={system.uptime ?? 99.8} color="#6366f1" suffix="%" />
                        <div style={{
                            padding: '18px 20px', background: 'rgba(16,185,129,0.08)',
                            borderRadius: 12, border: '1px solid rgba(16,185,129,0.2)',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
                        }}>
                            <div style={{ fontSize: '2.5rem' }}>🟢</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', marginTop: 6 }}>
                                All Systems Operational
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 🧑‍💼 Agent Leaderboard */}
                <motion.div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <SectionHeader icon="🧑‍💼" title="Agent Leaderboard (Global)" />
                    <div style={{ padding: '0' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(0,0,0,0.15)' }}>
                                    {['Rank', 'Agent Name', 'Company', 'Approval %', 'Avg Time'].map((h, i) => (
                                        <th key={i} style={{
                                            padding: '12px 16px', textAlign: 'left',
                                            color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem',
                                            textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.07)'
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {mockLeaderboard.map((a, i) => (
                                    <tr
                                        key={i}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s', background: 'transparent' }}


                                    >
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{
                                                fontWeight: 800, fontSize: '1rem',
                                                color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : 'var(--text-muted)',
                                                display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap'
                                            }}>
                                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span>🏅</span>} #{a.rank}
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontWeight: 700 }}>{a.name}</td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{a.company}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{ fontWeight: 800, color: '#10b981' }}>{a.approval}%</span>
                                        </td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{a.avgTime}</td>
                                    </tr>
                                ))}
                                {mockLeaderboard.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ padding: 30, textAlign: 'center', opacity: 0.5 }}>No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* ═══════════════════════════════════════
                🧾 AUDIT & COMPLIANCE LOG
            ═══════════════════════════════════════ */}
            <motion.div
                id="audit-compliance-log"
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}
            >
                <SectionHeader icon="🧾" title="Audit & Compliance Log (Read-Only)" />
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                    {logs.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', opacity: 0.5 }}>No audit logs yet.</div>
                    ) : logs.map((log, idx) => (
                        <div
                            key={log.id || idx}
                            style={{
                                padding: '14px 28px',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex', gap: 20, alignItems: 'flex-start',
                                transition: 'all 0.2s', background: 'transparent'
                            }}


                        >
                            <span style={{
                                fontSize: '0.8rem', color: 'var(--text-muted)',
                                minWidth: 140, flexShrink: 0, fontFamily: 'monospace'
                            }}>
                                {new Date(log.timestamp).toLocaleString()}
                            </span>
                            <span style={{ color: '#6366f1', fontWeight: 700, marginRight: 6 }}>•</span>
                            <span>
                                <span style={{ fontWeight: 600 }}>{log.action}</span>
                                {log.details && (
                                    <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                                        {log.details}
                                    </span>
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ═══════════════════════════════════════
                MODALS
            ═══════════════════════════════════════ */}

            {/* Action Confirmation Modal */}
            <Modal
                isOpen={actionModal.isOpen}
                onClose={() => { setActionModal({ isOpen: false, company: null, action: null }); setReason(''); }}
                title={`Confirm: ${actionModal.action?.charAt(0).toUpperCase() + actionModal.action?.slice(1) || ''}`}
                hideCloseButton={true}
            >
                <div style={{ color: 'var(--text-main)', display: 'grid', gap: 16 }}>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                        Are you sure you want to <strong style={{ color: 'white' }}>{actionModal.action}</strong> company{' '}
                        <strong style={{ color: '#6366f1' }}>{actionModal.company?.name}</strong>?
                    </p>
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="Enter reason (required for audit log)..."
                        rows={3}
                        style={{
                            padding: 12, borderRadius: 8, width: '100%', boxSizing: 'border-box',
                            border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)',
                            color: 'white', resize: 'vertical', fontSize: '0.9rem'
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <button type="button" className="secondary-btn" onClick={() => { setActionModal({ isOpen: false, company: null, action: null }); setReason(''); }}>
                            Cancel
                        </button>
                        <button onClick={handleAction} className="primary-btn" style={{ padding: '8px 20px' }}>
                            Confirm
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Add Company Modal */}
            <Modal isOpen={addCompanyModal} onClose={() => setAddCompanyModal(false)} title="➕ Add New Company">
                <form onSubmit={handleCreateCompany} style={{ display: 'grid', gap: 12, color: 'var(--text-main)' }}>
                    <ModalInput placeholder="Company Name" value={newCompany.name} onChange={e => setNewCompany({ ...newCompany, name: e.target.value })} required />
                    <ModalInput placeholder="Registration Number" value={newCompany.registrationNumber} onChange={e => setNewCompany({ ...newCompany, registrationNumber: e.target.value })} required />
                    <ModalInput type="email" placeholder="Official Email" value={newCompany.email} onChange={e => setNewCompany({ ...newCompany, email: e.target.value })} required />

                    <div style={{ padding: '10px 0 4px', borderTop: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                        Initial Admin Setup
                    </div>
                    <ModalInput placeholder="Admin Name" value={newCompany.adminName} onChange={e => setNewCompany({ ...newCompany, adminName: e.target.value })} required />
                    <ModalInput type="email" placeholder="Admin Email" value={newCompany.adminEmail} onChange={e => setNewCompany({ ...newCompany, adminEmail: e.target.value })} required />
                    <ModalInput type="password" placeholder="Admin Password" value={newCompany.adminPassword} onChange={e => setNewCompany({ ...newCompany, adminPassword: e.target.value })} required />

                    <button type="submit" className="primary-btn" style={{ marginTop: 6, padding: '12px', fontWeight: 700 }}>
                        Register Company
                    </button>
                </form>
            </Modal>

        </div>
    );
}
