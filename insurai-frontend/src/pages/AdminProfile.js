import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

// ─────────────────────────────────────────────────
//  SHARED MICRO-COMPONENTS
// ─────────────────────────────────────────────────

const InfoRow = ({ label, value, icon, locked }) => (
    <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)"
    }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1rem", opacity: 0.6 }}>{icon}</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--text-main)" }}>
                {value || <span style={{ opacity: 0.4, fontStyle: "italic" }}>Not set</span>}
            </span>
            {locked && (
                <span title="Read-only" style={{
                    fontSize: "0.7rem", background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)", color: "var(--text-muted)",
                    padding: "2px 7px", borderRadius: 20
                }}>🔒</span>
            )}
        </div>
    </div>
);

const PermissionRow = ({ label, granted }) => (
    <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "11px 18px", borderRadius: 10,
        background: granted ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.04)",
        border: `1px solid ${granted ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)"}`,
        marginBottom: 8
    }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1rem" }}>{granted ? "✔" : "✘"}</span>
            <span style={{ fontSize: "0.87rem", fontWeight: 500, color: granted ? "#d1fae5" : "var(--text-muted)" }}>
                {label}
            </span>
        </div>
        <span style={{
            fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20,
            background: granted ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
            color: granted ? "#10b981" : "#ef4444"
        }}>
            {granted ? "GRANTED" : "DENIED"}
        </span>
    </div>
);

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
            marginBottom: 24,
            ...s
        }}
    >
        <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "16px 24px",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.06)"
        }}>
            <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: `${accentColor}20`,
                border: `1px solid ${accentColor}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1rem"
            }}>{icon}</div>
            <h3 style={{ margin: 0, fontSize: "0.97rem", fontWeight: 700 }}>{title}</h3>
        </div>
        <div style={{ padding: "8px 24px 20px" }}>{children}</div>
    </motion.div>
);

const MetricPill = ({ label, value, color, icon }) => (
    <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "16px 20px", borderRadius: 14, textAlign: "center", flex: 1, minWidth: 100,
        background: `${color}12`, border: `1px solid ${color}30`,
        boxShadow: `0 4px 15px ${color}10`
    }}>
        <div style={{ fontSize: "1.3rem", marginBottom: 4 }}>{icon}</div>
        <div style={{ fontSize: "1.6rem", fontWeight: 800, color, lineHeight: 1 }}>{value ?? "—"}</div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>{label}</div>
    </div>
);

// ─────────────────────────────────────────────────
//  MAIN PROFILE PAGE
// ─────────────────────────────────────────────────

export default function AdminProfile() {
    const { user, logout } = useAuth();
    const { notify } = useNotification();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState(null);
    const [dashStats, setDashStats] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", phone: "" });
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirm: "" });
    const [showOldPw, setShowOldPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    const isSuperAdmin = user?.role === "SUPER_ADMIN";
    const isCompanyAdmin = user?.role === "COMPANY_ADMIN" || user?.role === "COMPANY";

    const loadProfile = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [profileRes, statsRes, logsRes] = await Promise.allSettled([
                api.get(`/users/${user.id}`),
                isSuperAdmin
                    ? api.get("/super-admin/dashboard-stats")
                    : api.get("/company/dashboard"),
                isSuperAdmin
                    ? api.get("/super-admin/audit-logs")
                    : api.get("/company/audit-logs")
            ]);

            if (profileRes.status === "fulfilled") {
                const d = profileRes.value.data;
                setProfileData(d);
                setEditForm({ name: d.name || "", phone: d.phone || "" });
            }

            if (statsRes.status === "fulfilled") {
                const raw = statsRes.value.data;
                setDashStats(isSuperAdmin ? raw?.metrics : raw?.metrics);
            }

            if (logsRes.status === "fulfilled") {
                setAuditLogs((logsRes.value.data || []).slice(0, 5));
            }
        } catch (err) {
            notify("Failed to load profile data", "error");
        } finally {
            setLoading(false);
        }
    }, [user, isSuperAdmin, notify]);

    useEffect(() => { loadProfile(); }, [loadProfile]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const res = await api.put(`/users/${user.id}`, editForm);
            setProfileData(res.data);
            setEditMode(false);
            notify("Profile updated successfully", "success");
        } catch {
            notify("Failed to update profile", "error");
        } finally {
            setSaving(false);
        }
    };

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

    if (!user || (!isSuperAdmin && !isCompanyAdmin)) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <h2>Access Denied</h2>
                <p style={{ opacity: 0.6 }}>This profile page is for Admin roles only.</p>
                <button className="primary-btn" onClick={() => navigate("/dashboard")}>
                    Go to Dashboard
                </button>
            </div>
        );
    }

    // ── Profile header config ──
    const roleConfig = isSuperAdmin
        ? {
            label: "Super Admin",
            badge: { bg: "linear-gradient(135deg, #f59e0b, #dc2626)", color: "#fff", border: "rgba(245,158,11,0.5)" },
            accent: "#f59e0b",
            avatarGradient: "linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)",
            platformLabel: "INSURAI Platform",
            planetIcon: "👑"
        }
        : {
            label: "Company Admin",
            badge: { bg: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", border: "rgba(99,102,241,0.5)" },
            accent: "#6366f1",
            avatarGradient: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
            platformLabel: profileData?.company?.name || profileData?.companyName || "Your Company",
            planetIcon: "🏢"
        };

    const displayName = profileData?.name || user?.name || "Unknown";
    const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    const companyPermissions = [
        { label: "Manage Company Agents", granted: true },
        { label: "View Company Users", granted: true },
        { label: "View Issued Policies", granted: true },
        { label: "View Fraud Alerts", granted: true },
        { label: "View Feedback & Reviews", granted: true },
        { label: "Platform-wide Access", granted: false },
        { label: "Manage Multiple Companies", granted: false },
    ];

    const superAdminPermissions = [
        { label: "Manage All Companies", granted: true },
        { label: "View All Users", granted: true },
        { label: "View All Agents", granted: true },
        { label: "View All Policies", granted: true },
        { label: "View Fraud Alerts", granted: true },
        { label: "View Feedback & Reviews", granted: true },
        { label: "Access Full Audit Logs", granted: true },
        { label: "System Governance Controls", granted: true },
    ];

    const permissions = isSuperAdmin ? superAdminPermissions : companyPermissions;

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

    if (loading) {
        return (
            <div style={{ padding: "40px", maxWidth: 1200, margin: "0 auto" }}>
                {/* Header skeleton */}
                <div style={{ height: 200, borderRadius: 18, background: "rgba(255,255,255,0.03)", marginBottom: 24, animation: "pulse 1.5s ease-in-out infinite" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} style={{ height: 220, borderRadius: 18, background: "rgba(255,255,255,0.03)", animation: "pulse 1.5s ease-in-out infinite" }} />
                    ))}
                </div>
                <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px", color: "var(--text-main)" }}>

            {/* ══════════════════════════════════════════════
                🔹 1. PROFILE HEADER
            ══════════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: "rgba(255,255,255,0.025)",
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${roleConfig.accent}30`,
                    borderRadius: 22,
                    padding: "32px 36px",
                    marginBottom: 28,
                    position: "relative",
                    overflow: "hidden"
                }}
            >
                {/* Decorative background blob */}
                <div style={{
                    position: "absolute", top: -60, right: -60,
                    width: 220, height: 220, borderRadius: "50%",
                    background: `${roleConfig.accent}15`,
                    filter: "blur(40px)", pointerEvents: "none"
                }} />

                <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                    {/* Avatar */}
                    <div style={{ position: "relative" }}>
                        <div style={{
                            width: 90, height: 90, borderRadius: "50%",
                            background: roleConfig.avatarGradient,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "2.2rem", fontWeight: 800, color: "#fff",
                            boxShadow: `0 0 30px ${roleConfig.accent}40`,
                            border: `3px solid ${roleConfig.accent}60`,
                            letterSpacing: -1
                        }}>
                            {initials}
                        </div>
                        <div style={{
                            position: "absolute", bottom: 2, right: 2,
                            width: 18, height: 18, borderRadius: "50%",
                            background: "#10b981", border: "2px solid #020617"
                        }} title="Active" />
                    </div>

                    {/* Identity */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
                            <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 800 }}>
                                {displayName}
                            </h1>
                            <span style={{
                                padding: "4px 14px", borderRadius: 30, fontSize: "0.8rem",
                                fontWeight: 700, background: roleConfig.badge.bg,
                                color: roleConfig.badge.color, letterSpacing: "0.05em"
                            }}>
                                {roleConfig.planetIcon} {roleConfig.label}
                            </span>
                            <span style={{
                                padding: "4px 12px", borderRadius: 30, fontSize: "0.75rem",
                                fontWeight: 700, background: "rgba(16,185,129,0.15)",
                                color: "#10b981", border: "1px solid rgba(16,185,129,0.3)"
                            }}>
                                🟢 Active
                            </span>
                        </div>
                        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                            <span>📧 {profileData?.email || user?.email}</span>
                            <span>{roleConfig.planetIcon} {roleConfig.platformLabel}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className="primary-btn"
                            style={{
                                padding: "10px 22px", fontSize: "0.87rem",
                                background: editMode ? "rgba(239,68,68,0.15)" : undefined,
                                borderColor: editMode ? "#ef4444" : undefined
                            }}
                            onClick={() => {
                                if (editMode) {
                                    setEditForm({ name: profileData?.name || "", phone: profileData?.phone || "" });
                                }
                                setEditMode(!editMode);
                            }}
                        >
                            {editMode ? "✕ Cancel" : "✏️ Edit Profile"}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className="secondary-btn"
                            style={{ padding: "10px 22px", fontSize: "0.87rem" }}
                            onClick={() => navigate(isSuperAdmin ? "/super-admin" : "/company")}
                        >
                            📊 Dashboard
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* ══════════════════════════════════════════════
                MAIN TWO-COLUMN LAYOUT
            ══════════════════════════════════════════════ */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginBottom: 22 }}>

                {/* ── 2. PERSONAL INFORMATION ── */}
                <SectionCard title="Personal Information" icon="👤" accentColor="#6366f1">
                    <AnimatePresence mode="wait">
                        {editMode ? (
                            <motion.div key="edit"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ paddingTop: 8 }}
                            >
                                <div className="form-group" style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Full Name</label>
                                    <input
                                        className="form-input"
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        style={{ padding: "10px 14px" }}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Phone Number</label>
                                    <input
                                        className="form-input"
                                        placeholder="+91 98765 43210"
                                        value={editForm.phone}
                                        onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                        style={{ padding: "10px 14px" }}
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    className="primary-btn"
                                    style={{ width: "100%", marginTop: 6 }}
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : "💾 Save Changes"}
                                </motion.button>
                            </motion.div>
                        ) : (
                            <motion.div key="view"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            >
                                <InfoRow label="Full Name" value={profileData?.name} icon="🪪" />
                                <InfoRow label="Email Address" value={profileData?.email} icon="📧" locked />
                                <InfoRow label="Phone Number" value={profileData?.phone} icon="📱" />
                                <InfoRow label="Role" value={roleConfig.label} icon="🎭" locked />
                                <InfoRow
                                    label="Account Created"
                                    value={profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null}
                                    icon="📅" locked
                                />
                                <InfoRow
                                    label="Last Login"
                                    value={profileData?.lastLogin ? new Date(profileData.lastLogin).toLocaleString("en-IN") : "N/A"}
                                    icon="🕒" locked
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </SectionCard>

                {/* ── 3. COMPANY / PLATFORM INFO ── */}
                <SectionCard
                    title={isSuperAdmin ? "Platform Overview" : "Company Information"}
                    icon={isSuperAdmin ? "🌐" : "🏢"}
                    accentColor={roleConfig.accent}
                >
                    {isSuperAdmin ? (
                        // Super Admin — Platform Metrics
                        <>
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8, marginBottom: 16 }}>
                                <MetricPill label="Companies" value={dashStats?.totalCompanies} color="#6366f1" icon="🏢" />
                                <MetricPill label="Users" value={(dashStats?.totalUsers || 0).toLocaleString()} color="#8b5cf6" icon="👥" />
                                <MetricPill label="Agents" value={dashStats?.totalAgents} color="#10b981" icon="🧑‍💼" />
                            </div>
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                                <MetricPill label="Policies Issued" value={(dashStats?.policiesIssued || 0).toLocaleString()} color="#f59e0b" icon="📄" />
                                <MetricPill label="Fraud Alerts" value={dashStats?.fraudAlerts} color="#ef4444" icon="⚠️" />
                                <MetricPill label="Feedback" value={dashStats?.totalFeedback} color="#06b6d4" icon="💬" />
                            </div>
                            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                                <span style={{ fontSize: "0.82rem", color: "#fbbf24", fontWeight: 600 }}>👑 Platform: INSURAI</span>
                                <span style={{ marginLeft: 12, fontSize: "0.8rem", color: "var(--text-muted)" }}>Global Access Granted</span>
                            </div>
                        </>
                    ) : (
                        // Company Admin — Company Details
                        <>
                            <InfoRow label="Company Name" value={profileData?.company?.name || profileData?.companyName} icon="🏢" locked />
                            <InfoRow label="Company ID" value={profileData?.company?.id ? `#${profileData.company.id}` : null} icon="🆔" locked />
                            <InfoRow label="Industry Type" value={profileData?.company?.industryType || "Insurance Services"} icon="🏭" locked />
                            <InfoRow
                                label="Company Registered"
                                value={profileData?.company?.createdAt
                                    ? new Date(profileData.company.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                                    : null}
                                icon="📋" locked
                            />
                            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                                <MetricPill label="Total Agents" value={dashStats?.totalAgents} color="#10b981" icon="🧑‍💼" />
                                <MetricPill label="Active Policies" value={dashStats?.activePolicies ?? dashStats?.policiesIssued} color="#6366f1" icon="📄" />
                                <MetricPill label="Total Users" value={dashStats?.totalUsers} color="#06b6d4" icon="👥" />
                            </div>
                        </>
                    )}
                </SectionCard>
            </div>

            {/* ══════════════════════════════════════════════
                🔹 4. ACCESS SCOPE & PERMISSIONS
            ══════════════════════════════════════════════ */}
            <SectionCard
                title={`${isSuperAdmin ? "Global Permissions Matrix" : "Access Scope & Permissions"}`}
                icon="🛡️"
                accentColor="#10b981"
                style={{ marginBottom: 22 }}
            >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px", marginTop: 8 }}>
                    {permissions.map((perm, i) => (
                        <PermissionRow key={i} label={perm.label} granted={perm.granted} />
                    ))}
                </div>
                <div style={{
                    marginTop: 14, padding: "10px 14px", borderRadius: 10,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                    fontSize: "0.8rem", color: "var(--text-muted)"
                }}>
                    🔒 Permissions are role-bound and cannot be self-modified. Contact platform governance to request changes.
                </div>
            </SectionCard>

            {/* ══════════════════════════════════════════════
                🔹 5. SECURITY & AUDIT
            ══════════════════════════════════════════════ */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginBottom: 22 }}>

                {/* Security Card */}
                <SectionCard title="Security Settings" icon="🔐" accentColor="#8b5cf6">
                    {/* Password Change */}
                    <div style={{
                        padding: "14px 16px", borderRadius: 12,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)", marginTop: 8, marginBottom: 12
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontWeight: 700, marginBottom: 3, fontSize: "0.9rem" }}>🔑 Change Password</div>
                                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                                    Keep your account secure with a strong password
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                onClick={() => setShowPasswordSection(!showPasswordSection)}
                                style={{
                                    padding: "7px 16px", borderRadius: 20, fontSize: "0.8rem",
                                    fontWeight: 600, cursor: "pointer",
                                    background: showPasswordSection ? "rgba(239,68,68,0.15)" : "rgba(99,102,241,0.15)",
                                    border: `1px solid ${showPasswordSection ? "rgba(239,68,68,0.4)" : "rgba(99,102,241,0.4)"}`,
                                    color: showPasswordSection ? "#f87171" : "#a5b4fc"
                                }}
                            >
                                {showPasswordSection ? "Cancel" : "Change"}
                            </motion.button>
                        </div>

                        <AnimatePresence>
                            {showPasswordSection && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    style={{ overflow: "hidden" }}
                                >
                                    <div style={{ paddingTop: 14, display: "grid", gap: 10 }}>
                                        {[
                                            { label: "Current Password", key: "oldPassword", show: showOldPw, setShow: setShowOldPw },
                                            { label: "New Password", key: "newPassword", show: showNewPw, setShow: setShowNewPw },
                                            { label: "Confirm New Password", key: "confirm", show: showConfirmPw, setShow: setShowConfirmPw },
                                        ].map(({ label, key, show, setShow }) => (
                                            <div key={key} style={{ position: "relative" }}>
                                                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 5 }}>
                                                    {label}
                                                </label>
                                                <div style={{ position: "relative" }}>
                                                    <input
                                                        type={show ? "text" : "password"}
                                                        className="form-input"
                                                        style={{ padding: "9px 40px 9px 12px" }}
                                                        value={pwForm[key]}
                                                        onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                                                        placeholder={label}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="input-icon-btn"
                                                        onClick={() => setShow(!show)}
                                                    >
                                                        {eyeIcon(show)}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                            className="primary-btn"
                                            style={{ width: "100%", marginTop: 4 }}
                                            onClick={handleChangePassword}
                                        >
                                            Update Password
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Quick Security Actions */}
                    <div style={{ display: "grid", gap: 8 }}>
                        <motion.div
                            whileHover={{ background: "rgba(255,255,255,0.05)" }}
                            style={{
                                padding: "13px 16px", borderRadius: 10, cursor: "pointer",
                                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                                display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s"
                            }}
                            onClick={() => navigate(isSuperAdmin ? "/super-admin" : "/company")}
                        >
                            <span style={{ fontSize: "1.1rem" }}>📋</span>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: "0.87rem" }}>
                                    {isSuperAdmin ? "Global Audit Logs" : "Company Audit Logs"}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>View full activity history</div>
                            </div>
                            <span style={{ marginLeft: "auto", opacity: 0.4 }}>→</span>
                        </motion.div>

                        <motion.div
                            whileHover={{ background: "rgba(239,68,68,0.06)" }}
                            style={{
                                padding: "13px 16px", borderRadius: 10, cursor: "pointer",
                                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(239,68,68,0.15)",
                                display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s"
                            }}
                            onClick={() => {
                                if (window.confirm("Logout from all sessions? You will be signed out.")) {
                                    logout();
                                }
                            }}
                        >
                            <span style={{ fontSize: "1.1rem" }}>🔓</span>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: "0.87rem", color: "#f87171" }}>Logout from All Sessions</div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Invalidate all active tokens</div>
                            </div>
                            <span style={{ marginLeft: "auto", opacity: 0.4, color: "#f87171" }}>→</span>
                        </motion.div>
                    </div>
                </SectionCard>

                {/* Audit Log Card */}
                <SectionCard title="Recent Activity" icon="🧾" accentColor="#06b6d4">
                    {auditLogs.length === 0 ? (
                        <div style={{ padding: "30px 0", textAlign: "center", opacity: 0.4, fontSize: "0.88rem" }}>
                            No audit logs found.
                        </div>
                    ) : auditLogs.map((log, i) => (
                        <motion.div
                            key={log.id || i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.07 }}
                            style={{
                                display: "flex", gap: 12, alignItems: "flex-start",
                                padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)"
                            }}
                        >
                            <div style={{
                                width: 8, height: 8, borderRadius: "50%", background: "#6366f1",
                                marginTop: 5, flexShrink: 0
                            }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{log.action}</div>
                                {log.details && (
                                    <div style={{ fontSize: "0.77rem", color: "var(--text-muted)", marginTop: 2 }}>{log.details}</div>
                                )}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", flexShrink: 0, fontFamily: "monospace" }}>
                                {log.timestamp ? new Date(log.timestamp).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
                            </div>
                        </motion.div>
                    ))}
                    {auditLogs.length > 0 && (
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className="secondary-btn"
                            style={{ width: "100%", marginTop: 12, fontSize: "0.82rem" }}
                            onClick={() => navigate(isSuperAdmin ? "/super-admin" : "/company")}
                        >
                            View All Logs →
                        </motion.button>
                    )}
                </SectionCard>
            </div>

            {/* ══════════════════════════════════════════════
                🔹 6. SYSTEM CONTROLS (Super Admin) / DANGER ZONE
            ══════════════════════════════════════════════ */}
            {isSuperAdmin && (
                <SectionCard title="System Controls" icon="⚙️" accentColor="#f59e0b" style={{ marginBottom: 22 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginTop: 8 }}>
                        {[
                            { label: "Add / Remove Company", icon: "🏢", color: "#6366f1", path: "/super-admin", desc: "Manage company registrations" },
                            { label: "User Management", icon: "👥", color: "#8b5cf6", path: "/users", desc: "Activate or deactivate accounts" },
                            { label: "Agent Governance", icon: "🧑‍💼", color: "#10b981", path: "/agents-list", desc: "View and manage all agents" },
                            { label: "Fraud & Exceptions", icon: "⚠️", color: "#ef4444", path: "/exceptions", desc: "Investigate platform alerts" },
                            { label: "Issued Policies", icon: "📄", color: "#f59e0b", path: "/issued-policies", desc: "View all active policies" },
                            { label: "Platform Analytics", icon: "📊", color: "#06b6d4", path: "/analytics", desc: "Performance & metrics" },
                        ].map((ctrl, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.03, background: `${ctrl.color}15` }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate(ctrl.path)}
                                style={{
                                    padding: "16px 18px", borderRadius: 14, cursor: "pointer",
                                    background: `${ctrl.color}08`,
                                    border: `1px solid ${ctrl.color}30`,
                                    transition: "all 0.2s"
                                }}
                            >
                                <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>{ctrl.icon}</div>
                                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: ctrl.color, marginBottom: 4 }}>{ctrl.label}</div>
                                <div style={{ fontSize: "0.77rem", color: "var(--text-muted)" }}>{ctrl.desc}</div>
                            </motion.div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* Company Admin — Danger Zone */}
            {isCompanyAdmin && (
                <SectionCard title="Governance Actions" icon="⚡" accentColor="#ef4444" style={{ marginBottom: 22 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 8 }}>
                        <motion.div
                            whileHover={{ background: "rgba(245,158,11,0.08)" }}
                            style={{
                                padding: "16px 18px", borderRadius: 12, cursor: "pointer",
                                background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)",
                                transition: "all 0.2s"
                            }}
                            onClick={() => navigate("/company")}
                        >
                            <div style={{ fontSize: "1.4rem", marginBottom: 8 }}>📞</div>
                            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#fbbf24", marginBottom: 4 }}>
                                Contact Super Admin
                            </div>
                            <div style={{ fontSize: "0.77rem", color: "var(--text-muted)" }}>
                                Raise escalations or platform concerns
                            </div>
                        </motion.div>
                        <motion.div
                            whileHover={{ background: "rgba(239,68,68,0.07)" }}
                            style={{
                                padding: "16px 18px", borderRadius: 12, cursor: "pointer",
                                background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.18)",
                                transition: "all 0.2s"
                            }}
                            onClick={() => {
                                notify("Company deactivation request submitted. Super Admin approval required.", "info");
                            }}
                        >
                            <div style={{ fontSize: "1.4rem", marginBottom: 8 }}>🏳️</div>
                            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#f87171", marginBottom: 4 }}>
                                Request Deactivation
                            </div>
                            <div style={{ fontSize: "0.77rem", color: "var(--text-muted)" }}>
                                Requires Super Admin approval
                            </div>
                        </motion.div>
                    </div>
                </SectionCard>
            )}

        </div>
    );
}
