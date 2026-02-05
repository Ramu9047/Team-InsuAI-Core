import { useEffect, useState } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

export default function PlansEnhanced() {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
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
    }, [user]);

    const fetchRecommendations = () => {
        setLoading(true);
        api.get(`/policies/recommendations/${user.id}`)
            .then(r => setRecommendations(r.data))
            .catch(err => {
                console.error(err);
                notify("Failed to load recommendations", "error");
            })
            .finally(() => setLoading(false));
    };

    const applyFilters = () => {
        if (!user || user.role !== 'USER') {
            notify("Please login as a user to use filters", "error");
            return;
        }

        setLoading(true);
        api.post(`/policies/filter/${user.id}`, filters)
            .then(r => {
                setRecommendations(r.data);
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
        navigate("/schedule", { state: { policy } });
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
        <div>
            <div className="breadcrumbs">
                <Link to="/">Home</Link>
                <span>/</span>
                <span>Insurance Plans</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                <div>
                    <h1 className="text-gradient" style={{ marginBottom: 10, fontSize: "2.5rem" }}>
                        Insurance Plans
                    </h1>
                    <p style={{ opacity: 0.8 }}>
                        {user && user.role === 'USER' 
                            ? 'AI-powered recommendations based on your profile' 
                            : 'Compare and buy the best insurance plans for your needs'}
                    </p>
                </div>
                
                {user && user.role === 'USER' && (
                    <button
                        className="primary-btn"
                        onClick={() => setShowFilters(!showFilters)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        <span>🔍</span>
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                )}
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
                {showFilters && user && user.role === 'USER' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="card"
                        style={{ marginBottom: 30, padding: 20 }}
                    >
                        <h3 style={{ marginTop: 0, marginBottom: 20 }}>Filter Policies</h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem', fontWeight: 600 }}>
                                    Max Premium (₹/month)
                                </label>
                                <input
                                    type="number"
                                    value={filters.maxPremium}
                                    onChange={e => setFilters({ ...filters, maxPremium: e.target.value })}
                                    placeholder="e.g., 5000"
                                    style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--card-border)' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem', fontWeight: 600 }}>
                                    Min Coverage (₹)
                                </label>
                                <input
                                    type="number"
                                    value={filters.minCoverage}
                                    onChange={e => setFilters({ ...filters, minCoverage: e.target.value })}
                                    placeholder="e.g., 500000"
                                    style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--card-border)' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem', fontWeight: 600 }}>
                                    Max Coverage (₹)
                                </label>
                                <input
                                    type="number"
                                    value={filters.maxCoverage}
                                    onChange={e => setFilters({ ...filters, maxCoverage: e.target.value })}
                                    placeholder="e.g., 10000000"
                                    style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--card-border)' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem', fontWeight: 600 }}>
                                    Policy Type
                                </label>
                                <select
                                    value={filters.type}
                                    onChange={e => setFilters({ ...filters, type: e.target.value })}
                                    style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--card-border)' }}
                                >
                                    <option value="">All Types</option>
                                    <option value="Health">Health</option>
                                    <option value="Life">Life</option>
                                    <option value="Motor">Motor</option>
                                    <option value="Corporate">Corporate</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            <button className="primary-btn" onClick={applyFilters}>
                                Apply Filters
                            </button>
                            <button 
                                onClick={clearFilters}
                                style={{ 
                                    padding: '10px 20px', 
                                    borderRadius: 8, 
                                    border: '1px solid var(--card-border)', 
                                    background: 'transparent',
                                    cursor: 'pointer'
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Picks Section */}
            {user && user.role === 'USER' && topPicks.length > 0 && (
                <div style={{ marginBottom: 50 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <span style={{ fontSize: '2rem' }}>⭐</span>
                        <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Top Picks for You</h2>
                    </div>
                    
                    <div className="grid">
                        {topPicks.map((rec, i) => (
                            <PolicyRecommendationCard
                                key={rec.policy.id}
                                recommendation={rec}
                                index={i}
                                onSelect={setSelectedPlan}
                                getEligibilityColor={getEligibilityColor}
                                getEligibilityText={getEligibilityText}
                                isTopPick={true}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* All Policies */}
            <div>
                {user && user.role === 'USER' && topPicks.length > 0 && (
                    <h2 style={{ fontSize: '1.6rem', marginBottom: 20 }}>Other Recommendations</h2>
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
                                key={rec.policy?.id || rec.id}
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
                    <div style={{
                        background: recommendation.matchScore >= 70 ? '#22c55e20' : recommendation.matchScore >= 50 ? '#eab30820' : '#ef444420',
                        color: recommendation.matchScore >= 70 ? '#22c55e' : recommendation.matchScore >= 50 ? '#eab308' : '#ef4444',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        fontWeight: 700
                    }}>
                        {recommendation.matchScore.toFixed(0)}% Match
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
            <p style={{ paddingLeft: 10, fontSize: "0.9rem", opacity: 0.7, lineHeight: 1.6, flex: 1, marginBottom: 20 }}>
                {(policy.description || "No description available.").length > 80 
                    ? (policy.description || "").substring(0, 80) + "..." 
                    : policy.description}
            </p>

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
