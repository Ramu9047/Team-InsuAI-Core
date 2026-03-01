import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import Modal from "../components/Modal";
import { motion } from "framer-motion";

const PolicyStatusTracker = ({ status }) => {
    // Map system statuses to the 5-step flow
    // Steps: 0:Applied, 1:Processing, 2:Approved, 3:Active, 4:Renewed
    let stepIndex = 0;

    if (['QUOTED', 'PAYMENT_PENDING', 'APPROVED'].includes(status)) {
        stepIndex = 2;
    } else if (status === 'ACTIVE') {
        stepIndex = 3;
    } else if (status === 'RENEWED') {
        stepIndex = 4;
    }

    const steps = ['Applied', 'Processing', 'Approved', 'Active', 'Renewed'];

    return (
        <div style={{ marginTop: 20, marginBottom: 15, padding: '0 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                {steps.map((step, idx) => {
                    const isCompleted = idx <= stepIndex;
                    const isActive = idx === stepIndex;
                    return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '20%' }}>
                            <div style={{
                                width: 24, height: 24, borderRadius: '50%',
                                background: isCompleted ? (isActive && idx !== 4 ? '#6366f1' : '#22c55e') : 'rgba(255,255,255,0.1)',
                                border: `2px solid ${isCompleted ? (isActive && idx !== 4 ? '#6366f1' : '#22c55e') : 'rgba(255,255,255,0.2)'}`,
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.7rem', fontWeight: 700, marginBottom: 6,
                                boxShadow: isActive ? `0 0 10px ${isActive && idx !== 4 ? '#6366f1' : '#22c55e'}` : 'none'
                            }}>
                                {isCompleted ? '✓' : idx + 1}
                            </div>
                            <span style={{
                                fontSize: '0.7rem', fontWeight: isActive ? 700 : 500,
                                color: isCompleted ? 'var(--text-main)' : 'var(--text-muted)',
                                textAlign: 'center'
                            }}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
            {/* Connecting lines */}
            <div style={{ position: 'relative', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, top: '-36px', zIndex: 0, margin: '0 10%' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stepIndex / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', background: stepIndex >= 3 ? '#22c55e' : '#6366f1', borderRadius: 2 }}
                />
            </div>
        </div>
    );
};

export default function MyPolicies() {
    const { user } = useAuth();
    const { notify, refreshSignal, triggerRefresh } = useNotification();
    const navigate = useNavigate();
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ isOpen: false, title: "", content: "", onConfirm: null });

    useEffect(() => {
        if (user && user.role === 'USER') {
            api.get(`/policies/user/${user.id}`)
                .then(r => setPolicies(r.data))
                .catch(console.error)
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user, refreshSignal]);

    const handleConfirm = (title, content, action) => {
        setModal({
            isOpen: true,
            title,
            content,
            onConfirm: async () => {
                await action();
                setModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    }

    if (!user || user.role !== 'USER') {
        return (
            <div style={{ textAlign: "center", marginTop: 50 }}>
                <h2>Access Restricted</h2>
                <p>Agents and Admins cannot manage personal policies here.</p>
            </div>
        );
    }

    if (loading) return <div style={{ textAlign: "center", marginTop: 50 }}>Loading policies...</div>;

    return (
        <div>
            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
                title={modal.title}
                actions={
                    <>
                        <button className="secondary-btn" onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}>Cancel</button>
                        <button className="primary-btn" onClick={modal.onConfirm}>Confirm</button>
                    </>
                }
            >
                {modal.content}
            </Modal>

            <div className="breadcrumbs">
                <Link to="/">Home</Link>
                <span>/</span>
                <span>My Policies</span>
            </div>
            <h1 className="text-gradient">My Active Policies</h1>

            {policies.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    style={{
                        margin: "50px auto", maxWidth: 500, padding: 50,
                        background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)',
                        borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)',
                        textAlign: "center", boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}
                >
                    <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 30px' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            style={{ position: 'absolute', inset: 0, border: '2px dashed rgba(99,102,241,0.3)', borderRadius: '50%' }}
                        />
                        <div style={{ position: 'absolute', inset: 10, background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4.5rem', boxShadow: 'inset 0 0 20px rgba(99,102,241,0.2)' }}>
                            📋
                        </div>
                    </div>
                    <h2 style={{ fontSize: "1.8rem", marginBottom: 15, background: 'linear-gradient(to right, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                        Secure Your Future
                    </h2>
                    <p style={{ fontSize: "1rem", color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 30 }}>
                        You don't have any active policies yet. Explore our AI-curated insurance plans designed specifically for your unique needs.
                    </p>
                    <button className="primary-btn" onClick={() => navigate('/plans')} style={{ padding: '14px 35px', fontSize: '1.1rem', borderRadius: 30, boxShadow: '0 8px 20px rgba(99,102,241,0.4)' }}>
                        Explore Plans 🚀
                    </button>
                </motion.div>
            ) : (
                <div className="grid">
                    {policies.sort((a, b) => {
                        const score = (s) => ['QUOTED', 'PAYMENT_PENDING'].includes(s) ? 0 : 1;
                        return score(a.status) - score(b.status) || a.id - b.id;
                    }).map(up => (
                        <div key={up.id} className="card" style={{ borderTop: `4px solid ${['QUOTED', 'PAYMENT_PENDING'].includes(up.status) ? '#eab308' : '#22c55e'}`, display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <h3>{up.policy.name}</h3>
                                <span style={{
                                    background: ['QUOTED', 'PAYMENT_PENDING'].includes(up.status) ? "rgba(234, 179, 8, 0.1)" : "rgba(34, 197, 94, 0.1)",
                                    color: ['QUOTED', 'PAYMENT_PENDING'].includes(up.status) ? "#eab308" : "#22c55e",
                                    padding: "4px 10px", borderRadius: 20, fontSize: "0.8rem", fontWeight: "bold"
                                }}>
                                    {up.status.replace('_', ' ')}
                                </span>
                            </div>
                            <p style={{ marginBottom: 5, opacity: 0.8, fontSize: "0.9rem" }}>{up.policy.description}</p>

                            <PolicyStatusTracker status={up.status} />

                            {up.recommendationNote && (
                                <div style={{ background: "rgba(234, 179, 8, 0.1)", padding: "10px", borderRadius: 8, marginTop: 10, fontSize: "0.9rem", color: "#eab308", border: "1px solid rgba(234, 179, 8, 0.2)" }}>
                                    <strong>💡 Agent Note:</strong> {up.recommendationNote}
                                </div>
                            )}

                            {['QUOTED', 'PAYMENT_PENDING'].includes(up.status) ? (
                                <div style={{ marginTop: "auto", paddingTop: 20 }}>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 15 }}>
                                        Policy approved/quoted. Complete payment to activate coverage.
                                    </p>
                                    <button
                                        className="primary-btn"
                                        style={{ width: "100%", background: "rgba(234, 179, 8, 0.2)", border: "1px solid #eab308", color: "#eab308" }}
                                        onClick={async () => {
                                            try {
                                                await api.post(`policies/${up.id}/purchase`);
                                                notify("Payment Successful! Policy is now ACTIVE ✅", "success");
                                                triggerRefresh();
                                            } catch (e) {
                                                console.error(e);
                                                notify("Payment Failed", "error");
                                            }
                                        }}
                                    >
                                        💳 Pay Premium & Activate
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: 15, marginTop: 15, fontSize: "0.9rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                            <span style={{ color: "var(--text-muted)" }}>Start Date:</span>
                                            <strong>{up.startDate}</strong>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "var(--text-muted)" }}>Valid Till:</span>
                                            <strong>{up.endDate}</strong>
                                        </div>

                                        {(() => {
                                            const end = new Date(up.endDate);
                                            const today = new Date();
                                            const diffTime = end - today;
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                            if (diffDays > 0 && diffDays < 30) {
                                                const handleRenew = () => {
                                                    handleConfirm(
                                                        "Renew Policy",
                                                        "Proceed to renew this policy for another year? Premium will be deducted.",
                                                        async () => {
                                                            notify("Processing Renewal Payment...", "info");
                                                            setTimeout(() => {
                                                                notify("Renewal Successful! Policy extended by 1 year. 📅", "success");
                                                                up.endDate = new Date(end.setFullYear(end.getFullYear() + 1)).toISOString().split('T')[0];
                                                                triggerRefresh();
                                                            }, 2000);
                                                        }
                                                    );
                                                };

                                                return (
                                                    <div style={{ marginTop: 10, padding: 8, background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderRadius: 4, textAlign: "center", fontSize: "0.85rem", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                                                        ⚠️ <strong>Action Required:</strong> Policy expires in {diffDays} days.
                                                        <button
                                                            style={{ marginLeft: 10, padding: "4px 10px", fontSize: "0.8rem", cursor: "pointer", background: "#ef4444", color: "white", border: "none", borderRadius: 4 }}
                                                            onClick={handleRenew}
                                                        >
                                                            Renew Now
                                                        </button>
                                                    </div>
                                                )
                                            }
                                        })()}
                                    </div>
                                    <div style={{ marginTop: "auto", paddingTop: 20 }}>
                                        <div style={{ display: "flex", gap: 10 }}>
                                            <button
                                                onClick={() => {
                                                    if (up.pdfUrl) window.open(up.pdfUrl, '_blank');
                                                    else notify("No document uploaded yet.", "error");
                                                }}
                                                className="secondary-btn"
                                                style={{ flex: 1, padding: "8px 12px", fontSize: "0.9rem" }}
                                            >
                                                📄 View PDF
                                            </button>
                                            <button
                                                onClick={() => document.getElementById(`file-upload-${up.id}`).click()}
                                                style={{
                                                    flex: 1,
                                                    background: "rgba(99, 102, 241, 0.1)",
                                                    color: "var(--primary)",
                                                    border: "1px solid rgba(99, 102, 241, 0.3)",
                                                    padding: "8px 12px",
                                                    borderRadius: "50px",
                                                    cursor: "pointer",
                                                    fontWeight: 600,
                                                    fontSize: "0.9rem",
                                                    transition: "all 0.2s"
                                                }}
                                            >
                                                📤 Upload
                                            </button>
                                            <input
                                                type="file"
                                                id={`file-upload-${up.id}`}
                                                style={{ display: "none" }}
                                                accept="application/pdf"
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;

                                                    const formData = new FormData();
                                                    formData.append("file", file);

                                                    try {
                                                        await api.post(`/policies/upload/${up.id}`, formData, {
                                                            headers: { 'Content-Type': 'multipart/form-data' }
                                                        });
                                                        triggerRefresh();
                                                    } catch (err) {
                                                        console.error(err);
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={() => navigate("/schedule-appointment", { state: { policy: up.policy } })}
                                                className="primary-btn"
                                                style={{
                                                    flex: 1.5,
                                                    padding: "8px 12px",
                                                    fontSize: "0.9rem",
                                                    background: "linear-gradient(135deg, #10b981, #059669)",
                                                    border: "none",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: "6px"
                                                }}
                                            >
                                                🔍 Book Enquiry
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
