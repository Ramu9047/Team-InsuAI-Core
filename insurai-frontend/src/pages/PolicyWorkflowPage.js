import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { motion } from 'framer-motion';

/**
 * Policy Purchase Workflow Page
 * Shows user's consultation requests and their status
 */
export default function PolicyWorkflowPage() {
    const { user } = useAuth();
    const { notify } = useNotification();
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);



    const loadWorkflows = useCallback(async () => {
        try {
            const response = await api.get(`/policy-workflow/user/${user.id}`);
            setWorkflows(response.data);
        } catch (error) {
            console.error('Failed to load workflows:', error);
            notify('Failed to load consultation history', 'error');
        } finally {
            setLoading(false);
        }
    }, [user, notify]);

    useEffect(() => {
        if (user) {
            loadWorkflows();
        }
    }, [user, loadWorkflows]);

    const requestConsultationForAlternative = async (policyId) => {
        try {
            await api.post('/policy-workflow/request-consultation', {
                userId: user.id,
                policyId: policyId,
                reason: 'Interested in recommended alternative policy'
            });
            notify('Consultation request submitted!', 'success');
            loadWorkflows();
        } catch (error) {
            notify('Failed to submit request', 'error');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'PENDING': { color: '#eab308', text: '⏳ Pending Review', bg: '#fef3c7' },
            'UNDER_REVIEW': { color: '#3b82f6', text: '👁️ Under Review', bg: '#dbeafe' },
            'APPROVED': { color: '#22c55e', text: '✅ Approved', bg: '#dcfce7' },
            'REJECTED': { color: '#ef4444', text: '❌ Rejected', bg: '#fee2e2' },
            'PENDING_ADMIN_APPROVAL': { color: '#f59e0b', text: '🔍 Admin Review', bg: '#fed7aa' },
            'CONSULTATION_REQUESTED': { color: '#8b5cf6', text: '📋 Requested', bg: '#ede9fe' }
        };

        const badge = badges[status] || badges['PENDING'];

        return (
            <span style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: badge.color,
                backgroundColor: badge.bg
            }}>
                {badge.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div style={{ padding: '60px 40px', maxWidth: 1200, margin: '0 auto' }}>
                <div className="skeleton" style={{ height: 36, width: '40%', marginBottom: 12, borderRadius: 10 }} />
                <div className="skeleton" style={{ height: 16, width: '25%', marginBottom: 36, borderRadius: 8 }} />
                {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16, marginBottom: 20 }} />)}
            </div>
        );
    }

    return (
        <div style={{ padding: '36px 32px', maxWidth: 1200, margin: '0 auto' }}>

            {/* ── Hero Header ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span className="badge badge-user" style={{ fontSize: '0.7rem' }}>👤 User</span>
                </div>
                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: "'Space Grotesk',sans-serif" }}>
                    📋 My Policy <span className="text-gradient">Consultations</span>
                </h1>
                <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Track your policy consultation requests and their real-time status.
                </p>
                <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(99,102,241,0.5), transparent)', marginTop: 16 }} />
            </motion.div>

            {workflows.length === 0 ? (
                <div className="card" style={{ padding: '60px 40px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 14 }}>📋</div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>No consultation requests yet.</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Browse policies and click "Request Consultation" to get started!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {workflows.map((workflow, idx) => {
                        const statusColors = {
                            APPROVED: '#10b981', REJECTED: '#ef4444',
                            PENDING: '#f59e0b', UNDER_REVIEW: '#6366f1',
                            PENDING_ADMIN_APPROVAL: '#f59e0b', CONSULTATION_REQUESTED: '#8b5cf6'
                        };
                        const topColor = statusColors[workflow.status] || 'var(--primary)';
                        return (
                            <motion.div
                                key={workflow.workflowId}
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
                                className="card"
                                style={{ borderTop: `3px solid ${topColor}`, padding: 0, overflow: 'hidden' }}
                            >
                                {/* Header */}
                                <div style={{
                                    padding: '20px 28px',
                                    background: `linear-gradient(135deg, ${topColor}18, transparent)`,
                                    borderBottom: '1px solid var(--border-subtle)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
                                }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                                            {workflow.policyName}
                                        </h3>
                                        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            {workflow.policyType} • ₹{workflow.premium?.toLocaleString()}/year
                                        </p>
                                    </div>
                                    {getStatusBadge(workflow.status)}
                                </div>

                                {/* Content */}
                                <div style={{ padding: '20px 30px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                                        <div>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 5 }}>
                                                Requested On
                                            </p>
                                            <p style={{ fontWeight: '600' }}>
                                                {new Date(workflow.requestedAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>

                                        {workflow.agentName && (
                                            <div>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 5 }}>
                                                    Reviewed By
                                                </p>
                                                <p style={{ fontWeight: '600' }}>
                                                    {workflow.agentName}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Appointment Reason */}
                                    {workflow.appointmentReason && (
                                        <div style={{ marginBottom: 20 }}>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 5 }}>
                                                Your Message
                                            </p>
                                            <p style={{
                                                padding: 15,
                                                background: 'var(--bg-secondary)',
                                                borderRadius: 8,
                                                fontStyle: 'italic'
                                            }}>
                                                "{workflow.appointmentReason}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Agent Notes (if approved) */}
                                    {workflow.status === 'APPROVED' && workflow.agentNotes && (
                                        <div style={{
                                            padding: 15,
                                            background: '#dcfce7',
                                            borderLeft: '4px solid #22c55e',
                                            borderRadius: 8,
                                            marginBottom: 20
                                        }}>
                                            <p style={{ fontSize: '0.85rem', color: '#166534', fontWeight: '600', marginBottom: 5 }}>
                                                ✅ Agent's Notes
                                            </p>
                                            <p style={{ color: '#166534', margin: 0 }}>
                                                {workflow.agentNotes}
                                            </p>
                                        </div>
                                    )}

                                    {/* Rejection with AI Recommendations */}
                                    {workflow.status === 'REJECTED' && (
                                        <div>
                                            <div style={{
                                                padding: 15,
                                                background: '#fee2e2',
                                                borderLeft: '4px solid #ef4444',
                                                borderRadius: 8,
                                                marginBottom: 20
                                            }}>
                                                <p style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: '600', marginBottom: 5 }}>
                                                    ❌ Rejection Reason
                                                </p>
                                                <p style={{ color: '#991b1b', margin: 0 }}>
                                                    {workflow.rejectionReason}
                                                </p>
                                            </div>

                                            {/* AI Recommendations */}
                                            {workflow.aiRecommendations && workflow.aiRecommendations.length > 0 && (
                                                <div>
                                                    <h4 style={{ marginBottom: 15, color: 'var(--text-main)' }}>
                                                        🤖 Recommended Alternatives
                                                    </h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                                                        {workflow.aiRecommendations.map(alt => (
                                                            <div key={alt.policyId} style={{
                                                                padding: 15,
                                                                border: '2px solid var(--card-border)',
                                                                borderRadius: 8,
                                                                background: 'var(--bg-card)',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center'
                                                            }}>
                                                                <div style={{ flex: 1 }}>
                                                                    <h5 style={{ margin: '0 0 5px 0', color: 'var(--text-main)' }}>
                                                                        {alt.policyName}
                                                                    </h5>
                                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>
                                                                        {alt.policyType} • ₹{alt.premium?.toLocaleString()}/year • Coverage: ₹{alt.coverage?.toLocaleString()}
                                                                    </p>
                                                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: 0 }}>
                                                                        💡 {alt.recommendationReason}
                                                                    </p>
                                                                    <div style={{ marginTop: 8 }}>
                                                                        <span style={{
                                                                            fontSize: '0.75rem',
                                                                            padding: '4px 8px',
                                                                            background: '#dbeafe',
                                                                            color: '#1e40af',
                                                                            borderRadius: 12,
                                                                            fontWeight: '600'
                                                                        }}>
                                                                            Match Score: {(alt.matchScore * 100).toFixed(0)}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => requestConsultationForAlternative(alt.policyId)}
                                                                    style={{
                                                                        padding: '10px 20px',
                                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: 8,
                                                                        fontWeight: '600',
                                                                        cursor: 'pointer',
                                                                        marginLeft: 20
                                                                    }}
                                                                >
                                                                    Request Consultation
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Pending Admin Approval */}
                                    {workflow.status === 'PENDING_ADMIN_APPROVAL' && (
                                        <div style={{
                                            padding: 15,
                                            background: '#fed7aa',
                                            borderLeft: '4px solid #f59e0b',
                                            borderRadius: 8
                                        }}>
                                            <p style={{ fontSize: '0.85rem', color: '#92400e', fontWeight: '600', marginBottom: 5 }}>
                                                🔍 Under Admin Review
                                            </p>
                                            <p style={{ color: '#92400e', margin: 0 }}>
                                                Your application has been flagged for additional review. An admin will review it shortly.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
