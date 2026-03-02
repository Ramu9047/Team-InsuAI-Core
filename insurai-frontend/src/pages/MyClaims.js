import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

const ClaimStatusTracker = ({ status }) => {
    // Map system statuses to the 5-step flow
    // Steps: 0:Submitted, 1:Document Verification, 2:Under Review, 3:Approved/Rejected, 4:Settled
    let stepIndex = 0;
    let isRejected = false;

    if (status === 'DOCS_VERIFIED') stepIndex = 1;
    else if (status === 'UNDER_REVIEW') stepIndex = 2;
    else if (status === 'APPROVED') stepIndex = 3;
    else if (status === 'REJECTED') {
        stepIndex = 3;
        isRejected = true;
    }
    else if (status === 'SETTLED') stepIndex = 4;

    const steps = ['Submitted', 'Verification', 'Review', isRejected ? 'Rejected' : 'Approved', 'Settled'];

    return (
        <div style={{ marginTop: 20, marginBottom: 15, padding: '0 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                {steps.map((step, idx) => {
                    let isCompleted = idx <= stepIndex;
                    if (isRejected && idx === 4) isCompleted = false; // Never reaching Settled if rejected

                    const isActive = idx === stepIndex;

                    let color = '#22c55e'; // default green
                    if (isRejected && idx === 3 && isCompleted) color = '#ef4444'; // Red if rejected at step 3
                    if (isActive && idx !== 4 && !isRejected) color = '#6366f1'; // Indigo if active but not done

                    return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '20%' }}>
                            <div style={{
                                width: 24, height: 24, borderRadius: '50%',
                                background: isCompleted ? color : 'rgba(255,255,255,0.1)',
                                border: `2px solid ${isCompleted ? color : 'rgba(255,255,255,0.2)'}`,
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.7rem', fontWeight: 700, marginBottom: 6,
                                boxShadow: isActive ? `0 0 10px ${color}` : 'none'
                            }}>
                                {isCompleted && !(isRejected && idx === 3) ? '✓' : (isRejected && idx === 3 ? '✗' : idx + 1)}
                            </div>
                            <span style={{
                                fontSize: '0.65rem', fontWeight: isActive ? 700 : 500,
                                color: isCompleted ? 'var(--text-main)' : 'var(--text-muted)',
                                textAlign: 'center'
                            }}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
            {/* Connecting lines */}
            <div style={{ position: 'relative', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, top: '-34px', zIndex: 0, margin: '0 10%' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stepIndex / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', background: isRejected ? '#ef4444' : (stepIndex >= 4 ? '#22c55e' : '#6366f1'), borderRadius: 2 }}
                />
            </div>
        </div>
    );
};

export default function MyClaims() {
    const { user } = useAuth();
    const { notify } = useNotification();
    const [claims, setClaims] = useState([]);
    const [userPolicies, setUserPolicies] = useState([]);
    const [view, setView] = useState("LIST"); // LIST, FORM
    const [formData, setFormData] = useState({ policyId: "", policyName: "", description: "", amount: "" });
    const [loading, setLoading] = useState(true);

    const fetchClaims = useCallback(() => {
        api.get(`/claims/user/${user.id}`)
            .then(r => setClaims(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const fetchPolicies = useCallback(() => {
        api.get(`/policies/user/${user.id}`)
            .then(r => setUserPolicies(r.data))
            .catch(console.error);
    }, [user]);

    useEffect(() => {
        if (user && user.role === 'USER') {
            fetchClaims();
            fetchPolicies();
        } else {
            setLoading(false);
        }
    }, [user, fetchClaims, fetchPolicies]);

    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.policyName) newErrors.policyName = "Please select a policy";
        if (!formData.amount) newErrors.amount = "Amount is required";
        if (!formData.description) newErrors.description = "Description is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const claimPayload = {
            policyId: formData.policyId,
            policyName: formData.policyName,
            description: formData.description,
            amount: parseFloat(formData.amount),
            status: 'PENDING'
        };

        api.post(`/claims/${user.id}`, claimPayload)
            .then(async (response) => {
                const claimId = response.data.id;

                if (formData.attachedFile) {
                    const fileFormData = new FormData();
                    fileFormData.append("file", formData.attachedFile);

                    try {
                        await api.post(`/claims/${claimId}/upload`, fileFormData, {
                            headers: { "Content-Type": "multipart/form-data" }
                        });
                        notify("Claim and document uploaded successfully!", "success");
                    } catch (uploadErr) {
                        console.error("File upload failed:", uploadErr);
                        notify("Claim filed but document upload failed.", "warning");
                    }
                } else {
                    notify("Claim filed successfully! Status: PENDING ⏳", "success");
                }

                setView("LIST");
                fetchClaims();
                setFormData({ policyName: "", description: "", amount: "", attachedFile: null });
                setErrors({});
            })
            .catch(err => {
                console.error(err);
                setErrors({ submit: "Failed to file claim. Please try again." });
            });
    };



    if (!user || user.role !== 'USER') {
        return (
            <div style={{ textAlign: "center", marginTop: 50 }}>
                <h2>Access Restricted</h2>
                <p>Agents and Admins cannot manage claims here.</p>
            </div>
        );
    }

    if (loading) return <div style={{ textAlign: "center", marginTop: 50 }}>Loading claims...</div>;

    return (
        <div>
            <div className="breadcrumbs">
                <Link to="/">Home</Link>
                <span>/</span>
                <span>Claims</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
                <h1 className="text-gradient">My Claims</h1>
                {view === "LIST" && (
                    <button
                        className="primary-btn"
                        onClick={() => setView("FORM")}
                    >
                        File New Claim
                    </button>
                )}
                {view === "FORM" && (
                    <button
                        className="secondary-btn"
                        onClick={() => setView("LIST")}
                    >
                        Cancel
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {view === "LIST" && (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {claims.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                style={{
                                    margin: "50px auto", maxWidth: 500, padding: 50,
                                    background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)',
                                    borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)',
                                    textAlign: "center", boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                                }}
                            >
                                <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 30px' }}>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        style={{ position: 'absolute', inset: 0, border: '2px dashed rgba(99,102,241,0.3)', borderRadius: '50%' }}
                                    />
                                    <div style={{ position: 'absolute', inset: 10, background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4.5rem', boxShadow: 'inset 0 0 20px rgba(99,102,241,0.2)' }}>
                                        🛡️
                                    </div>
                                </div>
                                <h2 style={{ fontSize: "1.8rem", marginBottom: 15, background: 'linear-gradient(to right, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                                    No Claims Yet!
                                </h2>
                                <p style={{ fontSize: "1rem", color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 30 }}>
                                    You haven't filed any claims yet. When you do, they'll appear here.
                                </p>
                                <button className="primary-btn" onClick={() => setView("FORM")} style={{ padding: '14px 35px', fontSize: '1.1rem', borderRadius: 30, boxShadow: '0 8px 20px rgba(99,102,241,0.4)' }}>
                                    File Your First Claim 🚀
                                </button>
                            </motion.div>
                        ) : (
                            <div className="grid">
                                {claims.map(claim => (
                                    <div key={claim.id} className="card" style={{ borderLeft: claim.status === 'APPROVED' ? "4px solid #22c55e" : claim.status === 'REJECTED' ? "4px solid #ef4444" : "4px solid #eab308" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <h3>{claim.policyName}</h3>
                                            <span style={{
                                                fontSize: "0.8rem", fontWeight: "bold",
                                                padding: "4px 10px", borderRadius: 20,
                                                background: claim.status === 'APPROVED' ? "rgba(34, 197, 94, 0.1)" : claim.status === 'REJECTED' ? "rgba(239, 68, 68, 0.1)" : "rgba(234, 179, 8, 0.1)",
                                                color: claim.status === 'APPROVED' ? "#22c55e" : claim.status === 'REJECTED' ? "#ef4444" : "#eab308"
                                            }}>
                                                {claim.status}
                                            </span>
                                        </div>
                                        <p style={{ marginTop: 10, marginBottom: 5 }}><strong>Amount:</strong> ₹{claim.amount}</p>
                                        <p style={{ opacity: 0.8, fontSize: "0.95rem" }}>{claim.description}</p>

                                        <ClaimStatusTracker status={claim.status} />

                                        {claim.status === 'PENDING' && !claim.documentUrl && (
                                            <div style={{ background: "rgba(234, 179, 8, 0.1)", padding: "10px", borderRadius: 8, marginTop: 10, fontSize: "0.85rem", color: "#eab308", border: "1px solid rgba(234, 179, 8, 0.2)" }}>
                                                ⚠️ <strong>Action Required:</strong> Missing documents. Please upload required files to speed up verification.
                                            </div>
                                        )}

                                        <div style={{ marginTop: 15, fontSize: "0.8rem", opacity: 0.6 }}>
                                            Filed on: {new Date(claim.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {view === "FORM" && (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="card"
                        style={{ maxWidth: 600, margin: "0 auto" }}
                    >
                        <h2 style={{ marginBottom: 20 }}>File a Claim</h2>
                        {errors.submit && <p className="error-msg">{errors.submit}</p>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Select Policy</label>
                                <select
                                    className="form-input"
                                    value={formData.policyId}
                                    onChange={(e) => {
                                        const selectedUp = userPolicies.find(up => up.policy.id === Number(e.target.value));
                                        setFormData({ ...formData, policyId: e.target.value, policyName: selectedUp?.policy.name || "" });
                                        if (errors.policyName) setErrors({ ...errors, policyName: null });
                                    }}
                                >
                                    <option value="">-- Select Active Policy --</option>
                                    {userPolicies.map(up => (
                                        <option key={up.id} value={up.policy.id}>
                                            {up.policy.name} (Coverage: ₹{up.policy.coverage})
                                        </option>
                                    ))}
                                </select>
                                {errors.policyName && <p className="error-msg">{errors.policyName}</p>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Claim Amount (₹)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.amount}
                                    onChange={(e) => {
                                        setFormData({ ...formData, amount: e.target.value });
                                        if (errors.amount) setErrors({ ...errors, amount: null });
                                    }}
                                    placeholder="e.g. 5000"
                                />
                                {errors.amount && <p className="error-msg">{errors.amount}</p>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-input"
                                    rows="4"
                                    value={formData.description}
                                    onChange={(e) => {
                                        setFormData({ ...formData, description: e.target.value });
                                        if (errors.description) setErrors({ ...errors, description: null });
                                    }}
                                    placeholder="Describe the incident details..."
                                />
                                {errors.description && <p className="error-msg">{errors.description}</p>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Attach Documents (Required for Verfication)</label>
                                <input
                                    type="file"
                                    id="file-upload"
                                    style={{ display: "none" }}
                                    onChange={(e) => {
                                        if (e.target.files[0]) {
                                            setFormData({ ...formData, attachedFile: e.target.files[0] });
                                            notify(`File chosen: ${e.target.files[0].name}`, "success");
                                        }
                                    }}
                                />
                                <div
                                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    onDrop={(e) => {
                                        e.preventDefault(); e.stopPropagation();
                                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                            setFormData({ ...formData, attachedFile: e.dataTransfer.files[0] });
                                            notify(`File chosen: ${e.dataTransfer.files[0].name}`, "success");
                                        }
                                    }}
                                    onClick={() => document.getElementById("file-upload").click()}
                                    style={{
                                        border: "2px dashed rgba(255,255,255,0.2)",
                                        borderRadius: "var(--radius-md)",
                                        padding: "30px",
                                        textAlign: "center",
                                        cursor: "pointer",
                                        background: "rgba(255,255,255,0.02)",
                                        transition: "all 0.3s"
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                                >
                                    <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>
                                        {formData.attachedFile ? "📄" : "📤"}
                                    </div>
                                    {formData.attachedFile ? (
                                        <div>
                                            <p style={{ fontWeight: 600, color: "var(--primary)", fontSize: "1.1rem" }}>{formData.attachedFile.name}</p>
                                            <p style={{ fontSize: "0.85rem", margin: "5px 0 0 0", opacity: 0.7 }}>Click or drag to change</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p style={{ fontWeight: 600, margin: "0 0 8px 0", fontSize: "1.1rem" }}>Click or drag files here to upload</p>
                                            <p style={{ fontSize: "0.85rem", margin: 0, opacity: 0.6 }}>Support for PDF, JPG, PNG from medical reports</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button type="submit" className="primary-btn" style={{ width: "100%", padding: "12px", fontSize: "1rem" }}>Submit Claim</button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
