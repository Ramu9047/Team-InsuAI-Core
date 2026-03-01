import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

// ─────────────────────────────────────────────────
//  SHARED MICRO-COMPONENTS
// ─────────────────────────────────────────────────

const SectionCard = ({ title, icon, accentColor = "#6366f1", children, style: s = {} }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
            background: "rgba(255,255,255,0.02)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
            overflow: "hidden",
            marginBottom: 22,
            ...s
        }}
    >
        <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "15px 24px",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.06)"
        }}>
            <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: `${accentColor}20`,
                border: `1px solid ${accentColor}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.95rem"
            }}>{icon}</div>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>{title}</h3>
        </div>
        <div style={{ padding: "10px 24px 22px" }}>{children}</div>
    </motion.div>
);

const InfoRow = ({ label, value, icon, locked, mono }) => (
    <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)"
    }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: "0.95rem", opacity: 0.55 }}>{icon}</span>
            <span style={{ fontSize: "0.83rem", color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{
                fontSize: mono ? "0.78rem" : "0.9rem",
                fontWeight: 600,
                color: mono ? "#a5b4fc" : "var(--text-main)",
                fontFamily: mono ? "monospace" : "inherit"
            }}>
                {value || <span style={{ opacity: 0.35, fontStyle: "italic", fontFamily: "inherit" }}>Not set</span>}
            </span>
            {locked && (
                <span style={{
                    fontSize: "0.65rem", background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-muted)",
                    padding: "2px 6px", borderRadius: 20
                }}>🔒</span>
            )}
        </div>
    </div>
);

const Badge = ({ label, color = "#6366f1", onClick }) => (
    <motion.span
        whileHover={onClick ? { scale: 1.05 } : undefined}
        onClick={onClick}
        style={{
            display: "inline-block",
            padding: "4px 12px", borderRadius: 20, fontSize: "0.76rem",
            fontWeight: 700, background: `${color}18`,
            color, border: `1px solid ${color}35`,
            cursor: onClick ? "pointer" : "default",
            userSelect: "none"
        }}
    >{label}</motion.span>
);

const MetricTile = ({ label, value, color, icon, sub }) => (
    <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "18px 14px", borderRadius: 14, textAlign: "center", flex: 1, minWidth: 90,
        background: `${color}10`, border: `1px solid ${color}28`,
    }}>
        <div style={{ fontSize: "1.4rem", marginBottom: 5 }}>{icon}</div>
        <div style={{ fontSize: "1.7rem", fontWeight: 800, color, lineHeight: 1 }}>{value ?? "—"}</div>
        {sub && <div style={{ fontSize: "0.65rem", color, opacity: 0.7, marginTop: 2, fontWeight: 700 }}>{sub}</div>}
        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 5, fontWeight: 500 }}>{label}</div>
    </div>
);

const StatusChip = ({ status }) => {
    const map = {
        PENDING: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
        APPROVED: { color: "#10b981", bg: "rgba(16,185,129,0.12)" },
        COMPLETED: { color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
        REJECTED: { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
        CANCELLED: { color: "#9ca3af", bg: "rgba(156,163,175,0.12)" },
        ACTIVE: { color: "#10b981", bg: "rgba(16,185,129,0.12)" },
        EXPIRED: { color: "#9ca3af", bg: "rgba(156,163,175,0.12)" },
        PAYMENT_PENDING: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    };
    const cfg = map[status?.toUpperCase()] || { color: "#94a3b8", bg: "rgba(148,163,184,0.12)" };
    return (
        <span style={{
            padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700,
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30`
        }}>{status}</span>
    );
};

const StarRating = ({ rating, max = 5 }) => (
    <span style={{ fontSize: "1rem", letterSpacing: 2 }}>
        {[...Array(max)].map((_, i) => (
            <span key={i} style={{ color: i < Math.round(rating || 0) ? "#f59e0b" : "rgba(255,255,255,0.15)" }}>★</span>
        ))}
        <span style={{ marginLeft: 6, fontSize: "0.82rem", color: "var(--text-muted)" }}>
            {rating ? Number(rating).toFixed(1) : "N/A"}
        </span>
    </span>
);

// Eye SVG for password toggle
const EyeIcon = ({ open }) => open ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

