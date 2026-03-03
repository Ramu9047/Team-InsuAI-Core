import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import Modal from "../components/Modal";
import { motion } from "framer-motion";

export default function AgentRequests() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [requests, setRequests] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [profileModal, setProfileModal] = useState({ isOpen: false, user: null });
  const [note, setNote] = useState("");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [activeTab, setActiveTab] = useState(queryParams.get('tab') || "appointments");
  const [claims, setClaims] = useState([]);
  const [viewedProfiles, setViewedProfiles] = useState(new Set());
  const [proofModal, setProofModal] = useState({ isOpen: false, url: "" });
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, bookingId: null, reason: "" });

  useEffect(() => {
    if (user?.id) {
      api.get("/agents/appointments").then(res => {
        // Show all active/relevant statuses
        setRequests(res.data.filter(b => ["PENDING", "APPROVED", "COMPLETED", "REJECTED", "EXPIRED"].includes(b.status)));
      }).catch(err => {
        console.error("Failed to fetch appointments:", err);
      });
      
      api.get("/claims").then(res => setClaims(res.data)).catch(err => {
        console.error("Failed to fetch claims:", err);
      }); // Agents view all claims
      
      api.get("/policies").then(res => setPolicies(res.data)).catch(err => {
        console.error("Failed to fetch policies:", err);
      });
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
    <div style={{ padding: '36px 32px', maxWidth: 1400, margin: '0 auto' }}>

      {/* ── Proof Modal ── */}
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

      {/* ── Page Header ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className="badge badge-agent" style={{ fontSize: '0.7rem' }}>🧑‍💼 Agent</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: "'Space Grotesk',sans-serif" }}>
              My <span className="text-gradient">Consultation Queue</span>
            </h1>
            <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Review, approve, and complete appointment requests from users.
            </p>
          </div>
        </div>
        <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(139,92,246,0.5), transparent)', marginTop: 16 }} />
      </motion.div>

      {/* ── Tab Selector ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {[
          { key: 'appointments', label: '📅 Appointments', count: requests.length },
          { key: 'claims', label: '🛡️ Claims Review', count: claims.filter(c => ['PENDING', 'INITIATED', 'DOCS_UPLOADED', 'UNDER_REVIEW', 'FLAGGED_FRAUD'].includes(c.status)).length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '9px 22px',
              borderRadius: 'var(--radius-pill)',
              border: activeTab === tab.key ? '1px solid var(--role-agent)' : '1px solid var(--border-input)',
              background: activeTab === tab.key ? 'rgba(139,92,246,0.15)' : 'transparent',
              color: activeTab === tab.key ? '#c4b5fd' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            {tab.label}
            <span style={{
              background: activeTab === tab.key ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.08)',
              color: activeTab === tab.key ? '#ddd6fe' : 'var(--text-muted)',
              padding: '1px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 800,
            }}>{tab.count}</span>
          </button>
        ))}
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
          <div style={{ textAlign: "center", padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-card)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📥</div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>No pending appointment requests.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {requests.map((b, idx) => {
              const statusColors = {
                PENDING: '#f59e0b', APPROVED: '#10b981', COMPLETED: '#3b82f6',
                REJECTED: '#ef4444', EXPIRED: '#6b7280'
              };
              const statusColor = statusColors[b.status] || '#6b7280';
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
                  className="card"
                  style={{ borderLeft: `4px solid ${statusColor}`, padding: '22px 24px' }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>{b.user.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        📅 {new Date(b.startTime).toLocaleString()}
                      </div>
                    </div>
                    <span className={`badge badge-${b.status === 'PENDING' ? 'warning' : b.status === 'APPROVED' ? 'success' : b.status === 'COMPLETED' ? 'info' : b.status === 'EXPIRED' ? 'neutral' : 'danger'}`}>
                      {b.status === 'COMPLETED' ? 'CONSULTED' : b.status}
                    </span>
                  </div>

                  {b.policy ? (
                    <div style={{ background: b.bookingType === 'ENQUIRY' ? 'rgba(59,130,246,0.08)' : 'rgba(16,185,129,0.08)', padding: '10px 14px', borderRadius: 10, margin: '14px 0', borderLeft: b.bookingType === 'ENQUIRY' ? '3px solid #3b82f6' : '3px solid #10b981' }}>
                      <strong style={{ color: b.bookingType === 'ENQUIRY' ? '#60a5fa' : '#34d399', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{b.bookingType === 'ENQUIRY' ? 'Policy Enquiry' : 'Purchase Request'}</strong>
                      <div style={{ fontSize: '0.97rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 3 }}>{b.policy.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Premium: ₹{b.policy.premium}/mo</div>
                    </div>
                  ) : b.reason && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: 10, margin: '10px 0', fontSize: '0.9rem', border: '1px solid var(--border-subtle)' }}>
                      <strong style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>GOAL</strong>
                      <div style={{ color: 'var(--text-main)', marginTop: 3 }}>{b.reason}</div>
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
                          {b.policy ? (b.bookingType === 'ENQUIRY' ? "Approve Enquiry" : "Approve Issue") : "Approve Meeting"}
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
                            {b.bookingType === 'ENQUIRY' ? "✅ Complete Policy Enquiry" : "✅ Complete Consultation & Issue Policy"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {b.status === "COMPLETED" && (
                    <div style={{ marginTop: 15, padding: 10, background: "rgba(59, 130, 246, 0.1)", borderRadius: 8, border: "1px solid rgba(59, 130, 246, 0.3)" }}>
                      <div style={{ fontWeight: "bold", color: "#3b82f6", marginBottom: 5 }}>Consultation Completed</div>
                      <div style={{ fontSize: "0.9rem" }}>
                        {b.bookingType === 'ENQUIRY'
                          ? `Enquiry for ${b.policy?.name} has been resolved.`
                          : `Policy ${b.policy?.name} has been issued (Payment Pending).`}
                      </div>
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
                </motion.div>
              );
            })}
          </div>
        )
      )}

      {activeTab === "claims" && (
        <>
          {claims.filter(c => ['PENDING', 'INITIATED', 'DOCS_UPLOADED', 'UNDER_REVIEW', 'FLAGGED_FRAUD'].includes(c.status)).length === 0 && (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)" }}>
              <p>✅ All caught up! No pending claims to review.</p>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {claims.map((c, idx) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
                className="card"
                style={{ borderLeft: `4px solid ${c.status === 'APPROVED' ? '#10b981' : c.status === 'REJECTED' ? '#ef4444' : c.status === 'FLAGGED_FRAUD' ? '#ef4444' : '#f59e0b'}`, padding: '22px 24px' }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
                  <div>
                    <strong style={{ fontSize: "1.1rem", display: "block" }}>Claim #{c.id}</strong>
                    <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{new Date().toLocaleDateString()}</span>
                  </div>
                  <span style={{
                    padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, height: "fit-content",
                    background: c.status === 'APPROVED' ? "#dcfce7" : c.status === 'REJECTED' ? "#fee2e2" : c.status === 'FLAGGED_FRAUD' ? "#fee2e2" : "#fef9c3",
                    color: c.status === 'APPROVED' ? "#15803d" : c.status === 'REJECTED' ? "#b91c1c" : c.status === 'FLAGGED_FRAUD' ? "#b91c1c" : "#854d0e"
                  }}>{c.status}</span>
                </div>
                <p><strong>Policy:</strong> {c.policyName}</p>
                <p style={{ opacity: 0.8, marginBottom: 15, fontSize: "0.95rem", lineHeight: "1.5", color: "var(--text-main)" }}>{c.description}</p>

                <div style={{ marginTop: "auto" }}>
                  <button
                    className="secondary-btn"
                    style={{ width: "100%", marginBottom: 15 }}
                    onClick={() => {
                      const url = c.proofUrl || (c.documentUrls && c.documentUrls.length > 0 ? c.documentUrls[0] : null);
                      setProofModal({ isOpen: true, url: url });
                    }}
                  >
                    📄 Evaluate Proofs
                  </button>

                  {['PENDING', 'INITIATED', 'DOCS_UPLOADED', 'UNDER_REVIEW', 'FLAGGED_FRAUD'].includes(c.status) ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <button className="primary-btn" onClick={() => updateClaimStatus(c.id, "APPROVED")} style={{ padding: "8px", background: "#10b981", border: "none" }}>Approve Claim</button>
                      <button className="secondary-btn" onClick={() => updateClaimStatus(c.id, "REJECTED")} style={{ padding: "8px", color: "#ef4444", borderColor: "#ef4444" }}>Reject Claim</button>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", color: "var(--text-muted)" }}>Process Completed</div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
