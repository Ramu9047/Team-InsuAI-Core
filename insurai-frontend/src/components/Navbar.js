import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import api from "../services/api";


export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);

    // Notification State
    const [notifications, setNotifications] = useState([]);
    const [badge, setBadge] = useState(0);
    const [toast, setToast] = useState(null); // Ephemeral toast

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    // Polling for Notifications
    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async (isFirstLoad = false) => {
            try {
                const res = await api.get('/notifications');
                const newNotes = res.data;

                // Live Alert Logic
                if (!isFirstLoad && newNotes.length > notifications.length) {
                    const latest = newNotes[0]; // Assumes backend sorts desc
                    // Only toast if it was created recently (e.g. last 10 seconds) to avoid spamming old notes on re-connect
                    if (new Date(latest.createdAt) > new Date(Date.now() - 20000)) {
                        showToast(latest.message);
                    }
                }

                setNotifications(newNotes);
                setBadge(newNotes.length);
            } catch (error) {
                // silent fail
            }
        };

        fetchNotifications(true);
        const interval = setInterval(fetchNotifications, 10000); // Poll every 10s

        return () => clearInterval(interval);
    }, [user, notifications.length]); // Dependency on length helps detection logic

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.filter(n => n.id !== id));
            setBadge(prev => Math.max(0, prev - 1));
        } catch (e) {
            console.error(e);
        }
    };

    const markAllRead = async () => {
        // Optimistic update
        const ids = notifications.map(n => n.id);
        setNotifications([]);
        setBadge(0);
        ids.forEach(id => api.put(`/notifications/${id}/read`).catch(() => { }));
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 5000);
    };

    return (
        <nav className="navbar">
            {/* Toast Notification */}
            {toast && (
                <div style={{
                    position: "fixed", top: 80, right: 20, zIndex: 2000,
                    background: "var(--card-bg)", borderLeft: "4px solid var(--primary)",
                    padding: "15px 20px", borderRadius: 8, boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                    animation: "slideIn 0.3s ease-out", color: "var(--text-main)", maxWidth: 350
                }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>🔔</span>
                        <div>
                            <strong style={{ display: "block", marginBottom: 5 }}>New Notification</strong>
                            <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>{toast}</div>
                        </div>
                    </div>
                </div>
            )}

            <Link to="/" className="logo">
                🛡️ InsurAI
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    Home
                </NavLink>

                {user ? (
                    <>
                        <NavLink to={user.role === 'ADMIN' ? "/admin" : "/dashboard"} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            Dashboard
                        </NavLink>

                        <NavLink to="/plans" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            Plans
                        </NavLink>

                        {/* Notification Bell */}
                        <div style={{ position: "relative" }}>
                            <div
                                onClick={() => setNotificationOpen(!notificationOpen)}
                                style={{
                                    cursor: "pointer", position: "relative", width: 40, height: 40,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    borderRadius: "50%", background: notificationOpen ? "rgba(255,255,255,0.1)" : "transparent"
                                }}
                            >
                                <span style={{ fontSize: 20 }}>🔔</span>
                                {badge > 0 && (
                                    <span style={{
                                        position: "absolute", top: 5, right: 5,
                                        background: "#ef4444", color: "white", fontSize: 10, fontWeight: "bold",
                                        width: 16, height: 16, borderRadius: "50%",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                                    }}>
                                        {badge}
                                    </span>
                                )}
                            </div>

                            {notificationOpen && (
                                <div className="card" style={{
                                    position: "absolute", top: 50, right: -60,
                                    width: 320, padding: 0, borderRadius: 12, zIndex: 100,
                                    boxShadow: "0 10px 40px rgba(0,0,0,0.5)", overflow: "hidden",
                                    border: "1px solid var(--card-border)"
                                }}>
                                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--nav-border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)" }}>
                                        <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Notifications</h4>
                                        {notifications.length > 0 && (
                                            <button
                                                onClick={markAllRead}
                                                style={{ border: "none", background: "none", color: "var(--primary)", fontSize: "0.8rem", cursor: "pointer", padding: 0 }}
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ maxHeight: 350, overflowY: "auto" }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: "30px 20px", textAlign: "center", opacity: 0.6, fontSize: "0.9rem" }}>
                                                <div style={{ fontSize: 24, marginBottom: 5 }}>💤</div>
                                                No new notifications
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => markAsRead(n.id)}
                                                    style={{
                                                        padding: "12px 16px", borderBottom: "1px solid var(--nav-border)",
                                                        cursor: "pointer", transition: "all 0.2s",
                                                        background: "transparent"
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                                >
                                                    <div style={{ fontSize: "0.9rem", marginBottom: 4, lineHeight: 1.4 }}>{n.message}</div>
                                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                                                        <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        <span style={{ color: n.type === 'SUCCESS' ? '#22c55e' : n.type === 'WARNING' ? '#eab308' : 'var(--primary)' }}>• {n.type}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Dropdown */}
                        <div style={{ position: "relative" }}>
                            <div
                                onClick={() => setMenuOpen(!menuOpen)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    cursor: "pointer",
                                    padding: "6px 12px",
                                    background: "rgba(0,0,0,0.05)",
                                    borderRadius: 30
                                }}
                            >
                                <div style={{
                                    width: 32, height: 32, borderRadius: "50%",
                                    background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                                    color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold"
                                }}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 500 }}>{user.name.split(" ")[0]}</span>
                            </div>

                            {menuOpen && (
                                <div className="card" style={{
                                    position: "absolute", top: 50, right: 0,
                                    width: 200, padding: 10, borderRadius: 16, zIndex: 50
                                }}>
                                    <div style={{ padding: 10, borderBottom: "1px solid var(--nav-border)", marginBottom: 5 }}>
                                        <small style={{ color: "var(--text-muted)" }}>Signed in as</small>
                                        <div style={{ fontWeight: 600 }}>{user.email}</div>
                                    </div>

                                    {/* Agent vs User Links */}
                                    {user.role === 'AGENT' ? (
                                        <>
                                            <NavLink to="/agent/consultations" className="nav-link" style={{ display: "block" }}>My Consultations</NavLink>
                                            <NavLink to="/agent/performance" className="nav-link" style={{ display: "block" }}>My Performance</NavLink>
                                            <NavLink to="/agent/requests" className="nav-link" style={{ display: "block" }}>Agent Requests</NavLink>
                                        </>
                                    ) : user.role === 'USER' ? (
                                        <>
                                            <NavLink to="/my-bookings" className="nav-link" style={{ display: "block" }}>My Bookings</NavLink>
                                            <NavLink to="/plans-enhanced" className="nav-link" style={{ display: "block" }}>AI Recommendations</NavLink>
                                        </>
                                    ) : null}

                                    <NavLink to="/profile" className="nav-link" style={{ display: "block" }}>Profile</NavLink>

                                    {user.role === 'USER' && (
                                        <>
                                            <NavLink to="/my-policies" className="nav-link" style={{ display: "block" }}>My Policies</NavLink>
                                            <NavLink to="/claims" className="nav-link" style={{ display: "block" }}>My Claims</NavLink>
                                        </>
                                    )}
                                    <div
                                        onClick={handleLogout}
                                        style={{
                                            padding: "10px 16px", cursor: "pointer",
                                            color: "#ef4444", fontWeight: 500, marginTop: 5, borderRadius: 8
                                        }}
                                        className="nav-link"
                                    >
                                        Logout
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <NavLink to="/login" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            Login
                        </NavLink>
                        <Link to="/register">
                            <button className="primary-btn" style={{ padding: "8px 20px", fontSize: 14 }}>Get Started</button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