// ─────────────────────────────────────────────────
//  SHARED SECURITY SECTION
// ─────────────────────────────────────────────────
function SecuritySection({ user, logout }) {
    const { notify } = useNotification();
    const [showSection, setShowSection] = useState(false);
    const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirm: "" });
    const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false });

    const changePassword = async () => {
        if (pwForm.newPassword !== pwForm.confirm) { notify("Passwords do not match", "error"); return; }
        if (pwForm.newPassword.length < 8) { notify("Min 8 characters required", "error"); return; }
        try {
            await api.post("/auth/change-password", {
                oldPassword: pwForm.oldPassword,
                newPassword: pwForm.newPassword
            });
            notify("Password updated successfully", "success");
            setPwForm({ oldPassword: "", newPassword: "", confirm: "" });
            setShowSection(false);
        } catch (err) {
            notify(err.response?.data?.message || "Failed to change password", "error");
        }
    };

    return (
        <SectionCard title="Security & Preferences" icon="🔐" accentColor="#8b5cf6">
            {/* Change Password */}
            <div style={{
                marginTop: 8, padding: "14px 16px", borderRadius: 12,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 2 }}>🔑 Change Password</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Keep your account secure</div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        onClick={() => setShowSection(!showSection)}
                        style={{
                            padding: "6px 14px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600,
                            cursor: "pointer",
                            background: showSection ? "rgba(239,68,68,0.12)" : "rgba(139,92,246,0.12)",
                            border: `1px solid ${showSection ? "rgba(239,68,68,0.35)" : "rgba(139,92,246,0.35)"}`,
                            color: showSection ? "#f87171" : "#c4b5fd"
                        }}
                    >{showSection ? "Cancel" : "Change"}</motion.button>
                </div>
                <AnimatePresence>
                    {showSection && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ overflow: "hidden" }}
                        >
                            <div style={{ paddingTop: 14, display: "grid", gap: 10 }}>
                                {[
                                    { label: "Current Password", key: "oldPassword", vis: showPw.old, toggle: () => setShowPw(p => ({ ...p, old: !p.old })) },
                                    { label: "New Password", key: "newPassword", vis: showPw.new, toggle: () => setShowPw(p => ({ ...p, new: !p.new })) },
                                    { label: "Confirm New Password", key: "confirm", vis: showPw.confirm, toggle: () => setShowPw(p => ({ ...p, confirm: !p.confirm })) },
                                ].map(({ label, key, vis, toggle }) => (
                                    <div key={key}>
                                        <label style={{ fontSize: "0.73rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 4 }}>{label}</label>
                                        <div style={{ position: "relative" }}>
                                            <input
                                                type={vis ? "text" : "password"}
                                                className="form-input"
                                                style={{ padding: "9px 38px 9px 12px" }}
                                                value={pwForm[key]}
                                                onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                                                placeholder={label}
                                            />
                                            <button type="button" className="input-icon-btn" onClick={toggle}>
                                                <EyeIcon open={vis} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <motion.button
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    className="primary-btn"
                                    style={{ width: "100%", marginTop: 4 }}
                                    onClick={changePassword}
                                >Update Password</motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Logout All */}
            <motion.div
                whileHover={{ background: "rgba(239,68,68,0.07)" }}
                style={{
                    padding: "13px 16px", borderRadius: 10, cursor: "pointer",
                    background: "rgba(239,68,68,0.03)", border: "1px solid rgba(239,68,68,0.15)",
                    display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s"
                }}
                onClick={() => { if (window.confirm("Sign out from all sessions?")) logout(); }}
            >
                <span style={{ fontSize: "1.1rem" }}>🔓</span>
                <div>
                    <div style={{ fontWeight: 700, fontSize: "0.86rem", color: "#f87171" }}>Logout from All Devices</div>
                    <div style={{ fontSize: "0.73rem", color: "var(--text-muted)" }}>Invalidate all active sessions</div>
                </div>
                <span style={{ marginLeft: "auto", opacity: 0.4, color: "#f87171" }}>→</span>
            </motion.div>
        </SectionCard>
    );
}

// ─────────────────────────────────────────────────
//  USER PROFILE
// ─────────────────────────────────────────────────
function UserProfile({ user, logout }) {
    const navigate = useNavigate();
    const { notify } = useNotification();
    const [profileData, setProfileData] = useState(null);
    const [policies, setPolicies] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", phone: "" });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [profRes, polRes, bookRes, fbRes] = await Promise.allSettled([
                api.get(`/users/${user.id}`),
                api.get(`/policies/user/${user.id}`),
                api.get(`/bookings/user/${user.id}`),
                api.get("/feedback/my"),
            ]);
            if (profRes.status === "fulfilled") {
                setProfileData(profRes.value.data);
                setEditForm({ name: profRes.value.data.name || "", phone: profRes.value.data.phone || "" });
            }
            if (polRes.status === "fulfilled") setPolicies(polRes.value.data || []);
            if (bookRes.status === "fulfilled") setBookings(bookRes.value.data || []);
            if (fbRes.status === "fulfilled") setFeedback(fbRes.value.data || []);
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put(`/users/${user.id}`, editForm);
            setProfileData(res.data);
            setEditMode(false);
            notify("Profile updated", "success");
        } catch { notify("Failed to update", "error"); }
        finally { setSaving(false); }
    };

    const displayName = profileData?.name || user?.name || "User";
    const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    // Derived data
    const upcoming = bookings.filter(b => ["PENDING", "APPROVED"].includes(b.status))
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).slice(0, 3);
    const past = bookings.filter(b => ["COMPLETED", "REJECTED", "CANCELLED"].includes(b.status)).slice(0, 3);
    const activePolicies = policies.filter(p => p.status === "ACTIVE");
    const companies = [...new Set(policies.map(p => p.policy?.company?.name || p.companyName).filter(Boolean))];

    if (loading) return <ProfileSkeleton />;

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px", color: "var(--text-main)" }}>

            {/* ── HEADER ── */}
            <ProfileHeader
                initials={initials}
                name={displayName}
                roleLabel="User"
                roleIcon="👤"
                badgeGradient="linear-gradient(135deg, #06b6d4, #6366f1)"
                avatarGradient="linear-gradient(135deg, #06b6d4, #6366f1)"
                accentColor="#06b6d4"
                sub={profileData?.email}
                subIcon="📧"
                statusLabel="Active"
                tagRight={null}
                onEdit={() => { setEditMode(!editMode); setEditForm({ name: profileData?.name || "", phone: profileData?.phone || "" }); }}
                onDash={() => navigate("/dashboard")}
                editMode={editMode}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 4 }}>

                {/* ── PERSONAL INFO ── */}
                <SectionCard title="Personal Information" icon="👤" accentColor="#06b6d4">
                    <AnimatePresence mode="wait">
                        {editMode ? (
                            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ paddingTop: 8 }}>
                                {[
                                    { label: "Full Name", key: "name", placeholder: "Jane Doe" },
                                    { label: "Phone Number", key: "phone", placeholder: "+91 98765 43210" }
                                ].map(({ label, key, placeholder }) => (
                                    <div key={key} className="form-group" style={{ marginBottom: 14 }}>
                                        <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 5 }}>{label}</label>
                                        <input className="form-input" style={{ padding: "9px 13px" }}
                                            placeholder={placeholder}
                                            value={editForm[key]}
                                            onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                                        />
                                    </div>
                                ))}
                                <motion.button whileHover={{ scale: 1.03 }} className="primary-btn"
                                    style={{ width: "100%", marginTop: 4 }} onClick={handleSave} disabled={saving}>
                                    {saving ? "Saving..." : "💾 Save Changes"}
                                </motion.button>
                            </motion.div>
                        ) : (
                            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <InfoRow label="Full Name" value={profileData?.name} icon="🪪" />
                                <InfoRow label="Email" value={profileData?.email} icon="📧" locked />
                                <InfoRow label="Phone" value={profileData?.phone} icon="📱" />
                                <InfoRow label="Age" value={profileData?.age ? `${profileData.age} yrs` : null} icon="🎂" />
                                <InfoRow label="Annual Income" value={profileData?.income ? `₹${Number(profileData.income).toLocaleString("en-IN")}` : null} icon="💰" />
                                <InfoRow label="Dependents" value={profileData?.dependents} icon="👨‍👩‍👧" />
                                <InfoRow label="Role" value="User" icon="🎭" locked />
                                <InfoRow label="Account Created" value={profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null} icon="📅" locked />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </SectionCard>

                {/* ── INSURANCE MEMBERSHIPS ── */}
                <SectionCard title="Insurance Memberships" icon="🛡️" accentColor="#10b981">
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10, marginBottom: 16 }}>
                        <MetricTile label="Total Policies" value={policies.length} color="#6366f1" icon="📄" />
                        <MetricTile label="Active Policies" value={activePolicies.length} color="#10b981" icon="✅" />
                        <MetricTile label="Companies" value={companies.length} color="#06b6d4" icon="🏢" />
                    </div>

                    {/* Associated Companies */}
                    {companies.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: 7 }}>ASSOCIATED COMPANIES</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                                {companies.map((c, i) => <Badge key={i} label={`🏢 ${c}`} color="#06b6d4" />)}
                            </div>
                        </div>
                    )}

                    {/* Policy list (recent 4) */}
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: 7 }}>RECENT POLICIES</div>
                    {policies.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "20px 0", opacity: 0.4, fontSize: "0.85rem" }}>
                            No policies yet. <span style={{ cursor: "pointer", color: "#6366f1" }} onClick={() => navigate("/plans")}>Browse Plans →</span>
                        </div>
                    ) : policies.slice(0, 4).map((p, i) => (
                        <div key={p.id || i} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)"
                        }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: "0.86rem" }}>{p.policy?.name || p.policyName || "Policy"}</div>
                                <div style={{ fontSize: "0.73rem", color: "var(--text-muted)" }}>
                                    {p.policy?.company?.name || p.companyName || "—"}
                                    {p.startDate ? ` · From ${new Date(p.startDate).toLocaleDateString("en-IN")}` : ""}
                                </div>
                            </div>
                            <StatusChip status={p.status} />
                        </div>
                    ))}
                    {policies.length > 4 && (
                        <motion.button whileHover={{ scale: 1.02 }} className="secondary-btn"
                            style={{ width: "100%", marginTop: 10, fontSize: "0.8rem" }}
                            onClick={() => navigate("/my-policies")}>
                            View All {policies.length} Policies →
                        </motion.button>
                    )}
                </SectionCard>
            </div>

            {/* ── APPOINTMENTS & CONSULTATIONS ── */}
            <SectionCard title="Appointments & Consultations" icon="📅" accentColor="#f59e0b">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 8 }}>
                    {/* Upcoming */}
                    <div>
                        <div style={{ fontSize: "0.78rem", color: "#fbbf24", fontWeight: 700, marginBottom: 10, letterSpacing: "0.05em" }}>⏳ UPCOMING</div>
                        {upcoming.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "20px 0", opacity: 0.4, fontSize: "0.83rem" }}>
                                No upcoming appointments
                            </div>
                        ) : upcoming.map((b, i) => (
                            <div key={b.id || i} style={{
                                padding: "11px 14px", borderRadius: 10, marginBottom: 8,
                                background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                    <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{b.policy?.name || b.policyName || "Consultation"}</span>
                                    <StatusChip status={b.status} />
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                    👤 Agent: {b.agent?.name || "Assigned agent"}
                                </div>
                                {b.startTime && (
                                    <div style={{ fontSize: "0.73rem", color: "var(--text-muted)", marginTop: 2 }}>
                                        🕒 {new Date(b.startTime).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {/* Past */}
                    <div>
                        <div style={{ fontSize: "0.78rem", color: "#a5b4fc", fontWeight: 700, marginBottom: 10, letterSpacing: "0.05em" }}>✅ PAST CONSULTATIONS</div>
                        {past.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "20px 0", opacity: 0.4, fontSize: "0.83rem" }}>
                                No past consultations
                            </div>
                        ) : past.map((b, i) => (
                            <div key={b.id || i} style={{
                                padding: "11px 14px", borderRadius: 10, marginBottom: 8,
                                background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                                    <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{b.policy?.name || "Consultation"}</span>
                                    <StatusChip status={b.status} />
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                    👤 {b.agent?.name || "Agent"}
                                    {b.completedAt ? ` · ${new Date(b.completedAt).toLocaleDateString("en-IN")}` : ""}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} className="secondary-btn"
                    style={{ width: "100%", marginTop: 12, fontSize: "0.8rem" }}
                    onClick={() => navigate("/my-bookings")}>
                    View All Appointments ({bookings.length}) →
                </motion.button>
            </SectionCard>

            {/* ── FEEDBACK & REVIEWS ── */}
            <SectionCard title="Feedback & Reviews" icon="💬" accentColor="#ec4899">
                <div style={{ display: "flex", gap: 10, marginTop: 8, marginBottom: 14, flexWrap: "wrap" }}>
                    <MetricTile label="Total Feedback" value={feedback.length} color="#ec4899" icon="💬" />
                    <MetricTile label="Open Issues" value={feedback.filter(f => f.status === "OPEN").length} color="#f59e0b" icon="🔔" />
                    <MetricTile label="Resolved" value={feedback.filter(f => f.status === "RESOLVED").length} color="#10b981" icon="✅" />
                </div>
                {feedback.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "16px 0", opacity: 0.4, fontSize: "0.85rem" }}>
                        No feedback submitted yet.
                    </div>
                ) : feedback.slice(0, 3).map((fb, i) => (
                    <div key={fb.id || i} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                        padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)"
                    }}>
                        <div style={{ flex: 1, paddingRight: 10 }}>
                            <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: 2 }}>{fb.subject || "Feedback"}</div>
                            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                                {fb.category} · {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString("en-IN") : ""}
                            </div>
                        </div>
                        <StatusChip status={fb.status} />
                    </div>
                ))}
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    <motion.button whileHover={{ scale: 1.02 }} className="secondary-btn"
                        style={{ flex: 1, fontSize: "0.8rem" }}
                        onClick={() => navigate("/feedback")}>View All Feedback →</motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} className="primary-btn"
                        style={{ flex: 1, fontSize: "0.8rem" }}
                        onClick={() => navigate("/feedback")}>+ Submit Feedback</motion.button>
                </div>
            </SectionCard>

            <SecuritySection user={user} logout={logout} />
        </div>
    );
}

