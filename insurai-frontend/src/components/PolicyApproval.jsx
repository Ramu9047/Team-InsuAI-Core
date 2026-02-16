import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import './PolicyApproval.css';

/**
 * Policy Approval Component
 * Agent interface for approving policies after consultation
 */
const PolicyApproval = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { notify } = useNotification();

    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Form state
    const [approvalNotes, setApprovalNotes] = useState('');
    const [customPremium, setCustomPremium] = useState('');
    const [customCoverage, setCustomCoverage] = useState('');
    const [policyDuration, setPolicyDuration] = useState('12'); // months
    const [specialConditions, setSpecialConditions] = useState('');

    useEffect(() => {
        fetchAppointmentDetails();
    }, [appointmentId]);

    const fetchAppointmentDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/appointments/${appointmentId}/insights`);
            setAppointment(response.data);

            // Set default values from policy
            if (response.data.policy) {
                setCustomPremium(response.data.policy.premium.toString());
                setCustomCoverage(response.data.policy.coverage.toString());
            }
        } catch (error) {
            console.error('Error fetching appointment:', error);
            notify('Failed to load appointment details', 'error');
            navigate('/agent/requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprovePolicy = async () => {
        if (!approvalNotes.trim()) {
            notify('Please add approval notes', 'warning');
            return;
        }

        if (!customPremium || parseFloat(customPremium) <= 0) {
            notify('Please enter valid premium amount', 'error');
            return;
        }

        if (!customCoverage || parseFloat(customCoverage) <= 0) {
            notify('Please enter valid coverage amount', 'error');
            return;
        }

        setProcessing(true);

        try {
            await api.put(`/api/appointments/${appointmentId}/approve-policy`, {
                notes: approvalNotes,
                customPremium: parseFloat(customPremium),
                customCoverage: parseFloat(customCoverage),
                policyDuration: parseInt(policyDuration),
                specialConditions: specialConditions.trim() || null
            });

            notify('Policy approved successfully! User will be notified.', 'success');

            setTimeout(() => {
                navigate('/agent/requests');
            }, 2000);

        } catch (error) {
            console.error('Error approving policy:', error);
            notify(error.response?.data?.message || 'Failed to approve policy', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = () => {
        navigate(`/agent/requests/${appointmentId}/reject`);
    };

    const calculateAnnualPremium = () => {
        if (!customPremium) return 0;
        return (parseFloat(customPremium) * 12).toFixed(2);
    };

    const formatCurrency = (value) => {
        if (!value) return '$0';
        return '$' + parseFloat(value).toLocaleString();
    };

    if (loading) {
        return (
            <div className="policy-approval-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading appointment details...</p>
                </div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="policy-approval-container">
                <div className="error-state">
                    <h2>Appointment Not Found</h2>
                    <button onClick={() => navigate('/agent/requests')}>
                        Back to Requests
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="policy-approval-container">
            <div className="approval-wrapper">
                {/* Header */}
                <div className="approval-header">
                    <button onClick={() => navigate(-1)} className="back-button">
                        ← Back
                    </button>
                    <h1>Policy Approval</h1>
                    <div className="status-badge">
                        {appointment.status === 'CONSULTED' ? 'Ready for Approval' : appointment.status}
                    </div>
                </div>

                <div className="approval-content">
                    {/* User & Policy Info */}
                    <div className="info-section">
                        <h2>📋 Consultation Summary</h2>

                        <div className="info-grid">
                            <div className="info-card">
                                <h3>👤 User Information</h3>
                                <div className="info-details">
                                    <p><strong>Name:</strong> {appointment.user?.name || 'N/A'}</p>
                                    <p><strong>Email:</strong> {appointment.user?.email || 'N/A'}</p>
                                    <p><strong>Age:</strong> {appointment.user?.age || 'N/A'}</p>
                                    <p><strong>Health Status:</strong> {appointment.user?.healthStatus || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="info-card">
                                <h3>📄 Policy Details</h3>
                                <div className="info-details">
                                    <p><strong>Policy:</strong> {appointment.policy?.name || 'N/A'}</p>
                                    <p><strong>Type:</strong> {appointment.policy?.type || 'N/A'}</p>
                                    <p><strong>Base Premium:</strong> {formatCurrency(appointment.policy?.premium)}/month</p>
                                    <p><strong>Base Coverage:</strong> {formatCurrency(appointment.policy?.coverage)}</p>
                                </div>
                            </div>
                        </div>

                        {/* AI Risk Assessment */}
                        {appointment.aiRiskScore && (
                            <div className="risk-assessment-card">
                                <h3>🤖 AI Risk Assessment</h3>
                                <div className="risk-score-display">
                                    <div className={`risk-score ${appointment.aiRiskScore > 70 ? 'high' : appointment.aiRiskScore > 40 ? 'medium' : 'low'}`}>
                                        {appointment.aiRiskScore}/100
                                    </div>
                                    <div className="risk-interpretation">
                                        {appointment.aiRiskScore > 70 && <span className="high">High Risk</span>}
                                        {appointment.aiRiskScore > 40 && appointment.aiRiskScore <= 70 && <span className="medium">Medium Risk</span>}
                                        {appointment.aiRiskScore <= 40 && <span className="low">Low Risk</span>}
                                    </div>
                                </div>

                                {appointment.aiExplanation && (
                                    <div className="ai-explanation">
                                        <p>{appointment.aiExplanation}</p>
                                    </div>
                                )}

                                {appointment.aiRiskFactors && appointment.aiRiskFactors.length > 0 && (
                                    <div className="risk-factors">
                                        <h4>Risk Factors:</h4>
                                        <ul>
                                            {appointment.aiRiskFactors.map((factor, index) => (
                                                <li key={index}>{factor}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Approval Form */}
                    <div className="approval-form-section">
                        <h2>✅ Approve Policy</h2>

                        <div className="form-group">
                            <label>Monthly Premium *</label>
                            <div className="input-with-currency">
                                <span className="currency-symbol">$</span>
                                <input
                                    type="number"
                                    value={customPremium}
                                    onChange={(e) => setCustomPremium(e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    className="form-input"
                                />
                            </div>
                            <p className="input-hint">Annual Premium: {formatCurrency(calculateAnnualPremium())}</p>
                        </div>

                        <div className="form-group">
                            <label>Coverage Amount *</label>
                            <div className="input-with-currency">
                                <span className="currency-symbol">$</span>
                                <input
                                    type="number"
                                    value={customCoverage}
                                    onChange={(e) => setCustomCoverage(e.target.value)}
                                    placeholder="0.00"
                                    step="1000"
                                    min="0"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Policy Duration</label>
                            <select
                                value={policyDuration}
                                onChange={(e) => setPolicyDuration(e.target.value)}
                                className="form-input"
                            >
                                <option value="6">6 Months</option>
                                <option value="12">12 Months (1 Year)</option>
                                <option value="24">24 Months (2 Years)</option>
                                <option value="36">36 Months (3 Years)</option>
                                <option value="60">60 Months (5 Years)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Special Conditions (Optional)</label>
                            <textarea
                                value={specialConditions}
                                onChange={(e) => setSpecialConditions(e.target.value)}
                                placeholder="Any special terms, conditions, or exclusions..."
                                rows="4"
                                className="form-textarea"
                            />
                        </div>

                        <div className="form-group">
                            <label>Approval Notes *</label>
                            <textarea
                                value={approvalNotes}
                                onChange={(e) => setApprovalNotes(e.target.value)}
                                placeholder="Add notes about why this policy is approved and any recommendations for the user..."
                                rows="5"
                                className="form-textarea"
                                required
                            />
                        </div>

                        {/* Summary Box */}
                        <div className="approval-summary">
                            <h3>📊 Approval Summary</h3>
                            <div className="summary-grid">
                                <div className="summary-item">
                                    <span className="summary-label">Monthly Premium:</span>
                                    <span className="summary-value">{formatCurrency(customPremium)}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Annual Premium:</span>
                                    <span className="summary-value">{formatCurrency(calculateAnnualPremium())}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Coverage:</span>
                                    <span className="summary-value">{formatCurrency(customCoverage)}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Duration:</span>
                                    <span className="summary-value">{policyDuration} months</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <button
                                onClick={handleReject}
                                className="reject-btn"
                                disabled={processing}
                            >
                                ❌ Reject
                            </button>
                            <button
                                onClick={handleApprovePolicy}
                                className="approve-btn"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <span className="button-spinner"></span>
                                        Processing...
                                    </>
                                ) : (
                                    <>✅ Approve Policy</>
                                )}
                            </button>
                        </div>

                        {/* Warning Note */}
                        <div className="warning-note">
                            <span className="warning-icon">⚠️</span>
                            <p>
                                Once approved, the user will receive an email notification and can proceed to payment.
                                Please ensure all details are correct before approving.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyApproval;
