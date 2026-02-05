import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * AI Risk Assessment Component
 * Shows intelligent risk scoring and eligibility prediction
 */
export default function AIRiskAssessment({ policyId, onClose }) {
    const { user } = useAuth();
    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssessment();
        // eslint-disable-next-line
    }, [policyId]);

    const fetchAssessment = async () => {
        try {
            const response = await api.get('/ai/risk-assessment', {
                params: { userId: user.id, policyId }
            });
            setAssessment(response.data);
        } catch (error) {
            console.error('Failed to fetch risk assessment:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ fontSize: '2rem', marginBottom: 10 }}
                >
                    🤖
                </motion.div>
                <p>AI is analyzing your profile...</p>
            </div>
        );
    }

    if (!assessment) return null;

    const getRiskColor = (level) => {
        switch (level) {
            case 'LOW': return { bg: '#dcfce7', color: '#166534', border: '#22c55e' };
            case 'MEDIUM': return { bg: '#fef9c3', color: '#854d0e', border: '#eab308' };
            case 'HIGH': return { bg: '#fed7aa', color: '#9a3412', border: '#f97316' };
            case 'CRITICAL': return { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' };
            default: return { bg: '#dbeafe', color: '#1e40af', border: '#3b82f6' };
        }
    };

    const getEligibilityColor = (prediction) => {
        switch (prediction) {
            case 'LIKELY_ELIGIBLE': return { bg: '#dcfce7', color: '#166534', icon: '✅' };
            case 'PARTIALLY_ELIGIBLE': return { bg: '#fef9c3', color: '#854d0e', icon: '⚠️' };
            case 'LIKELY_INELIGIBLE': return { bg: '#fee2e2', color: '#991b1b', icon: '❌' };
            default: return { bg: '#dbeafe', color: '#1e40af', icon: 'ℹ️' };
        }
    };

    const getReadinessColor = (level) => {
        switch (level) {
            case 'EXCELLENT': return { bg: '#dcfce7', color: '#166534' };
            case 'GOOD': return { bg: '#d1fae5', color: '#065f46' };
            case 'FAIR': return { bg: '#fef9c3', color: '#854d0e' };
            case 'POOR': return { bg: '#fee2e2', color: '#991b1b' };
            default: return { bg: '#dbeafe', color: '#1e40af' };
        }
    };

    const riskStyles = getRiskColor(assessment.riskLevel);
    const eligibilityStyles = getEligibilityColor(assessment.eligibilityPrediction);
    const readinessStyles = getReadinessColor(assessment.claimReadiness?.readinessLevel);

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    padding: 30,
                    borderRadius: 16,
                    marginBottom: 20,
                    textAlign: 'center'
                }}
            >
                <div style={{ fontSize: '3rem', marginBottom: 10 }}>🤖</div>
                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>AI Risk Assessment</h2>
                <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
                    Intelligent analysis of your eligibility and risk profile
                </p>
            </motion.div>

            {/* Risk Score */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="card"
                style={{
                    borderLeft: `6px solid ${riskStyles.border}`,
                    marginBottom: 20
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Risk Score</h3>
                        <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Based on your profile and policy requirements
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{
                            fontSize: '3rem',
                            fontWeight: 700,
                            color: riskStyles.color,
                            lineHeight: 1
                        }}>
                            {assessment.riskScore}
                        </div>
                        <div style={{
                            background: riskStyles.bg,
                            color: riskStyles.color,
                            padding: '4px 12px',
                            borderRadius: 20,
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            marginTop: 8
                        }}>
                            {assessment.riskLevel} RISK
                        </div>
                    </div>
                </div>

                {/* Risk Progress Bar */}
                <div style={{
                    height: 12,
                    background: '#f1f5f9',
                    borderRadius: 6,
                    overflow: 'hidden',
                    marginTop: 20
                }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${assessment.riskScore}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        style={{
                            height: '100%',
                            background: `linear-gradient(90deg, ${riskStyles.border}, ${riskStyles.color})`,
                            borderRadius: 6
                        }}
                    />
                </div>
            </motion.div>

            {/* Eligibility Prediction */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="card"
                style={{
                    background: eligibilityStyles.bg,
                    border: `2px solid ${eligibilityStyles.color}`,
                    marginBottom: 20
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    <div style={{ fontSize: '2.5rem' }}>{eligibilityStyles.icon}</div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, color: eligibilityStyles.color }}>
                            {assessment.eligibilityPrediction.replace(/_/g, ' ')}
                        </h3>
                        <p style={{ margin: '5px 0 0 0', color: eligibilityStyles.color, opacity: 0.8 }}>
                            Confidence: {assessment.eligibilityConfidence?.toFixed(1)}%
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Risk Factors */}
            {assessment.riskFactors && assessment.riskFactors.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card"
                    style={{ marginBottom: 20 }}
                >
                    <h3 style={{ margin: '0 0 15px 0' }}>⚠️ Risk Factors</h3>
                    {assessment.riskFactors.map((factor, index) => (
                        <div
                            key={index}
                            style={{
                                padding: 12,
                                background: '#fef3f2',
                                border: '1px solid #fecaca',
                                borderLeft: '4px solid #ef4444',
                                borderRadius: 6,
                                marginBottom: 10
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                <strong style={{ color: '#991b1b' }}>{factor.factor}</strong>
                                <span style={{
                                    background: '#fee2e2',
                                    color: '#991b1b',
                                    padding: '2px 8px',
                                    borderRadius: 4,
                                    fontSize: '0.75rem',
                                    fontWeight: 700
                                }}>
                                    {factor.severity}
                                </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#991b1b', opacity: 0.8 }}>
                                {factor.explanation}
                            </p>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Claim Readiness */}
            {assessment.claimReadiness && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="card"
                    style={{
                        background: readinessStyles.bg,
                        border: `2px solid ${readinessStyles.color}`,
                        marginBottom: 20
                    }}
                >
                    <h3 style={{ margin: '0 0 15px 0', color: readinessStyles.color }}>
                        🎯 Claim Readiness Score
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                        <div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: readinessStyles.color }}>
                                {assessment.claimReadiness.readinessScore}%
                            </div>
                            <div style={{ fontSize: '0.9rem', color: readinessStyles.color, opacity: 0.8 }}>
                                {assessment.claimReadiness.readinessLevel} Readiness
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.85rem', color: readinessStyles.color, opacity: 0.8 }}>
                                Claim Success Probability
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: readinessStyles.color }}>
                                {assessment.claimReadiness.claimSuccessProbability?.toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    {/* Strengths */}
                    {assessment.claimReadiness.strengths && assessment.claimReadiness.strengths.length > 0 && (
                        <div style={{ marginBottom: 15 }}>
                            <strong style={{ color: readinessStyles.color }}>✓ Strengths:</strong>
                            <ul style={{ margin: '5px 0', paddingLeft: 20, color: readinessStyles.color }}>
                                {assessment.claimReadiness.strengths.map((s, i) => (
                                    <li key={i} style={{ fontSize: '0.9rem' }}>{s}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Improvement Tips */}
                    {assessment.claimReadiness.improvementTips && assessment.claimReadiness.improvementTips.length > 0 && (
                        <div>
                            <strong style={{ color: readinessStyles.color }}>💡 Improvement Tips:</strong>
                            <ul style={{ margin: '5px 0', paddingLeft: 20, color: readinessStyles.color }}>
                                {assessment.claimReadiness.improvementTips.map((tip, i) => (
                                    <li key={i} style={{ fontSize: '0.9rem' }}>{tip}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Recommendations */}
            {assessment.recommendations && assessment.recommendations.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="card"
                    style={{ marginBottom: 20 }}
                >
                    <h3 style={{ margin: '0 0 15px 0' }}>💡 AI Recommendations</h3>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {assessment.recommendations.map((rec, index) => (
                            <li key={index} style={{ marginBottom: 8, color: 'var(--text-main)' }}>
                                {rec}
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {/* Required Documents */}
            {assessment.requiredDocuments && assessment.requiredDocuments.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="card"
                    style={{ marginBottom: 20 }}
                >
                    <h3 style={{ margin: '0 0 15px 0' }}>📄 Required Documents</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                        {assessment.requiredDocuments.map((doc, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: 10,
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 6,
                                    fontSize: '0.85rem',
                                    color: 'var(--text-main)'
                                }}
                            >
                                ✓ {doc}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Close Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="secondary-btn"
                    style={{ width: '100%', marginTop: 20 }}
                >
                    Close Assessment
                </button>
            )}
        </div>
    );
}
