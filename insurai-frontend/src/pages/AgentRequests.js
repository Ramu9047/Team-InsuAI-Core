import { useEffect, useState } from "react";
import api from "../services/api";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import Modal from "../components/Modal";

export default function AgentRequests() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [requests, setRequests] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [profileModal, setProfileModal] = useState({ isOpen: false, user: null });
  const [note, setNote] = useState("");
  const [activeTab, setActiveTab] = useState("appointments");
  const [claims, setClaims] = useState([]);
  const [viewedProfiles, setViewedProfiles] = useState(new Set());
  const [proofModal, setProofModal] = useState({ isOpen: false, url: "" });

  useEffect(() => {
    if (user?.id) {
      api.get("/agents/appointments").then(res => {
        setRequests(res.data.filter(b => b.status === "PENDING" || b.status === "APPROVED"));
      });
      api.get("/claims").then(res => setClaims(res.data)); // Agents view all claims
      api.get("/policies").then(res => setPolicies(res.data));
    }
  }, [user]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/agents/appointments/${id}/status`, { status });
      setRequests(r => r.map(b => b.id === id ? { ...b, status } : b));
      if (status === 'APPROVED') notify("Appointment Approved & Policy Created!", "success");
      else notify("Appointment Rejected", "error");
    } catch (e) {
      notify("Failed to update status", "error");
    }
  };

  const updateClaimStatus = async (id, status) => {
    try {
      await api.put(`/claims/${id}/status?status=${status}`);
      setClaims(c => c.map(cl => cl.id === id ? { ...cl, status } : cl));
      notify(`Claim ${status}`, "success");
    } catch (e) {
      notify("Failed to update claim", "error");
    }
  };

  const handleViewProfile = (user) => {
    setProfileModal({ isOpen: true, user });
    setViewedProfiles(prev => new Set(prev).add(user.id));
  };

  const recommendPolicy = async (booking, policyId) => {
    try {
      await api.post("/agents/recommendations", {
        userId: booking.user.id,
        policyId: policyId,
        note: note
      });
      notify("Policy Recommended successfully!", "success");
      setSelectedBooking(null);
      setNote("");
    } catch (e) {
      console.error(e);
      notify("Failed to recommend policy", "error");
    }
  };

  if (!user || user.role !== 'AGENT') return <div style={{ padding: 40 }}>Access Denied</div>;

  return (
    <div className="container" style={{ marginTop: 20 }}>
      {/* Proof Modal */}
      <Modal
        isOpen={proofModal.isOpen}
        onClose={() => setProofModal({ isOpen: false, url: "" })}
        title="Claim Proof Document"
      >
        <div style={{ textAlign: 'center', padding: 20 }}>
          {proofModal.url ? (
            <div style={{ padding: 20, background: "rgba(255,255,255,0.1)", borderRadius: 8 }}>
              <div style={{ fontSize: "3rem", marginBottom: 10 }}>📄</div>
              <p style={{ wordBreak: "break-all" }}>Document: <strong>{proofModal.url.split('/').pop()}</strong></p>
              <a href={proofModal.url} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "underline", fontWeight: "bold" }}>
                Download / View Document
              </a>
            </div>
          ) : (
            <div style={{ padding: 30, background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
              <div style={{ fontSize: "2rem", marginBottom: 10 }}>📂</div>
              <p>No proof document has been uploaded by the user.</p>
            </div>
          )}
        </div>
      </Modal>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <h2 className="text-gradient" style={{ margin: 0 }}>Agent Dashboard</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setActiveTab("appointments")}
            style={{
              padding: "8px 16px", background: activeTab === "appointments" ? "var(--primary)" : "transparent",
              border: "1px solid var(--primary)",
              borderRadius: 20, color: activeTab === "appointments" ? "white" : "var(--primary)", cursor: "pointer"
            }}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab("claims")}
            style={{
              padding: "8px 16px", background: activeTab === "claims" ? "var(--primary)" : "transparent",
              border: "1px solid var(--primary)",
              borderRadius: 20, color: activeTab === "claims" ? "white" : "var(--primary)", cursor: "pointer"
            }}
          >
            Start Claims Process
          </button>
        </div>
      </div>

      {/* Profile Viewer Modal */}
      <Modal
        isOpen={profileModal.isOpen}
        onClose={() => setProfileModal({ isOpen: false, user: null })}
        title="User Profile"
      >
        {profileModal.user && (
          <div style={{ color: "var(--text-main)" }}>
            <p><strong>Name:</strong> {profileModal.user.name}</p>
            <p><strong>Email:</strong> {profileModal.user.email}</p>
            <div style={{ height: 1, background: "var(--glass-border)", margin: "10px 0" }}></div>
            <p><strong>Age:</strong> {profileModal.user.age || 'N/A'}</p>
            <p><strong>Income:</strong> {profileModal.user.income ? `₹${profileModal.user.income}` : 'N/A'}</p>
            <p><strong>Health Info:</strong> {profileModal.user.healthInfo || 'N/A'}</p>
          </div>
        )}
      </Modal>

      {/* Recommendation Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title={`Recommend for ${selectedBooking?.user.name}`}
        actions={<button className="secondary-btn" onClick={() => setSelectedBooking(null)}>Cancel</button>}
      >
        <p style={{ marginBottom: 15, color: "var(--text-muted)" }}>Select a policy to send as a quote:</p>
        <textarea
          placeholder="Reason for recommendation (e.g. Best fit for age 30...)"
          style={{
            width: "100%", padding: 15, marginBottom: 20, borderRadius: 12,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "white", fontFamily: "inherit"
          }}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        ></textarea>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "40vh", overflowY: "auto" }}>
          {policies.map(p => (
            <div key={p.id}
              onClick={() => recommendPolicy(selectedBooking, p.id)}
              style={{
                padding: 15, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
                cursor: "pointer", transition: "all 0.2s", background: "rgba(255,255,255,0.02)"
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = "var(--primary)"}
              onMouseOut={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
            >
              <div style={{ fontWeight: "bold", color: "var(--text-main)" }}>{p.name}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Premium: ₹{p.premium} | Cover: ₹{p.coverage}</div>
            </div>
          ))}
        </div>
      </Modal>

      {activeTab === "appointments" && (
        requests.length === 0 ? (
          <div style={{ textAlign: "center", padding: 50, opacity: 0.6 }}>
            <p>No pending appointment requests.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 30, alignItems: "start" }}>
            {requests.map(b => (
              <Card key={b.id} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{b.user.name}</span>
                  <span style={{
                    padding: "2px 8px", borderRadius: 10, fontSize: "0.8rem",
                    background: b.status === "PENDING" ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)",
                    color: b.status === "PENDING" ? "#f59e0b" : "#10b981",
                    border: b.status === "PENDING" ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid rgba(16, 185, 129, 0.4)"
                  }}>{b.status}</span>
                </div>
                <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "var(--text-muted)" }}>📅 {new Date(b.startTime).toLocaleString()}</p>

                {b.policy ? (
                  <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: 10, borderRadius: 8, margin: "10px 0", borderLeft: "4px solid #10b981" }}>
                    <strong style={{ color: "#10b981" }}>Purchase Request:</strong>
                    <div style={{ fontSize: "1rem", fontWeight: "bold" }}>{b.policy.name}</div>
                    <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>Premium: ₹{b.policy.premium}</div>
                  </div>
                ) : b.reason && (
                  <div style={{ background: "rgba(255,255,255,0.03)", padding: 8, borderRadius: 4, margin: "10px 0", fontSize: "0.9rem" }}>
                    <strong>Goal:</strong> {b.reason}
                  </div>
                )}

                <button
                  className="secondary-btn"
                  style={{ width: "100%", marginBottom: 10, marginTop: "auto", fontSize: "0.85rem", background: viewedProfiles.has(b.user.id) ? "rgba(34, 197, 94, 0.1)" : "transparent", borderColor: viewedProfiles.has(b.user.id) ? "#22c55e" : "rgba(255,255,255,0.2)" }}
                  onClick={() => handleViewProfile(b.user)}
                >
                  {viewedProfiles.has(b.user.id) ? "✅ Profile Analyzed" : "🔍 Analyze User Profile"}
                </button>

                {b.status === "PENDING" && (
                  <div style={{ marginTop: 15 }}>
                    {!viewedProfiles.has(b.user.id) && (
                      <div style={{ fontSize: "0.8rem", color: "#f59e0b", textAlign: "center", marginBottom: 5 }}>
                        ⚠️ Analyze profile before decision
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        className="primary-btn"
                        style={{ flex: 1, padding: "8px", opacity: viewedProfiles.has(b.user.id) ? 1 : 0.5, cursor: viewedProfiles.has(b.user.id) ? "pointer" : "not-allowed" }}
                        onClick={() => viewedProfiles.has(b.user.id) && updateStatus(b.id, "APPROVED")}
                        disabled={!viewedProfiles.has(b.user.id)}
                      >
                        {b.policy ? "Approve Issue" : "Approve Meeting"}
                      </button>
                      <button
                        className="secondary-btn"
                        style={{ flex: 1, padding: "8px", color: "#ef4444", borderColor: "#ef4444" }}
                        onClick={() => updateStatus(b.id, "REJECTED")}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {b.status === "APPROVED" && !b.policy && (
                  <div style={{ marginTop: 15 }}>
                    {!viewedProfiles.has(b.user.id) ? (
                      <div style={{ fontSize: "0.8rem", color: "#f59e0b", textAlign: "center", marginBottom: 5 }}>
                        ⚠️ Analyze profile before recommending
                      </div>
                    ) : null}
                    <button
                      className="primary-btn"
                      style={{ width: "100%", background: "#6366f1", border: "none", opacity: viewedProfiles.has(b.user.id) ? 1 : 0.5, cursor: viewedProfiles.has(b.user.id) ? "pointer" : "not-allowed" }}
                      onClick={() => viewedProfiles.has(b.user.id) && setSelectedBooking(b)}
                      disabled={!viewedProfiles.has(b.user.id)}
                    >
                      ✨ Recommend Policy
                    </button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )
      )}

      {activeTab === "claims" && (
        <>
          {claims.filter(c => ['PENDING', 'INITIATED'].includes(c.status)).length === 0 && (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)" }}>
              <p>✅ All caught up! No pending claims to review.</p>
            </div>
          )}
          <div className="grid">
            {/* Map claims... */}
            {claims.map(c => (
              <Card key={c.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
                  <div>
                    <strong style={{ fontSize: "1.1rem", display: "block" }}>Claim #{c.id}</strong>
                    <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{new Date().toLocaleDateString()}</span>
                  </div>
                  <span style={{
                    padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, height: "fit-content",
                    background: c.status === 'APPROVED' ? "#dcfce7" : c.status === 'REJECTED' ? "#fee2e2" : "#fef9c3",
                    color: c.status === 'APPROVED' ? "#15803d" : c.status === 'REJECTED' ? "#b91c1c" : "#854d0e"
                  }}>{c.status}</span>
                </div>
                <p><strong>Policy:</strong> {c.policyName}</p>
                <p style={{ opacity: 0.8, marginBottom: 15, fontSize: "0.95rem", lineHeight: "1.5", color: "var(--text-main)" }}>{c.description}</p>

                <button
                  className="secondary-btn"
                  style={{ width: "100%", marginBottom: 15 }}
                  onClick={() => {
                    let url = c.proofUrl || (c.documentUrls && c.documentUrls.length > 0 ? c.documentUrls[0] : null) || c.attachedFile;
                    // Temp Fix: Replace broken mock domain with working dummy PDF for historical data
                    if (url && url.includes("insurai-docs.com")) {
                      url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
                    }
                    setProofModal({ isOpen: true, url: url });
                  }}
                >
                  📄 Evaluate Proofs
                </button>

                {['PENDING', 'INITIATED'].includes(c.status) ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <button className="primary-btn" onClick={() => updateClaimStatus(c.id, "APPROVED")} style={{ padding: "8px", background: "#10b981", border: "none" }}>Approve Claim</button>
                    <button className="secondary-btn" onClick={() => updateClaimStatus(c.id, "REJECTED")} style={{ padding: "8px", color: "#ef4444", borderColor: "#ef4444" }}>Reject Claim</button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", color: "var(--text-muted)" }}>Process Completed</div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
