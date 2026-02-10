import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";

export default function AdminAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const { notify } = useNotification();

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
            <div>
                <h1 className="text-gradient" style={{ marginBottom: 30, fontSize: "2.5rem" }}>
                    Admin Analytics
                </h1>
                <div className="grid">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="card" style={{ minHeight: 150 }}>
                            <div className="skeleton" style={{ height: 20, width: "60%", marginBottom: 10 }}></div>
                            <div className="skeleton" style={{ height: 40, width: "40%", marginBottom: 10 }}></div>
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
        <div>
            <div style={{ marginBottom: 30 }}>
                <h1 className="text-gradient" style={{ marginBottom: 10, fontSize: "2.5rem" }}>
                    📊 Admin Analytics
                </h1>
                <p style={{ opacity: 0.8 }}>
                    Full lifecycle visibility with funnel metrics and drop-off analysis
                </p>
            </div>

            {/* Funnel Metrics */}
            {funnelMetrics && (
                <div style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>🎯 Conversion Funnel</h2>

                    {/* Funnel Visualization */}
                    <FunnelVisualization funnel={funnelMetrics} />

                    {/* Conversion Rates */}
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginTop: 20 }}>
                        <MetricCard
                            icon="👁️"
                            title="Policy Views"
                            value={funnelMetrics.totalPolicyViews?.toLocaleString() || '0'}
                            subtitle="Total impressions"
                            index={0}
                        />
                        <MetricCard
                            icon="📅"
                            title="Appointments"
                            value={funnelMetrics.totalAppointmentsBooked?.toLocaleString() || '0'}
                            subtitle={`${funnelMetrics.viewToAppointmentRate?.toFixed(1) || '0'}% conversion`}
                            index={1}
                        />
                        <MetricCard
                            icon="💬"
                            title="Consultations"
                            value={funnelMetrics.totalConsultationsCompleted?.toLocaleString() || '0'}
                            subtitle={`${funnelMetrics.appointmentToConsultationRate?.toFixed(1) || '0'}% completion`}
                            index={2}
                        />
                        <MetricCard
                            icon="✅"
                            title="Approvals"
                            value={funnelMetrics.totalApprovalsGiven?.toLocaleString() || '0'}
                            subtitle={`${funnelMetrics.consultationToApprovalRate?.toFixed(1) || '0'}% approved`}
                            index={3}
                        />
                        <MetricCard
                            icon="💰"
                            title="Purchases"
                            value={funnelMetrics.totalPurchasesCompleted?.toLocaleString() || '0'}
                            subtitle={`${funnelMetrics.overallConversionRate?.toFixed(2) || '0'}% overall`}
                            index={4}
                            status="good"
                        />
                    </div>
                </div>
            )}

            {/* Drop-off Analysis */}
            {dropOffAnalysis && (
                <div style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>📉 Drop-off Analysis</h2>
                    <p style={{ opacity: 0.7, marginBottom: 20 }}>Identify bottlenecks in the customer journey</p>

                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                        {dropOffAnalysis.viewToAppointment && (
                            <DropOffCard dropOff={dropOffAnalysis.viewToAppointment} index={0} />
                        )}
                        {dropOffAnalysis.appointmentToConsultation && (
                            <DropOffCard dropOff={dropOffAnalysis.appointmentToConsultation} index={1} />
                        )}
                        {dropOffAnalysis.consultationToApproval && (
                            <DropOffCard dropOff={dropOffAnalysis.consultationToApproval} index={2} />
                        )}
                        {dropOffAnalysis.approvalToPurchase && (
                            <DropOffCard dropOff={dropOffAnalysis.approvalToPurchase} index={3} />
                        )}
                    </div>
                </div>
            )}

            {/* Agent Performance Summary */}
            {agentPerformance && (
                <div style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>👥 Agent Performance</h2>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        <MetricCard
                            icon="👨‍💼"
                            title="Total Agents"
                            value={agentPerformance.totalAgents || 0}
                            subtitle={`${agentPerformance.activeAgents || 0} active`}
                            index={5}
                        />
                        <MetricCard
                            icon="⚡"
                            title="Avg Response Time"
                            value={`${agentPerformance.averageResponseTime?.toFixed(1) || '0'}h`}
                            subtitle={agentPerformance.averageResponseTime < 24 ? 'Within SLA' : 'Exceeds SLA'}
                            status={agentPerformance.averageResponseTime < 24 ? 'good' : 'warning'}
                            index={6}
                        />
                        <MetricCard
                            icon="👍"
                            title="Avg Approval Rate"
                            value={`${agentPerformance.averageApprovalRate?.toFixed(1) || '0'}%`}
                            subtitle="Across all agents"
                            index={7}
                        />
                        <MetricCard
                            icon="⚠️"
                            title="SLA Breaches"
                            value={agentPerformance.totalSLABreaches || 0}
                            subtitle={`${agentPerformance.agentsWithSLABreaches || 0} agents affected`}
                            status={agentPerformance.totalSLABreaches > 0 ? 'error' : 'good'}
                            index={8}
                        />
                    </div>
                </div>
            )}

            {/* Financial Metrics */}
            {financialMetrics && (
                <div style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>💵 Financial Metrics</h2>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        <MetricCard
                            icon="💰"
                            title="Total Revenue"
                            value={`₹${(financialMetrics.totalRevenue || 0).toLocaleString('en-IN')}`}
                            subtitle="All time"
                            status="good"
                            index={9}
                        />
                        <MetricCard
                            icon="📅"
                            title="Monthly Revenue"
                            value={`₹${(financialMetrics.monthlyRevenue || 0).toLocaleString('en-IN')}`}
                            subtitle="This month"
                            index={10}
                        />
                        <MetricCard
                            icon="📊"
                            title="Avg Premium"
                            value={`₹${(financialMetrics.averagePremium || 0).toLocaleString('en-IN')}`}
                            subtitle="Per policy"
                            index={11}
                        />
                        <MetricCard
                            icon="🛡️"
                            title="Coverage Issued"
                            value={`₹${((financialMetrics.totalCoverageIssued || 0) / 10000000).toFixed(1)}Cr`}
                            subtitle="Total protection"
                            index={12}
                        />
                        <MetricCard
                            icon="👤"
                            title="Total Users"
                            value={financialMetrics.totalUsers || 0}
                            subtitle={`${financialMetrics.activeUsers || 0} with policies`}
                            index={13}
                        />
                    </div>
                </div>
            )}

            {/* Policy Metrics */}
            {policyMetrics && (
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>📋 Policy Metrics</h2>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        <MetricCard
                            icon="📄"
                            title="Total Policies"
                            value={policyMetrics.totalPolicies || 0}
                            subtitle="In catalog"
                            index={14}
                        />
                        <MetricCard
                            icon="✅"
                            title="Active Policies"
                            value={policyMetrics.activePolicies || 0}
                            subtitle="Currently active"
                            status="good"
                            index={15}
                        />
                        <MetricCard
                            icon="💭"
                            title="Quoted Policies"
                            value={policyMetrics.quotedPolicies || 0}
                            subtitle="Pending purchase"
                            index={16}
                        />
                        <MetricCard
                            icon="❌"
                            title="Rejected"
                            value={policyMetrics.rejectedPolicies || 0}
                            subtitle="Not approved"
                            status="error"
                            index={17}
                        />
                    </div>
                </div>
            )}
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

function MetricCard({ icon, title, value, subtitle, status, index }) {
    const getStatusColor = () => {
        switch (status) {
            case 'good': return '#22c55e';
            case 'warning': return '#eab308';
            case 'error': return '#ef4444';
            default: return 'var(--primary)';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card"
            style={{
                borderLeft: status ? `4px solid ${getStatusColor()}` : undefined,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{
                position: 'absolute',
                top: -20,
                right: -20,
                fontSize: '5rem',
                opacity: 0.05
            }}>
                {icon}
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.6, marginBottom: 8 }}>
                    {title}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: status ? getStatusColor() : 'var(--text-main)', marginBottom: 4 }}>
                    {value}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                    {subtitle}
                </div>
            </div>
        </motion.div>
    );
}
