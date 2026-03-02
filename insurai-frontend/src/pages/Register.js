import { useState, useMemo } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "../context/NotificationContext";
import { useNavigate, Link } from "react-router-dom";

// ── Eye SVGs ─────────────────────────────────────────────────
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

// ── Password Strength ─────────────────────────────────────────
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { label: "Weak", color: "#ef4444" },
    { label: "Fair", color: "#f97316" },
    { label: "Good", color: "#f59e0b" },
    { label: "Strong", color: "#10b981" },
  ];
  return { score, ...levels[Math.max(0, score - 1)] };
}

function PasswordStrengthBar({ password }) {
  const { score, label, color } = getPasswordStrength(password);
  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
        {[1, 2, 3, 4].map(s => (
          <motion.div key={s}
            animate={{ background: score >= s ? color : "rgba(255,255,255,0.08)" }}
            transition={{ duration: 0.3 }}
            style={{ flex: 1, height: 4, borderRadius: 3 }}
          />
        ))}
      </div>
      <span style={{ fontSize: "0.75rem", color, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function PasswordRequirement({ met, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: met ? "#10b981" : "#475569" }}>
      <motion.span animate={{ scale: met ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.25 }}>
        {met ? "✓" : "○"}
      </motion.span>
      <span>{text}</span>
    </div>
  );
}

// ── Left Branding Panel ───────────────────────────────────────
function BrandPanel() {
  const benefits = [
    { icon: "🛡️", title: "Access Insurance Plans", desc: "Browse and compare plans from multiple top companies" },
    { icon: "📅", title: "Book Consultations", desc: "Schedule 1-on-1 sessions with certified agents" },
    { icon: "📋", title: "Track Your Claims", desc: "Monitor claim status in real-time with full transparency" },
    { icon: "🤖", title: "AI Recommendations", desc: "Get personalized policy suggestions powered by AI" },
  ];

  return (
    <div style={{
      flex: 1,
      width: "100%",
      background: "linear-gradient(145deg, #0d1529 0%, #070c1a 100%)",
      borderRight: "1px solid rgba(99,102,241,0.10)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "50px 40px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: "-5%", right: "-10%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", left: "-10%", width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.10), transparent 70%)", pointerEvents: "none" }} />

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
            <path d="M20 3 L37 10 L37 22 Q37 32 20 38 Q3 32 3 22 L3 10 Z" fill="none" stroke="url(#sg2)" strokeWidth="2" />
            <path d="M10 20 L16 26 L30 12" stroke="url(#sg2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="sg2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <span style={{ fontSize: "1.75rem", fontWeight: 800, background: "linear-gradient(135deg, #6366f1, #a855f7, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontFamily: "'Space Grotesk', sans-serif" }}>
            InsurAI
          </span>
        </div>

        <div style={{ marginBottom: 10 }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.1em", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", padding: "4px 12px", borderRadius: 20 }}>
            User Account
          </span>
        </div>
        <h1 style={{ fontSize: "1.95rem", fontWeight: 800, color: "#f1f5f9", lineHeight: 1.2, marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
          Join InsurAI as a{" "}
          <span style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Policy Holder
          </span>
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.65, marginBottom: 40 }}>
          User accounts are for insurance buyers only. If you're an agent or admin, your access will be provisioned by your company.
        </p>
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {benefits.map((b, i) => (
          <motion.div key={b.title}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.1 }}
            style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 9, flexShrink: 0, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>
              {b.icon}
            </div>
            <div>
              <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>{b.title}</div>
              <div style={{ fontSize: "0.78rem", color: "#64748b", lineHeight: 1.5 }}>{b.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
        style={{ marginTop: 44, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p style={{ fontSize: "0.75rem", color: "#334155", margin: 0, lineHeight: 1.6 }}>
          🔒 Your data is encrypted and protected. We never share personal information without your consent.
        </p>
      </motion.div>
    </div>
  );
}

// ── Main Register Component ───────────────────────────────────
export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { notify } = useNotification();
  const navigate = useNavigate();

  const pwStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const pwRules = [
    { met: form.password.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(form.password), text: "One uppercase letter" },
    { met: /\d/.test(form.password), text: "One number" },
    { met: /[^A-Za-z0-9]/.test(form.password), text: "One special character" },
  ];

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email) e.email = "Email is required";
    else if (!form.email.includes("@")) e.email = "Invalid email format";
    if (!form.password) e.password = "Password is required";
    else if (pwStrength.score < 4) e.password = "Password does not meet all requirements";
    return e;
  };

  const setField = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      // Always register as USER — no role selection
      await api.post("/auth/register", { ...form, role: "USER" });
      notify("Account created! Please sign in.", "success");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Registration failed";
      notify(msg, "error");
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 64,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      background: "linear-gradient(135deg, #020617 0%, #070c1a 100%)",
      overflow: "hidden",
      zIndex: 0,
    }}>
      <div style={{ flex: "0 0 42%", minWidth: 0, display: "flex" }} className="auth-brand-panel">
        <BrandPanel />
      </div>

      {/* Right panel — Form */}
      <div style={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        overflowY: "auto",
        minWidth: 0,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ width: "100%", maxWidth: 480 }}
        >
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#f1f5f9", marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
              Create your account
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#818cf8", fontWeight: 600 }}>Sign in here</Link>
            </p>
          </div>

          {/* Account type indicator */}
          <div style={{
            padding: "12px 16px",
            borderRadius: 10,
            background: "rgba(59,130,246,0.07)",
            border: "1px solid rgba(59,130,246,0.2)",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ fontSize: "1.1rem" }}>👤</span>
            <div>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#93c5fd" }}>User Account</div>
              <div style={{ fontSize: "0.75rem", color: "#475569" }}>For insurance buyers only — agents & admins are provisioned separately</div>
            </div>
          </div>

          {/* Server error */}
          <AnimatePresence>
            {errors.form && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontSize: "0.88rem", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                ⚠️ {errors.form}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={submit} noValidate>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                id="reg-name"
                className="form-input"
                autoFocus
                placeholder="Jane Doe"
                value={form.name}
                autoComplete="name"
                onChange={e => setField("name", e.target.value)}
                style={errors.name ? { borderColor: "rgba(239,68,68,0.5)" } : {}}
              />
              {errors.name && <p className="error-msg">⚠ {errors.name}</p>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                id="reg-email"
                className="form-input"
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                autoComplete="email"
                onChange={e => setField("email", e.target.value)}
                style={errors.email ? { borderColor: "rgba(239,68,68,0.5)" } : {}}
              />
              {errors.email && <p className="error-msg">⚠ {errors.email}</p>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="reg-password"
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 chars, 1 upper, 1 number, 1 special"
                  value={form.password}
                  autoComplete="new-password"
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

              {/* Strength bar */}
              <PasswordStrengthBar password={form.password} />
              {errors.password && <p className="error-msg">⚠ {errors.password}</p>}

              {/* Requirements checklist */}
              {form.password && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                  {pwRules.map(r => <PasswordRequirement key={r.text} met={r.met} text={r.text} />)}
                </motion.div>
              )}
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
                marginTop: 8,
                boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                letterSpacing: "0.02em",
              }}
            >
              {loading ? (
                <><span style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Creating account...</>
              ) : "Create Account →"}
            </motion.button>
          </form>

          <p style={{ marginTop: 24, fontSize: "0.75rem", color: "#334155", textAlign: "center", lineHeight: 1.6 }}>
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .auth-brand-panel { display: none !important; }
        }
      `}</style>
    </div >
  );
}