import { useEffect, useState, useCallback } from "react";
import { useNotification } from "../context/NotificationContext";
import api from "../services/api";
import StandardCard from "../components/StandardCard";
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

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

    return (
        <div className="container" style={{ marginTop: 20 }}>
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

            {/* Header */}
            <h1 className="text-gradient" style={{ marginBottom: 30 }}>Feedback Management</h1>

            {/* Statistics */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 20, marginBottom: 30 }}>
                    <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalFeedback}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Feedback</div>
                    </div>
                    <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-pending)' }}>{stats.openFeedback}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Open</div>
                    </div>
                    <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.inProgressFeedback}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>In Progress</div>
                    </div>
                    <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-approved)' }}>{stats.resolvedFeedback}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Resolved</div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div style={{ marginBottom: 30 }}>
                <div style={{ display: 'flex', gap: 20, marginBottom: 20, borderBottom: '1px solid var(--glass-border)', paddingBottom: 10 }}>
                    <h2
                        onClick={() => setActiveDashboard('SYSTEM')}
                        style={{
                            cursor: 'pointer',
                            color: activeDashboard === 'SYSTEM' ? 'var(--primary)' : 'var(--text-muted)',
                            borderBottom: activeDashboard === 'SYSTEM' ? '2px solid var(--primary)' : 'none',
                            paddingBottom: 5
                        }}
                    >
                        System Feedback
                    </h2>
                    <h2
                        onClick={() => setActiveDashboard('AGENTS')}
                        style={{
                            cursor: 'pointer',
                            color: activeDashboard === 'AGENTS' ? 'var(--primary)' : 'var(--text-muted)',
                            borderBottom: activeDashboard === 'AGENTS' ? '2px solid var(--primary)' : 'none',
                            paddingBottom: 5
                        }}
                    >
                        Agent Reviews
                    </h2>
                </div>

                {activeDashboard === 'SYSTEM' ? (
                    <>
                        <div style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Status Filter</label>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        style={{
                                            padding: '8px 16px',
                                            background: filter === status ? 'var(--primary)' : 'transparent',
                                            border: '1px solid var(--primary)',
                                            borderRadius: 20,
                                            color: filter === status ? 'white' : 'var(--primary)',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {status.replace(/_/g, ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Category Filter</label>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {['ALL', 'BUG', 'QUERY', 'SUGGESTION', 'COMPLAINT'].map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setCategoryFilter(category)}
                                        style={{
                                            padding: '8px 16px',
                                            background: categoryFilter === category ? 'var(--primary)' : 'transparent',
                                            border: '1px solid var(--primary)',
                                            borderRadius: 20,
                                            color: categoryFilter === category ? 'white' : 'var(--primary)',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ padding: 15, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                        Viewing all agent reviews. Use browser search to filter by agent/user.
                    </div>
                )}
            </div>

            {/* Content Switch */}
            {activeDashboard === 'AGENTS' ? (
                <AgentReviewsList />
            ) : (
                /* Feedback List */
                filteredFeedback.length === 0 ? (
                    <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)' }}>No feedback found with selected filters</p>
                    </div>
                ) : (
                    <div className="standard-card-grid">
                        {filteredFeedback.map(item => {
                            const categoryIcons = {
                                BUG: '🐛',
                                QUERY: '❓',
                                SUGGESTION: '💡',
                                COMPLAINT: '⚠️'
                            };

                            const actions = [];

                            if (item.status !== 'RESOLVED') {
                                actions.push({
                                    label: 'View Details',
                                    onClick: () => setDetailModal({ isOpen: true, feedback: item }),
                                    variant: 'primary',
                                    icon: '👁️'
                                });
                            }

                            if (!item.assignedTo) {
                                actions.push({
                                    label: 'Assign',
                                    onClick: () => setAssignModal({ isOpen: true, feedback: item }),
                                    variant: 'secondary',
                                    icon: '👤'
                                });
                            }

                            return (
                                <StandardCard
                                    key={item.id}
                                    variant="default"
                                    title={item.subject}
                                    subtitle={`${categoryIcons[item.category]} ${item.category} • ${new Date(item.createdAt).toLocaleDateString()}`}
                                    status={item.status}
                                    icon={categoryIcons[item.category]}
                                    actions={actions}
                                >
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        <p style={{ margin: '0 0 10px 0', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {item.description}
                                        </p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: 10 }}>
                                            <span><strong>From:</strong> {item.user?.name || 'User'}</span>
                                            {item.assignedTo && <span><strong>Assigned to:</strong> {item.assignedTo.name}</span>}
                                        </div>
                                    </div>
                                </StandardCard>
                            );
                        })}
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
        <Modal isOpen={isOpen} onClose={onClose} title="Feedback Details">
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

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" className="secondary-btn" onClick={onClose} style={{ flex: 1 }}>
                            Cancel
                        </button>
                        <button type="submit" className="primary-btn" style={{ flex: 1 }}>
                            Update
                        </button>
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
        <Modal isOpen={isOpen} onClose={onClose} title="Assign Feedback">
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

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" className="secondary-btn" onClick={onClose} style={{ flex: 1 }}>
                            Cancel
                        </button>
                        <button type="submit" className="primary-btn" style={{ flex: 1 }}>
                            Assign
                        </button>
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

    if (loading) return <div>Loading reviews...</div>;

    if (reviews.length === 0) {
        return (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                <p>No agent reviews found.</p>
            </div>
        );
    }

    return (
        <div className="standard-card-grid">
            {reviews.map(review => (
                <StandardCard
                    key={review.id}
                    title={`${review.agent?.name || 'Agent'} (${review.rating}★)`}
                    subtitle={`From: ${review.user?.name || 'User'} • ${new Date(review.createdAt).toLocaleDateString()}`}
                    icon="⭐"
                    variant="default"
                    status="COMPLETED"
                >
                    <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>"{review.feedback}"</p>
                </StandardCard>
            ))}
        </div>
    );
}
