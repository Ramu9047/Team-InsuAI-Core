import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div style={{ position: "fixed", top: 20, right: 80, zIndex: 200 }}>
      <div onClick={() => setOpen(!open)} style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: "linear-gradient(135deg,#6366f1,#ec4899)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        cursor: "pointer",
        boxShadow: "0 4px 10px rgba(99, 102, 241, 0.4)"
      }}>
        {user.name.charAt(0).toUpperCase()}
      </div>

      {open && (
        <div className="card" style={{
          position: "absolute",
          right: 0,
          top: 60,
          padding: 10,
          minWidth: 160,
          borderRadius: 16
        }}>
          <div style={{ padding: "8px 12px", opacity: 0.7, fontSize: 13 }}>{user.email}</div>
          <div
            onClick={() => { logout(); setOpen(false); }}
            style={{ padding: "10px 12px", cursor: "pointer", color: "#ef4444", fontWeight: 500, borderRadius: 8, transition: "background 0.2s" }}
            onMouseEnter={e => e.target.style.background = "rgba(239, 68, 68, 0.1)"}
            onMouseLeave={e => e.target.style.background = "transparent"}
          >
            Logout
          </div>
        </div>
      )}
    </div>
  );
}
