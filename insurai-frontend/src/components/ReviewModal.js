import { useState } from "react";
import PropTypes from "prop-types";
import Modal from "./Modal";
import StarRating from "./StarRating";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";

export default function ReviewModal({ isOpen, onClose, booking, onReviewSubmitted }) {
    const { notify } = useNotification();
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            notify("Please select a rating", "error");
            return;
        }

        setSubmitting(true);

        try {
            const response = await api.post("/reviews/submit", {
                bookingId: booking.id,
                rating,
                feedback: feedback.trim()
            });

            notify(response.data.message || "Review submitted successfully!", "success");

            // Reset form
            setRating(0);
            setFeedback("");

            // Callback to parent
            if (onReviewSubmitted) {
                onReviewSubmitted(response.data.review);
            }

            onClose();
        } catch (error) {
            notify(error.response?.data?.error || "Failed to submit review", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Rate Your Consultation"
            actions={
                <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        style={{
                            flex: 1,
                            padding: 12,
                            borderRadius: 8,
                            background: 'transparent',
                            border: '1px solid var(--card-border)',
                            color: 'var(--text-main)',
                            cursor: 'pointer',
                            opacity: submitting ? 0.5 : 1
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting || rating === 0}
                        style={{
                            flex: 1,
                            padding: 12,
                            borderRadius: 8,
                            background: rating === 0 ? 'var(--card-border)' : 'var(--primary)',
                            border: 'none',
                            color: 'white',
                            cursor: rating === 0 ? 'not-allowed' : 'pointer',
                            fontWeight: 600
                        }}
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            }
        >
            <form id="review-form" onSubmit={(e) => e.preventDefault()}>
                <div style={{ marginBottom: 20 }}>
                    <p style={{ color: 'var(--text-main)', marginBottom: 10 }}>
                        How was your consultation with <strong>{booking?.agent?.name}</strong>?
                    </p>

                    <div style={{ textAlign: 'center', margin: '20px 0' }}>
                        <StarRating
                            rating={rating}
                            onRatingChange={setRating}
                            size="large"
                            interactive
                        />
                    </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-main)' }}>
                        Share your experience (optional)
                    </label>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Tell us about your experience..."
                        rows={4}
                        maxLength={1000}
                        style={{
                            width: '100%',
                            padding: 12,
                            borderRadius: 8,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--card-border)',
                            color: 'white',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                        }}
                    />
                    <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 5 }}>
                        {feedback.length}/1000
                    </div>
                </div>
            </form>
        </Modal>
    );
}

ReviewModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    booking: PropTypes.object,
    onReviewSubmitted: PropTypes.func
};
