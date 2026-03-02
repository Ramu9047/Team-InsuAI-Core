import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import { motion } from "framer-motion";

import { useNotification } from "../context/NotificationContext";

export default function Profile() {
    const { user } = useAuth();
    const { notify } = useNotification();
    const [form, setForm] = useState({
        name: "", email: "", phone: "", age: "", income: "", dependents: "", healthInfo: ""
    });
    const [loading, setLoading] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirm: "" });
    const [showOldPw, setShowOldPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    const displayName = form?.name || user?.name || "Member";
    const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    const roleConfig = user?.role === 'AGENT'
        ? { label: "Insurance Agent", badge: { bg: "linear-gradient(135deg, #8b5cf6, #c084fc)", color: "#fff" }, accent: "#8b5cf6", avatarGradient: "linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%)", icon: "🧑‍💼" }
        : { label: "Customer", badge: { bg: "linear-gradient(135deg, #3b82f6, #60a5fa)", color: "#fff" }, accent: "#3b82f6", avatarGradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)", icon: "💎" };

    const handleChangePassword = async () => {
        if (pwForm.newPassword !== pwForm.confirm) {
            notify("Passwords do not match", "error");
            return;
        }
        if (pwForm.newPassword.length < 8) {
            notify("Password must be at least 8 characters", "error");
            return;
        }
        try {
            await api.post("/auth/change-password", {
                oldPassword: pwForm.oldPassword,
                newPassword: pwForm.newPassword
            });
            notify("Password changed successfully", "success");
            setPwForm({ oldPassword: "", newPassword: "", confirm: "" });
            setShowPasswordSection(false);
        } catch (err) {
            notify(err.response?.data?.message || "Failed to change password", "error");
        }
    };

    useEffect(() => {
        if (user) {
            api.get(`/users/${user.id}`).then(res => {
                setForm(prev => ({ ...prev, ...res.data }));
            }).catch(console.error);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/users/${user.id}`, form);
            notify("Profile updated successfully! ✅", "success");
        } catch (err) {
            console.error(err);
            notify("Failed to update profile.", "error");
        } finally {
            setLoading(false);
        }
    };

    const eyeIcon = (show) => show ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    );

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px", color: "var(--text-main)" }}>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: "rgba(255,255,255,0.025)", backdropFilter: "blur(20px)",
                    border: `1px solid ${roleConfig.accent}30`, borderRadius: 22,
                    padding: "32px 36px", marginBottom: 28, position: "relative", overflow: "hidden"
                }}
            >
                <div style={{
                    position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%",
                    background: `${roleConfig.accent}15`, filter: "blur(40px)", pointerEvents: "none"
                }} />

                <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                    <div style={{ position: "relative" }}>
                        <div style={{
                            width: 90, height: 90, borderRadius: "50%", background: roleConfig.avatarGradient,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "2.2rem", fontWeight: 800, color: "#fff",
                            boxShadow: `0 0 30px ${roleConfig.accent}40`, border: `3px solid ${roleConfig.accent}60`
                        }}>
                            {initials}
                        </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
                            <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 800 }}>{displayName}</h1>
                            <span style={{
                                padding: "4px 14px", borderRadius: 30, fontSize: "0.8rem", fontWeight: 700,
                                background: roleConfig.badge.bg, color: roleConfig.badge.color
                            }}>
                                {roleConfig.icon} {roleConfig.label}
                            </span>
                        </div>
                        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                            <span>📧 {user?.email}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

                {/* Personal Information */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, overflow: "hidden"
                }}>
                    <div style={{ padding: "16px 24px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "1.2rem" }}>👤</span>
                        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>Personal Details</h3>
                    </div>
                    <div style={{ padding: "20px 24px" }}>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: 16 }}>
                                <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Full Name</label>
                                <input className="form-input" value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} style={{ padding: "10px 14px" }} />
                            </div>

                            <div style={{ display: "flex", gap: 15, marginBottom: 16 }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Age</label>
                                    <input type="number" className="form-input" value={form.age || ""} placeholder="e.g. 30" onChange={e => setForm({ ...form, age: e.target.value })} style={{ padding: "10px 14px" }} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Phone</label>
                                    <input className="form-input" value={form.phone || ""} placeholder="+91 98765 43210" onChange={e => setForm({ ...form, phone: e.target.value })} style={{ padding: "10px 14px" }} />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 15, marginBottom: 16 }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Annual Income (₹)</label>
                                    <input type="number" className="form-input" value={form.income || ""} placeholder="500000" onChange={e => setForm({ ...form, income: e.target.value })} style={{ padding: "10px 14px" }} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Dependents</label>
                                    <input type="number" className="form-input" value={form.dependents || ""} placeholder="2" onChange={e => setForm({ ...form, dependents: e.target.value })} style={{ padding: "10px 14px" }} />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 16 }}>
                                <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Health Conditions</label>
                                <textarea className="form-input" rows="2" value={form.healthInfo || ""} placeholder="Any existing conditions..." onChange={e => setForm({ ...form, healthInfo: e.target.value })} style={{ padding: "10px 14px", resize: "none" }} />
                            </div>

                            <button type="submit" className="primary-btn" style={{ width: "100%", padding: "12px", fontWeight: 700 }} disabled={loading}>
                                {loading ? "Saving..." : "💾 Save Changes"}
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* Security Settings */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, overflow: "hidden"
                }}>
                    <div style={{ padding: "16px 24px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "1.2rem" }}>🔐</span>
                        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>Security Settings</h3>
                    </div>

                    <div style={{ padding: "20px 24px" }}>
                        <div style={{ padding: "16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showPasswordSection ? 16 : 0 }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Change Password</div>
                                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>Keep your account secure</div>
                                </div>
                                <button
                                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                                    style={{
                                        padding: "6px 16px", borderRadius: 20, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                                        background: showPasswordSection ? "rgba(239,68,68,0.15)" : "rgba(99,102,241,0.15)",
                                        border: `1px solid ${showPasswordSection ? "rgba(239,68,68,0.4)" : "rgba(99,102,241,0.4)"}`,
                                        color: showPasswordSection ? "#f87171" : "#a5b4fc"
                                    }}
                                >
                                    {showPasswordSection ? "Cancel" : "Change"}
                                </button>
                            </div>

                            {showPasswordSection && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} style={{ overflow: "hidden", display: "grid", gap: 12 }}>
                                    {[
                                        { label: "Current Password", key: "oldPassword", show: showOldPw, setShow: setShowOldPw },
                                        { label: "New Password", key: "newPassword", show: showNewPw, setShow: setShowNewPw },
                                        { label: "Confirm Password", key: "confirm", show: showConfirmPw, setShow: setShowConfirmPw },
                                    ].map(({ label, key, show, setShow }) => (
                                        <div key={key}>
                                            <div style={{ position: "relative" }}>
                                                <input
                                                    type={show ? "text" : "password"}
                                                    className="form-input"
                                                    value={pwForm[key]}
                                                    onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                                                    placeholder={label}
                                                    style={{ padding: "10px 40px 10px 14px", fontSize: "0.85rem" }}
                                                />
                                                <button
                                                    type="button"
                                                    className="input-icon-btn"
                                                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                                    onClick={() => setShow(!show)}
                                                >
                                                    {eyeIcon(show)}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={handleChangePassword} className="primary-btn" style={{ padding: "10px", marginTop: 4 }}>
                                        Update Password
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
