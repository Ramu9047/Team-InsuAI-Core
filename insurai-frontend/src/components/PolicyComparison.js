import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';

export default function PolicyComparison({ policies = [], onSelect }) {
    const { notify } = useNotification();
    const [selectedPolicies, setSelectedPolicies] = useState([]);
    const [showComparison, setShowComparison] = useState(false);

    // Mock policies if none provided
    const defaultPolicies = [
        {
            id: 1,
            name: 'Health Secure Plus',
            type: 'HEALTH',
            provider: 'Star Health',
            premium: 5000,
            coverage: 1000000,
            features: {
                cashless: true,
                preExisting: true,
                maternity: true,
                ambulance: true,
                roomRent: 'No Limit',
                copay: '0%',
                restoration: true,
                wellness: true
            },
            aiScore: 89,
            aiReasons: [
                'Best coverage for your age group',
                'No co-payment required',
                'Unlimited room rent',
                'Wellness benefits included'
            ],
            recommended: true
        },
        {
            id: 2,
            name: 'Family Shield',
            type: 'HEALTH',
            provider: 'HDFC Ergo',
            premium: 7000,
            coverage: 1500000,
            features: {
                cashless: true,
                preExisting: true,
                maternity: false,
                ambulance: true,
                roomRent: '₹5000/day',
                copay: '10%',
                restoration: true,
                wellness: false
            },
            aiScore: 76,
            aiReasons: [
                'Higher coverage amount',
                'Good for families',
                'Co-payment required',
                'Limited room rent'
            ],
            recommended: false
        },
        {
            id: 3,
            name: 'Basic Care',
            type: 'HEALTH',
            provider: 'Care Health',
            premium: 3500,
            coverage: 500000,
            features: {
                cashless: false,
                preExisting: false,
                maternity: false,
                ambulance: true,
                roomRent: '₹2000/day',
                copay: '20%',
                restoration: false,
                wellness: false
            },
            aiScore: 62,
            aiReasons: [
                'Budget-friendly option',
                'Limited coverage',
                'No cashless facility',
                'High co-payment'
            ],
            recommended: false
        }
    ];

    const policiesToShow = policies.length > 0 ? policies : defaultPolicies;

    const togglePolicySelection = (policyId) => {
        setSelectedPolicies(prev => {
            if (prev.includes(policyId)) {
                return prev.filter(id => id !== policyId);
            }
            if (prev.length >= 3) {
                notify('You can compare up to 3 policies at a time', 'warning');
                return prev;
            }
            return [...prev, policyId];
        });
    };

    const getComparisonPolicies = () => {
        return policiesToShow.filter(p => selectedPolicies.includes(p.id));
    };

    const formatCurrency = (amount) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
        return `₹${amount.toLocaleString()}`;
    };

    const getFeatureIcon = (value) => {
        if (value === true) return '✅';
        if (value === false) return '❌';
        return value;
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
                padding: '25px 30px',
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                color: 'white'
            }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>
                    🔍 Policy Comparison Engine
                </h3>
                <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '0.95rem' }}>
                    Compare policies side-by-side with AI recommendations
                </p>
            </div>

            <div style={{ padding: 30 }}>
                {!showComparison ? (
                    <>
                        {/* Policy Selection Grid */}
                        <div style={{ marginBottom: 30 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                                    Select Policies to Compare ({selectedPolicies.length}/3)
                                </h4>
                                {selectedPolicies.length >= 2 && (
                                    <button
                                        onClick={() => setShowComparison(true)}
                                        className="primary-btn"
                                        style={{ background: '#8b5cf6' }}
                                    >
                                        Compare Selected ({selectedPolicies.length})
                                    </button>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                                {policiesToShow.map((policy, idx) => (
                                    <motion.div
                                        key={policy.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => togglePolicySelection(policy.id)}
                                        style={{
                                            padding: 20,
                                            background: selectedPolicies.includes(policy.id)
                                                ? 'rgba(139,92,246,0.1)'
                                                : 'rgba(255,255,255,0.02)',
                                            border: selectedPolicies.includes(policy.id)
                                                ? '2px solid #8b5cf6'
                                                : '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 12,
                                            cursor: 'pointer',
                                            position: 'relative',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(139,92,246,0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        {/* Recommended Badge */}
                                        {policy.recommended && (
                                            <div style={{
                                                position: 'absolute',
                                                top: -10,
                                                right: 20,
                                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                                color: 'white',
                                                padding: '6px 16px',
                                                borderRadius: 20,
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                boxShadow: '0 4px 12px rgba(16,185,129,0.4)'
                                            }}>
                                                🏆 AI BEST PICK
                                            </div>
                                        )}

                                        {/* Selection Checkbox */}
                                        <div style={{
                                            position: 'absolute',
                                            top: 15,
                                            left: 15,
                                            width: 24,
                                            height: 24,
                                            borderRadius: 6,
                                            border: `2px solid ${selectedPolicies.includes(policy.id) ? '#8b5cf6' : 'rgba(255,255,255,0.3)'}`,
                                            background: selectedPolicies.includes(policy.id) ? '#8b5cf6' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.9rem'
                                        }}>
                                            {selectedPolicies.includes(policy.id) && '✓'}
                                        </div>

                                        <div style={{ marginTop: policy.recommended ? 20 : 0 }}>
                                            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                                {policy.name}
                                            </h4>
                                            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {policy.provider}
                                            </p>

                                            <div style={{ marginBottom: 16 }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                                    Premium (Annual)
                                                </div>
                                                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8b5cf6' }}>
                                                    {formatCurrency(policy.premium)}
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: 16 }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                                    Coverage
                                                </div>
                                                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                                    {formatCurrency(policy.coverage)}
                                                </div>
                                            </div>

                                            {/* AI Score */}
                                            <div style={{
                                                padding: '12px 16px',
                                                background: `${getScoreColor(policy.aiScore)}20`,
                                                border: `1px solid ${getScoreColor(policy.aiScore)}40`,
                                                borderRadius: 8,
                                                marginBottom: 12
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                                        AI Match Score
                                                    </span>
                                                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: getScoreColor(policy.aiScore) }}>
                                                        {policy.aiScore}%
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Quick Features */}
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                {policy.features.cashless && (
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        background: 'rgba(16,185,129,0.1)',
                                                        border: '1px solid rgba(16,185,129,0.3)',
                                                        borderRadius: 12,
                                                        fontSize: '0.75rem',
                                                        color: '#10b981'
                                                    }}>
                                                        💳 Cashless
                                                    </span>
                                                )}
                                                {policy.features.preExisting && (
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        background: 'rgba(59,130,246,0.1)',
                                                        border: '1px solid rgba(59,130,246,0.3)',
                                                        borderRadius: 12,
                                                        fontSize: '0.75rem',
                                                        color: '#3b82f6'
                                                    }}>
                                                        🏥 Pre-existing
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Comparison Table */}
                        <div style={{ marginBottom: 20 }}>
                            <button
                                onClick={() => setShowComparison(false)}
                                className="primary-btn"
                                style={{ background: '#6b7280', marginBottom: 20 }}
                            >
                                ← Back to Selection
                            </button>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                                            <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                                Feature
                                            </th>
                                            {getComparisonPolicies().map(policy => (
                                                <th key={policy.id} style={{ padding: '16px', textAlign: 'center', minWidth: 200 }}>
                                                    <div style={{ marginBottom: 8 }}>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                                            {policy.name}
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                                            {policy.provider}
                                                        </div>
                                                    </div>
                                                    {policy.recommended && (
                                                        <div style={{
                                                            display: 'inline-block',
                                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                                            color: 'white',
                                                            padding: '4px 12px',
                                                            borderRadius: 12,
                                                            fontSize: '0.7rem',
                                                            fontWeight: 700
                                                        }}>
                                                            🏆 BEST PICK
                                                        </div>
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Premium */}
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
                                                💰 Annual Premium
                                            </td>
                                            {getComparisonPolicies().map(policy => (
                                                <td key={policy.id} style={{ padding: '16px', textAlign: 'center', fontSize: '1.3rem', fontWeight: 700, color: '#8b5cf6' }}>
                                                    {formatCurrency(policy.premium)}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Coverage */}
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                                            <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
                                                🛡️ Coverage Amount
                                            </td>
                                            {getComparisonPolicies().map(policy => (
                                                <td key={policy.id} style={{ padding: '16px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                                    {formatCurrency(policy.coverage)}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* AI Score */}
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
                                                🤖 AI Match Score
                                            </td>
                                            {getComparisonPolicies().map(policy => (
                                                <td key={policy.id} style={{ padding: '16px', textAlign: 'center' }}>
                                                    <div style={{
                                                        display: 'inline-block',
                                                        padding: '8px 20px',
                                                        background: `${getScoreColor(policy.aiScore)}20`,
                                                        border: `2px solid ${getScoreColor(policy.aiScore)}`,
                                                        borderRadius: 12,
                                                        fontSize: '1.5rem',
                                                        fontWeight: 800,
                                                        color: getScoreColor(policy.aiScore)
                                                    }}>
                                                        {policy.aiScore}%
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Features */}
                                        {Object.keys(getComparisonPolicies()[0]?.features || {}).map((feature, idx) => (
                                            <tr key={feature} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                                <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>
                                                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                                                </td>
                                                {getComparisonPolicies().map(policy => (
                                                    <td key={policy.id} style={{ padding: '16px', textAlign: 'center', fontSize: '1.2rem' }}>
                                                        {getFeatureIcon(policy.features[feature])}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* AI Recommendations */}
                            <div style={{ marginTop: 30, display: 'grid', gridTemplateColumns: `repeat(${getComparisonPolicies().length}, 1fr)`, gap: 20 }}>
                                {getComparisonPolicies().map(policy => (
                                    <div key={policy.id} style={{
                                        padding: 20,
                                        background: policy.recommended ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)',
                                        border: policy.recommended ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 12
                                    }}>
                                        <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--text-main)' }}>
                                            🤖 AI Analysis
                                        </h4>
                                        <ul style={{ margin: 0, padding: '0 0 0 20px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                            {policy.aiReasons.map((reason, idx) => (
                                                <li key={idx} style={{ marginBottom: 6 }}>{reason}</li>
                                            ))}
                                        </ul>
                                        <button
                                            onClick={() => onSelect && onSelect(policy)}
                                            className="primary-btn"
                                            style={{
                                                width: '100%',
                                                marginTop: 16,
                                                background: policy.recommended ? '#10b981' : '#8b5cf6'
                                            }}
                                        >
                                            {policy.recommended ? '✅ Choose Recommended' : 'Choose This Policy'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
