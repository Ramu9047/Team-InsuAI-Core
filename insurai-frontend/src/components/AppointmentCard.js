import PropTypes from "prop-types";
import { useState } from "react";
import { useNotification } from "../context/NotificationContext";
import { joinMeeting, addToCalendar } from "../utils/calendarUtils";
import ReviewModal from "./ReviewModal";
import "./AppointmentCard.css";

export default function AppointmentCard({ appointment, onReviewSubmitted, showReviewButton = false }) {
    const { notify } = useNotification();
    const [reviewModal, setReviewModal] = useState(false);
    const [showCalendarOptions, setShowCalendarOptions] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'var(--status-pending)';
            case 'APPROVED': return 'var(--status-approved)';
            case 'REJECTED': return 'var(--status-rejected)';
            case 'CONSULTED': return 'var(--status-active)';
            case 'POLICY_APPROVED': return 'var(--status-approved)';
            default: return 'var(--text-muted)';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return '⏳';
            case 'APPROVED': return '✅';
            case 'REJECTED': return '❌';
            case 'CONSULTED': return '🎯';
            case 'POLICY_APPROVED': return '🎉';
            default: return '📋';
        }
    };

    const handleJoinMeeting = () => {
        joinMeeting(appointment.meetingLink, notify);
    };

    const handleAddToCalendar = (provider) => {
        addToCalendar(appointment, provider);
        setShowCalendarOptions(false);
        notify(`Calendar event ${provider === 'google' ? 'opened' : 'downloaded'}!`, 'success');
    };

    const canJoinMeeting = appointment.status === 'APPROVED' && appointment.meetingLink;
    const canAddToCalendar = appointment.status === 'APPROVED' && appointment.startTime;
    const canReview = showReviewButton && (appointment.status === 'CONSULTED' || appointment.status === 'POLICY_APPROVED');

    return (
        <>
            <div className="appointment-card">
                {/* Header */}
                <div className="appointment-card__header">
                    <div className="appointment-card__header-left">
                        <div className="appointment-card__icon">👤</div>
                        <div>
                            <h3 className="appointment-card__title">{appointment.agent?.name || 'Agent'}</h3>
                            <p className="appointment-card__subtitle">
                                {appointment.agent?.specialization || 'Insurance Agent'}
                            </p>
                        </div>
                    </div>
                    <div className="appointment-card__status" style={{ background: getStatusColor(appointment.status) }}>
                        {getStatusIcon(appointment.status)} {appointment.status}
                    </div>
                </div>

                {/* Details */}
                <div className="appointment-card__details">
                    {appointment.policy && (
                        <div className="appointment-card__detail-row">
                            <span className="appointment-card__detail-label">Policy:</span>
                            <span className="appointment-card__detail-value">{appointment.policy.name}</span>
                        </div>
                    )}

                    {appointment.startTime && (
                        <div className="appointment-card__detail-row">
                            <span className="appointment-card__detail-label">Date & Time:</span>
                            <span className="appointment-card__detail-value">
                                {new Date(appointment.startTime).toLocaleString()}
                            </span>
                        </div>
                    )}

                    {appointment.reason && (
                        <div className="appointment-card__detail-row">
                            <span className="appointment-card__detail-label">Reason:</span>
                            <span className="appointment-card__detail-value">{appointment.reason}</span>
                        </div>
                    )}

                    {appointment.rejectionReason && (
                        <div className="appointment-card__rejection">
                            <strong>Rejection Reason:</strong> {appointment.rejectionReason}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="appointment-card__actions">
                    {canJoinMeeting && (
                        <button
                            onClick={handleJoinMeeting}
                            className="appointment-card__action appointment-card__action--primary"
                        >
                            🎥 Join Meeting
                        </button>
                    )}

                    {canAddToCalendar && (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowCalendarOptions(!showCalendarOptions)}
                                className="appointment-card__action appointment-card__action--secondary"
                            >
                                📅 Add to Calendar
                            </button>

                            {showCalendarOptions && (
                                <div className="calendar-dropdown">
                                    <button onClick={() => handleAddToCalendar('google')}>
                                        Google Calendar
                                    </button>
                                    <button onClick={() => handleAddToCalendar('outlook')}>
                                        Outlook Calendar
                                    </button>
                                    <button onClick={() => handleAddToCalendar('apple')}>
                                        Apple Calendar
                                    </button>
                                    <button onClick={() => handleAddToCalendar('ics')}>
                                        Download ICS File
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {canReview && (
                        <button
                            onClick={() => setReviewModal(true)}
                            className="appointment-card__action appointment-card__action--success"
                        >
                            ⭐ Rate Agent
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div className="appointment-card__footer">
                    Booked on {new Date(appointment.createdAt).toLocaleDateString()}
                </div>
            </div>

            {/* Review Modal */}
            {canReview && (
                <ReviewModal
                    isOpen={reviewModal}
                    onClose={() => setReviewModal(false)}
                    booking={appointment}
                    onReviewSubmitted={(review) => {
                        setReviewModal(false);
                        if (onReviewSubmitted) {
                            onReviewSubmitted(review);
                        }
                    }}
                />
            )}
        </>
    );
}

AppointmentCard.propTypes = {
    appointment: PropTypes.object.isRequired,
    onReviewSubmitted: PropTypes.func,
    showReviewButton: PropTypes.bool
};
