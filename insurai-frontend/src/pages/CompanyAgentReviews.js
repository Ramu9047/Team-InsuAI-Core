import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

const StarRating = ({ rating, animated = false }) => (
    <div style={{ display: 'flex', gap: 4 }}>
        {[1, 2, 3, 4, 5].map(s => (
            <motion.span
                key={s}
                initial={animated ? { scale: 0, opacity: 0 } : false}
                animate={animated ? { scale: 1, opacity: 1 } : false}
                transition={{ delay: s * 0.08, type: 'spring', stiffness: 300 }}
                style={{
                    color: s <= rating ? '#f59e0b' : 'rgba(255,255,255,0.15)',
                    fontSize: '1.1rem',
                    textShadow: s <= rating ? '0 0 10px rgba(245,158,11,0.4)' : 'none'
                }}
            >
                ★
            </motion.span>
        ))}
    </div>
);

const VerifiedBadge = () => (
    <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 8px', borderRadius: 12,
        background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
        fontSize: '0.7rem', fontWeight: 700, color: '#10b981'
    }}>
        <span>✓</span> Verified Review
    </div>
);

export default function CompanyAgentReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/company/agent-reviews')
            .then(res => setReviews(res.data))
            .catch(err => console.error("Failed to fetch agent reviews", err))
            .finally(() => setLoading(false));
    }, []);

    const distribution = useMemo(() => {
        const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            const star = Math.round(r.rating) || 1;
            dist[star] = (dist[star] || 0) + 1;
        });
        return dist;
    }, [reviews]);

    const averageRating = useMemo(() => {
        if (!reviews.length) return 0;
        return (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1);
    }, [reviews]);

    if (loading) return (
        <div style={{ padding: 40, maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ height: 200, borderRadius: 18, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
        </div>
    );

    return (
        <div style={{ maxWidth: 1100, margin: "20px auto", padding: "0 20px" }}>
            <h1 className="text-gradient" style={{ marginBottom: 30 }}>Platform Feedback & Reviews</h1>

            {reviews.length > 0 && (
                <div style={{
                    display: 'flex', gap: 30, flexWrap: 'wrap', marginBottom: 40,
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 20, padding: 30, backdropFilter: 'blur(20px)'
                }}>
                    <div style={{ flex: '1', minWidth: 250, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1, color: '#f59e0b', textShadow: '0 4px 20px rgba(245,158,11,0.3)' }}>
                            {averageRating}
                        </div>
                        <div style={{ margin: '10px 0' }}>
                            <StarRating rating={averageRating} animated />
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                            Based on {reviews.length} reviews
                        </div>
                    </div>

                    <div style={{ flex: '2', minWidth: 300 }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.05rem', color: 'var(--text-main)' }}>Rating Distribution</h3>
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = distribution[star];
                            const percentage = reviews.length ? (count / reviews.length) * 100 : 0;
                            return (
                                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 8 }}>
                                    <div style={{ width: 45, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{star} Stars</div>
                                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', height: 10, borderRadius: 5, overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            style={{
                                                height: '100%', borderRadius: 5,
                                                background: star >= 4 ? '#10b981' : star === 3 ? '#f59e0b' : '#ef4444'
                                            }}
                                        />
                                    </div>
                                    <div style={{ width: 30, fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>{count}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {reviews.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 20 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 15 }}>🌟</div>
                    <h3 style={{ margin: '0 0 10px 0' }}>No Reviews Yet</h3>
                    <p style={{ color: 'var(--text-muted)' }}>As agents complete consultations, their feedback will appear here.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                    <AnimatePresence>
                        {reviews.map((review, idx) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                style={{
                                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: 18, padding: 24, display: 'flex', flexDirection: 'column'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 44, height: 44, borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.2rem', fontWeight: 700, color: 'white'
                                        }}>
                                            {review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{review.user?.name || 'Anonymous User'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                        </div>
                                    </div>
                                    {review.booking?.id && <VerifiedBadge />}
                                </div>

                                <div style={{ marginBottom: 16 }}>
                                    <StarRating rating={review.rating} />
                                </div>

                                <div style={{
                                    fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6,
                                    fontStyle: 'italic', flex: 1, marginBottom: 20
                                }}>
                                    "{review.feedback || 'No written feedback provided.'}"
                                </div>

                                <div style={{
                                    borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16,
                                    fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between'
                                }}>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Agent:</span> <strong style={{ color: '#06b6d4' }}>{review.agent?.name}</strong></div>
                                    {review.booking?.policy?.name && (
                                        <div><span style={{ color: 'var(--text-muted)' }}>Policy:</span> <strong>{review.booking.policy.name}</strong></div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
