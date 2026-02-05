import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";

export default function AgentPerformance() {
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);
    const { notify } = useNotification();

    useEffect(() => {
        api.get('/agents/performance')
            .then(r => {
                setPerformance(r.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                notify("Failed to load performance data", "error");
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div>
                <h1 className="text-gradient" style={{ marginBottom: 30, fontSize: "2.5rem" }}>
                    My Performance
                </h1>
                <div className="grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="card" style={{ minHeight: 150 }}>
                            <div className="skeleton" style={{ height: 20, width: "40%", marginBottom: 10 }}></div>
                            <div className="skeleton" style={{ height: 40, width: "60%", marginBottom: 10 }}></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!performance) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                <h2>No performance data available</h2>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 30 }}>
                <h1 className="text-gradient" style={{ marginBottom: 10, fontSize: "2.5rem" }}>
                    My Performance
                </h1>
                <p style={{ opacity: 0.8 }}>
                    Track your consultation metrics, SLA compliance, and quality indicators
                </p>
            </div>

            {/* SLA Metrics */}
            <div style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>⏱️ SLA Metrics</h2>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                    <MetricCard
                        icon="⚡"
                        title="Avg Response Time"
                        value={performance.averageResponseTimeHours ? `${performance.averageResponseTimeHours.toFixed(1)}h` : 'N/A'}
                        status={performance.averageResponseTimeHours < 24 ? 'good' : 'warning'}
                        subtitle={performance.averageResponseTimeHours < 24 ? 'Within SLA' : 'Exceeds 24h SLA'}
                        index={0}
                    />
                    <MetricCard
                        icon="⚠️"
                        title="SLA Breaches"
                        value={performance.slaBreaches || 0}
                        status={performance.slaBreaches === 0 ? 'good' : 'error'}
                        subtitle={performance.slaBreaches === 0 ? 'Excellent!' : 'Needs improvement'}
                        index={1}
                    />
                    <MetricCard
                        icon="⏳"
                        title="Pending"
                        value={performance.pendingConsultations || 0}
                        status="info"
                        subtitle="Awaiting review"
                        index={2}
                    />
                    <MetricCard
                        icon="✅"
                        title="Completed"
                        value={performance.completedConsultations || 0}
                        status="info"
                        subtitle="Total consultations"
                        index={3}
                    />
                </div>
            </div>

            {/* Performance Metrics */}
            <div style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>📊 Performance Metrics</h2>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                    <MetricCard
                        icon="👍"
                        title="Approval Rate"
                        value={performance.approvalRate ? `${performance.approvalRate.toFixed(1)}%` : 'N/A'}
                        status={performance.approvalRate >= 60 ? 'good' : performance.approvalRate >= 40 ? 'warning' : 'error'}
                        subtitle={`${performance.approvalRate >= 60 ? 'Great!' : 'Room for improvement'}`}
                        index={4}
                    />
                    <MetricCard
                        icon="👎"
                        title="Rejection Rate"
                        value={performance.rejectionRate ? `${performance.rejectionRate.toFixed(1)}%` : 'N/A'}
                        status="info"
                        subtitle="Policies rejected"
                        index={5}
                    />
                    <MetricCard
                        icon="💰"
                        title="Conversion Rate"
                        value={performance.conversionRate ? `${performance.conversionRate.toFixed(1)}%` : 'N/A'}
                        status={performance.conversionRate >= 50 ? 'good' : performance.conversionRate >= 30 ? 'warning' : 'error'}
                        subtitle={performance.conversionRate >= 50 ? 'Excellent!' : 'Can improve'}
                        index={6}
                    />
                    <MetricCard
                        icon="💡"
                        title="Alternatives Suggested"
                        value={performance.alternativesRecommended || 0}
                        status="info"
                        subtitle="Better options provided"
                        index={7}
                    />
                </div>
            </div>

            {/* Activity Metrics */}
            <div style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>📅 Activity</h2>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                    <MetricCard
                        icon="📆"
                        title="This Week"
                        value={performance.consultationsThisWeek || 0}
                        status="info"
                        subtitle="Consultations"
                        index={8}
                    />
                    <MetricCard
                        icon="📅"
                        title="This Month"
                        value={performance.consultationsThisMonth || 0}
                        status="info"
                        subtitle="Consultations"
                        index={9}
                    />
                    <MetricCard
                        icon="📈"
                        title="Total Consultations"
                        value={performance.totalConsultations || 0}
                        status="info"
                        subtitle="All time"
                        index={10}
                    />
                    {performance.lastActiveTime && (
                        <MetricCard
                            icon="🕐"
                            title="Last Active"
                            value={new Date(performance.lastActiveTime).toLocaleDateString()}
                            status="info"
                            subtitle={new Date(performance.lastActiveTime).toLocaleTimeString()}
                            index={11}
                        />
                    )}
                </div>
            </div>

            {/* Rejection Reasons Analysis */}
            {performance.rejectionReasons && Object.keys(performance.rejectionReasons).length > 0 && (
                <div style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>📋 Top Rejection Reasons</h2>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card"
                    >
                        <p style={{ opacity: 0.7, marginBottom: 20 }}>
                            Understanding rejection patterns helps improve consultation quality
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                            {Object.entries(performance.rejectionReasons)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 5)
                                .map(([reason, count], index) => (
                                    <RejectionReasonBar
                                        key={reason}
                                        reason={reason}
                                        count={count}
                                        total={Object.values(performance.rejectionReasons).reduce((a, b) => a + b, 0)}
                                        index={index}
                                    />
                                ))}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Performance Summary */}
            <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>💬 Performance Summary</h2>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                    style={{ background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.1), rgba(var(--secondary-rgb), 0.1))' }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                        <SummaryItem
                            label="Overall Rating"
                            value={getOverallRating(performance)}
                            color={getOverallRatingColor(performance)}
                        />
                        <SummaryItem
                            label="SLA Compliance"
                            value={performance.slaBreaches === 0 ? '100%' : `${((performance.completedConsultations - performance.slaBreaches) / performance.completedConsultations * 100).toFixed(0)}%`}
                            color={performance.slaBreaches === 0 ? '#22c55e' : '#eab308'}
                        />
                        <SummaryItem
                            label="Quality Score"
                            value={getQualityScore(performance)}
                            color={getQualityScoreColor(performance)}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function MetricCard({ icon, title, value, status, subtitle, index }) {
    const getStatusColor = () => {
        switch (status) {
            case 'good': return '#22c55e';
            case 'warning': return '#eab308';
            case 'error': return '#ef4444';
            case 'info': return 'var(--primary)';
            default: return '#9ca3af';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card"
            style={{
                borderLeft: `4px solid ${getStatusColor()}`,
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
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: getStatusColor(), marginBottom: 4 }}>
                    {value}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                    {subtitle}
                </div>
            </div>
        </motion.div>
    );
}

function RejectionReasonBar({ reason, count, total, index }) {
    const percentage = (count / total) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{reason}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {count} ({percentage.toFixed(0)}%)
                </span>
            </div>
            <div style={{
                height: 8,
                background: 'rgba(0,0,0,0.05)',
                borderRadius: 4,
                overflow: 'hidden'
            }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                    style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                        borderRadius: 4
                    }}
                />
            </div>
        </motion.div>
    );
}

function SummaryItem({ label, value, color }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.6, marginBottom: 8 }}>
                {label}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color }}>
                {value}
            </div>
        </div>
    );
}

