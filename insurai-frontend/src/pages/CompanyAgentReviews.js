import { useEffect, useState } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

/* ── Animated Star Rating Display ── */
function StarRating({ rating, size = '1.2rem' }) {
    return (
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map(s => (
                <motion.span
                    key={s}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: s * 0.06 }}
                    style={{ fontSize: size, color: s <= rating ? '#fbbf24' : 'rgba(255,255,255,0.15)' }}
                >
                    ★
                </motion.span>
            ))}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 4, fontWeight: 700 }}>
                {rating?.toFixed(1)}
            </span>
        </div>
    );
}

/* ── Rating Distribution Bar ── */
function RatingDistribution({ reviews }) {
    const counts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length
    }));
    const max = Math.max(...counts.map(c => c.count), 1);
    const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;

    return (
        <div className="card" style={{ padding: '22px 26px', marginBottom: 28 }}>
            <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Big average */}
                <div style={{ textAlign: 'center', minWidth: 90 }}>
                    <div style={{ fontSize: '3rem', fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>
                        {avg.toFixed(1)}
                    </div>
                    <StarRating rating={Math.round(avg)} size="1rem" />
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
                        {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* Bar breakdown */}
                <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {counts.map(({ star, count }) => (
                        <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', width: 14, textAlign: 'right' }}>{star}</span>
                            <span style={{ color: '#fbbf24', fontSize: '0.85rem' }}>★</span>
                            <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(count / max) * 100}%` }}
                                    transition={{ duration: 0.5, delay: star * 0.05 }}
                                    style={{ height: '100%', background: '#fbbf24', borderRadius: 4 }}
                                />
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: 18 }}>{count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function CompanyAgentReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('latest'); // latest | highest | lowest

    useEffect(() => {
        api.get('/company/agent-reviews')
            .then(res => setReviews(res.data))
            .catch(err => console.error("Failed to fetch agent reviews", err))
            .finally(() => setLoading(false));
    }, []);

    const sorted = [...reviews].sort((a, b) => {
        if (sortBy === 'highest') return b.rating - a.rating;
        if (sortBy === 'lowest') return a.rating - b.rating;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    if (loading) return (
        <div style={{ padding: '60px 40px', maxWidth: 1100, margin: '0 auto' }}>
            <div className="skeleton" style={{ height: 36, width: '45%', marginBottom: 12, borderRadius: 10 }} />
            <div className="skeleton" style={{ height: 110, width: '100%', marginBottom: 28, borderRadius: 16 }} />
            <div className="grid">
                {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 16 }} />)}
            </div>
        </div>
    );

    return (
        <div style={{ padding: '36px 40px', maxWidth: 1100, margin: '0 auto' }}>

            {/* ── Hero Header ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span className="badge badge-company-admin" style={{ fontSize: '0.7rem' }}>🏢 Company Admin</span>
                </div>
                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: "'Space Grotesk',sans-serif" }}>
                    Agent <span className="text-gradient">Reviews</span>
                </h1>
                <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Client feedback and ratings for your company's agents.
                </p>
                <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(20,184,166,0.5), transparent)', marginTop: 16 }} />
            </motion.div>

            {reviews.length === 0 ? (
                <div className="card" style={{ padding: '60px 40px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 14 }}>⭐</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>No agent reviews yet.</p>
                </div>
            ) : (
                <>
                    {/* ── Rating Distribution ── */}
                    <RatingDistribution reviews={reviews} />

                    {/* ── Sort Controls ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>SORT:</span>
                        {[
                            { key: 'latest', label: '🕐 Latest' },
                            { key: 'highest', label: '⬆️ Highest' },
                            { key: 'lowest', label: '⬇️ Lowest' },
                        ].map(opt => (
                            <button
                                key={opt.key}
                                onClick={() => setSortBy(opt.key)}
                                className={sortBy === opt.key ? 'primary-btn' : 'secondary-btn'}
                                style={{ padding: '6px 16px', fontSize: '0.82rem' }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Review Cards ── */}
                    <div className="grid">
                        <AnimatePresence>
                            {sorted.map((review, i) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="card"
                                    style={{ borderTop: `3px solid ${review.rating >= 4 ? '#10b981' : review.rating >= 3 ? '#f59e0b' : '#ef4444'}`, padding: '20px 22px' }}
                                >
                                    {/* Agent + Stars row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', marginBottom: 2 }}>
                                                🧑‍💼 {review.agent?.name || 'Agent'}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                👤 {review.user?.name || 'Client'}
                                            </div>
                                        </div>
                                        <StarRating rating={review.rating} />
                                    </div>

                                    {/* Policy */}
                                    {review.booking?.policy?.name && (
                                        <div style={{ marginBottom: 10 }}>
                                            <span style={{
                                                background: 'rgba(99,102,241,0.1)', color: '#a5b4fc',
                                                padding: '3px 10px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600
                                            }}>
                                                📄 {review.booking.policy.name}
                                            </span>
                                        </div>
                                    )}

                                    {/* Feedback quote */}
                                    <div style={{
                                        padding: '10px 14px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--border-subtle)',
                                        borderLeft: '3px solid rgba(251,191,36,0.4)',
                                        borderRadius: 8,
                                        fontSize: '0.88rem', fontStyle: 'italic',
                                        color: 'var(--text-sub)', lineHeight: 1.5,
                                        marginBottom: 12
                                    }}>
                                        "{review.feedback || 'No written feedback provided.'}"
                                    </div>

                                    {/* Date */}
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        📅 {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </>
            )}
        </div>
    );
}
