import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../components/Modal";

// Calendar Utilities
const generateGoogleCalendarLink = (apt) => {
    const title = encodeURIComponent(`Insurance Consultation: ${apt.policy ? apt.policy.name : 'General Inquiry'}`);
    const details = encodeURIComponent(`Meeting with Agent: ${apt.agent?.name || 'InsurAI Agent'}\n\nJoin Link: ${apt.meetingLink}\n\nNotes: ${apt.reason || ''}`);
    const location = encodeURIComponent(apt.meetingLink || 'Online Meeting');

    // Format dates to YYYYMMDDTHHMMSSZ
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().replace(/-|:|\.\d+/g, "");
    };

    const start = formatDate(apt.startTime);
    const end = formatDate(apt.endTime);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
};

const downloadICS = (apt) => {
    const title = `Insurance Consultation: ${apt.policy ? apt.policy.name : 'General Inquiry'}`;
    const description = `Meeting with Agent: ${apt.agent?.name || 'InsurAI Agent'}\\nJoin Link: ${apt.meetingLink}\\nNotes: ${apt.reason || ''}`;
    const location = apt.meetingLink || 'Online Meeting';

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().replace(/-|:|\.\d+/g, "");
    };

    const start = formatDate(apt.startTime);
    const end = formatDate(apt.endTime);
    const now = formatDate(new Date().toISOString());

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//InsurAI//Consultation//EN',
        'BEGIN:VEVENT',
        `UID:${apt.id}@insurai.com`,
        `DTSTAMP:${now}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `consultation-${apt.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export default function MyAppointmentsEnhanced() {
    const { user } = useAuth();
    const { notify } = useNotification();
    const [appointments, setAppointments] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("appointments");
    const [paymentModal, setPaymentModal] = useState({ isOpen: false, policy: null });
    const [rejectionDetails, setRejectionDetails] = useState(null);
    const [reviewModal, setReviewModal] = useState({ isOpen: false, booking: null });
    const [reviewData, setReviewData] = useState({ rating: 5, feedback: '' });
    const [reviewableBookings, setReviewableBookings] = useState({}); // bookingId -> boolean

    const fetchData = useCallback(() => {
        if (!user) return;

        Promise.all([
            api.get(`/bookings/user/${user.id}`),
            api.get(`/policies/user/${user.id}`)
        ])
            .then(([aptRes, polRes]) => {
                const appts = aptRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setAppointments(appts);
                setPolicies(polRes.data);

                // Check review eligibility for completed appointments
                appts.forEach(apt => {
                    if (['CONSULTED', 'POLICY_APPROVED', 'ISSUED', 'ACTIVE', 'REJECTED'].includes(apt.status)) {
                        api.get(`/reviews/can-review/${apt.id}`)
                            .then(res => {
                                setReviewableBookings(prev => ({ ...prev, [apt.id]: res.data.canReview }));
                            })
                            .catch(() => { });
                    }
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchRejectionDetails = async (bookingId) => {
        try {
            const res = await api.get(`/appointment-workflow/${bookingId}/insights`);
            setRejectionDetails(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePayment = async (policyId) => {
        try {
            await api.post(`/appointment-workflow/activate-policy/${policyId}`);
            notify("Payment successful! Policy activated.", "success");
            setPaymentModal({ isOpen: false, policy: null });
            fetchData();
        } catch (err) {
            notify(err.response?.data?.message || "Payment failed", "error");
        }
    };

    const handleReviewSubmit = async () => {
        try {
            await api.post('/reviews/submit', {
                bookingId: reviewModal.booking.id,
                rating: reviewData.rating,
                feedback: reviewData.feedback
            });
            notify("Review submitted successfully!", "success");
            setReviewModal({ isOpen: false, booking: null });
            setReviewData({ rating: 5, feedback: '' });
            fetchData(); // Refresh to update "can review" status
        } catch (err) {
            notify(err.response?.data?.error || "Failed to submit review", "error");
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'REQUESTED': '#f59e0b',
            'MEETING_APPROVED': '#3b82f6',
            'CONSULTED': '#8b5cf6',
            'POLICY_APPROVED': '#10b981',
            'REJECTED': '#ef4444',
            'ISSUED': '#10b981',
            'ACTIVE': '#22c55e'
        };
        return colors[status] || '#6b7280';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'REQUESTED': '⏳',
            'MEETING_APPROVED': '✅',
            'CONSULTED': '💬',
            'POLICY_APPROVED': '🎉',
            'REJECTED': '❌',
            'ISSUED': '📋',
            'ACTIVE': '✅'
        };
        return icons[status] || '📌';
    };

    if (loading) return <div style={{ textAlign: "center", marginTop: 50 }}>Loading...</div>;

    return (
        <div style={{ padding: 30 }}>
            {/* Payment Modal */}
            <Modal
                isOpen={paymentModal.isOpen}
                onClose={() => setPaymentModal({ isOpen: false, policy: null })}
                title="Activate Policy"
                actions={
                    paymentModal.policy && (
                        <>
                            <button
                                className="secondary-btn"
                                onClick={() => setPaymentModal({ isOpen: false, policy: null })}
                            >
                                Cancel
                            </button>
                            <button
                                className="primary-btn"
                                onClick={() => handlePayment(paymentModal.policy.id)}
                                style={{ background: '#10b981', borderColor: '#10b981' }}
                            >
                                Pay ₹{paymentModal.policy.premium}
                            </button>
                        </>
                    )
                }
            >
                {paymentModal.policy && (
                    <div style={{ color: 'var(--text-main)' }}>
                        <div style={{ marginBottom: 20, padding: 15, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                            <h3 style={{ margin: '0 0 10px 0' }}>{paymentModal.policy.policy?.name}</h3>
                            <p><strong>Premium:</strong> ₹{paymentModal.policy.premium}/month</p>
                            <p><strong>Coverage:</strong> ₹{paymentModal.policy.policy?.coverage}</p>
                        </div>

                        <div style={{ padding: 15, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, marginBottom: 20, border: '1px solid #10b981' }}>
                            <p style={{ margin: 0, color: '#10b981' }}>
                                💳 Complete payment to activate your policy
                            </p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Review Modal */}
            <Modal
                isOpen={reviewModal.isOpen}
                onClose={() => setReviewModal({ isOpen: false, booking: null })}
                title="Rate Agent & Consultation"
                actions={
                    reviewModal.booking && (
                        <>
                            <button
                                className="secondary-btn"
                                onClick={() => setReviewModal({ isOpen: false, booking: null })}
                            >
                                Cancel
                            </button>
                            <button
                                className="primary-btn"
                                onClick={handleReviewSubmit}
                                style={{ background: '#fbbf24', borderColor: '#fbbf24', color: '#000' }}
                            >
                                Submit Review
                            </button>
                        </>
                    )
                }
            >
                <div style={{ color: 'var(--text-main)' }}>
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <p>How was your experience with <strong>{reviewModal.booking?.agent?.name}</strong>?</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, fontSize: '2rem', cursor: 'pointer' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <span
                                    key={star}
                                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                                    style={{ color: star <= reviewData.rating ? '#fbbf24' : '#4b5563', transition: 'color 0.2s' }}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>

                    <textarea
                        placeholder="Share your feedback (optional)..."
                        value={reviewData.feedback}
                        onChange={(e) => setReviewData({ ...reviewData, feedback: e.target.value })}
                        rows={4}
                        style={{
                            width: '100%',
                            padding: 12,
                            borderRadius: 8,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--card-border)',
                            color: 'white',
                            fontFamily: 'inherit',
                            marginBottom: 20
                        }}
                    />
                </div>
            </Modal>

            {/* Rejection Details Modal */}
            <Modal
                isOpen={!!rejectionDetails}
                onClose={() => setRejectionDetails(null)}
                title="Rejection Details & Alternatives"
                actions={
                    <button
                        className="primary-btn"
                        onClick={() => setRejectionDetails(null)}
                    >
                        Close
                    </button>
                }
            >
                {rejectionDetails && (
                    <div style={{ color: 'var(--text-main)' }}>
                        <div style={{ marginBottom: 20, padding: 15, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, border: '1px solid #ef4444' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#ef4444' }}>Rejection Reason</h4>
                            <p>{rejectionDetails.rejectionReason}</p>
                        </div>

                        {rejectionDetails.aiExplanation && (
                            <div style={{ marginBottom: 20, padding: 15, background: 'rgba(139, 92, 246, 0.1)', borderRadius: 8, border: '1px solid #8b5cf6' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#8b5cf6' }}>🤖 AI Analysis</h4>
                                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', margin: 0 }}>
                                    {rejectionDetails.aiExplanation}
                                </pre>
                            </div>
                        )}

                        {rejectionDetails.alternativePolicies && rejectionDetails.alternativePolicies.length > 0 && (
                            <div>
                                <h4 style={{ margin: '0 0 15px 0' }}>Recommended Alternative Policies</h4>
                                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                                    {rejectionDetails.alternativePolicies.map((alt, idx) => (
                                        <div key={idx} style={{ padding: 15, background: 'rgba(0,0,0,0.2)', borderRadius: 8, marginBottom: 10 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                                                <div>
                                                    <h4 style={{ margin: '0 0 5px 0' }}>{alt.policyName}</h4>
                                                    <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>{alt.policyType}</div>
                                                </div>
                                                <div style={{
                                                    padding: '4px 12px',
                                                    borderRadius: 20,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    background: '#10b98120',
                                                    color: '#10b981',
                                                    border: '1px solid #10b981'
                                                }}>
                                                    {(alt.matchScore * 100).toFixed(0)}% Match
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.9rem', marginBottom: 10 }}>
                                                <strong>Premium:</strong> ₹{alt.premium}/mo | <strong>Coverage:</strong> ₹{alt.coverage}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#10b981' }}>
                                                ✨ {alt.recommendationReason}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <h1 className="text-gradient" style={{ marginBottom: 30 }}>My Appointments & Policies</h1>

            <div style={{ marginBottom: 30, display: 'flex', gap: 10, borderBottom: '1px solid var(--card-border)' }}>
                <button
                    onClick={() => setActiveTab("appointments")}
                    style={{
                        padding: "12px 24px",
                        background: activeTab === "appointments" ? "var(--primary)" : "transparent",
                        color: activeTab === "appointments" ? "white" : "var(--text-muted)",
                        border: "none",
                        borderBottom: activeTab === "appointments" ? "3px solid white" : "3px solid transparent",
                        cursor: "pointer",
                        fontWeight: 600,
                        transition: "all 0.3s"
                    }}
                >
                    Appointments ({appointments.length})
                </button>
                <button
                    onClick={() => setActiveTab("policies")}
                    style={{
                        padding: "12px 24px",
                        background: activeTab === "policies" ? "var(--primary)" : "transparent",
                        color: activeTab === "policies" ? "white" : "var(--text-muted)",
                        border: "none",
                        borderBottom: activeTab === "policies" ? "3px solid white" : "3px solid transparent",
                        cursor: "pointer",
                        fontWeight: 600,
                        transition: "all 0.3s"
                    }}
                >
                    Policies ({policies.length})
                </button>
            </div>

            {activeTab === "appointments" && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
                    <AnimatePresence>
                        {appointments.map(apt => (
                            <motion.div
                                key={apt.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="card"
                                style={{ borderLeft: `4px solid ${getStatusColor(apt.status)}` }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                    <span style={{ fontSize: 28 }}>{getStatusIcon(apt.status)}</span>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: 20,
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        background: getStatusColor(apt.status) + '20',
                                        color: getStatusColor(apt.status),
                                        border: `1px solid ${getStatusColor(apt.status)}`
                                    }}>
                                        {apt.status}
                                    </span>
                                </div>

                                <h3 style={{ margin: '0 0 10px 0' }}>Agent: {apt.agent?.name}</h3>

                                <div style={{ margin: '15px 0', padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                                    <div style={{ fontWeight: 600, marginBottom: 5 }}>
                                        {apt.policy ? `🛡️ ${apt.policy.name}` : '💬 General Consultation'}
                                    </div>
                                    {apt.policy && (
                                        <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                                            Premium: ₹{apt.policy.premium}/mo
                                        </div>
                                    )}
                                </div>

                                <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: 15 }}>
                                    📅 {new Date(apt.startTime).toLocaleDateString()}<br />
                                    ⏰ {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>

                                {apt.meetingLink && apt.status === 'MEETING_APPROVED' && (
                                    <div style={{ marginTop: 15 }}>
                                        <a
                                            href={apt.meetingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="primary-btn"
                                            style={{
                                                display: 'block',
                                                textAlign: 'center',
                                                background: '#22c55e',
                                                borderColor: '#22c55e',
                                                textDecoration: 'none',
                                                marginBottom: 10
                                            }}
                                        >
                                            🎥 Join Meeting
                                        </a>

                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <a
                                                href={generateGoogleCalendarLink(apt)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="secondary-btn"
                                                style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', padding: '8px' }}
                                            >
                                                📅 Add to Google
                                            </a>
                                            <button
                                                onClick={() => downloadICS(apt)}
                                                className="secondary-btn"
                                                style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }}
                                            >
                                                📥 Download ICS
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {reviewableBookings[apt.id] && (
                                    <button
                                        onClick={() => setReviewModal({ isOpen: true, booking: apt })}
                                        className="primary-btn"
                                        style={{ width: '100%', marginTop: 15, background: '#fbbf24', borderColor: '#fbbf24', color: '#000' }}
                                    >
                                        ⭐ Rate Agent
                                    </button>
                                )}

                                {apt.status === 'REJECTED' && (
                                    <button
                                        className="secondary-btn"
                                        onClick={() => fetchRejectionDetails(apt.id)}
                                        style={{ width: '100%', color: '#ef4444', borderColor: '#ef4444' }}
                                    >
                                        View Rejection Details & Alternatives
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {activeTab === "policies" && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
                    <AnimatePresence>
                        {policies.map(pol => (
                            <motion.div
                                key={pol.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="card"
                                style={{ borderLeft: `4px solid ${getStatusColor(pol.status)}` }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                    <span style={{ fontSize: 28 }}>{getStatusIcon(pol.status)}</span>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: 20,
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        background: getStatusColor(pol.status) + '20',
                                        color: getStatusColor(pol.status),
                                        border: `1px solid ${getStatusColor(pol.status)}`
                                    }}>
                                        {pol.status}
                                    </span>
                                </div>

                                <h3 style={{ margin: '0 0 10px 0' }}>{pol.policy?.name}</h3>
                                <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: 15 }}>
                                    {pol.policy?.type}
                                </p>

                                <div style={{ padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 8, marginBottom: 15 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span>Premium:</span>
                                        <strong>₹{pol.premium}/mo</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Coverage:</span>
                                        <strong>₹{pol.policy?.coverage}</strong>
                                    </div>
                                </div>

                                {pol.status === 'ISSUED' && (
                                    <button
                                        className="primary-btn"
                                        onClick={() => setPaymentModal({ isOpen: true, policy: pol })}
                                        style={{
                                            width: '100%',
                                            background: '#10b981',
                                            borderColor: '#10b981',
                                            animation: 'pulse 2s infinite'
                                        }}
                                    >
                                        💳 Pay & Activate Policy
                                    </button>
                                )}

                                {pol.status === 'ACTIVE' && (
                                    <div style={{ padding: 12, background: 'rgba(34, 197, 94, 0.1)', borderRadius: 8, border: '1px solid #22c55e', textAlign: 'center' }}>
                                        <div style={{ color: '#22c55e', fontWeight: 600 }}>✅ Policy Active</div>
                                        <div style={{ fontSize: '0.85rem', marginTop: 5 }}>
                                            Valid until: {new Date(pol.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {(activeTab === "appointments" && appointments.length === 0) || (activeTab === "policies" && policies.length === 0) ? (
                <div style={{ textAlign: "center", padding: 50, opacity: 0.6, background: "var(--bg-card)", borderRadius: 12 }}>
                    <p>No {activeTab} found.</p>
                </div>
            ) : null}

            <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
        </div>
    );
}
