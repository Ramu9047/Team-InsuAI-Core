import { useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");
    const [msgType, setMsgType] = useState(""); // 'success' | 'error'
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");
        try {
            const res = await api.get(`/auth/forgot?email=${email}`);
            setMsgType("success");
            setMsg(typeof res.data === 'string' ? res.data : "Reset link sent! Check your email.");
        } catch (err) {
            setMsgType("error");
            setMsg(err.response?.data || "User not found. Please check your email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', background: 'var(--bg-dark)'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ width: '100%', maxWidth: 440, padding: '40px 36px' }}
            >
                {/* Icon */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'rgba(99,102,241,0.12)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.8rem', margin: '0 auto 16px'
                    }}>🔑</div>
                    <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Forgot Password?
                    </h2>
                    <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Enter your email and we'll send you a reset link.
                    </p>
                </div>

                {/* Feedback Message */}
                <AnimatePresence>
                    {msg && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{
                                padding: '12px 16px', borderRadius: 10, marginBottom: 20,
                                background: msgType === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                border: `1px solid ${msgType === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                color: msgType === 'success' ? '#10b981' : '#ef4444',
                                fontSize: '0.9rem', fontWeight: 600
                            }}
                        >
                            {msgType === 'success' ? '✅' : '❌'} {msg}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button className="primary-btn" disabled={loading} style={{ padding: '13px', fontSize: '0.95rem' }}>
                        {loading ? '⏳ Sending...' : '📧 Send Reset Link'}
                    </button>
                </form>

                {/* Back to Login */}
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        ← Back to Login
                    </Link>
                </div>

                {/* Trust indicators */}
                <div style={{
                    marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border-subtle)',
                    display: 'flex', justifyContent: 'center', gap: 20
                }}>
                    {['🔒 SSL Encrypted', '📧 Email Verified'].map(t => (
                        <span key={t} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {t}
                        </span>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
