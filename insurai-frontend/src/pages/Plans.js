import { useEffect, useState } from "react";
import api from "../services/api";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { useNotification } from "../context/NotificationContext";

export default function Plans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [selectedPlan, setSelectedPlan] = useState(null);

    const { user } = useAuth();
    const { notify } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/policies")
            .then(r => setPlans(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const bookConsultation = () => {
        if (!user) {
            notify("Please login to book a consultation", "error");
            return;
        }

        // Navigate to schedule, passing the policy generic info (could be implemented via query params or context)
        // Pass selectedPlan in state for "Buy" intent
        navigate("/schedule", { state: { policy: selectedPlan } });
    };


    // Loading handled in UI with skeletons

    return (
        <div>
            <div className="breadcrumbs">
                <Link to="/">Home</Link>
                <span>/</span>
                <span>Insurance Plans</span>
            </div>
            <h1 className="text-gradient" style={{ marginBottom: 20, fontSize: "2.5rem" }}>
                Insurance Plans
            </h1>
            <p style={{ marginBottom: 40, opacity: 0.8 }}>Compare and buy the best insurance plans for your needs.</p>

            {/* Category Navigation */}
            <div style={{ display: "flex", gap: 10, marginBottom: 40, overflowX: "auto", paddingBottom: 10 }}>
                {/* Dynamically extract categories from plans if possible, or use predefined list extended with new ones */}
                {["All", "Personal Insurance", "Health Insurance", "Investment Plans", "Business Insurance", "Employee Benefits", "Liability", "Engineering", "Other Plans"].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        style={{
                            background: filter === cat ? "var(--primary)" : "rgba(0,0,0,0.05)",
                            color: filter === cat ? "white" : "var(--text-main)",
                            border: "none", padding: "10px 20px", borderRadius: 30, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap"
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

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
                Object.entries(plans.reduce((acc, plan) => {
                    const cat = plan.category || "Other Plans";
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(plan);
                    return acc;
                }, {}))
                    .sort(([a], [b]) => {
                        const order = ["Personal Insurance", "Health Insurance", "Investment Plans", "Business Insurance", "Employee Benefits", "Liability", "Engineering", "Other Plans"];
                        let idxA = order.indexOf(a);
                        let idxB = order.indexOf(b);
                        if (idxA === -1) idxA = 999;
                        if (idxB === -1) idxB = 999;
                        return idxA - idxB;
                    })
                    .filter(([category]) => filter === "All" || category === filter) // Apply Filter Here
                    .map(([category, categoryPlans]) => {
                        const getCategoryIcon = (cat) => {
                            switch (cat) {
                                case 'Personal Insurance': return '👤';
                                case 'Health Insurance': return '🏥';
                                case 'Investment Plans': return '📈';
                                case 'Business Insurance': return '💼';
                                case 'Employee Benefits': return '👥';
                                case 'Liability': return '⚖️';
                                case 'Engineering': return '🏗️';
                                default: return '🛡️';
                            }
                        };

                        return (
                            <div key={category} style={{ marginBottom: 60 }}>
                                <h2 style={{
                                    fontSize: "1.8rem", marginBottom: 20,
                                    borderBottom: "2px solid rgba(0,0,0,0.05)", paddingBottom: 10,
                                    display: "flex", alignItems: "center", gap: 10
                                }}>
                                    <span style={{ fontSize: "2rem" }}>{getCategoryIcon(category)}</span> {category}
                                </h2>
                                <div className="grid">
                                    {categoryPlans.map((p, i) => {
                                        // Dynamic Color based on Category
                                        const getCategoryColor = (cat) => {
                                            switch (cat) {
                                                case 'Personal Insurance': return '#ef4444'; // Red
                                                case 'Health Insurance': return '#22c55e';   // Green
                                                case 'Investment Plans': return '#eab308';   // Yellow/Gold
                                                case 'Business Insurance': return '#3b82f6'; // Blue
                                                case 'Employee Benefits': return '#8b5cf6';  // Purple
                                                case 'Liability': return '#f97316';          // Orange
                                                case 'Engineering': return '#6366f1';        // Indigo
                                                case 'Other Plans': return '#ec4899';        // Pink
                                                default: return 'var(--primary)';
                                            }
                                        };
                                        const stripeColor = getCategoryColor(p.category || category);

                                        return (
                                            <motion.div
                                                key={p.id}
                                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                                className="card policy-card-minimal"
                                                style={{ position: "relative", overflow: "hidden" }}
                                            >
                                                {/* Categorical Stripe Color */}
                                                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: stripeColor }}></div>

                                                {/* Header */}
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15, paddingLeft: 10 }}>
                                                    <div>
                                                        <span style={{
                                                            fontSize: "0.75rem", fontWeight: 700, opacity: 0.6,
                                                            textTransform: "uppercase", letterSpacing: "0.05em",
                                                            marginBottom: 4, display: "block", color: stripeColor
                                                        }}>{p.type}</span>
                                                        <h3 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 700, lineHeight: 1.2 }}>{p.name}</h3>
                                                    </div>
                                                </div>

                                                {/* Price Tag */}
                                                <div style={{ paddingLeft: 10, marginBottom: 20 }}>
                                                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                                                        <span style={{ fontSize: "1.8rem", fontWeight: 700, color: stripeColor }}>₹{p.premium}</span>
                                                        <span style={{ fontSize: "0.9rem", opacity: 0.6 }}>/mo</span>
                                                    </div>
                                                    <div style={{ fontSize: "0.85rem", opacity: 0.7, marginTop: 4 }}>
                                                        Cover: <strong style={{ color: "var(--text-main)" }}>₹{p.coverage?.toLocaleString('en-IN') ?? "N/A"}</strong>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <p style={{ paddingLeft: 10, fontSize: "0.9rem", opacity: 0.7, lineHeight: 1.6, flex: 1, marginBottom: 20 }}>
                                                    {(p.description || "No description available.").length > 80 ? (p.description || "").substring(0, 80) + "..." : p.description}
                                                </p>

                                                {/* Action */}
                                                <div style={{ paddingLeft: 10, marginTop: "auto" }}>
                                                    <button
                                                        className="primary-btn"
                                                        style={{
                                                            width: "100%", borderRadius: "var(--radius-md)", padding: "14px", fontSize: "0.95rem",
                                                            background: (user && user.role !== 'USER') ? 'var(--card-border)' : stripeColor,
                                                            border: `1px solid ${(user && user.role !== 'USER') ? 'var(--card-border)' : stripeColor}`,
                                                            color: (user && user.role !== 'USER') ? 'var(--text-main)' : 'white',
                                                            cursor: "pointer"
                                                        }}
                                                        onClick={() => {
                                                            if (!user) {
                                                                navigate("/login");
                                                                return;
                                                            }
                                                            setSelectedPlan(p);
                                                        }}
                                                    >
                                                        {user && user.role === 'USER' ? "View Details & Consult Agent" : "View Details"}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
            )}

            {/* Quote Modal */}
            {selectedPlan && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="card" style={{ width: 400, maxWidth: "90%" }}
                    >
                        <h2 style={{ marginTop: 0 }}>Consult Expert for {selectedPlan.name}</h2>
                        <p style={{ opacity: 0.7, marginBottom: 20 }}>
                            Our compliance requires an agent consultation before purchase.
                            Talk to an expert to get the best quote.
                        </p>

                        <div style={{ display: "flex", gap: 10 }}>
                            {user && user.role === 'USER' && (
                                <button className="primary-btn" style={{ flex: 1 }} onClick={bookConsultation}>
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

            {plans.length === 0 && !loading && (
                <p style={{ textAlign: "center", opacity: 0.6, marginTop: 50 }}>No plans found.</p>
            )}
        </div>
    );
}
