import { useState } from "react";
import api from "../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/auth/reset", { token, newPassword: password });
            setStatus("✅ Password updated! Redirecting to login...");
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setStatus("❌ Failed: " + (err.response?.data || "Invalid token"));
        }
    };

    if (!token) return <div style={{ textAlign: "center", marginTop: 50 }}>Invalid Link</div>;

    return (
        <div style={{ maxWidth: 400, margin: "50px auto", padding: 30 }} className="card">
            <h2 style={{ textAlign: "center" }}>Set New Password</h2>
            {status && <p style={{ textAlign: "center", fontWeight: "bold" }}>{status}</p>}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                <div style={{ position: "relative", marginBottom: 20 }}>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="form-input"
                        style={{ marginBottom: 0, paddingRight: 50 }}
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
                            padding: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "50%",
                            color: "var(--text-muted)",
                            transition: "all 0.2s ease"
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
                        {showPassword ? (
                            <motion.svg
                                key="hide"
                                initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
                                transition={{ duration: 0.2 }}
                                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            >
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                            </motion.svg>
                        ) : (
                            <motion.svg
                                key="show"
                                initial={{ scale: 0.5, opacity: 0, rotate: 45 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                exit={{ scale: 0.5, opacity: 0, rotate: -45 }}
                                transition={{ duration: 0.2 }}
                                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </motion.svg>
                        )}
                    </button>
                </div>
                <button className="primary-btn">Update Password</button>
            </form>
        </div>
    );
}
