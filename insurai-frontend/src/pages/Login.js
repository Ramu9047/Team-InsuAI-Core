import { useState } from "react";
import api from "../services/api";
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

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validation
    const errors = {};
    if (!form.email) errors.email = "Email is required";
    if (!form.password) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    try {
      const res = await api.post("/auth/login", form);
      const data = res.data;

      login(data);
      notify(`Welcome back, ${data.user.name}!`, "success");

      if (data.user.role === 'COMPANY' || data.user.role === 'COMPANY_ADMIN') navigate('/company');
      else if (data.user.role === 'SUPER_ADMIN') navigate('/super-admin');
      else navigate('/dashboard');

    } catch (err) {
      console.error("Login Error:", err);

      // Extract error message safely
      let msg = "Invalid credentials";
      if (err.response) {
        if (typeof err.response.data === 'string') {
          msg = err.response.data;
        } else if (err.response.data?.message) {
          msg = err.response.data.message;
        }
      }

      notify(msg, "error");
      setErrors({ form: msg });
    }
  };

  return (
    <Card title="Login">
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            className="form-input"
            autoFocus
            type="email"
            value={form.email}
            placeholder="john@example.com"
            onChange={e => {
              setForm({ ...form, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: null });
            }}
          />
          {errors.email && <p className="error-msg">{errors.email}</p>}
        </div>

        <div className="form-group" style={{ position: "relative" }}>
          <label className="form-label">Password</label>
          <div style={{ position: "relative" }}>
            <input
              className="form-input"
              type={showPassword ? "text" : "password"}
              value={form.password}
              placeholder="••••••••"
              onChange={e => {
                setForm({ ...form, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: null });
              }}
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
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
          {errors.password && <p className="error-msg">{errors.password}</p>}
        </div>

        {errors.form && (
          <div style={{
            padding: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '0.9rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {errors.form}
          </div>
        )}

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
