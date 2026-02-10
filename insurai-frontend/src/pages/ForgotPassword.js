import { useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.get(`/auth/forgot?email=${email}`);
            setMsg("✅ " + (typeof res.data === 'string' ? res.data : "Reset link sent! Check your email."));
        } catch (err) {
            setMsg("❌ Failed: " + (err.response?.data || "User not found"));
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "50px auto", padding: 30 }} className="card">
            <h2 style={{ textAlign: "center" }}>Reset Password</h2>
            {msg && (
                <div style={{ textAlign: "center", fontWeight: "bold", marginBottom: 15 }}>
                    {msg.includes("http") ? (
                        <>
                            <p>{msg.split("http")[0]}</p>
                            <a href={`http${msg.split("http")[1]}`} style={{ color: "var(--primary)", textDecoration: "underline" }}>
                                Click here to reset password
                            </a>
                        </>
                    ) : (
                        msg
                    )}
                </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ padding: 10, borderRadius: 5, border: "1px solid #ccc" }}
                />
                <button className="primary-btn">Send Reset Link</button>
            </form>
            <Link to="/login" style={{ textAlign: "center", display: "block", marginTop: 15 }}>Back to Login</Link>
        </div>
    );
}
