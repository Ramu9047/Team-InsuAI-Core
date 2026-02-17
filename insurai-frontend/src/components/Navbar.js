import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import logoParticles from "../assets/logo-particles.svg";


export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Notification State for Toast only
    const [toast, setToast] = useState(null); // Ephemeral toast

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    // Close menu when navigating to a different page
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    // Polling for Notifications
    useEffect(() => {
        if (!user) return;

        const checkNotifications = async () => {
            try {
                const res = await api.get('/notifications');
                const newNotes = res.data;
                const latest = newNotes[0]; // Assumes desc sort

                if (latest) {
                    const storedId = sessionStorage.getItem('lastSeenNotifId');
                    // Store as string to handle potentially large IDs or type mismatches
                    const lastId = storedId || null;
                    const currentId = String(latest.id);

                    if (lastId === null) {
                        // First load, store current ID to prevent stale toast
                        sessionStorage.setItem('lastSeenNotifId', currentId);
                    } else if (currentId !== lastId) {
                        // New notification detected
                        const activityTime = new Date(latest.createdAt || latest.timestamp);
                        const isRecent = !isNaN(activityTime.getTime()) &&
                            activityTime > new Date(Date.now() - 60000); // 1 min window

                        if (isRecent) {
                            showToast(latest.message);
                        }
                        sessionStorage.setItem('lastSeenNotifId', currentId);
                    }
                }
            } catch (error) {
                // silent fail
            }
        };

        checkNotifications();
        const interval = setInterval(checkNotifications, 10000);

        return () => clearInterval(interval);
    }, [user]);

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

            <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={logoParticles} alt="InsurAI Logo" style={{ height: '40px' }} />
                InsurAI
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    Home
                </NavLink>

                {user ? (
                    <>
                        <NavLink to={
                            user.role === 'SUPER_ADMIN' ? "/super-admin" :
                                user.role === 'COMPANY' ? "/company" :
                                    user.role === 'ADMIN' ? "/admin" :
                                        "/dashboard"
                        } className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            Dashboard
                        </NavLink>

                        <NavLink to="/plans" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            Plans
                        </NavLink>

                        {/* Notification Bell Removed as per request */}
                        {/* Task handled by dashboard NotificationCenter */}

                        {/* User Dropdown */}
                        <div style={{ position: "relative" }} ref={menuRef}>
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
                                    position: "absolute", top: 60, right: 0,
                                    width: 280, padding: 15, borderRadius: 16, zIndex: 1000,
                                    boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
                                }}>
                                    <div style={{ padding: "10px 15px", borderBottom: "1px solid var(--nav-border)", marginBottom: 10 }}>
                                        <small style={{ color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Signed in as</small>
                                        <div style={{ fontWeight: 600, wordBreak: "break-all" }}>{user.email}</div>
                                    </div>

                                    {/* Agent vs User Links */}
                                    {user.role === 'AGENT' ? (
                                        <>
                                            <NavLink to="/agent/consultations" className="nav-link" style={{ display: "block", padding: "8px 15px" }}>My Consultations</NavLink>
                                            <NavLink to="/agent/performance" className="nav-link" style={{ display: "block", padding: "8px 15px" }}>My Performance</NavLink>
                                            <NavLink to="/agent/requests" className="nav-link" style={{ display: "block", padding: "8px 15px" }}>Agent Requests</NavLink>
                                        </>
                                    ) : user.role === 'USER' ? (
                                        <>
                                            <NavLink to="/my-bookings" className="nav-link" style={{ display: "block", padding: "8px 15px" }}>My Bookings</NavLink>
                                            <NavLink to="/plans-enhanced" className="nav-link" style={{ display: "block", padding: "8px 15px" }}>AI Recommendations</NavLink>
                                        </>
                                    ) : null}

                                    <NavLink to="/profile" className="nav-link" style={{ display: "block", padding: "8px 15px" }}>Profile</NavLink>

                                    {user.role === 'USER' && (
                                        <>
                                            <NavLink to="/my-policies" className="nav-link" style={{ display: "block", padding: "8px 15px" }}>My Policies</NavLink>
                                            <NavLink to="/claims" className="nav-link" style={{ display: "block", padding: "8px 15px" }}>My Claims</NavLink>
                                        </>
                                    )}
                                    <div
                                        onClick={handleLogout}
                                        style={{
                                            padding: "8px 15px", cursor: "pointer",
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
