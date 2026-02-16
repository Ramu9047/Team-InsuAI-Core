import { useEffect, useState, useCallback } from "react";
import { useNotification } from "../context/NotificationContext";
import api from "../services/api";
import FeedbackForm from "../components/FeedbackForm";
import StandardCard from "../components/StandardCard";

export default function UserFeedbackPage() {
    const { notify } = useNotification();
    const [myFeedback, setMyFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const fetchMyFeedback = useCallback(() => {
        api.get('/feedback/my')
            .then(res => {
                setMyFeedback(res.data);
            })
            .catch(err => {
                console.error(err);
                notify("Failed to load your feedback", "error");
            })
            .finally(() => setLoading(false));
    }, [notify]);

    useEffect(() => {
        fetchMyFeedback();
    }, [fetchMyFeedback]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'var(--status-pending)';
            case 'IN_PROGRESS': return 'var(--primary)';
            case 'RESOLVED': return 'var(--status-approved)';
            default: return 'var(--text-muted)';
        }
    };

    const categoryIcons = {
        BUG: '🐛',
        QUERY: '❓',
        SUGGESTION: '💡',
        COMPLAINT: '⚠️'
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

    return (
        <div className="container" style={{ marginTop: 20 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                <div>
                    <h1 className="text-gradient" style={{ margin: 0 }}>Feedback & Support</h1>
                    <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>
                        Share your thoughts or report issues
                    </p>
                </div>
                <button
                    className="primary-btn"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? '📋 View My Feedback' : '➕ Submit New Feedback'}
                </button>
            </div>

            {/* Toggle between form and feedback list */}
            {showForm ? (
                <div>
                    <FeedbackForm />
                    <div style={{ textAlign: 'center', marginTop: 20 }}>
                        <button
                            className="secondary-btn"
                            onClick={() => {
                                setShowForm(false);
                                fetchMyFeedback();
                            }}
                        >
                            ← Back to My Feedback
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* My Feedback List */}
                    <h2 style={{ marginBottom: 20 }}>My Feedback History</h2>

                    {myFeedback.length === 0 ? (
                        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 10 }}>💬</div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                                You haven't submitted any feedback yet.
                            </p>
                            <button className="primary-btn" onClick={() => setShowForm(true)}>
                                Submit Your First Feedback
                            </button>
                        </div>
                    ) : (
                        <div className="standard-card-grid">
                            {myFeedback.map(item => (
                                <StandardCard
                                    key={item.id}
                                    variant="default"
                                    title={item.subject}
                                    subtitle={`${categoryIcons[item.category]} ${item.category}`}
                                    status={item.status}
                                    icon={categoryIcons[item.category]}
                                >
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        <p style={{ margin: '0 0 15px 0', whiteSpace: 'pre-wrap', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                            {item.description}
                                        </p>

                                        <div style={{ padding: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 8, marginBottom: 10 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                <span><strong>Status:</strong></span>
                                                <span style={{ color: getStatusColor(item.status), fontWeight: 600 }}>
                                                    {item.status.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: 5 }}>
                                                <span><strong>Submitted:</strong></span>
                                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {item.assignedTo && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: 5 }}>
                                                    <span><strong>Assigned to:</strong></span>
                                                    <span>{item.assignedTo.name}</span>
                                                </div>
                                            )}
                                            {item.resolvedAt && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: 5 }}>
                                                    <span><strong>Resolved:</strong></span>
                                                    <span>{new Date(item.resolvedAt).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>

                                        {item.adminResponse && (
                                            <div style={{ padding: 12, background: 'rgba(102, 126, 234, 0.1)', borderRadius: 8, border: '1px solid var(--primary)' }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 5, color: 'var(--primary)' }}>
                                                    Admin Response:
                                                </div>
                                                <div style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                                                    {item.adminResponse}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </StandardCard>
                            ))}
                        </div>
                    )}

                    {/* Info Box */}
                    <div style={{
                        marginTop: 30,
                        padding: 20,
                        borderRadius: 12,
                        background: 'rgba(102, 126, 234, 0.1)',
                        border: '1px solid var(--primary)'
                    }}>
                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>💡 Feedback Tips</h3>
                        <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-muted)' }}>
                            <li>Be specific and detailed in your description</li>
                            <li>For bugs, include steps to reproduce the issue</li>
                            <li>For queries, provide context about what you're trying to do</li>
                            <li>For urgent issues, contact support@insurai.com directly</li>
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}
