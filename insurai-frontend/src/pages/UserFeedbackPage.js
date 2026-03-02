import { useEffect, useState, useCallback } from "react";
import { useNotification } from "../context/NotificationContext";
import { motion } from "framer-motion";
import api from "../services/api";
import FeedbackForm from "../components/FeedbackForm";

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

    const categoryIcons = {
        BUG: '🐛',
        QUERY: '❓',
        SUGGESTION: '💡',
        COMPLAINT: '⚠️'
    };

    if (loading) return (
        <div style={{ padding: '60px 40px', maxWidth: 1000, margin: '0 auto' }}>
            <div className="skeleton" style={{ height: 36, width: '40%', marginBottom: 12, borderRadius: 10 }} />
            <div className="skeleton" style={{ height: 18, width: '24%', marginBottom: 32, borderRadius: 8 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16 }} />)}
            </div>
        </div>
    );

    return (
        <div style={{ padding: '36px 32px', maxWidth: 1000, margin: '0 auto' }}>

            {/* ── Page Header ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span className="badge badge-user" style={{ fontSize: '0.7rem' }}>👤 User</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: "'Space Grotesk',sans-serif" }}>
                            Feedback &amp; <span className="text-gradient">Support</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', margin: '6px 0 0', fontSize: '0.9rem' }}>
                            Share your thoughts, report bugs, or get help from our team.
                        </p>
                    </div>
                    <button className="primary-btn" onClick={() => setShowForm(!showForm)} style={{ padding: '10px 22px', fontWeight: 700, flexShrink: 0 }}>
                        {showForm ? '📋 My Feedback' : '➕ New Feedback'}
                    </button>
                </div>
                <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(59,130,246,0.5), transparent)', marginTop: 16 }} />
            </motion.div>

            {/* Toggle between form and feedback list */}
            {showForm ? (
                <div>
                    <FeedbackForm />
                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <button className="secondary-btn" onClick={() => { setShowForm(false); fetchMyFeedback(); }}>
                            ← Back to My Feedback
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <h2 style={{ marginBottom: 20, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        📎 My Feedback History
                    </h2>

                    {myFeedback.length === 0 ? (
                        <div className="card" style={{ padding: '60px 40px', textAlign: 'center' }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: 14 }}>💬</div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontWeight: 500 }}>
                                You haven't submitted any feedback yet.
                            </p>
                            <button className="primary-btn" onClick={() => setShowForm(true)}>
                                Submit Your First Feedback
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {myFeedback.map((item, i) => {
                                const statusCfg = {
                                    OPEN: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
                                    IN_PROGRESS: { color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)' },
                                    RESOLVED: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
                                };
                                const sc = statusCfg[item.status] || statusCfg.OPEN;
                                return (
                                    <motion.div key={item.id}
                                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                                        className="card"
                                        style={{ padding: '20px 24px', borderLeft: `4px solid ${sc.color}` }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <span style={{ fontSize: '1.3rem' }}>{categoryIcons[item.category]}</span>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{item.subject}</div>
                                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                                        {item.category} &middot; {new Date(item.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                                                background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                                            }}>{item.status.replace(/_/g, ' ')}</span>
                                        </div>

                                        <p style={{
                                            margin: '0 0 12px', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5,
                                            overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                                        }}>{item.description}</p>

                                        <div style={{ display: 'flex', gap: 20, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                            {item.assignedTo && <span>👤 Assigned: {item.assignedTo.name}</span>}
                                            {item.resolvedAt && <span>✅ Resolved: {new Date(item.resolvedAt).toLocaleDateString()}</span>}
                                        </div>

                                        {item.adminResponse && (
                                            <div style={{
                                                marginTop: 14, padding: '12px 16px', borderRadius: 10,
                                                background: 'rgba(99,102,241,0.08)',
                                                border: '1px solid rgba(99,102,241,0.2)',
                                            }}>
                                                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a5b4fc', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    💬 Team Response
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{item.adminResponse}</div>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    <div style={{
                        marginTop: 28, padding: '18px 22px', borderRadius: 14,
                        background: 'rgba(99,102,241,0.06)',
                        border: '1px solid rgba(99,102,241,0.2)'
                    }}>
                        <h3 style={{ margin: '0 0 12px', color: '#a5b4fc', fontSize: '0.95rem', fontWeight: 700 }}>💡 Feedback Tips</h3>
                        <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 2 }}>
                            <li>Be specific and detailed in your description</li>
                            <li>For bugs, include steps to reproduce the issue</li>
                            <li>For queries, provide context about what you're trying to do</li>
                            <li>For urgent issues, email <strong style={{ color: '#a5b4fc' }}>support@insurai.com</strong></li>
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}
