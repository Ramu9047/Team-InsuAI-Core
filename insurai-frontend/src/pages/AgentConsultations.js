import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";

export default function AgentConsultations() {
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, completed
    const { notify } = useNotification();

    const fetchConsultations = useCallback(() => {
        setLoading(true);
        api.get('/agents/consultations')
            .then(r => {
                setConsultations(r.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                notify("Failed to load consultations", "error");
                setLoading(false);
            });
    }, [notify]);

    useEffect(() => {
        fetchConsultations();
    }, [fetchConsultations]);

    const filteredConsultations = consultations.filter(c => {
        if (filter === 'pending') return c.status === 'PENDING';
        if (filter === 'completed') return c.status !== 'PENDING';
        return true;
    });

    const pendingCount = consultations.filter(c => c.status === 'PENDING').length;
    const completedCount = consultations.filter(c => c.status !== 'PENDING').length;

    return (
        <div>
            <div style={{ marginBottom: 30 }}>
                <h1 className="text-gradient" style={{ marginBottom: 10, fontSize: "2.5rem" }}>
                    My Consultations
                </h1>
                <p style={{ opacity: 0.8 }}>
                    Review user profiles, analyze AI risk indicators, and make informed decisions
                </p>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
                <FilterTab
                    active={filter === 'all'}
                    onClick={() => setFilter('all')}
                    label="All Consultations"
                    count={consultations.length}
                />
                <FilterTab
                    active={filter === 'pending'}
                    onClick={() => setFilter('pending')}
                    label="Pending"
                    count={pendingCount}
                    color="#eab308"
                />
                <FilterTab
                    active={filter === 'completed'}
                    onClick={() => setFilter('completed')}
                    label="Completed"
                    count={completedCount}
                    color="#22c55e"
                />
            </div>

            {/* Consultations Grid */}
            {loading ? (
                <div className="grid">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="card" style={{ minHeight: 300 }}>
                            <div className="skeleton" style={{ height: 20, width: "60%", marginBottom: 10 }}></div>
                            <div className="skeleton" style={{ height: 40, width: "80%", marginBottom: 20 }}></div>
                            <div className="skeleton" style={{ height: 100, width: "100%", marginBottom: 20 }}></div>
                        </div>
                    ))}
                </div>
            ) : filteredConsultations.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 20 }}>📭</div>
                    <h3>No {filter !== 'all' ? filter : ''} consultations</h3>
                    <p style={{ opacity: 0.7 }}>
                        {filter === 'pending' ? 'All caught up! No pending consultations.' : 'Consultations will appear here.'}
                    </p>
                </div>
            ) : (
                <div className="grid">
                    {filteredConsultations.map((consultation, index) => (
                        <ConsultationCard
                            key={consultation.bookingId}
                            consultation={consultation}
                            index={index}
                            onClick={() => setSelectedConsultation(consultation)}
                        />
                    ))}
                </div>
            )}

            {/* Consultation Detail Modal */}
            {selectedConsultation && (
                <ConsultationDetailModal
                    consultation={selectedConsultation}
                    onClose={() => setSelectedConsultation(null)}
                    onDecisionMade={() => {
                        setSelectedConsultation(null);
                        fetchConsultations();
                    }}
                />
            )}
        </div>
    );
}

function FilterTab({ active, onClick, label, count, color }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: active ? `2px solid ${color || 'var(--primary)'}` : '1px solid var(--card-border)',
                background: active ? `${color || 'var(--primary)'}10` : 'transparent',
                color: active ? (color || 'var(--primary)') : 'var(--text-main)',
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 8
            }}
        >
            {label}
            <span style={{
                background: active ? (color || 'var(--primary)') : 'var(--card-border)',
                color: active ? 'white' : 'var(--text-main)',
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: '0.75rem',
                fontWeight: 700
            }}>
                {count}
            </span>
        </button>
    );
}

