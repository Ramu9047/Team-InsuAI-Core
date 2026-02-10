import React from 'react';
import { motion } from 'framer-motion';
import './AIInsightCard.css';

/**
 * AI Insurance Insights Component
 * Displays AI-powered policy recommendations with match scores
 */
export const AIInsightCard = ({ insights, onCompare, onTalkToAgent }) => {
    const defaultInsights = [
        {
            id: 1,
            policyName: 'Health Secure Plus',
            matchScore: 89,
            recommended: true,
            reason: 'Age 23, income bracket, no pre-existing illness',
            premium: 5000,
            coverage: '₹5 Lakh',
            type: 'Health'
        },
        {
            id: 2,
            policyName: 'Family Shield',
            matchScore: 45,
            recommended: false,
            reason: 'Low dependents count',
            premium: 8000,
            coverage: '₹10 Lakh',
            type: 'Family'
        }
    ];

    const policyInsights = insights || defaultInsights;

    const getMatchColor = (score) => {
        if (score >= 80) return '#22c55e'; // Green
        if (score >= 60) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    const getMatchLabel = (score) => {
        if (score >= 80) return 'Excellent Match';
        if (score >= 60) return 'Good Match';
        return 'Not Recommended';
    };

    return (
        <div className="ai-insight-card">
            <div className="ai-insight-header">
                <h3>🤖 AI Insurance Insights for You</h3>
                <span className="ai-badge">Powered by AI</span>
            </div>

            <div className="insights-list">
                {policyInsights.map((insight, index) => (
                    <motion.div
                        key={insight.id}
                        className={`insight-item ${insight.recommended ? 'recommended' : 'not-recommended'}`}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="insight-content">
                            <div className="insight-header-row">
                                <div className="policy-info">
                                    {insight.recommended ? (
                                        <span className="status-icon recommended-icon">✔</span>
                                    ) : (
                                        <span className="status-icon not-recommended-icon">⚠️</span>
                                    )}
                                    <div>
                                        <h4 className="policy-name">{insight.policyName}</h4>
                                        <span className="policy-type">{insight.type} Insurance</span>
                                    </div>
                                </div>

                                <div className="match-score">
                                    <div
                                        className="score-circle"
                                        style={{
                                            background: `conic-gradient(${getMatchColor(insight.matchScore)} ${insight.matchScore}%, var(--bg-secondary) 0)`
                                        }}
                                    >
                                        <div className="score-inner">
                                            <span className="score-value">{insight.matchScore}%</span>
                                        </div>
                                    </div>
                                    <span className="match-label" style={{ color: getMatchColor(insight.matchScore) }}>
                                        {getMatchLabel(insight.matchScore)}
                                    </span>
                                </div>
                            </div>

                            <div className="insight-details">
                                <div className="reason-section">
                                    <span className="reason-label">
                                        {insight.recommended ? 'Why recommended:' : 'Why not recommended:'}
                                    </span>
                                    <p className="reason-text">{insight.reason}</p>
                                </div>

                                <div className="policy-details">
                                    <div className="detail-item">
                                        <span className="detail-label">Premium</span>
                                        <span className="detail-value">₹{insight.premium.toLocaleString()}/mo</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Coverage</span>
                                        <span className="detail-value">{insight.coverage}</span>
                                    </div>
                                </div>
                            </div>

                            {insight.recommended && (
                                <div className="insight-actions">
                                    <button className="action-btn primary" onClick={() => onTalkToAgent && onTalkToAgent(insight)}>
                                        💬 Talk to Agent
                                    </button>
                                    <button className="action-btn secondary" onClick={() => onCompare && onCompare(insight)}>
                                        📊 Compare Policies
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="ai-insight-footer">
                <p className="ai-disclaimer">
                    💡 These recommendations are based on your profile and may change as we learn more about your needs.
                </p>
            </div>
        </div>
    );
};

export default AIInsightCard;
