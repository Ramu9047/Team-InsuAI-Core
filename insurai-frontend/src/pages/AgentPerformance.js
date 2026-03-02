import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
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
    }, [notify]);

    if (loading) {
        return (
            <div style={{ padding: '60px 40px', maxWidth: 1400, margin: '0 auto' }}>
                <div className="skeleton" style={{ height: 36, width: '38%', marginBottom: 12, borderRadius: 10 }} />
                <div className="skeleton" style={{ height: 16, width: '26%', marginBottom: 36, borderRadius: 8 }} />
                <div className="grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="card" style={{ minHeight: 150 }}>
                            <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: 14, borderRadius: 6 }} />
                            <div className="skeleton" style={{ height: 40, width: '40%', borderRadius: 8 }} />
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
        <div style={{ padding: '36px 40px', maxWidth: 1400, margin: '0 auto' }}>

            {/* ── Hero Header ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span className="badge badge-agent" style={{ fontSize: '0.7rem' }}>🧑‍💼 Agent</span>
                </div>
                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: "'Space Grotesk',sans-serif" }}>
                    My <span className="text-gradient">Performance</span>
                </h1>
                <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Track your consultation metrics, SLA compliance, and quality indicators.
                </p>
                <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(139,92,246,0.5), transparent)', marginTop: 16 }} />
            </motion.div>

            {/* ── SLA Metrics ── */}
            <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <span style={{ fontSize: '1.2rem' }}>⏱️</span>
                    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>SLA Metrics</h2>
                    <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, rgba(139,92,246,0.3), transparent)' }} />
                </div>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                    <MetricCard
                        icon="⚡"
                        title="Avg Response Time"
                        value={performance.averageResponseTimeHours !== null ? `${performance.averageResponseTimeHours?.toFixed(1)}h` : 'N/A'}
                        status={performance.averageResponseTimeHours < 24 ? 'good' : 'warning'}
                        subtitle={performance.averageResponseTimeHours < 24 ? 'Within SLA' : 'Exceeds 24h SLA'}
                        index={0}
                    />
                    <MetricCard
                        icon="⚠️"
                        title="SLA Breaches"
                        value={performance.slaBreaches ?? 0}
                        status={performance.slaBreaches === 0 ? 'good' : 'error'}
                        subtitle={performance.slaBreaches === 0 ? 'Excellent!' : 'Needs improvement'}
                        index={1}
                    />
                    <MetricCard
                        icon="⏳"
                        title="Pending"
                        value={performance.pendingConsultations ?? 0}
                        status="info"
                        subtitle="Awaiting review"
                        index={2}
                    />
                    <MetricCard
                        icon="✅"
                        title="Completed"
                        value={performance.completedConsultations ?? 0}
                        status="info"
                        subtitle="Total consultations"
                        index={3}
                    />
                </div>
            </div>

            {/* ── Performance Metrics ── */}
            <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <span style={{ fontSize: '1.2rem' }}>📊</span>
                    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Performance Metrics</h2>
                    <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, rgba(139,92,246,0.3), transparent)' }} />
                </div>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                    <MetricCard
                        icon="👍"
                        title="Approval Rate"
                        value={performance.approvalRate !== null ? `${performance.approvalRate?.toFixed(1)}%` : '0%'}
                        status={performance.approvalRate >= 60 ? 'good' : performance.approvalRate >= 40 ? 'warning' : 'error'}
                        subtitle={`${performance.approvalRate >= 60 ? 'Great!' : 'Room for improvement'}`}
                        index={4}
                    />
                    <MetricCard
                        icon="👎"
                        title="Rejection Rate"
                        value={performance.rejectionRate !== null ? `${performance.rejectionRate?.toFixed(1)}%` : '0%'}
                        status="info"
                        subtitle="Policies rejected"
                        index={5}
                    />
                    <MetricCard
                        icon="💰"
                        title="Conversion Rate"
                        value={performance.conversionRate !== null ? `${performance.conversionRate?.toFixed(1)}%` : '0%'}
                        status={performance.conversionRate >= 50 ? 'good' : performance.conversionRate >= 30 ? 'warning' : 'error'}
                        subtitle={performance.conversionRate >= 50 ? 'Excellent!' : 'Can improve'}
                        index={6}
                    />
                    <MetricCard
                        icon="💡"
                        title="Alternatives Suggested"
                        value={performance.alternativesRecommended ?? 0}
                        status="info"
                        subtitle="Better options provided"
                        index={7}
                    />
                </div>
            </div>

            {/* ── Activity Charts ── */}
            <div style={{ marginBottom: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                >
                    <h3>📅 Consultation Activity</h3>
                    <div style={{ height: 250, marginTop: 20 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'This Week', value: performance.consultationsThisWeek || 0 },
                                { name: 'Last Month', value: performance.consultationsThisMonth || 0 },
                                { name: 'Total', value: performance.totalConsultations || 0 }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                    style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
                >
                    <div style={{ fontSize: '4rem', marginBottom: 20 }}>🏆</div>
                    <h3>Agent Rank</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: '#f59e0b', margin: '10px 0' }}>
                        {performance.rankPercentile ? `Top ${Math.max(1, 100 - performance.rankPercentile)}%` : 'New Agent'}
                    </div>
                    <p style={{ opacity: 0.7 }}>
                        {performance.rankPercentile
                            ? `You are performing better than ${performance.rankPercentile}% of agents!`
                            : "Complete consultations to earn a rank."}
                    </p>

                    <div style={{ marginTop: 30, width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span>Percentile Score</span>
                            <span>{performance.rankPercentile || 0}/100</span>
                        </div>
                        <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${performance.rankPercentile || 0}%`, height: '100%', background: '#f59e0b' }}></div>
                        </div>
                    </div>
                </motion.div>
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
            <div style={{ marginBottom: 40 }}>
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

            {/* Customer Reviews */}
            <ReviewsSection agentId={performance.agentId} />
        </div>
    );
}

function ReviewsSection({ agentId }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!agentId) return;
        api.get(`/agents/${agentId}/reviews`)
            .then(res => setReviews(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [agentId]);

    if (loading) return <div>Loading reviews...</div>;

    if (reviews.length === 0) {
        return (
            <div className="card" style={{ padding: 40, textAlign: 'center', opacity: 0.7 }}>
                <h3>No reviews yet</h3>
                <p>Complete consultations to receive feedback from customers.</p>
            </div>
        );
    }

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>⭐ Customer Reviews ({reviews.length})</h2>
            <div className="grid">
                {reviews.map((review, idx) => (
                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="card"
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                            <div style={{ display: 'flex', gap: 5 }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <span key={star} style={{ color: star <= review.rating ? '#f59e0b' : '#374151', fontSize: '1.2rem' }}>★</span>
                                ))}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <p style={{ fontStyle: 'italic', marginBottom: 15 }}>"{review.feedback}"</p>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            - {review.user?.name || 'Customer'}
                        </div>
                    </motion.div>
                ))}
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
