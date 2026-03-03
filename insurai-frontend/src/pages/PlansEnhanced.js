import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

export default function PlansEnhanced() {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Filter state
    const [filters, setFilters] = useState({
        maxPremium: '',
        minCoverage: '',
        maxCoverage: '',
        type: '',
        category: ''
    });

    const { user } = useAuth();
    const { notify } = useNotification();
    const navigate = useNavigate();

    // Fetch AI recommendations on mount


    const fetchRecommendations = useCallback(() => {
        setLoading(true);
        api.get(`/policies/recommendations/${user.id}`)
            .then(r => {
                const normalized = r.data.map(rec => ({
                    ...rec,
                    policy: rec.policy || {
                        id: rec.policyId,
                        name: rec.policyName,
                        type: rec.type,
                        category: rec.category,
                        premium: rec.premium,
                        coverage: rec.coverage,
                        description: rec.recommendationReason || rec.matchReason || ""
                    }
                }));
                setRecommendations(normalized);
            })
            .catch(err => {
                console.error(err);
                notify("Failed to load recommendations", "error");
            })
            .finally(() => setLoading(false));
    }, [user, notify]);

    // Fetch AI recommendations on mount
    useEffect(() => {
        if (user && user.role === 'USER') {
            fetchRecommendations();
        } else {
            // Fallback to regular policies
            api.get("/policies")
                .then(r => {
                    const enriched = r.data.map(p => ({
                        policy: p,
                        matchScore: null,
                        eligibilityStatus: null,
                        isRecommended: false
                    }));
                    setRecommendations(enriched);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [user, fetchRecommendations]);

    const applyFilters = () => {
        if (!user || user.role !== 'USER') {
            notify("Please login as a user to use filters", "error");
            return;
        }

        setLoading(true);
        api.post(`/policies/filter/${user.id}`, filters)
            .then(r => {
                const normalized = r.data.map(rec => ({
                    ...rec,
                    policy: rec.policy || {
                        id: rec.policyId,
                        name: rec.policyName,
                        type: rec.type,
                        category: rec.category,
                        premium: rec.premium,
                        coverage: rec.coverage,
                        description: rec.recommendationReason || rec.matchReason || ""
                    }
                }));
                setRecommendations(normalized);
                setShowFilters(false);
                notify("Filters applied successfully", "success");
            })
            .catch(err => {
                console.error(err);
                notify("Failed to apply filters", "error");
            })
            .finally(() => setLoading(false));
    };

    const clearFilters = () => {
        setFilters({
            maxPremium: '',
            minCoverage: '',
            maxCoverage: '',
            type: '',
            category: ''
        });
        fetchRecommendations();
    };

    const bookConsultation = (policyData) => {
        if (!user) {
            notify("Please login to book a consultation", "error");
            navigate("/login");
            return;
        }

        const policy = policyData.policy || policyData;
        navigate("/schedule-appointment", { state: { policy } });
        setSelectedPlan(null);
    };

    const getEligibilityColor = (status) => {
        switch (status) {
            case 'ELIGIBLE': return '#22c55e';
            case 'PARTIALLY_ELIGIBLE': return '#eab308';
            case 'NOT_ELIGIBLE': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getEligibilityText = (status) => {
        switch (status) {
            case 'ELIGIBLE': return 'Eligible';
            case 'PARTIALLY_ELIGIBLE': return 'Partially Eligible';
            case 'NOT_ELIGIBLE': return 'Not Eligible';
            default: return 'Unknown';
        }
    };

    // Group recommendations
    const topPicks = recommendations.filter(r => r.isRecommended).slice(0, 3);
    const otherRecommendations = recommendations.filter(r => !r.isRecommended);

    return (
        <div style={{ padding: '36px 32px', maxWidth: 1400, margin: '0 auto' }}>
            {/* ── Breadcrumb ── */}
            <div className="breadcrumbs" style={{ marginBottom: 16 }}>
                <Link to="/">Home</Link>
                <span>/</span>
                <span>Insurance Plans</span>
            </div>

            {/* ── Hero Header ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span className="badge badge-user" style={{ fontSize: '0.7rem' }}>👤 User</span>
                    {user?.role === 'USER' && (
                        <span style={{
                            fontSize: '0.7rem', fontWeight: 700, color: '#8b5cf6',
                            background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
                            padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5,
                        }}>
                            🤖 AI-Powered
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: "'Space Grotesk',sans-serif" }}>
                            📜 <span className="text-gradient">Insurance Plans</span>
                        </h1>
                        <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {user?.role === 'USER'
                                ? 'AI-powered recommendations based on your age, income, and health profile'
                                : 'Compare and explore the best insurance plans available on the platform'}
                        </p>
                    </div>
                    {user?.role === 'USER' && (
                        <button
                            className="secondary-btn"
                            onClick={() => setShowFilters(!showFilters)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', fontWeight: 700, flexShrink: 0 }}
                        >
                            <span>🔍</span>
                            {showFilters ? 'Hide Filters' : 'Refine Results'}
                        </button>
                    )}
                </div>
                <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(99,102,241,0.5), rgba(139,92,246,0.3), transparent)', marginTop: 16 }} />
            </motion.div>

            {/* ── Filter Panel ── */}
            <AnimatePresence>
                {showFilters && user?.role === 'USER' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="card"
                        style={{ marginBottom: 28, padding: '22px 26px', overflow: 'hidden' }}
                    >
                        <h3 style={{ marginTop: 0, marginBottom: 18, fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                            🔍 Refine Your Results
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                            {[
                                { key: 'maxPremium', label: 'Max Premium (₹/month)', placeholder: 'e.g. 5000', type: 'number' },
                                { key: 'minCoverage', label: 'Min Coverage (₹)', placeholder: 'e.g. 500000', type: 'number' },
                                { key: 'maxCoverage', label: 'Max Coverage (₹)', placeholder: 'e.g. 10000000', type: 'number' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="form-label">{f.label}</label>
                                    <input
                                        type={f.type}
                                        className="form-input"
                                        value={filters[f.key]}
                                        onChange={e => setFilters({ ...filters, [f.key]: e.target.value })}
                                        placeholder={f.placeholder}
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="form-label">Policy Type</label>
                                <select
                                    className="form-input"
                                    value={filters.type}
                                    onChange={e => setFilters({ ...filters, type: e.target.value })}
                                >
                                    <option value="">All Types</option>
                                    {[
                                        'Health', 'Life', 'Child', 'Accident', 'Critical', 'Family', 'Senior', 'OPD', 'Top-Up', 'Wellness',
                                        'Endowment', 'Money Back', 'Guaranteed', 'Pension', 'ULIP', 'Investment', 'Property', 'Group Health',
                                        'Group Life', 'Cyber', 'Motor', 'Home', 'Travel'
                                    ].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            <button className="primary-btn" onClick={applyFilters} style={{ padding: '9px 22px' }}>
                                Apply Filters
                            </button>
                            <button className="secondary-btn" onClick={clearFilters} style={{ padding: '9px 22px' }}>
                                Clear All
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Top AI Picks ── */}
            {user?.role === 'USER' && topPicks.length > 0 && (
                <div style={{ marginBottom: 48 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <div style={{
                            padding: '6px 16px', background: 'rgba(245,158,11,0.1)',
                            border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-pill)',
                            color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem',
                            display: 'flex', alignItems: 'center', gap: 6
                        }}>
                            ⭐ Top AI Picks for You
                        </div>
                        <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, rgba(245,158,11,0.3), transparent)' }} />
                    </div>
                    <div className="grid">
                        {topPicks.map((rec, i) => (
                            <PolicyRecommendationCard
                                key={rec.policy?.id || rec.policyId || i}
                                recommendation={rec} index={i}
                                onSelect={setSelectedPlan}
                                getEligibilityColor={getEligibilityColor}
                                getEligibilityText={getEligibilityText}
                                isTopPick={true}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ── All Policies── */}
            <div>
                {user?.role === 'USER' && topPicks.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <div style={{
                            padding: '6px 16px', background: 'rgba(99,102,241,0.1)',
                            border: '1px solid rgba(99,102,241,0.25)', borderRadius: 'var(--radius-pill)',
                            color: '#a5b4fc', fontWeight: 700, fontSize: '0.85rem'
                        }}>Other Recommendations</div>
                        <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, rgba(99,102,241,0.3), transparent)' }} />
                    </div>
                )}

                {loading ? (
                    <div className="grid">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="card policy-card-minimal" style={{ minHeight: 400 }}>
                                <div className="skeleton" style={{ height: 20, width: "30%", marginBottom: 10 }}></div>
                                <div className="skeleton" style={{ height: 32, width: "60%", marginBottom: 20 }}></div>
                                <div className="skeleton" style={{ height: 50, width: "40%", marginBottom: 20 }}></div>
                                <div className="skeleton" style={{ height: 100, width: "100%", marginBottom: 20 }}></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid">
                        {(user && user.role === 'USER' ? otherRecommendations : recommendations).map((rec, i) => (
                            <PolicyRecommendationCard
                                key={rec.policy?.id || rec.policyId || rec.id || i}
                                recommendation={rec}
                                index={i}
                                onSelect={setSelectedPlan}
                                getEligibilityColor={getEligibilityColor}
                                getEligibilityText={getEligibilityText}
                                isTopPick={false}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Consultation Modal */}
            {selectedPlan && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="card" style={{ width: 500, maxWidth: "90%" }}
                    >
                        <h2 style={{ marginTop: 0 }}>Consult Expert for {selectedPlan.policy?.name || selectedPlan.name}</h2>

                        {selectedPlan.matchScore !== null && selectedPlan.matchScore !== undefined && (
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <span style={{ fontWeight: 600 }}>Match Score:</span>
                                    <span style={{
                                        fontWeight: 700,
                                        color: selectedPlan.matchScore >= 70 ? '#22c55e' : selectedPlan.matchScore >= 50 ? '#eab308' : '#ef4444'
                                    }}>
                                        {selectedPlan.matchScore.toFixed(0)}/100
                                    </span>
                                </div>
                                {selectedPlan.eligibilityStatus && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <span style={{ fontWeight: 600 }}>Eligibility:</span>
                                        <span style={{
                                            fontWeight: 700,
                                            color: getEligibilityColor(selectedPlan.eligibilityStatus)
                                        }}>
                                            {getEligibilityText(selectedPlan.eligibilityStatus)}
                                        </span>
                                    </div>
                                )}
                                {selectedPlan.recommendationReason && (
                                    <p style={{
                                        padding: 10,
                                        background: 'rgba(0,0,0,0.05)',
                                        borderRadius: 8,
                                        fontSize: '0.9rem',
                                        marginTop: 10
                                    }}>
                                        💡 {selectedPlan.recommendationReason}
                                    </p>
                                )}
                            </div>
                        )}

                        <p style={{ opacity: 0.7, marginBottom: 20 }}>
                            Our compliance requires an agent consultation before purchase.
                            Talk to an expert to get the best quote.
                        </p>

                        <div style={{ display: "flex", gap: 10 }}>
                            {user && user.role === 'USER' && (
                                <button className="primary-btn" style={{ flex: 1 }} onClick={() => bookConsultation(selectedPlan)}>
                                    Book Appointment
                                </button>
                            )}
                            <button style={{ flex: 1, background: "transparent", border: "1px solid var(--text-muted)", color: "var(--text-main)" }} onClick={() => setSelectedPlan(null)}>
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

// Circular Progress Component
const CircularProgress = ({ score, size = 46, strokeWidth = 4 }) => {
    const radius = size / 2 - strokeWidth;
    const circumference = radius * 2 * Math.PI;
    const offset = Math.max(0, circumference - (score / 100) * circumference);
    const color = score >= 70 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444';

    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} fill="transparent"
                />
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke={color} strokeWidth={strokeWidth} fill="transparent"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color, lineHeight: 1 }}>{Math.round(score)}</span>
                <span style={{ fontSize: '0.4rem', fontWeight: 700, color: 'var(--text-muted)' }}>%</span>
            </div>
        </div>
    );
};

// Expandable Explainability Section
const ExplainabilitySection = ({ reason }) => {
    const [expanded, setExpanded] = useState(false);

    if (!reason) return null;

    return (
        <div style={{ paddingLeft: 10, marginBottom: 15, paddingRight: 10 }}>
            <div
                onClick={() => setExpanded(!expanded)}
                style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(255,255,255,0.03)', padding: '8px 12px',
                    borderRadius: 8, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '1rem' }}>💡</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a5b4fc' }}>Why this policy?</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    ▼
                </span>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{
                            padding: '10px 12px', background: 'rgba(99,102,241,0.05)',
                            border: '1px solid rgba(99,102,241,0.1)',
                            borderTop: 'none', borderRadius: '0 0 8px 8px',
                            fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5
                        }}>
                            {reason}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Policy Recommendation Card Component
function PolicyRecommendationCard({ recommendation, index, onSelect, getEligibilityColor, getEligibilityText, isTopPick }) {
    const policy = recommendation.policy || recommendation;
    const hasAIData = recommendation.matchScore !== null && recommendation.matchScore !== undefined;

    const getCategoryColor = (cat) => {
        switch (cat) {
            case 'Personal Insurance': return '#ef4444';
            case 'Health Insurance': return '#22c55e';
            case 'Investment Plans': return '#eab308';
            case 'Business Insurance': return '#3b82f6';
            case 'Employee Benefits': return '#8b5cf6';
            case 'Liability': return '#f97316';
            case 'Engineering': return '#6366f1';
            default: return 'var(--primary)';
        }
    };

    const stripeColor = getCategoryColor(policy.category);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card policy-card-minimal"
            style={{
                position: "relative",
                overflow: "hidden",
                border: isTopPick ? `2px solid ${stripeColor}` : undefined,
                boxShadow: isTopPick ? `0 4px 20px ${stripeColor}40` : undefined
            }}
        >
            {/* Categorical Stripe */}
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: stripeColor }}></div>

            {/* Top Pick Badge */}
            {isTopPick && (
                <div style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: stripeColor,
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                }}>
                    <span>⭐</span> Best for You
                </div>
            )}

            {/* AI Indicators */}
            {hasAIData && (
                <div style={{
                    display: 'flex',
                    gap: 8,
                    marginBottom: 15,
                    paddingLeft: 10,
                    flexWrap: 'wrap'
                }}>
                    {/* Match Score Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 4 }}>
                        <CircularProgress score={recommendation.matchScore} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>AI Match</span>
                    </div>

                    {/* Eligibility Badge */}
                    {recommendation.eligibilityStatus && (
                        <div style={{
                            background: `${getEligibilityColor(recommendation.eligibilityStatus)}20`,
                            color: getEligibilityColor(recommendation.eligibilityStatus),
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 700
                        }}>
                            {getEligibilityText(recommendation.eligibilityStatus)}
                        </div>
                    )}

                    {/* Claim Success Rate */}
                    {recommendation.claimSuccessRate && (
                        <div style={{
                            background: '#3b82f620',
                            color: '#3b82f6',
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 700
                        }}>
                            {recommendation.claimSuccessRate}% Claims Settled
                        </div>
                    )}
                </div>
            )}

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15, paddingLeft: 10 }}>
                <div>
                    <span style={{
                        fontSize: "0.75rem", fontWeight: 700, opacity: 0.6,
                        textTransform: "uppercase", letterSpacing: "0.05em",
                        marginBottom: 4, display: "block", color: stripeColor
                    }}>{policy.type}</span>
                    <h3 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 700, lineHeight: 1.2 }}>{policy.name}</h3>
                </div>
            </div>

            {/* Price Tag */}
            <div style={{ paddingLeft: 10, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontSize: "1.8rem", fontWeight: 700, color: stripeColor }}>₹{policy.premium}</span>
                    <span style={{ fontSize: "0.9rem", opacity: 0.6 }}>/mo</span>
                </div>
                <div style={{ fontSize: "0.85rem", opacity: 0.7, marginTop: 4 }}>
                    Cover: <strong style={{ color: "var(--text-main)" }}>₹{policy.coverage?.toLocaleString('en-IN') ?? "N/A"}</strong>
                </div>
            </div>

            {/* Description */}
            <p style={{ paddingLeft: 10, paddingRight: 10, fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6, flex: 1, marginBottom: 15 }}>
                {(policy.description || "No description available.").length > 80
                    ? (policy.description || "").substring(0, 80) + "..."
                    : policy.description}
            </p>

            {hasAIData && recommendation.recommendationReason && (
                <ExplainabilitySection reason={recommendation.recommendationReason} />
            )}

            {/* Action */}
            <div style={{ paddingLeft: 10, marginTop: "auto" }}>
                <button
                    className="primary-btn"
                    style={{
                        width: "100%", borderRadius: "var(--radius-md)", padding: "14px", fontSize: "0.95rem",
                        background: stripeColor,
                        border: `1px solid ${stripeColor}`,
                        color: 'white',
                        cursor: "pointer"
                    }}
                    onClick={() => onSelect(recommendation)}
                >
                    View Details & Consult Agent
                </button>
            </div>
        </motion.div>
    );
}