function ConsultationCard({ consultation, index, onClick }) {
    const getRiskColor = (level) => {
        switch (level) {
            case 'LOW': return '#22c55e';
            case 'MEDIUM': return '#eab308';
            case 'HIGH': return '#ef4444';
            default: return '#9ca3af';
        }
    };

    const getEligibilityColor = (status) => {
        switch (status) {
            case 'ELIGIBLE': return '#22c55e';
            case 'PARTIALLY_ELIGIBLE': return '#eab308';
            case 'NOT_ELIGIBLE': return '#ef4444';
            default: return '#9ca3af';
        }
    };

    const isPending = consultation.status === 'PENDING';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card"
            style={{
                cursor: 'pointer',
                border: isPending ? '2px solid #eab308' : undefined,
                position: 'relative',
                overflow: 'hidden'
            }}
            onClick={onClick}
        >
            {/* Pending Indicator */}
            {isPending && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: '#eab308',
                    color: 'white',
                    padding: '4px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderBottomLeftRadius: 8
                }}>
                    PENDING REVIEW
                </div>
            )}

            {/* User Info */}
            <div style={{ marginBottom: 15 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.2rem'
                    }}>
                        {consultation.userName?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{consultation.userName}</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.6 }}>{consultation.userEmail}</p>
                    </div>
                </div>
            </div>

            {/* Policy Info */}
            <div style={{ marginBottom: 15, padding: 10, background: 'rgba(0,0,0,0.03)', borderRadius: 8 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6, marginBottom: 4 }}>
                    SELECTED POLICY
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{consultation.policyName}</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: 4 }}>
                    ₹{consultation.policyPremium}/mo • ₹{consultation.policyCoverage?.toLocaleString('en-IN')} coverage
                </div>
            </div>

            {/* AI Risk Indicators */}
            <div style={{ marginBottom: 15 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6, marginBottom: 8 }}>
                    AI RISK ANALYSIS
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                    {/* Risk Level */}
                    <div style={{
                        background: `${getRiskColor(consultation.riskLevel)}20`,
                        color: getRiskColor(consultation.riskLevel),
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                    }}>
                        <span>{consultation.riskLevel === 'LOW' ? '✓' : consultation.riskLevel === 'HIGH' ? '⚠' : '●'}</span>
                        {consultation.riskLevel} RISK
                    </div>

                    {/* Match Score */}
                    {consultation.matchScore !== null && (
                        <div style={{
                            background: consultation.matchScore >= 70 ? '#22c55e20' : consultation.matchScore >= 50 ? '#eab30820' : '#ef444420',
                            color: consultation.matchScore >= 70 ? '#22c55e' : consultation.matchScore >= 50 ? '#eab308' : '#ef4444',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 700
                        }}>
                            {consultation.matchScore.toFixed(0)}% Match
                        </div>
                    )}

                    {/* Eligibility */}
                    {consultation.eligibilityStatus && (
                        <div style={{
                            background: `${getEligibilityColor(consultation.eligibilityStatus)}20`,
                            color: getEligibilityColor(consultation.eligibilityStatus),
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 700
                        }}>
                            {consultation.eligibilityStatus.replace('_', ' ')}
                        </div>
                    )}

                    {/* Affordability */}
                    {consultation.affordabilityRatio !== null && (
                        <div style={{
                            background: consultation.isAffordable ? '#22c55e20' : '#ef444420',
                            color: consultation.isAffordable ? '#22c55e' : '#ef4444',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 700
                        }}>
                            {consultation.affordabilityRatio.toFixed(1)}% of income
                        </div>
                    )}
                </div>

                {/* Risk Reason */}
                {consultation.riskReason && (
                    <div style={{
                        padding: 8,
                        background: 'rgba(0,0,0,0.03)',
                        borderRadius: 6,
                        fontSize: '0.85rem',
                        lineHeight: 1.4,
                        borderLeft: `3px solid ${getRiskColor(consultation.riskLevel)}`
                    }}>
                        {consultation.riskReason}
                    </div>
                )}
            </div>

            {/* Action Button */}
            <button
                className="primary-btn"
                style={{ width: '100%', marginTop: 'auto' }}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
            >
                {isPending ? 'Review & Make Decision' : 'View Details'}
            </button>
        </motion.div>
    );
}

