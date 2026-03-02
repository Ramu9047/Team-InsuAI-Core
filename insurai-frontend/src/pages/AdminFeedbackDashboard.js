import { useEffect, useState, useCallback } from "react";
import { useNotification } from "../context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import Modal from "../components/Modal";

export default function AdminFeedbackDashboard() {
    const { notify } = useNotification();
    const [feedback, setFeedback] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [detailModal, setDetailModal] = useState({ isOpen: false, feedback: null });
    const [assignModal, setAssignModal] = useState({ isOpen: false, feedback: null });
    const [agents, setAgents] = useState([]);
    const [activeDashboard, setActiveDashboard] = useState('SYSTEM');

    const fetchData = useCallback(() => {
        Promise.all([
            api.get('/feedback'),
            api.get('/agents')
        ])
            .then(([feedbackRes, agentsRes]) => {
                const feedbackList = feedbackRes.data;
                setFeedback(feedbackList);
                setAgents(agentsRes.data);

                setStats({
                    totalFeedback: feedbackList.length,
                    openFeedback: feedbackList.filter(f => f.status === 'OPEN').length,
                    inProgressFeedback: feedbackList.filter(f => f.status === 'IN_PROGRESS').length,
                    resolvedFeedback: feedbackList.filter(f => f.status === 'RESOLVED').length
                });
            })
            .catch(err => {
                console.error(err);
                notify("Failed to load feedback data", "error");
            })
            .finally(() => setLoading(false));
    }, [notify]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAssign = async (feedbackId, assigneeId) => {
        try {
            await api.patch(`/feedback/${feedbackId}/assign/${assigneeId}`);
            notify("Feedback assigned successfully!", "success");
            setAssignModal({ isOpen: false, feedback: null });
            fetchData();
        } catch (err) {
            notify(err.response?.data?.error || "Failed to assign feedback", "error");
        }
    };

    const handleUpdateStatus = async (feedbackId, status, adminResponse) => {
        try {
            await api.patch(`/feedback/${feedbackId}`, { status, adminResponse });
            notify("Status updated successfully!", "success");
            setDetailModal({ isOpen: false, feedback: null });
            fetchData();
        } catch (err) {
            notify(err.response?.data?.error || "Failed to update status", "error");
        }
    };

    const filteredFeedback = feedback.filter(f => {
        const statusMatch = filter === 'ALL' || f.status === filter;
        const categoryMatch = categoryFilter === 'ALL' || f.category === categoryFilter;
        return statusMatch && categoryMatch;
    });

    if (loading) return (
        <div style={{ padding: '60px 40px', maxWidth: 1200, margin: '0 auto' }}>
            <div className="skeleton" style={{ height: 36, width: '40%', marginBottom: 12, borderRadius: 10 }} />
            <div className="skeleton" style={{ height: 16, width: '26%', marginBottom: 36, borderRadius: 8 }} />
            <div className="grid">
                {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16 }} />)}
            </div>
        </div>
    );

    return (
        <div style={{ padding: '36px 40px', maxWidth: 1200, margin: '0 auto' }}>
            {/* Detail Modal */}
            <FeedbackDetailModal
                isOpen={detailModal.isOpen}
                onClose={() => setDetailModal({ isOpen: false, feedback: null })}
                feedback={detailModal.feedback}
                onUpdateStatus={handleUpdateStatus}
            />

            {/* Assign Modal */}
            <AssignModal
                isOpen={assignModal.isOpen}
                onClose={() => setAssignModal({ isOpen: false, feedback: null })}
                feedback={assignModal.feedback}
                agents={agents}
                onAssign={handleAssign}
            />

            {/* ── Hero Header ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span className="badge badge-super-admin" style={{ fontSize: '0.7rem' }}>🔐 Super Admin</span>
                </div>
                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: "'Space Grotesk',sans-serif" }}>
                    Feedback <span className="text-gradient">Management</span>
                </h1>
                <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Review, assign, and resolve all platform feedback and agent reviews.
                </p>
                <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(245,158,11,0.5), transparent)', marginTop: 16 }} />
            </motion.div>

            {/* ── Stats KPI Row ── */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 28 }}>
                    {[{ label: 'Total', value: stats.totalFeedback, color: '#6366f1', icon: '📥' },
                    { label: 'Open', value: stats.openFeedback, color: '#f59e0b', icon: '🕓' },
                    { label: 'In Progress', value: stats.inProgressFeedback, color: '#3b82f6', icon: '⚙️' },
                    { label: 'Resolved', value: stats.resolvedFeedback, color: '#10b981', icon: '✅' }
                    ].map((s, i) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                            className="card"
                            style={{ borderTop: `3px solid ${s.color}`, padding: '18px 20px', textAlign: 'center' }}
                        >
                            <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{s.icon}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4, fontWeight: 600 }}>{s.label}</div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* ── Filters ── */}
            <div style={{ marginBottom: 26 }}>
                {/* Section tabs */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 0 }}>
                    {['SYSTEM', 'AGENTS'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveDashboard(tab)}
                            style={{
                                padding: '9px 20px', background: 'transparent', border: 'none',
                                borderBottom: activeDashboard === tab ? '2px solid var(--primary)' : '2px solid transparent',
                                color: activeDashboard === tab ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: activeDashboard === tab ? 700 : 500,
                                cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s'
                            }}
                        >
                            {tab === 'SYSTEM' ? '📊 System Feedback' : '⭐ Agent Reviews'}
                        </button>
                    ))}
                </div>

                {activeDashboard === 'SYSTEM' ? (
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div>
                            <label className="form-label">Status</label>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={filter === status ? 'primary-btn' : 'secondary-btn'}
                                        style={{ padding: '7px 16px', fontSize: '0.82rem' }}
                                    >
                                        {status.replace(/_/g, ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="form-label">Category</label>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {['ALL', 'BUG', 'QUERY', 'SUGGESTION', 'COMPLAINT'].map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setCategoryFilter(category)}
                                        className={categoryFilter === category ? 'primary-btn' : 'secondary-btn'}
                                        style={{ padding: '7px 16px', fontSize: '0.82rem' }}
                                    >
                                        {category === 'BUG' ? '🐛' : category === 'QUERY' ? '❓' : category === 'SUGGESTION' ? '💡' : category === 'COMPLAINT' ? '⚠️' : '🗂️'} {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        Viewing all agent reviews from your platform.
                    </div>
                )}
            </div>

            {/* ── Content Switch ── */}
            {activeDashboard === 'AGENTS' ? (
                <AgentReviewsList />
            ) : (
                filteredFeedback.length === 0 ? (
                    <div className="card" style={{ padding: '50px 40px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📬</div>
                        <p style={{ color: 'var(--text-muted)' }}>No feedback found with selected filters.</p>
                    </div>
                ) : (
                    <div className="grid">
                        <AnimatePresence>
                            {filteredFeedback.map((item, i) => {
                                const categoryIcons = { BUG: '🐛', QUERY: '❓', SUGGESTION: '💡', COMPLAINT: '⚠️' };
                                const statusColors = { OPEN: '#f59e0b', IN_PROGRESS: '#6366f1', RESOLVED: '#10b981' };
                                const statusColor = statusColors[item.status] || '#6b7280';
                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 14 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="card"
                                        style={{ borderLeft: `3px solid ${statusColor}`, padding: '18px 20px' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                            <div style={{ flex: 1, marginRight: 12 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                    <span style={{ fontSize: '1.1rem' }}>{categoryIcons[item.category] || '📥'}</span>
                                                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{item.subject}</h4>
                                                </div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                    {item.category} • {new Date(item.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <span style={{
                                                background: `${statusColor}18`, color: statusColor,
                                                border: `1px solid ${statusColor}30`,
                                                padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap'
                                            }}>{item.status.replace('_', ' ')}</span>
                                        </div>
                                        <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {item.description}
                                        </p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>👤 {item.user?.name || 'User'}{item.assignedTo ? ` • 🧑‍💼 ${item.assignedTo.name}` : ''}</span>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                {item.status !== 'RESOLVED' && (
                                                    <button className="secondary-btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                                                        onClick={() => setDetailModal({ isOpen: true, feedback: item })}>
                                                        👁️ View
                                                    </button>
                                                )}
                                                {!item.assignedTo && (
                                                    <button className="primary-btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                                                        onClick={() => setAssignModal({ isOpen: true, feedback: item })}>
                                                        👤 Assign
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )
            )}
        </div>
    );
}

// Feedback Detail Modal
function FeedbackDetailModal({ isOpen, onClose, feedback, onUpdateStatus }) {
    const [status, setStatus] = useState('');
    const [adminResponse, setAdminResponse] = useState('');

    useEffect(() => {
        if (feedback) {
            setStatus(feedback.status);
            setAdminResponse(feedback.adminResponse || '');
        }
    }, [feedback]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdateStatus(feedback.id, status, adminResponse);
    };

    if (!feedback) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Feedback Details"
            actions={
                <>
                    <button type="button" className="secondary-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="button" className="primary-btn" onClick={handleSubmit}>
                        Update
                    </button>
                </>
            }
        >
            <div style={{ color: 'var(--text-main)' }}>
                <div style={{ marginBottom: 20, padding: 15, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>{feedback.subject}</h3>
                    <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: 10 }}>
                        <span style={{ marginRight: 15 }}>📁 {feedback.category}</span>
                        <span style={{ marginRight: 15 }}>👤 {feedback.user?.name}</span>
                        <span>📅 {new Date(feedback.createdAt).toLocaleString()}</span>
                    </div>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{feedback.description}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'block', marginBottom: 8 }}>Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            style={{
                                width: '100%',
                                padding: 12,
                                borderRadius: 8,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--card-border)',
                                color: 'white'
                            }}
                        >
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', marginBottom: 8 }}>Admin Response</label>
                        <textarea
                            value={adminResponse}
                            onChange={(e) => setAdminResponse(e.target.value)}
                            placeholder="Add your response..."
                            rows={4}
                            style={{
                                width: '100%',
                                padding: 12,
                                borderRadius: 8,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--card-border)',
                                color: 'white',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                </form>
            </div>
        </Modal>
    );
}

// Assign Modal
function AssignModal({ isOpen, onClose, feedback, agents, onAssign }) {
    const [selectedAgent, setSelectedAgent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedAgent) {
            onAssign(feedback.id, selectedAgent);
        }
    };

    if (!feedback) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Assign Feedback"
            actions={
                <>
                    <button type="button" className="secondary-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="button" className="primary-btn" onClick={handleSubmit}>
                        Assign
                    </button>
                </>
            }
        >
            <div style={{ color: 'var(--text-main)' }}>
                <div style={{ marginBottom: 20, padding: 15, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>{feedback.subject}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>{feedback.category}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', marginBottom: 8 }}>Assign to</label>
                        <select
                            value={selectedAgent}
                            onChange={(e) => setSelectedAgent(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: 12,
                                borderRadius: 8,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--card-border)',
                                color: 'white'
                            }}
                        >
                            <option value="">Select agent...</option>
                            {agents.map(agent => (
                                <option key={agent.id} value={agent.id}>
                                    {agent.name} - {agent.specialization || 'General'}
                                </option>
                            ))}
                        </select>
                    </div>

                </form>
            </div>
        </Modal>
    );
}

function AgentReviewsList() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/agents/reviews/all')
            .then(res => setReviews(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />;

    if (reviews.length === 0) {
        return (
            <div className="card" style={{ padding: '50px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⭐</div>
                <p style={{ color: 'var(--text-muted)' }}>No agent reviews found.</p>
            </div>
        );
    }

    return (
        <div className="grid">
            {reviews.map((review, i) => (
                <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="card"
                    style={{ borderTop: `3px solid ${review.rating >= 4 ? '#10b981' : review.rating >= 3 ? '#f59e0b' : '#ef4444'}`, padding: '18px 20px' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                            🧑‍💼 {review.agent?.name || 'Agent'}
                        </div>
                        <div style={{ display: 'flex', gap: 2 }}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} style={{ fontSize: '0.9rem', color: s <= review.rating ? '#fbbf24' : 'rgba(255,255,255,0.15)' }}>★</span>
                            ))}
                        </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                        👤 {review.user?.name || 'User'} • {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                    <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderLeft: '3px solid rgba(251,191,36,0.4)', borderRadius: 8, fontSize: '0.88rem', fontStyle: 'italic', color: 'var(--text-sub)' }}>
                        "{review.feedback}"
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
