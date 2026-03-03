import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";

export default function AdminAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const { notify } = useNotification();
    const { user } = useAuth();

    const fetchAnalytics = useCallback(() => {
        setLoading(true);
        api.get('/admin/analytics')
            .then(r => {
                setAnalytics(r.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                notify("Failed to load analytics", "error");
                setLoading(false);
            });
    }, [notify]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (loading) {
        return (
            <div style={{ padding: '60px 40px', maxWidth: 1400, margin: '0 auto' }}>
                <div className="skeleton" style={{ height: 36, width: '40%', marginBottom: 12, borderRadius: 10 }} />
                <div className="skeleton" style={{ height: 18, width: '24%', marginBottom: 36, borderRadius: 8 }} />
                <div className="grid">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="card" style={{ minHeight: 150 }}>
                            <div className="skeleton" style={{ height: 14, width: '55%', marginBottom: 14, borderRadius: 6 }} />
                            <div className="skeleton" style={{ height: 42, width: '45%', marginBottom: 10, borderRadius: 8 }} />
                            <div className="skeleton" style={{ height: 10, width: '35%', borderRadius: 6 }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                <h2>No analytics data available</h2>
            </div>
        );
    }

    const { funnelMetrics, agentPerformance, policyMetrics, financialMetrics, dropOffAnalysis } = analytics;

    return (
        <div style={{ padding: '36px 40px', maxWidth: 1400, margin: '0 auto' }}>

            {/* ── Hero Header ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span className={`badge badge-${user?.role === 'SUPER_ADMIN' ? 'super-admin' : 'company-admin'}`} style={{ fontSize: '0.7rem' }}>
                        {user?.role === 'SUPER_ADMIN' ? '⚡ SUPER ADMIN' : '🏢 COMPANY ADMIN'}
                    </span>
                    <span style={{
                        fontSize: '0.7rem', fontWeight: 700, color: '#10b981',
                        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                        padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                        Real-time
                    </span>
                </div>
                <h1 style={{ margin: 0, fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: "'Space Grotesk',sans-serif" }}>
                    📊 Platform <span className="text-gradient">Analytics</span>
                </h1>
                <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Full lifecycle visibility — funnel metrics, agent performance, and financial overview.
                </p>
                <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(99,102,241,0.5), rgba(139,92,246,0.3), transparent)', marginTop: 16 }} />
            </motion.div>

            {/* ── Conversion Funnel ── */}
            {funnelMetrics && (
                <div style={{ marginBottom: 44 }}>
                    <SectionHeader icon="🎯" title="Conversion Funnel" subtitle="Track how users move from viewing to purchasing" />
                    <FunnelVisualization funnel={funnelMetrics} />
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginTop: 20 }}>
                        <MetricCard icon="👁️" title="Policy Views" value={funnelMetrics.totalPolicyViews?.toLocaleString() || '0'} subtitle="Total impressions" index={0} accentColor="#6366f1" />
                        <MetricCard icon="📅" title="Appointments" value={funnelMetrics.totalAppointmentsBooked?.toLocaleString() || '0'} subtitle={`${funnelMetrics.viewToAppointmentRate?.toFixed(1) || '0'}% from views`} index={1} accentColor="#8b5cf6" />
                        <MetricCard icon="💬" title="Consultations" value={funnelMetrics.totalConsultationsCompleted?.toLocaleString() || '0'} subtitle={`${funnelMetrics.appointmentToConsultationRate?.toFixed(1) || '0'}% completion`} index={2} accentColor="#ec4899" />
                        <MetricCard icon="✅" title="Approvals" value={funnelMetrics.totalApprovalsGiven?.toLocaleString() || '0'} subtitle={`${funnelMetrics.consultationToApprovalRate?.toFixed(1) || '0'}% approved`} index={3} accentColor="#f59e0b" />
                        <MetricCard icon="💰" title="Purchases" value={funnelMetrics.totalPurchasesCompleted?.toLocaleString() || '0'} subtitle={`${funnelMetrics.overallConversionRate?.toFixed(2) || '0'}% overall`} index={4} accentColor="#10b981" status="good" />
                    </div>
                </div>
            )}

            {/* ── Drop-off Analysis ── */}
            {dropOffAnalysis && (
                <div style={{ marginBottom: 44 }}>
                    <SectionHeader icon="📉" title="Drop-off Analysis" subtitle="Identify bottlenecks in the customer journey" />
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                        {dropOffAnalysis.viewToAppointment && <DropOffCard dropOff={dropOffAnalysis.viewToAppointment} index={0} />}
                        {dropOffAnalysis.appointmentToConsultation && <DropOffCard dropOff={dropOffAnalysis.appointmentToConsultation} index={1} />}
                        {dropOffAnalysis.consultationToApproval && <DropOffCard dropOff={dropOffAnalysis.consultationToApproval} index={2} />}
                        {dropOffAnalysis.approvalToPurchase && <DropOffCard dropOff={dropOffAnalysis.approvalToPurchase} index={3} />}
                    </div>
                </div>
            )}

            {/* ── Agent Performance ── */}
            {agentPerformance && (
                <div style={{ marginBottom: 44 }}>
                    <SectionHeader icon="🧑‍💼" title="Agent Performance" subtitle="SLA tracking and approval metrics" />
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                        <MetricCard icon="👨‍💼" title="Total Agents" value={agentPerformance.totalAgents || 0} subtitle={`${agentPerformance.activeAgents || 0} active`} index={5} accentColor="#6366f1" />
                        <MetricCard icon="⚡" title="Avg Response" value={`${agentPerformance.averageResponseTime?.toFixed(1) || '0'}h`} subtitle={agentPerformance.averageResponseTime < 24 ? 'Within SLA ✅' : 'Exceeds SLA ⚠️'} status={agentPerformance.averageResponseTime < 24 ? 'good' : 'warning'} index={6} accentColor="#8b5cf6" />
                        <MetricCard icon="👍" title="Avg Approval Rate" value={`${agentPerformance.averageApprovalRate?.toFixed(1) || '0'}%`} subtitle="Across all agents" index={7} accentColor="#10b981" status="good" />
                        <MetricCard icon="⚠️" title="SLA Breaches" value={agentPerformance.totalSLABreaches || 0} subtitle={`${agentPerformance.agentsWithSLABreaches || 0} agents affected`} index={8} accentColor="#ef4444" status={agentPerformance.totalSLABreaches > 0 ? 'error' : 'good'} />
                    </div>
                </div>
            )}

            {/* ── Financial Metrics ── */}
            {financialMetrics && (
                <div style={{ marginBottom: 44 }}>
                    <SectionHeader icon="💵" title="Financial Metrics" subtitle="Revenue, premium, and coverage overview" />
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                        <MetricCard icon="💰" title="Total Revenue" value={`₹${(financialMetrics.totalRevenue || 0).toLocaleString('en-IN')}`} subtitle="All time" status="good" index={9} accentColor="#10b981" />
                        <MetricCard icon="📅" title="Monthly Revenue" value={`₹${(financialMetrics.monthlyRevenue || 0).toLocaleString('en-IN')}`} subtitle="This month" index={10} accentColor="#6366f1" />
                        <MetricCard icon="📊" title="Avg Premium" value={`₹${(financialMetrics.averagePremium || 0).toLocaleString('en-IN')}`} subtitle="Per policy" index={11} accentColor="#8b5cf6" />
                        <MetricCard icon="🛡️" title="Coverage Issued" value={`₹${((financialMetrics.totalCoverageIssued || 0) / 10000000).toFixed(1)}Cr`} subtitle="Total protection" index={12} accentColor="#f59e0b" />
                        <MetricCard icon="👤" title="Total Users" value={financialMetrics.totalUsers || 0} subtitle={`${financialMetrics.activeUsers || 0} with policies`} index={13} accentColor="#3b82f6" />
                    </div>
                </div>
            )}

            {/* ── Policy Metrics ── */}
            {policyMetrics && (
                <div style={{ marginBottom: 20 }}>
                    <SectionHeader icon="📋" title="Policy Metrics" subtitle="Platform catalog and activation status" />
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                        <MetricCard icon="📄" title="Total Policies" value={policyMetrics.totalPolicies || 0} subtitle="In catalog" index={14} accentColor="#6366f1" />
                        <MetricCard icon="✅" title="Active Policies" value={policyMetrics.activePolicies || 0} subtitle="Currently active" status="good" index={15} accentColor="#10b981" />
                        <MetricCard icon="💭" title="Quoted" value={policyMetrics.quotedPolicies || 0} subtitle="Pending purchase" index={16} accentColor="#f59e0b" />
                        <MetricCard icon="❌" title="Rejected" value={policyMetrics.rejectedPolicies || 0} subtitle="Not approved" status="error" index={17} accentColor="#ef4444" />
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Section Header Helper ──
function SectionHeader({ icon, title, subtitle }) {
    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.3rem' }}>{icon}</span>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{title}</h2>
                <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, rgba(99,102,241,0.3), transparent)' }} />
            </div>
            {subtitle && <p style={{ margin: '5px 0 0 32px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{subtitle}</p>}
        </div>
    );
}

function FunnelVisualization({ funnel }) {
    const stages = [
        { label: 'Views', value: funnel.totalPolicyViews, color: '#3b82f6' },
        { label: 'Appointments', value: funnel.totalAppointmentsBooked, color: '#8b5cf6' },
        { label: 'Consultations', value: funnel.totalConsultationsCompleted, color: '#ec4899' },
        { label: 'Approvals', value: funnel.totalApprovalsGiven, color: '#f59e0b' },
        { label: 'Purchases', value: funnel.totalPurchasesCompleted, color: '#22c55e' }
    ];

    const maxValue = Math.max(...stages.map(s => s.value || 0));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
            style={{ padding: 30 }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                {stages.map((stage, index) => {
                    const width = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
                    return (
                        <div key={index}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                <span style={{ fontWeight: 600 }}>{stage.label}</span>
                                <span style={{ fontWeight: 700, color: stage.color }}>
                                    {stage.value?.toLocaleString() || '0'}
                                </span>
                            </div>
                            <div style={{
                                height: 40,
                                background: 'rgba(0,0,0,0.05)',
                                borderRadius: 8,
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${width}%` }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    style={{
                                        height: '100%',
                                        background: stage.color,
                                        borderRadius: 8,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        paddingRight: 15,
                                        color: 'white',
                                        fontWeight: 700
                                    }}
                                >
                                    {width > 20 && `${width.toFixed(0)}%`}
                                </motion.div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

function DropOffCard({ dropOff, index }) {
    const dropOffRate = dropOff.dropOffRate || 0;
    const severity = dropOffRate > 50 ? 'error' : dropOffRate > 30 ? 'warning' : 'good';
    const color = severity === 'error' ? '#ef4444' : severity === 'warning' ? '#eab308' : '#22c55e';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
            style={{ borderLeft: `4px solid ${color}` }}
        >
            <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>{dropOff.stage}</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 15 }}>
                <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: 2 }}>Entered</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                        {dropOff.entered?.toLocaleString() || '0'}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: 2 }}>Exited</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                        {dropOff.exited?.toLocaleString() || '0'}
                    </div>
                </div>
            </div>

            <div style={{
                padding: 15,
                background: `${color}10`,
                borderRadius: 8,
                marginBottom: 10
            }}>
                <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: 5 }}>Drop-off Rate</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color }}>
                    {dropOffRate.toFixed(1)}%
                </div>
                <div style={{ fontSize: '0.85rem', marginTop: 5 }}>
                    {dropOff.dropped?.toLocaleString() || '0'} users dropped
                </div>
            </div>

            {dropOff.primaryReason && (
                <div style={{
                    padding: 10,
                    background: 'rgba(0,0,0,0.03)',
                    borderRadius: 6,
                    fontSize: '0.85rem',
                    lineHeight: 1.4
                }}>
                    <strong>Primary Reason:</strong> {dropOff.primaryReason}
                </div>
            )}
        </motion.div>
    );
}

function MetricCard({ icon, title, value, subtitle, status, index, accentColor }) {
    const statusColor = status === 'good' ? '#10b981' : status === 'warning' ? '#f59e0b' : status === 'error' ? '#ef4444' : null;
    const topColor = statusColor || accentColor || 'var(--primary)';

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="card"
            style={{ borderTop: `3px solid ${topColor}`, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}
        >
            <div style={{ position: 'absolute', top: -18, right: -12, fontSize: '4.5rem', opacity: 0.04, pointerEvents: 'none' }}>
                {icon}
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.3 }}>
                        {title}
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${topColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                        {icon}
                    </div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: statusColor || 'var(--text-main)', lineHeight: 1 }}>
                    {value}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>{subtitle}</div>
            </div>
        </motion.div>
    );
}