function getOverallRating(performance) {
    const approvalScore = performance.approvalRate || 0;
    const conversionScore = performance.conversionRate || 0;
    const slaScore = performance.slaBreaches === 0 ? 100 : Math.max(0, 100 - (performance.slaBreaches * 10));

    const overall = (approvalScore + conversionScore + slaScore) / 3;

    if (overall >= 80) return 'Excellent';
    if (overall >= 60) return 'Good';
    if (overall >= 40) return 'Average';
    return 'Needs Improvement';
}

function getOverallRatingColor(performance) {
    const rating = getOverallRating(performance);
    switch (rating) {
        case 'Excellent': return '#22c55e';
        case 'Good': return '#3b82f6';
        case 'Average': return '#eab308';
        default: return '#ef4444';
    }
}

function getQualityScore(performance) {
    const alternativesScore = Math.min(100, (performance.alternativesRecommended || 0) * 10);
    const conversionScore = performance.conversionRate || 0;

    const quality = (alternativesScore + conversionScore) / 2;
    return `${quality.toFixed(0)}/100`;
}

function getQualityScoreColor(performance) {
    const score = parseFloat(getQualityScore(performance));
    if (score >= 70) return '#22c55e';
    if (score >= 50) return '#eab308';
    return '#ef4444';
}
