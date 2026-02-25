import { useEffect, useState } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

export default function CompanyAgentReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/company/agent-reviews')
            .then(res => setReviews(res.data))
            .catch(err => console.error("Failed to fetch agent reviews", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading reviews...</div>;

    return (
        <div className="container" style={{ marginTop: 20 }}>
            <h1 className="text-gradient" style={{ marginBottom: 30 }}>Company Agent Reviews</h1>

            {reviews.length === 0 ? (
                <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                    <p>No agent reviews found.</p>
                </div>
            ) : (
                <div className="standard-card-grid">
                    <AnimatePresence>
                        {reviews.map(review => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="card"
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                                        Agent: {review.agent?.name}
                                    </div>
                                    <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                                        {review.rating} ⭐
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 15 }}>
                                    <strong>Client:</strong> {review.user?.name} <br />
                                    <strong>Policy:</strong> {review.booking?.policy?.name || 'General Consultation'} <br />
                                    <strong>Date:</strong> {new Date(review.createdAt).toLocaleDateString()}
                                </div>

                                <div style={{ padding: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 8, fontStyle: 'italic', color: 'var(--text-main)' }}>
                                    "{review.feedback || 'No written feedback provided.'}"
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
