import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

export default function MyClaims() {
    const { user } = useAuth();
    const { notify } = useNotification();
    const [claims, setClaims] = useState([]);
    const [userPolicies, setUserPolicies] = useState([]);
    const [view, setView] = useState("LIST"); // LIST, FORM
    const [formData, setFormData] = useState({ policyName: "", description: "", amount: "" });
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

        // Simulating document upload by adding a mock URL in the backend request if supported
        // For now, we just proceed with data
        const payload = {
            ...formData,
            status: 'PENDING',
            // In a real app, we would upload the file first then get the URL from S3/Blob storage.
            // For this DEMO, we use a public dummy PDF so the Agent can successfully "view" a document.
            proofUrl: formData.attachedFile ? "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" : null,
            attachedFile: formData.attachedFile ? formData.attachedFile.name : null
        };

        api.post(`/claims/${user.id}`, payload)
            .then(() => {
                notify("Claim filed successfully! Status: PENDING ⏳", "success");
                setView("LIST");
                fetchClaims();
                setFormData({ policyName: "", description: "", amount: "" });
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
                            <div style={{ textAlign: "center", marginTop: 50, opacity: 0.7 }}>
                                <p>No claims filed yet.</p>
                            </div>
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
                                    value={formData.policyName}
                                    onChange={(e) => {
                                        setFormData({ ...formData, policyName: e.target.value });
                                        if (errors.policyName) setErrors({ ...errors, policyName: null });
                                    }}
                                >
                                    <option value="">-- Select Active Policy --</option>
                                    {userPolicies.map(up => (
                                        <option key={up.id} value={up.policy.name}>
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
                                <label className="form-label">Attach Documents (Optional)</label>
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
                                    className="file-upload-label"
                                    onClick={() => document.getElementById("file-upload").click()}
                                >
                                    <div style={{ fontSize: "2rem", marginBottom: 5 }}>
                                        {formData.attachedFile ? "📄" : "📤"}
                                    </div>
                                    {formData.attachedFile ? (
                                        <div>
                                            <p style={{ fontWeight: 600, color: "var(--primary)" }}>{formData.attachedFile.name}</p>
                                            <p style={{ fontSize: "0.8rem", margin: 0 }}>Click to change</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p style={{ fontWeight: 500, margin: "0 0 5px 0" }}>Click to upload documents</p>
                                            <p style={{ fontSize: "0.8rem", margin: 0, opacity: 0.7 }}>Support for PDF, JPG, PNG from medical reports</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button type="submit" className="primary-btn" style={{ width: "100%" }}>Submit Claim</button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