// ─────────────────────────────────────────────────
//  AGENT PROFILE
// ─────────────────────────────────────────────────
function AgentProfile({ user, logout }) {
    const navigate = useNavigate();
    const { notify } = useNotification();
    const [profileData, setProfileData] = useState(null);
    const [performance, setPerformance] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", phone: "", specialization: "", bio: "" });
    const [available, setAvailable] = useState(false);
    const [togglingAvail, setTogglingAvail] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [profRes, perfRes, revRes, apptRes] = await Promise.allSettled([
                api.get(`/users/${user.id}`),
                api.get("/agents/performance"),
                api.get(`/agents/${user.id}/reviews`),
                api.get("/agents/appointments"),
            ]);
            if (profRes.status === "fulfilled") {
                const d = profRes.value.data;
                setProfileData(d);
                setAvailable(d.available ?? false);
                setEditForm({ name: d.name || "", phone: d.phone || "", specialization: d.specialization || "", bio: d.bio || "" });
            }
            if (perfRes.status === "fulfilled") setPerformance(perfRes.value.data);
            if (revRes.status === "fulfilled") setReviews(revRes.value.data || []);
            if (apptRes.status === "fulfilled") setAppointments(apptRes.value.data || []);
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put(`/users/${user.id}`, editForm);
            setProfileData(res.data);
            setEditMode(false);
            notify("Profile updated", "success");
        } catch { notify("Failed to update", "error"); }
        finally { setSaving(false); }
    };

    const toggleAvailability = async () => {
        setTogglingAvail(true);
        try {
            const res = await api.patch(`/agents/${user.id}/availability`, { available: !available });
            setAvailable(res.data.available);
            notify(res.data.available ? "You are now Online 🟢" : "You are now Offline 🔴", res.data.available ? "success" : "info");
        } catch { notify("Failed to toggle availability", "error"); }
        finally { setTogglingAvail(false); }
    };

    const displayName = profileData?.name || user?.name || "Agent";
    const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    const upcomingAppts = appointments.filter(a => ["PENDING", "APPROVED"].includes(a.status)).slice(0, 3);

    // Specializations — mock tags if not set
    const specs = profileData?.specialization
        ? profileData.specialization.split(",").map(s => s.trim()).filter(Boolean)
        : ["Health", "Life", "Vehicle"];

    if (loading) return <ProfileSkeleton />;

    const approvalRate = performance?.approvalRate ?? (
        performance?.totalConsultations > 0
            ? Math.round((performance.approvedPolicies / performance.totalConsultations) * 100)
            : 0
    );

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px", color: "var(--text-main)" }}>

            {/* ── HEADER ── */}
            <ProfileHeader
                initials={initials}
                name={displayName}
                roleLabel="Agent"
                roleIcon="🧑‍💼"
                badgeGradient="linear-gradient(135deg, #10b981, #06b6d4)"
                avatarGradient="linear-gradient(135deg, #10b981, #06b6d4)"
                accentColor="#10b981"
                sub={profileData?.company?.name || "Company Agent"}
                subIcon="🏢"
                statusLabel={available ? "Online" : "Offline"}
                statusColor={available ? "#10b981" : "#ef4444"}
                tagRight={
                    <motion.button
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        onClick={toggleAvailability}
                        disabled={togglingAvail}
                        style={{
                            padding: "8px 20px", borderRadius: 20, fontSize: "0.82rem", fontWeight: 700,
                            cursor: "pointer", border: "none",
                            background: available ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
                            color: available ? "#f87171" : "#34d399",
                            borderStyle: "solid", borderWidth: 1,
                            borderColor: available ? "rgba(239,68,68,0.4)" : "rgba(16,185,129,0.4)"
                        }}
                    >
                        {togglingAvail ? "..." : available ? "🔴 Go Offline" : "🟢 Go Online"}
                    </motion.button>
                }
                onEdit={() => { setEditMode(!editMode); setEditForm({ name: profileData?.name || "", phone: profileData?.phone || "", specialization: profileData?.specialization || "", bio: profileData?.bio || "" }); }}
                onDash={() => navigate("/dashboard")}
                editMode={editMode}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 4 }}>

                {/* ── PERSONAL & PROFESSIONAL INFO ── */}
                <SectionCard title="Personal & Professional Info" icon="🧑‍💼" accentColor="#10b981">
                    <AnimatePresence mode="wait">
                        {editMode ? (
                            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ paddingTop: 8 }}>
                                {[
                                    { label: "Full Name", key: "name", placeholder: "John Agent" },
                                    { label: "Phone", key: "phone", placeholder: "+91 98765 43210" },
                                    { label: "Specialization (comma-separated)", key: "specialization", placeholder: "Health, Life, Vehicle" },
                                ].map(({ label, key, placeholder }) => (
                                    <div key={key} className="form-group" style={{ marginBottom: 13 }}>
                                        <label style={{ fontSize: "0.77rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 5 }}>{label}</label>
                                        <input className="form-input" style={{ padding: "9px 13px" }}
                                            placeholder={placeholder} value={editForm[key]}
                                            onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                                        />
                                    </div>
                                ))}
                                <div className="form-group" style={{ marginBottom: 13 }}>
                                    <label style={{ fontSize: "0.77rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 5 }}>Professional Bio</label>
                                    <textarea className="form-input" rows="3" style={{ padding: "9px 13px", resize: "vertical" }}
                                        placeholder="Brief professional summary..."
                                        value={editForm.bio}
                                        onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                                    />
                                </div>
                                <motion.button whileHover={{ scale: 1.03 }} className="primary-btn"
                                    style={{ width: "100%", marginTop: 4 }} onClick={handleSave} disabled={saving}>
                                    {saving ? "Saving..." : "💾 Save Changes"}
                                </motion.button>
                            </motion.div>
                        ) : (
                            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <InfoRow label="Full Name" value={profileData?.name} icon="🪪" />
                                <InfoRow label="Email" value={profileData?.email} icon="📧" locked />
                                <InfoRow label="Phone" value={profileData?.phone} icon="📱" />
                                <InfoRow label="Company" value={profileData?.company?.name} icon="🏢" locked />
                                <InfoRow label="Agent ID" value={profileData?.id ? `#${profileData.id}` : null} icon="🆔" locked mono />
                                <InfoRow label="Role" value="Agent" icon="🎭" locked />
                                <InfoRow label="Joined" value={profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null} icon="📅" locked />
                                {profileData?.bio && (
                                    <div style={{ paddingTop: 10, fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, fontStyle: "italic" }}>
                                        "{profileData.bio}"
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </SectionCard>

                {/* ── EXPERTISE & SPECIALIZATION ── */}
                <SectionCard title="Expertise & Specialization" icon="🎯" accentColor="#f59e0b">
                    <div style={{ paddingTop: 10 }}>
                        <div style={{ fontSize: "0.77rem", color: "var(--text-muted)", fontWeight: 700, marginBottom: 10 }}>INSURANCE TYPES</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                            {specs.map((s, i) => (
                                <Badge key={i} label={s} color={["#6366f1", "#10b981", "#f59e0b", "#06b6d4", "#ec4899"][i % 5]} />
                            ))}
                        </div>

                        <div style={{ fontSize: "0.77rem", color: "var(--text-muted)", fontWeight: 700, marginBottom: 10 }}>CERTIFICATIONS</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                            {["IRDAI Certified", "Insurance Advisor"].map((c, i) => (
                                <Badge key={i} label={`🏅 ${c}`} color="#f59e0b" />
                            ))}
                        </div>

                        <div style={{ fontSize: "0.77rem", color: "var(--text-muted)", fontWeight: 700, marginBottom: 10 }}>AVAILABILITY STATUS</div>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                            borderRadius: 10,
                            background: available ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)",
                            border: `1px solid ${available ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`
                        }}>
                            <div style={{
                                width: 12, height: 12, borderRadius: "50%",
                                background: available ? "#10b981" : "#ef4444",
                                boxShadow: `0 0 8px ${available ? "#10b981" : "#ef4444"}`
                            }} />
                            <span style={{ fontWeight: 700, fontSize: "0.87rem", color: available ? "#34d399" : "#f87171" }}>
                                {available ? "Online – Accepting Consultations" : "Offline – Not Accepting Consultations"}
                            </span>
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* ── PERFORMANCE OVERVIEW ── */}
            <SectionCard title="Performance Overview" icon="📊" accentColor="#6366f1">
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10, marginBottom: 16 }}>
                    <MetricTile label="Total Consultations" value={performance?.totalConsultations} color="#6366f1" icon="🤝" />
                    <MetricTile label="Approved Policies" value={performance?.approvedPolicies} color="#10b981" icon="✅" />
                    <MetricTile label="Rejected" value={performance?.rejectedPolicies} color="#ef4444" icon="❌" />
                    <MetricTile label="Approval Rate" value={`${approvalRate}%`} color="#f59e0b" icon="📈" sub={approvalRate >= 70 ? "Good" : "Needs Work"} />
                    <MetricTile label="Avg Rating" value={performance?.averageRating ? Number(performance.averageRating).toFixed(1) : "N/A"} color="#ec4899" icon="⭐" />
                </div>

                {/* Progress bar for approval rate */}
                <div style={{ marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.77rem", color: "var(--text-muted)", marginBottom: 6 }}>
                        <span>Approval Rate</span><span style={{ fontWeight: 700, color: "#f59e0b" }}>{approvalRate}%</span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 6, overflow: "hidden", height: 8 }}>
                        <motion.div
                            initial={{ width: 0 }} animate={{ width: `${Math.min(approvalRate, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{
                                height: "100%", borderRadius: 6,
                                background: approvalRate >= 70
                                    ? "linear-gradient(90deg, #10b981, #06b6d4)"
                                    : "linear-gradient(90deg, #f59e0b, #ef4444)"
                            }}
                        />
                    </div>
                </div>

                <motion.button whileHover={{ scale: 1.02 }} className="secondary-btn"
                    style={{ width: "100%", marginTop: 10, fontSize: "0.8rem" }}
                    onClick={() => navigate("/agent/performance")}>
                    View Full Performance Dashboard →
                </motion.button>
            </SectionCard>

            {/* ── APPOINTMENTS & WORKLOAD ── */}
            <SectionCard title="Appointments & Workload" icon="📅" accentColor="#f59e0b">
                <div style={{ display: "flex", gap: 12, marginTop: 8, marginBottom: 14, flexWrap: "wrap" }}>
                    <MetricTile label="Total Assigned" value={appointments.length} color="#6366f1" icon="📋" />
                    <MetricTile label="Pending Review" value={appointments.filter(a => a.status === "PENDING").length} color="#f59e0b" icon="⏳" />
                    <MetricTile label="Completed" value={appointments.filter(a => a.status === "COMPLETED").length} color="#10b981" icon="✅" />
                </div>

                <div style={{ fontSize: "0.77rem", color: "#fbbf24", fontWeight: 700, marginBottom: 8 }}>⏳ UPCOMING APPOINTMENTS</div>
                {upcomingAppts.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "16px 0", opacity: 0.4, fontSize: "0.83rem" }}>No upcoming appointments</div>
                ) : upcomingAppts.map((a, i) => (
                    <div key={a.id || i} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "11px 14px", borderRadius: 10, marginBottom: 8,
                        background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)"
                    }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{a.policy?.name || "Consultation"}</div>
                            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                                👤 {a.user?.name || "User"}
                                {a.startTime ? ` · ${new Date(a.startTime).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}` : ""}
                            </div>
                        </div>
                        <StatusChip status={a.status} />
                    </div>
                ))}
                <motion.button whileHover={{ scale: 1.02 }} className="secondary-btn"
                    style={{ width: "100%", marginTop: 8, fontSize: "0.8rem" }}
                    onClick={() => navigate("/agent/appointments-enhanced")}>
                    View All Appointments →
                </motion.button>
            </SectionCard>

            {/* ── REVIEWS & FEEDBACK ── */}
            <SectionCard title="Reviews & Feedback" icon="⭐" accentColor="#ec4899">
                <div style={{ display: "flex", gap: 12, marginTop: 8, marginBottom: 14, flexWrap: "wrap" }}>
                    <MetricTile label="Total Reviews" value={reviews.length} color="#ec4899" icon="📝" />
                    <MetricTile
                        label="Avg Rating"
                        value={reviews.length ? Number(reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : "N/A"}
                        color="#f59e0b" icon="⭐"
                    />
                    <MetricTile label="5-Star Reviews" value={reviews.filter(r => r.rating === 5).length} color="#10b981" icon="🌟" />
                </div>

                {reviews.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "16px 0", opacity: 0.4, fontSize: "0.83rem" }}>No reviews yet</div>
                ) : reviews.slice(0, 3).map((rev, i) => (
                    <div key={rev.id || i} style={{
                        padding: "12px 14px", borderRadius: 10, marginBottom: 8,
                        background: "rgba(236,72,153,0.05)", border: "1px solid rgba(236,72,153,0.15)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                            <span style={{ fontWeight: 700, fontSize: "0.84rem" }}>{rev.user?.name || "User"}</span>
                            <StarRating rating={rev.rating} />
                        </div>
                        {rev.feedback && (
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5, fontStyle: "italic" }}>
                                "{rev.feedback}"
                            </div>
                        )}
                        {rev.createdAt && (
                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 5, opacity: 0.6 }}>
                                {new Date(rev.createdAt).toLocaleDateString("en-IN")}
                            </div>
                        )}
                    </div>
                ))}
            </SectionCard>

            <SecuritySection user={user} logout={logout} />
        </div>
    );
}

// ─────────────────────────────────────────────────
//  SHARED HEADER COMPONENT
// ─────────────────────────────────────────────────
function ProfileHeader({
    initials, name, roleLabel, roleIcon, badgeGradient, avatarGradient, accentColor,
    sub, subIcon, statusLabel, statusColor = "#10b981",
    tagRight, onEdit, onDash, editMode
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: "rgba(255,255,255,0.02)",
                backdropFilter: "blur(20px)",
                border: `1px solid ${accentColor}28`,
                borderRadius: 22,
                padding: "28px 32px",
                marginBottom: 24,
                position: "relative",
                overflow: "hidden"
            }}
        >
            <div style={{
                position: "absolute", top: -50, right: -50,
                width: 180, height: 180, borderRadius: "50%",
                background: `${accentColor}12`, filter: "blur(40px)", pointerEvents: "none"
            }} />

            <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
                {/* Avatar */}
                <div style={{ position: "relative" }}>
                    <div style={{
                        width: 84, height: 84, borderRadius: "50%",
                        background: avatarGradient,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "2rem", fontWeight: 800, color: "#fff",
                        boxShadow: `0 0 28px ${accentColor}38`,
                        border: `3px solid ${accentColor}55`
                    }}>{initials}</div>
                    <div style={{
                        position: "absolute", bottom: 2, right: 2,
                        width: 16, height: 16, borderRadius: "50%",
                        background: statusColor, border: "2px solid #020617"
                    }} />
                </div>

                {/* Identity */}
                <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 5 }}>
                        <h1 style={{ margin: 0, fontSize: "1.7rem", fontWeight: 800 }}>{name}</h1>
                        <span style={{
                            padding: "4px 13px", borderRadius: 30, fontSize: "0.78rem", fontWeight: 700,
                            background: badgeGradient, color: "#fff", letterSpacing: "0.04em"
                        }}>{roleIcon} {roleLabel}</span>
                        <span style={{
                            padding: "3px 11px", borderRadius: 30, fontSize: "0.72rem", fontWeight: 700,
                            background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30`
                        }}>● {statusLabel}</span>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {subIcon} {sub}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    {tagRight}
                    <motion.button
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        className="primary-btn"
                        style={{
                            padding: "9px 20px", fontSize: "0.84rem",
                            background: editMode ? "rgba(239,68,68,0.12)" : undefined,
                            borderColor: editMode ? "#ef4444" : undefined
                        }}
                        onClick={onEdit}
                    >{editMode ? "✕ Cancel" : "✏️ Edit Profile"}</motion.button>
                    <motion.button
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        className="secondary-btn"
                        style={{ padding: "9px 20px", fontSize: "0.84rem" }}
                        onClick={onDash}
                    >📊 Dashboard</motion.button>
                </div>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────
