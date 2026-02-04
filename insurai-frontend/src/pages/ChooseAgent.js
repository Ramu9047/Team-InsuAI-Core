import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api"; // Updated import path if needed (pages/.. is depth 2, so ../services/api is correct)
import { motion } from "framer-motion";

export default function ChooseAgent() {
  const [agents, setAgents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/agents")
      .then(r => setAgents(r.data))
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>Agents</span>
      </div>
      <h1 className="text-gradient">Our Expert Agents</h1>
      <p style={{ marginBottom: 30, opacity: 0.7 }}>Browse our qualified specialists or proceed to booking directly.</p>

      <div className="grid">
        {agents.map(a => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 15 }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#e0e7ff", color: "#4f46e5", display: "grid", placeItems: "center", fontSize: "1.2rem", fontWeight: "bold" }}>
                {a.name.charAt(0)}
              </div>
              <div>
                <h3 style={{ margin: 0 }}>{a.name}</h3>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{a.specialization || "General Insurance"}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, fontSize: "0.9rem", marginBottom: 20 }}>
              <span style={{ background: a.available ? "#dcfce7" : "#fee2e2", color: a.available ? "#166534" : "#b91c1c", padding: "2px 8px", borderRadius: 4 }}>
                {a.available ? "Online" : "Offline"}
              </span>
              <span>★ {a.rating || "4.8"}</span>
            </div>

            <button
              className="primary-btn"
              style={{ width: "100%" }}
              onClick={() => navigate("/schedule")}
            >
              Book Appointment
            </button>
          </motion.div>
        ))}
      </div>

      {agents.length === 0 && <p>Loading agents...</p>}
    </div>
  );
}
