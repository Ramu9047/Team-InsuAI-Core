import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ── Eye toggle SVGs ──────────────────────────────────────────
function EyeOn() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// ── Left Branding Panel ──────────────────────────────────────
function BrandPanel() {
  const features = [
    { icon: "🤖", label: "AI-Powered Matching", desc: "Smart policy recommendations tailored to your profile" },
    { icon: "🛡️", label: "Multi-Company Access", desc: "Compare policies across verified insurance companies" },
    { icon: "📊", label: "Real-Time Analytics", desc: "Live dashboards for agents, admins, and companies" },
    { icon: "🔐", label: "Role-Based Security", desc: "Strict access controls enforced at every layer" },
  ];

  return (
    <div style={{
      flex: "0 0 42%",
      background: "linear-gradient(145deg, #0d1529 0%, #0a0f1e 50%, #070c1a 100%)",
      borderRight: "1px solid rgba(99,102,241,0.12)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "60px 48px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background glow blobs */}
      <div style={{ position: "absolute", top: "-10%", left: "-15%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.12), transparent 70%)", pointerEvents: "none" }} />

      {/* Logo */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
            <path d="M20 3 L37 10 L37 22 Q37 32 20 38 Q3 32 3 22 L3 10 Z" fill="none" stroke="url(#sg)" strokeWidth="2" />
            <path d="M10 20 L16 26 L30 12" stroke="url(#sg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <span style={{ fontSize: "1.8rem", fontWeight: 800, background: "linear-gradient(135deg, #6366f1, #a855f7, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontFamily: "'Space Grotesk', sans-serif" }}>
            InsurAI
          </span>
        </div>

        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#f1f5f9", lineHeight: 1.25, marginBottom: 14, fontFamily: "'Space Grotesk', sans-serif" }}>
          Intelligent Insurance<br />
          <span style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Platform
          </span>
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: 1.65, marginBottom: 44 }}>
          AI-driven insurance consultations, real-time policy matching, and enterprise-grade governance — all in one platform.
        </p>
      </motion.div>

      {/* Feature list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {features.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.1 }}
            style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.1rem"
            }}>
              {f.icon}
            </div>
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>{f.label}</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        style={{ display: "flex", gap: 20, marginTop: 52, paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        {["🔒 256-bit SSL", "✓ ISO 27001", "🏛️ IRDAI Compliant"].map(t => (
          <span key={t} style={{ fontSize: "0.72rem", color: "#475569", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>{t}</span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Main Login Component ─────────────────────────────────────
export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    if (!form.password) errs.password = "Password is required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      const data = res.data;
      login(data);
      notify(`Welcome back, ${data.user.name}!`, "success");

      const role = data.user.role;
      if (role === "COMPANY" || role === "COMPANY_ADMIN") navigate("/company");
      else if (role === "SUPER_ADMIN") navigate("/super-admin");
      else navigate("/dashboard");
    } catch (err) {
      let msg = "Invalid credentials";
      if (err.response) {
        if (typeof err.response.data === "string") msg = err.response.data;
        else if (err.response.data?.message) msg = err.response.data.message;
      }
      notify(msg, "error");
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  const setField = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "linear-gradient(135deg, #020617 0%, #070c1a 100%)",
    }}>
      {/* Left panel — hide on mobile */}
      <div style={{ display: "flex", flex: 1 }}>
        <div style={{ flex: "0 0 42%", display: "flex" }} className="auth-brand-panel">
          <BrandPanel />
        </div>

        {/* Right — Form panel */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          background: "rgba(2,6,23,0.7)",
        }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            style={{ width: "100%", maxWidth: 420 }}
          >
            {/* Header */}
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#f1f5f9", marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                Sign in to your account
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.92rem" }}>
                Don't have an account?{" "}
                <Link to="/register" style={{ color: "#818cf8", fontWeight: 600, textDecoration: "none" }}>
                  Create one for free
                </Link>
              </p>
            </div>

            {/* Error banner */}
            <AnimatePresence>
              {errors.form && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{
                    padding: "12px 16px", borderRadius: 10,
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    color: "#ef4444", fontSize: "0.88rem", marginBottom: 24,
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  <span>⚠️</span> {errors.form}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin} noValidate>
              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  id="login-email"
                  className="form-input"
                  type="email"
                  autoFocus
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setField("email", e.target.value)}
                  style={errors.email ? { borderColor: "rgba(239,68,68,0.5)" } : {}}
                />
                {errors.email && <p className="error-msg">⚠ {errors.email}</p>}
              </div>

              {/* Password */}
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label className="form-label" style={{ margin: 0 }}>Password</label>
                  <Link to="/forgot-password" style={{ fontSize: "0.78rem", color: "#6366f1", fontWeight: 500 }}>
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    id="login-password"
                    className="form-input"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••••"
                    value={form.password}
                    onChange={e => setField("password", e.target.value)}
                    style={{ paddingRight: 50, ...(errors.password ? { borderColor: "rgba(239,68,68,0.5)" } : {}) }}
                  />
                  <button type="button" className="input-icon-btn" onClick={() => setShowPassword(s => !s)}>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span key={showPassword ? "on" : "off"}
                        initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.15 }} style={{ display: "flex" }}>
                        {showPassword ? <EyeOff /> : <EyeOn />}
                      </motion.span>
                    </AnimatePresence>
                  </button>
                </div>
                {errors.password && <p className="error-msg">⚠ {errors.password}</p>}
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 12,
                  border: "none",
                  background: loading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff",
                  fontSize: "0.98rem",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  marginBottom: 24,
                  boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.35)",
                  transition: "all 0.25s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  letterSpacing: "0.02em",
                }}
              >
                {loading ? (
                  <><span style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Signing in...</>
                ) : (
                  <> Sign In →</>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              <span style={{ fontSize: "0.78rem", color: "#475569", fontWeight: 500 }}>Role Access</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            </div>

            {/* Role indicators */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { role: "User", color: "#3b82f6", icon: "👤" },
                { role: "Agent", color: "#8b5cf6", icon: "🧑‍💼" },
                { role: "Company Admin", color: "#14b8a6", icon: "🏢" },
                { role: "Super Admin", color: "#f59e0b", icon: "⚡" },
              ].map(r => (
                <div key={r.role} style={{
                  padding: "9px 12px", borderRadius: 10,
                  background: `rgba(${r.color === "#3b82f6" ? "59,130,246" : r.color === "#8b5cf6" ? "139,92,246" : r.color === "#14b8a6" ? "20,184,166" : "245,158,11"},0.07)`,
                  border: `1px solid ${r.color}22`,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontSize: "0.95rem" }}>{r.icon}</span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8" }}>{r.role}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .auth-brand-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
