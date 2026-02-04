import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <div className="card" style={{
      width: 260,
      height: "94vh",
      margin: "3vh 0 0 20px",
      padding: 24,
      position: "fixed",
      left: 0,
      top: 0,
      display: "flex",
      flexDirection: "column",
      gap: 5,
      borderRadius: 24,
      zIndex: 100,
      overflowY: "auto"
    }}>
      <div style={{ padding: "0 10px 20px 10px" }}>
        <h2 style={{ margin: 0, fontSize: 26, background: "linear-gradient(to right, #6366f1, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          InsurAI
        </h2>
        {user && (
          <div style={{ marginTop: 5 }}>
            <span style={{
              fontSize: 11, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em",
              background: user.role === 'ADMIN' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(99, 102, 241, 0.1)',
              color: user.role === 'ADMIN' ? 'var(--secondary)' : 'var(--primary)',
              padding: "2px 8px", borderRadius: 4
            }}>
              {user.role} Portal
            </span>
          </div>
        )}
      </div>

      <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        🏠 Home
      </NavLink>

      {user ? (
        <>
          <div style={{ margin: "15px 0 5px 15px", fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700, opacity: 0.6 }}>Main Menu</div>

          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            📊 Dashboard
          </NavLink>

          <NavLink to="/schedule" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            📅 Appointments
          </NavLink>

          <NavLink to="/my-policies" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            🛡️ My Policies
          </NavLink>

          <NavLink to="/my-bookings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            📑 History
          </NavLink>

          <NavLink to="/claims" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            ⚠️ Claims
          </NavLink>

          {/* New Upgrade/Renew Link for Sales */}
          <NavLink to="/plans" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            ⭐ Upgrade Plan
          </NavLink>

          {/* Contextual CTA Banner */}
          <div className="cta-banner" style={{ marginTop: "auto", padding: 20 }}>
            <h4 style={{ margin: "0 0 5px 0", fontSize: "1rem" }}>Need Help?</h4>
            <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.9, lineHeight: 1.4 }}>
              Our top agents are available for consultation.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 15 }}>
              <NavLink to="/choose-agent">
                <button style={{
                  width: "100%", border: "none",
                  background: "rgba(255,255,255,0.2)", color: "white",
                  padding: "8px", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem"
                }}>
                  Find Agent →
                </button>
              </NavLink>
              {/* Secondary Renew/Upgrade CTA in banner */}
              <NavLink to="/plans">
                <button style={{
                  width: "100%", border: "1px solid rgba(255,255,255,0.4)",
                  background: "transparent", color: "white",
                  padding: "8px", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem"
                }}>
                  Renew / Upgrade
                </button>
              </NavLink>
            </div>
          </div>

          <div style={{ padding: "15px 0", borderTop: "1px solid var(--card-border)", marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 15 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                {user.name.charAt(0)}
              </div>
              <div style={{ overflow: "hidden" }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</p>
                <p style={{ margin: 0, fontSize: 11, opacity: 0.6 }}>{user.email}</p>
              </div>
            </div>
            <button key="logout-btn" onClick={logout} className="secondary-btn" style={{ width: "100%", padding: "8px", fontSize: 13 }}>
              Sign Out
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ margin: "15px 0 5px 15px", fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700, opacity: 0.6 }}>Account</div>
          <NavLink to="/login" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            🔐 Login
          </NavLink>
          <NavLink to="/register" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            ✨ Register
          </NavLink>
        </>
      )}
    </div>
  );
}
