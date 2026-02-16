import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppointmentCard from '../components/AppointmentCard';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import './ConsultationStatus.css';

/**
 * Consultation Status Page
 * Displays detailed appointment status with all actions
 */
const ConsultationStatus = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { notify } = useNotification();

    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [aiInsights, setAiInsights] = useState(null);

    useEffect(() => {
        fetchAppointmentDetails();
    }, [appointmentId]);

    const fetchAppointmentDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch appointment with AI insights
            const response = await api.get(`/api/appointments/${appointmentId}/insights`);
            setAppointment(response.data);

            // If AI insights available, set them
            if (response.data.aiRiskScore) {
                setAiInsights({
                    riskScore: response.data.aiRiskScore,
                    riskFactors: response.data.aiRiskFactors,
                    aiExplanation: response.data.aiExplanation,
                    alternativePolicies: response.data.alternativePolicies
                });
            }

        } catch (err) {
            console.error('Error fetching appointment:', err);
            setError('Failed to load appointment details');
            notify('Failed to load appointment details', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmitted = () => {
        notify('Thank you for your review!', 'success');
        fetchAppointmentDetails(); // Refresh to show updated status
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    if (loading) {
        return (
            <div className="consultation-status-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading appointment details...</p>
                </div>
            </div>
        );
    }

    if (error || !appointment) {
        return (
            <div className="consultation-status-container">
                <div className="error-state">
                    <div className="error-icon">⚠️</div>
                    <h2>Appointment Not Found</h2>
                    <p>{error || 'The requested appointment could not be found.'}</p>
                    <button onClick={handleBackToDashboard} className="back-button">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            'REQUESTED': { color: 'orange', icon: '⏳', text: 'Pending Approval' },
            'MEETING_APPROVED': { color: 'blue', icon: '✅', text: 'Approved' },
            'CONSULTED': { color: 'green', icon: '✔️', text: 'Completed' },
            'REJECTED': { color: 'red', icon: '❌', text: 'Rejected' },
            'POLICY_APPROVED': { color: 'purple', icon: '🎉', text: 'Policy Approved' }
        };

        const config = statusConfig[status] || { color: 'gray', icon: '•', text: status };

        return (
            <div className={`status-badge status-${config.color}`}>
                <span className="status-icon">{config.icon}</span>
                <span className="status-text">{config.text}</span>
            </div>
        );
    };

    return (
        <div className="consultation-status-container">
            {/* Header */}
            <div className="status-header">
                <button onClick={handleBackToDashboard} className="back-link">
                    ← Back to Dashboard
                </button>
                <h1>Consultation Details</h1>
                {getStatusBadge(appointment.status)}
            </div>

            {/* Main Content */}
            <div className="status-content">
                {/* Appointment Card */}
                <div className="appointment-section">
                    <AppointmentCard
                        appointment={{
                            id: appointment.bookingId,
                            status: appointment.status,
                            meetingLink: appointment.meetingLink,
                            agent: appointment.agent,
                            policy: appointment.policy,
                            startTime: appointment.startTime,
                            endTime: appointment.endTime,
                            reason: appointment.reason
                        }}
                        showReviewButton={appointment.status === 'CONSULTED'}
                        onReviewSubmitted={handleReviewSubmitted}
                    />
                </div>

                {/* AI Insights Section */}
                {aiInsights && (
                    <div className="ai-insights-section">
                        <h2>🤖 AI Risk Assessment</h2>

                        <div className="risk-score-card">
                            <div className="risk-score-header">
                                <h3>Risk Score</h3>
                                <div className={`risk-score ${aiInsights.riskScore > 70 ? 'high' : aiInsights.riskScore > 40 ? 'medium' : 'low'}`}>
                                    {aiInsights.riskScore}/100
                                </div>
                            </div>

                            {aiInsights.riskFactors && aiInsights.riskFactors.length > 0 && (
                                <div className="risk-factors">
                                    <h4>Risk Factors:</h4>
                                    <ul>
                                        {aiInsights.riskFactors.map((factor, index) => (
                                            <li key={index}>{factor}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {aiInsights.aiExplanation && (
                                <div className="ai-explanation">
                                    <h4>AI Analysis:</h4>
                                    <p>{aiInsights.aiExplanation}</p>
                                </div>
                            )}
                        </div>

                        {/* Alternative Policies */}
                        {aiInsights.alternativePolicies && aiInsights.alternativePolicies.length > 0 && (
                            <div className="alternative-policies">
                                <h3>💡 Recommended Alternative Policies</h3>
                                <div className="policies-grid">
                                    {aiInsights.alternativePolicies.map((policy, index) => (
                                        <div key={index} className="policy-card">
                                            <h4>{policy.policyName}</h4>
                                            <div className="policy-details">
                                                <p><strong>Type:</strong> {policy.policyType}</p>
                                                <p><strong>Premium:</strong> ${policy.premium}/month</p>
                                                <p><strong>Coverage:</strong> ${policy.coverage.toLocaleString()}</p>
                                                <p><strong>Match Score:</strong> {(policy.matchScore * 100).toFixed(0)}%</p>
                                            </div>
                                            <p className="recommendation-reason">{policy.recommendationReason}</p>
                                            <button
                                                className="view-policy-btn"
                                                onClick={() => navigate(`/policies/${policy.policyId}`)}
                                            >
                                                View Policy
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Rejection Reason */}
                {appointment.rejectionReason && (
                    <div className="rejection-section">
                        <h3>📋 Rejection Details</h3>
                        <div className="rejection-card">
                            <p>{appointment.rejectionReason}</p>
                        </div>
                    </div>
                )}

                {/* Timeline */}
                <div className="timeline-section">
                    <h3>📅 Appointment Timeline</h3>
                    <div className="timeline">
                        <div className="timeline-item completed">
                            <div className="timeline-marker">✓</div>
                            <div className="timeline-content">
                                <h4>Appointment Requested</h4>
                                <p>You submitted your consultation request</p>
                            </div>
                        </div>

                        {appointment.status !== 'REQUESTED' && (
                            <div className={`timeline-item ${appointment.status !== 'REJECTED' ? 'completed' : 'rejected'}`}>
                                <div className="timeline-marker">
                                    {appointment.status === 'REJECTED' ? '✗' : '✓'}
                                </div>
                                <div className="timeline-content">
                                    <h4>{appointment.status === 'REJECTED' ? 'Request Declined' : 'Appointment Approved'}</h4>
                                    <p>
                                        {appointment.status === 'REJECTED'
                                            ? 'Agent provided alternative recommendations'
                                            : 'Meeting scheduled and link generated'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {appointment.status === 'CONSULTED' && (
                            <div className="timeline-item completed">
                                <div className="timeline-marker">✓</div>
                                <div className="timeline-content">
                                    <h4>Consultation Completed</h4>
                                    <p>Your consultation session has been completed</p>
                                </div>
                            </div>
                        )}

                        {appointment.status === 'POLICY_APPROVED' && (
                            <div className="timeline-item completed">
                                <div className="timeline-marker">✓</div>
                                <div className="timeline-content">
                                    <h4>Policy Approved</h4>
                                    <p>Your policy is ready for activation</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsultationStatus;