//  SKELETON LOADER
// ─────────────────────────────────────────────────
function ProfileSkeleton() {
    return (
        <div style={{ padding: "36px 20px", maxWidth: 1100, margin: "0 auto" }}>
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
            <div style={{ height: 180, borderRadius: 20, background: "rgba(255,255,255,0.04)", marginBottom: 22, animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {[...Array(4)].map((_, i) => (
                    <div key={i} style={{ height: 260, borderRadius: 18, background: "rgba(255,255,255,0.03)", animation: "pulse 1.5s ease-in-out infinite" }} />
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────
//  ROOT EXPORT — ROLE ROUTER
// ─────────────────────────────────────────────────
export default function UserAgentProfile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        return (
            <div style={{ padding: 60, textAlign: "center" }}>
                <h2>Please log in to view your profile.</h2>
                <button className="primary-btn" onClick={() => navigate("/login")}>Go to Login</button>
            </div>
        );
    }

    if (user.role === "AGENT") return <AgentProfile user={user} logout={logout} />;
    if (user.role === "USER") return <UserProfile user={user} logout={logout} />;

    // Fallback for admins who land here
    return (
        <div style={{ padding: 60, textAlign: "center" }}>
            <h2>Profile not available for your role here.</h2>
            <button className="primary-btn" onClick={() => navigate("/admin-profile")}>Go to Admin Profile</button>
        </div>
    );
}
