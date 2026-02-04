import { useState } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const submit = async () => {
    const e = {};
    if (!form.email) e.email = "Email required";
    if (!form.password) e.password = "Password required";
    setErrors(e);
    if (Object.keys(e).length) return;

    try {
      const res = await api.post("/auth/login", form);
      const data = res.data; // { user, token }
      const user = data.user;

      login(data); // Pass { user, token } to context
      notify("Welcome " + user.name, "success");

      if (user.role === 'ADMIN') navigate('/admin');
      else navigate('/dashboard');

    } catch (err) {
      console.error(err);
      const msg = err.response?.data || "Invalid credentials";
      notify(msg, "error");
    }
  };

  return (
    <Card title="Login">
      <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            className="form-input"
            autoFocus
            placeholder="john@example.com"
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && <p className="error-msg">{errors.email}</p>}
        </div>

        <div className="form-group" style={{ position: "relative" }}>
          <label className="form-label">Password</label>
          <div style={{ position: "relative" }}>
            <input
              className="form-input"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{ paddingRight: 50, marginBottom: 0 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 15,
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                color: "var(--text-muted)",
                transition: "all 0.2s ease",
                width: 32,
                height: 32
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 0.1)";
                e.currentTarget.style.color = "var(--primary)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {showPassword ? (
                  <motion.svg
                    key="hide"
                    initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: 20 }}
                    transition={{ duration: 0.2 }}
                    width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="show"
                    initial={{ opacity: 0, scale: 0.8, rotate: 20 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: -20 }}
                    transition={{ duration: 0.2 }}
                    width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </motion.svg>
                )}
              </AnimatePresence>
            </button>
          </div>
          {errors.password && <p className="error-msg">{errors.password}</p>}
        </div>

        <button type="submit" className="primary-btn" style={{ width: "100%", marginBottom: 20 }}>Sign In</button>

        <div style={{ textAlign: "center", fontSize: "0.9rem" }}>
          <Link to="/forgot-password" style={{ color: "var(--primary)" }}>Forgot Password?</Link>
          <br />
          <span style={{ opacity: 0.7 }}>Don't have an account? </span>
          <Link to="/register" style={{ color: "var(--primary)" }}>Register</Link>
        </div>
      </form>
    </Card>
  );
}
