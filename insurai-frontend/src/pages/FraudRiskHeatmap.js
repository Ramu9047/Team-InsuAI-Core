import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

/**
 * Fraud Risk Heatmap — Phase 8 Redesign
 * Enterprise severity badge system, dark-themed KPI cards,
 * filter pills, and scrollable risk user list.
 */

const SeverityBadge = ({ level }) => {
    const cfg = {
        GREEN: { label: 'Low Risk', bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.3)', icon: '🟢' },
        YELLOW: { label: 'Medium Risk', bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)', icon: '🟡' },
        RED: { label: 'High Risk', bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.3)', icon: '🔴' },
    };
    const c = cfg[level] || cfg.GREEN;
    return (
        <span style={{
            padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
            background: c.bg, color: c.color, border: `1px solid ${c.border}`,
            display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
            {c.icon} {c.label}
        </span>
    );
};

const RiskScoreArc = ({ score }) => {
    const pct = Math.min(score, 100);
    const color = pct < 40 ? '#10b981' : pct < 70 ? '#f59e0b' : '#ef4444';
    return (
        <div style={{ position: 'relative', width: 54, height: 54, flexShrink: 0 }}>
            <svg width="54" height="54" viewBox="0 0 54 54">
                <circle cx="27" cy="27" r="22" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
                <circle
                    cx="27" cy="27" r="22" fill="none"
                    stroke={color} strokeWidth="5"
                    strokeDasharray={`${(pct / 100) * 138.2} 138.2`}
                    strokeLinecap="round"
                    transform="rotate(-90 27 27)"
                />
            </svg>
            <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 800, color,
            }}>
                {pct.toFixed(0)}
            </div>
        </div>
    );
};