function ConsultationDetailModal({ consultation, onClose, onDecisionMade }) {
    const [action, setAction] = useState('APPROVE');
    const [agentNotes, setAgentNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { notify } = useNotification();

    const handleSubmit = async () => {
        if (!agentNotes.trim()) {
            notify("Please add agent notes", "error");
            return;
        }

        if (action === 'REJECT' && !rejectionReason.trim()) {
            notify("Please provide a rejection reason", "error");
            return;
        }

        setSubmitting(true);

        const request = {
            bookingId: consultation.bookingId,
            action,
            agentNotes,
            rejectionReason: action === 'REJECT' ? rejectionReason : null,
            alternatives: action === 'RECOMMEND_ALTERNATIVE' ? [] : null // TODO: Add alternative selector
        };

        try {
            await api.post('/agents/consultations/decision', request);
            notify(`Consultation ${action.toLowerCase()}d successfully`, "success");
            onDecisionMade();
        } catch (err) {
            console.error(err);
            notify("Failed to process decision", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000,
            padding: 20,
            overflowY: 'auto'
        }} onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={e => e.stopPropagation()}
                className="card"
                style={{ width: 700, maxWidth: "100%", maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    ×
                </button>
                <h2 style={{ marginTop: 0, paddingRight: 40 }}>Consultation Review</h2>

                {/* User Profile */}
                <div className="card" style={{ background: 'rgba(0,0,0,0.03)', marginBottom: 20 }}>
                    <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>User Profile</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <InfoRow label="Name" value={consultation.userName} />
                        <InfoRow label="Email" value={consultation.userEmail} />
                        <InfoRow label="Age" value={consultation.userAge || 'N/A'} />
                        <InfoRow label="Income" value={consultation.userIncome ? `₹${consultation.userIncome.toLocaleString()}` : 'N/A'} />
                        <InfoRow label="Dependents" value={consultation.userDependents || 'N/A'} />
                        <InfoRow label="Health Info" value={consultation.userHealthInfo || 'None provided'} span={2} />
                    </div>
                </div>

                {/* Policy Details */}
                <div className="card" style={{ background: 'rgba(0,0,0,0.03)', marginBottom: 20 }}>
                    <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>Selected Policy</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <InfoRow label="Policy" value={consultation.policyName} span={2} />
                        <InfoRow label="Type" value={consultation.policyType} />
                        <InfoRow label="Premium" value={`₹${consultation.policyPremium}/mo`} />
                        <InfoRow label="Coverage" value={`₹${consultation.policyCoverage?.toLocaleString()}`} span={2} />
                    </div>
                </div>

                {/* AI Analysis */}
                <div className="card" style={{ background: 'rgba(var(--primary-rgb), 0.05)', marginBottom: 20, border: '1px solid var(--primary)' }}>
                    <h3 style={{ marginTop: 0, fontSize: '1.1rem', color: 'var(--primary)' }}>🤖 AI Risk Analysis</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <InfoRow label="Risk Level" value={consultation.riskLevel} />
                        <InfoRow label="Match Score" value={consultation.matchScore ? `${consultation.matchScore.toFixed(0)}/100` : 'N/A'} />
                        <InfoRow label="Eligibility" value={consultation.eligibilityStatus?.replace('_', ' ')} />
                        <InfoRow label="Affordability" value={consultation.affordabilityRatio ? `${consultation.affordabilityRatio.toFixed(1)}% of income` : 'N/A'} />
                        {consultation.riskReason && (
                            <InfoRow label="Risk Reason" value={consultation.riskReason} span={2} />
                        )}
                    </div>
                </div>

                {/* Decision Form */}
                <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 15 }}>Your Decision</h3>

                    {/* Action Tabs */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                        <ActionTab
                            active={action === 'APPROVE'}
                            onClick={() => setAction('APPROVE')}
                            label="✅ Approve"
                            color="#22c55e"
                        />
                        <ActionTab
                            active={action === 'REJECT'}
                            onClick={() => setAction('REJECT')}
                            label="❌ Reject"
                            color="#ef4444"
                        />
                        <ActionTab
                            active={action === 'RECOMMEND_ALTERNATIVE'}
                            onClick={() => setAction('RECOMMEND_ALTERNATIVE')}
                            label="🔄 Recommend Alternative"
                            color="#eab308"
                        />
                    </div>

                    {/* Agent Notes */}
                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>
                            Agent Notes *
                        </label>
                        <textarea
                            value={agentNotes}
                            onChange={e => setAgentNotes(e.target.value)}
                            placeholder="Explain your decision to the user..."
                            rows={4}
                            style={{
                                width: '100%',
                                padding: 10,
                                borderRadius: 8,
                                border: '1px solid var(--card-border)',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    {/* Rejection Reason */}
                    {action === 'REJECT' && (
                        <div style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>
                                Rejection Reason *
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={e => setRejectionReason(e.target.value)}
                                placeholder="Why is this policy not suitable for the user?"
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: 10,
                                    borderRadius: 8,
                                    border: '1px solid var(--card-border)',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    )}

                    {/* Alternative Recommendation Note */}
                    {action === 'RECOMMEND_ALTERNATIVE' && (
                        <div style={{
                            padding: 10,
                            background: '#eab30810',
                            borderRadius: 8,
                            border: '1px solid #eab308',
                            fontSize: '0.9rem',
                            marginBottom: 15
                        }}>
                            💡 Alternative policy selector coming soon. For now, add recommendations in agent notes.
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        className="primary-btn"
                        onClick={handleSubmit}
                        disabled={submitting}
                        style={{ flex: 1 }}
                    >
                        {submitting ? 'Processing...' : 'Submit Decision'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        style={{
                            flex: 1,
                            padding: '10px 20px',
                            borderRadius: 8,
                            border: '1px solid var(--card-border)',
                            background: 'transparent',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function ActionTab({ active, onClick, label, color }) {
    return (
        <button
            onClick={onClick}
            style={{
                flex: 1,
                padding: '10px 15px',
                borderRadius: 8,
                border: active ? `2px solid ${color}` : '1px solid var(--card-border)',
                background: active ? `${color}10` : 'transparent',
                color: active ? color : 'var(--text-main)',
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.9rem'
            }}
        >
            {label}
        </button>
    );
}

function InfoRow({ label, value, span }) {
    return (
        <div style={{ gridColumn: span === 2 ? 'span 2' : undefined }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6, marginBottom: 2 }}>
                {label}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                {value || 'N/A'}
            </div>
        </div>
    );
}
