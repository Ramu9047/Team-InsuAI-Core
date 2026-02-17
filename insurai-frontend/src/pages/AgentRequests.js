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
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, bookingId: null, reason: "" });

  useEffect(() => {
    if (user?.id) {
      api.get("/agents/appointments").then(res => {
        // Show all active/relevant statuses
        setRequests(res.data.filter(b => ["PENDING", "APPROVED", "COMPLETED", "REJECTED", "EXPIRED"].includes(b.status)));
      });
      api.get("/claims").then(res => setClaims(res.data)); // Agents view all claims
      api.get("/policies").then(res => setPolicies(res.data));
    }
  }, [user]);

  const updateStatus = async (id, status, extraBody = {}) => {
    try {
      await api.put(`/agents/appointments/${id}/status`, { status, ...extraBody });
      const res = await api.get("/agents/appointments"); // Refresh to get latest data (AI fields)
      setRequests(res.data.filter(b => ["PENDING", "APPROVED", "COMPLETED", "REJECTED", "EXPIRED"].includes(b.status)));

      if (status === 'APPROVED') notify("Meeting Approved!", "success");
      else if (status === 'COMPLETED') notify("Consultation Completed & Policy Issued!", "success");
      else if (status === 'REJECTED') notify("Appointment Rejected", "info");
    } catch (e) {
      notify("Failed to update status", "error");
    }
  };

  const submitRejection = () => {
    if (!rejectionModal.reason) {
      notify("Reason is required", "error");
      return;
    }
    updateStatus(rejectionModal.bookingId, "REJECTED", { reason: rejectionModal.reason });
    setRejectionModal({ isOpen: false, bookingId: null, reason: "" });
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

      {/* Rejection Modal */}
      <Modal
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, bookingId: null, reason: "" })}
        title="Reject Appointment"
        actions={
          <div style={{ display: "flex", gap: 10, width: "100%" }}>
            <button className="secondary-btn" onClick={() => setRejectionModal({ isOpen: false, bookingId: null, reason: "" })}>Cancel</button>
            <button className="primary-btn" style={{ background: "#ef4444", borderColor: "#ef4444" }} onClick={submitRejection}>Confirm Rejection</button>
          </div>
        }
      >
        <p style={{ color: "var(--text-muted)", marginBottom: 10 }}>Please provide a mandatory reason for rejection. AI will analyze this for the user.</p>
        <textarea
          style={{
            width: "100%", padding: 15, borderRadius: 12,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "white", fontFamily: "inherit", minHeight: 100
          }}
          placeholder="e.g. Income does not match policy requirements..."
          value={rejectionModal.reason}
          onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
        />
      </Modal>

      {activeTab === "appointments" && (
        requests.length === 0 ? (
          <div style={{ textAlign: "center", padding: 50, opacity: 0.6 }}>
            <p>No pending appointment requests.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 30 }}>
            {requests.map(b => (
              <Card key={b.id} style={{ display: "flex", flexDirection: "column", height: "100%", margin: "0 auto", width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{b.user.name}</span>
                  <span style={{
                    padding: "2px 8px", borderRadius: 10, fontSize: "0.8rem",
                    background: b.status === "PENDING" ? "rgba(245, 158, 11, 0.1)" : b.status === "APPROVED" ? "rgba(16, 185, 129, 0.1)" : b.status === "COMPLETED" ? "rgba(59, 130, 246, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    color: b.status === "PENDING" ? "#f59e0b" : b.status === "APPROVED" ? "#10b981" : b.status === "COMPLETED" ? "#3b82f6" : "#ef4444",
                    border: b.status === "PENDING" ? "1px solid rgba(245, 158, 11, 0.4)" : b.status === "APPROVED" ? "1px solid rgba(16, 185, 129, 0.4)" : b.status === "COMPLETED" ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)"
                  }}>{b.status === "COMPLETED" ? "CONSULTED" : b.status}</span>
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
                        onClick={() => setRejectionModal({ isOpen: true, bookingId: b.id, reason: "" })}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {b.status === "APPROVED" && (
                  <div style={{ marginTop: 15 }}>
                    {/* Meeting Link if available */}
                    {b.meetingLink && (
                      <a
                        href={b.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="primary-btn"
                        style={{
                          display: 'block',
                          textAlign: 'center',
                          marginBottom: 10,
                          background: '#22c55e',
                          borderColor: '#22c55e',
                          textDecoration: 'none'
                        }}
                      >
                        🎥 Join Meeting
                      </a>
                    )}

                    {/* Add to Google Calendar */}
                    {b.startTime && b.endTime && (
                      <a
                        href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Consultation with ${b.user.name}`)}&dates=${new Date(b.startTime).toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${new Date(b.endTime).toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(`Policy consultation for ${b.policy?.name || 'General Discussion'}`)}&location=${encodeURIComponent(b.meetingLink || 'To be shared')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="secondary-btn"
                        style={{
                          display: 'block',
                          textAlign: 'center',
                          marginBottom: 10,
                          textDecoration: 'none'
                        }}
                      >
                        📅 Add to Google Calendar
                      </a>
                    )}

                    {!b.policy && (
                      <>
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
                      </>
                    )}

                    {b.policy && (
                      <div style={{ marginTop: 10 }}>
                        <button
                          className="primary-btn"
                          style={{ width: "100%", background: "#3b82f6", borderColor: "#3b82f6", marginBottom: 10 }}
                          onClick={() => updateStatus(b.id, "COMPLETED")}
                        >
                          ✅ Complete Consultation & Issue Policy
                        </button>
                        <button
                          className="secondary-btn"
                          style={{ width: "100%", color: "#6b7280", borderColor: "#6b7280" }}
                          onClick={() => updateStatus(b.id, "EXPIRED")}
                        >
                          ⏳ Mark as Expired
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {b.status === "COMPLETED" && (
                  <div style={{ marginTop: 15, padding: 10, background: "rgba(59, 130, 246, 0.1)", borderRadius: 8, border: "1px solid rgba(59, 130, 246, 0.3)" }}>
                    <div style={{ fontWeight: "bold", color: "#3b82f6", marginBottom: 5 }}>Consultation Completed</div>
                    <div style={{ fontSize: "0.9rem" }}>Policy <strong>{b.policy?.name}</strong> has been issued (Payment Pending).</div>
                  </div>
                )}

                {b.status === "EXPIRED" && (
                  <div style={{ marginTop: 15, padding: 10, background: "rgba(107, 114, 128, 0.1)", borderRadius: 8, border: "1px solid rgba(107, 114, 128, 0.3)" }}>
                    <div style={{ fontWeight: "bold", color: "#6b7280", marginBottom: 5 }}>Consultation Expired</div>
                    <div style={{ fontSize: "0.9rem" }}>No action was taken during the scheduled time slot.</div>
                  </div>
                )}

                {b.status === "REJECTED" && (
                  <div style={{ marginTop: 15 }}>
                    <div style={{ padding: 10, background: "rgba(239, 68, 68, 0.1)", borderRadius: 8, border: "1px solid rgba(239, 68, 68, 0.3)", marginBottom: 10 }}>
                      <strong style={{ color: "#ef4444" }}>Rejection Reason:</strong>
                      <p style={{ fontSize: "0.9rem", margin: "5px 0" }}>{b.rejectionReason}</p>
                    </div>
                    {b.aiAnalysis && (
                      <div style={{ padding: 10, background: "rgba(139, 92, 246, 0.1)", borderRadius: 8, border: "1px solid rgba(139, 92, 246, 0.3)" }}>
                        <strong style={{ color: "#8b5cf6" }}>🤖 AI Analysis:</strong>
                        <div style={{ fontSize: "0.85rem", marginTop: 5 }}>
                          <div><strong>Risk Score:</strong> {b.riskScore ? (b.riskScore * 100).toFixed(0) + "%" : "N/A"}</div>
                          <p style={{ marginTop: 5 }}>{b.aiAnalysis}</p>
                        </div>
                      </div>
                    )}
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 30 }}>
            {/* Map claims... */}
            {claims.map(c => (
              <Card key={c.id} style={{ display: "flex", flexDirection: "column", height: "100%", margin: "0 auto", width: "100%" }}>
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

                <div style={{ marginTop: "auto" }}>
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
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