export default function FraudRiskHeatmap() {
    const [heatmapData, setHeatmapData] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const { user } = useAuth();

    useEffect(() => { loadHeatmap(); }, []);

    const loadHeatmap = async () => {
        try {
            const r = await api.get('/ai/fraud/heatmap');
            setHeatmapData(r.data);
        } catch (e) {
            console.error('Fraud heatmap load error:', e);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level) => ({ GREEN: '#10b981', YELLOW: '#f59e0b', RED: '#ef4444' }[level] || '#6b7280');

    const filteredUsers = (heatmapData?.userRiskScores || [])
        .filter(u => filter === 'ALL' || u.riskLevel === filter)
        .sort((a, b) => b.riskScore - a.riskScore);

    if (loading) return (
        <div style={{ padding: '60px 40px', maxWidth: 1400, margin: '0 auto' }}>
            <div className="skeleton" style={{ height: 36, width: '40%', marginBottom: 12, borderRadius: 10 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
                {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 16 }} />)}
            </div>
        </div>
    );

    const kpis = [
        { label: 'Total Users Assessed', value: heatmapData?.totalUsers || 0, icon: '👥', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
        {
            label: 'Low Risk', value: heatmapData?.greenCount || 0, icon: '🟢', color: '#10b981', bg: 'rgba(16,185,129,0.1)',
            pct: heatmapData?.totalUsers > 0 ? ((heatmapData.greenCount / heatmapData.totalUsers) * 100).toFixed(1) : 0
        },
        {
            label: 'Medium Risk', value: heatmapData?.yellowCount || 0, icon: '🟡', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',
            pct: heatmapData?.totalUsers > 0 ? ((heatmapData.yellowCount / heatmapData.totalUsers) * 100).toFixed(1) : 0
        },
        {
            label: 'High Risk 🚨', value: heatmapData?.redCount || 0, icon: '🔴', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',
            pct: heatmapData?.totalUsers > 0 ? ((heatmapData.redCount / heatmapData.totalUsers) * 100).toFixed(1) : 0
        },
    ];

    const filterConfig = [
        { key: 'ALL', label: 'All Users', color: '#6366f1' },
        { key: 'GREEN', label: '🟢 Low', color: '#10b981' },
        { key: 'YELLOW', label: '🟡 Medium', color: '#f59e0b' },
        { key: 'RED', label: '🔴 High', color: '#ef4444' },
    ];

    return (
        <div style={{ padding: '36px 40px', maxWidth: 1400, margin: '0 auto', color: 'var(--text-main)' }}>

            {/* ── Hero Header ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span className={`badge badge-${user?.role === 'SUPER_ADMIN' ? 'super-admin' : 'company-admin'}`} style={{ fontSize: '0.7rem' }}>
                        {user?.role === 'SUPER_ADMIN' ? '⚡ SUPER ADMIN' : '🏢 COMPANY ADMIN'}
                    </span>
                    <span style={{
                        fontSize: '0.7rem', fontWeight: 700, color: '#ef4444',
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                        padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulseGlow 2s infinite' }} />
                        AI Live Monitor
                    </span>
                </div>
                <h1 style={{ margin: 0, fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: "'Space Grotesk',sans-serif" }}>
                    🔍 Fraud Risk <span className="text-gradient">Heatmap</span>
                </h1>
                <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    AI-powered fraud detection — real-time risk scoring across all platform users.
                </p>
                <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(239,68,68,0.5), rgba(245,158,11,0.3), transparent)', marginTop: 16 }} />
            </motion.div>

            {/* ── KPI Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 32 }}>
                {kpis.map((k, i) => (
                    <motion.div key={k.label}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className="card" style={{ padding: '22px 24px', borderTop: `3px solid ${k.color}` }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                                    {k.label}
                                </div>
                                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: k.color, lineHeight: 1 }}>
                                    {k.value.toLocaleString()}
                                </div>
                                {k.pct !== undefined && (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                        {k.pct}% of total
                                    </div>
                                )}
                            </div>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                {k.icon}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Filter Pills ── */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {filterConfig.map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)} style={{
                        padding: '8px 20px', borderRadius: 'var(--radius-pill)',
                        border: filter === f.key ? `1px solid ${f.color}` : '1px solid var(--border-input)',
                        background: filter === f.key ? `${f.color}18` : 'transparent',
                        color: filter === f.key ? f.color : 'var(--text-muted)',
                        fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                        {f.label}
                        <span style={{
                            marginLeft: 8, background: filter === f.key ? `${f.color}30` : 'rgba(255,255,255,0.08)',
                            padding: '1px 7px', borderRadius: 10, fontSize: '0.75rem',
                        }}>
                            {f.key === 'ALL' ? filteredUsers.length :
                                f.key === 'GREEN' ? heatmapData?.greenCount || 0 :
                                    f.key === 'YELLOW' ? heatmapData?.yellowCount || 0 :
                                        heatmapData?.redCount || 0}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── User Risk Table ── */}
            <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{
                    padding: '18px 24px', background: 'rgba(255,255,255,0.025)',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                        🧩 User Risk Matrix
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                            Sorted by risk score (highest first)
                        </span>
                    </h3>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} shown
                    </span>
                </div>

                {filteredUsers.length === 0 ? (
                    <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>No users found at this risk level.</p>
                    </div>
                ) : (
                    <table className="data-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th style={{ textAlign: 'center' }}>Risk Score</th>
                                <th style={{ textAlign: 'center' }}>Risk Level</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredUsers.map((u, i) => (
                                    <motion.tr key={u.userId}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ delay: i * 0.04 }}
                                        style={{ borderLeft: `3px solid ${getRiskColor(u.riskLevel)}20` }}
                                    >
                                        <td style={{ fontWeight: 700 }}>{u.userName}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.userEmail}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                <RiskScoreArc score={u.riskScore} />
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <SeverityBadge level={u.riskLevel} />
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button onClick={() => setSelectedUser(u)} style={{
                                                padding: '6px 14px', borderRadius: 8,
                                                border: '1px solid var(--border-input)',
                                                background: 'transparent', color: 'var(--text-muted)',
                                                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                                            }}>
                                                🔎 Details
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                )}
            </motion.div>

            {/* ── User Detail Drawer Modal ── */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                        }}
                        onClick={() => setSelectedUser(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="card"
                            style={{ maxWidth: 560, width: '92%', padding: 32, maxHeight: '82vh', overflow: 'auto' }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>{selectedUser.userName}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 2 }}>{selectedUser.userEmail}</div>
                                </div>
                                <button onClick={() => setSelectedUser(null)} style={{
                                    background: 'none', border: 'none', fontSize: '1.4rem',
                                    cursor: 'pointer', color: 'var(--text-muted)', padding: 4
                                }}>✕</button>
                            </div>

                            {/* Score Display */}
                            <div style={{
                                padding: '20px 24px', borderRadius: 14,
                                background: `${getRiskColor(selectedUser.riskLevel)}12`,
                                border: `1px solid ${getRiskColor(selectedUser.riskLevel)}30`,
                                marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20,
                            }}>
                                <RiskScoreArc score={selectedUser.riskScore} />
                                <div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        Fraud Risk Score
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: 900, color: getRiskColor(selectedUser.riskLevel), lineHeight: 1.2 }}>
                                        {selectedUser.riskScore.toFixed(1)} / 100
                                    </div>
                                    <div style={{ marginTop: 6 }}><SeverityBadge level={selectedUser.riskLevel} /></div>
                                </div>
                            </div>

                            {/* Risk Factors */}
                            <div style={{ marginBottom: 24 }}>
                                <h4 style={{ margin: '0 0 14px', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                                    ⚠️ Risk Factors
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {selectedUser.riskFactors.map((factor, i) => (
                                        <div key={i} style={{
                                            padding: '10px 14px', borderRadius: 10,
                                            background: 'rgba(239,68,68,0.06)',
                                            border: '1px solid rgba(239,68,68,0.15)',
                                            fontSize: '0.88rem', color: 'var(--text-main)',
                                            display: 'flex', alignItems: 'flex-start', gap: 8,
                                        }}>
                                            <span style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }}>▸</span>
                                            {factor}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className="secondary-btn" style={{ flex: 1, padding: '10px 16px', fontWeight: 700 }}>
                                    👤 View Profile
                                </button>
                                {selectedUser.riskLevel === 'RED' && (
                                    <button className="danger-btn" style={{ flex: 1, padding: '10px 16px', fontWeight: 700 }}>
                                        🚨 Flag for Review
                                    </button>
                                )}
                                {selectedUser.riskLevel === 'YELLOW' && (
                                    <button style={{
                                        flex: 1, padding: '10px 16px', fontWeight: 700,
                                        border: '1px solid rgba(245,158,11,0.5)', color: '#fbbf24',
                                        background: 'rgba(245,158,11,0.1)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                                    }}>
                                        ⚠️ Mark for Watch
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
