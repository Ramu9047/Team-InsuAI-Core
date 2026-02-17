import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../components/Modal";

export default function AgentAppointmentsEnhanced() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionModal, setActionModal] = useState({ isOpen: false, action: null });
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const fetchAppointments = useCallback(() => {
    if (!user) return;
    api.get("/agents/appointments")
      .then(r => setAppointments(r.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const fetchAIInsights = async (bookingId) => {
    setLoadingAI(true);
    try {
      const res = await api.get(`/appointment-workflow/${bookingId}/insights`);
      setAiInsights(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleAction = async (action) => {
    if (!selectedAppointment) return;

    if (action === 'REJECT' && !rejectionReason.trim()) {
      notify("Rejection reason is mandatory", "error");
      return;
    }

    try {
      const payload = {
        bookingId: selectedAppointment.id,
        action: action,
        notes: notes,
        rejectionReason: action === 'REJECT' ? rejectionReason : null,
        includeAIRecommendations: action === 'REJECT'
      };

      const res = await api.post("/appointment-workflow/agent/decision", payload);

      notify(res.data.message || "Action completed successfully", "success");
      setActionModal({ isOpen: false, action: null });
      setSelectedAppointment(null);
      setNotes("");
      setRejectionReason("");
      setAiInsights(null);
      fetchAppointments();
    } catch (err) {
      notify(err.response?.data?.message || "Action failed", "error");
    }
  };

  const openActionModal = (appointment, action) => {
    setSelectedAppointment(appointment);
    setActionModal({ isOpen: true, action });
    if (action === 'REJECT') {
      fetchAIInsights(appointment.id);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'REQUESTED': '#f59e0b',
      'MEETING_APPROVED': '#3b82f6',
      'CONSULTED': '#8b5cf6',
      'POLICY_APPROVED': '#10b981',
      'REJECTED': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'REQUESTED': '📋',
      'MEETING_APPROVED': '✅',
      'CONSULTED': '💬',
      'POLICY_APPROVED': '🎉',
      'REJECTED': '❌'
    };
    return icons[status] || '📌';
  };

  const getAvailableActions = (status) => {
    switch (status) {
      case 'REQUESTED':
        return ['APPROVE_MEETING', 'REJECT'];
      case 'MEETING_APPROVED':
        return ['MARK_COMPLETED', 'REJECT'];
      case 'CONSULTED':
        return ['APPROVE_POLICY', 'REJECT'];
      default:
        return [];
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      'APPROVE_MEETING': '✅ Approve Meeting',
      'MARK_COMPLETED': '✔️ Mark as Completed',
      'APPROVE_POLICY': '🎉 Approve Policy',
      'REJECT': '❌ Reject'
    };
    return labels[action] || action;
  };

  if (loading) return <div style={{ textAlign: "center", marginTop: 50 }}>Loading appointments...</div>;

  return (
    <div style={{ padding: 30 }}>
      {/* Action Modal */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => {
          setActionModal({ isOpen: false, action: null });
          setSelectedAppointment(null);
          setNotes("");
          setRejectionReason("");
          setAiInsights(null);
        }}
        title={`${getActionLabel(actionModal.action)} - ${selectedAppointment?.user?.name || ''}`}
        actions={
          selectedAppointment && (
            <>
              <button
                className="secondary-btn"
                onClick={() => {
                  setActionModal({ isOpen: false, action: null });
                  setSelectedAppointment(null);
                  setNotes("");
                  setRejectionReason("");
                  setAiInsights(null);
                }}
              >
                Cancel
              </button>
              <button
                className="primary-btn"
                onClick={() => handleAction(actionModal.action)}
                style={{
                  background: actionModal.action === 'REJECT' ? '#ef4444' : 'var(--primary)',
                  borderColor: actionModal.action === 'REJECT' ? '#ef4444' : 'var(--primary)'
                }}
              >
                Confirm
              </button>
            </>
          )
        }
      >
        <div style={{ color: 'var(--text-main)' }}>
          {selectedAppointment && (
            <>
              <div style={{ marginBottom: 20, padding: 15, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                <p><strong>Policy:</strong> {selectedAppointment.policy?.name || 'General Consultation'}</p>
                <p><strong>User:</strong> {selectedAppointment.user?.name}</p>
                <p><strong>Time:</strong> {new Date(selectedAppointment.startTime).toLocaleString()}</p>
              </div>

              {actionModal.action === 'REJECT' && (
                <>
                  <label style={{ display: 'block', marginBottom: 10, fontWeight: 600 }}>
                    Rejection Reason (Required) *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="Provide a clear reason for rejection..."
                    style={{
                      width: '100%',
                      minHeight: 100,
                      padding: 10,
                      borderRadius: 8,
                      border: '1px solid var(--card-border)',
                      background: 'var(--card-bg)',
                      color: 'var(--text-main)',
                      marginBottom: 15
                    }}
                  />

                  {loadingAI && (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                      <div className="spinner"></div>
                      <p>Loading AI insights...</p>
                    </div>
                  )}

                  {aiInsights && !loadingAI && (
                    <div style={{ marginBottom: 20, padding: 15, background: 'rgba(139, 92, 246, 0.1)', borderRadius: 8, border: '1px solid #8b5cf6' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#8b5cf6' }}>🤖 AI Risk Assessment</h4>
                      {aiInsights.aiRiskScore && (
                        <p><strong>Risk Score:</strong> {aiInsights.aiRiskScore.toFixed(1)}/10</p>
                      )}
                      {aiInsights.aiRiskFactors && aiInsights.aiRiskFactors.length > 0 && (
                        <>
                          <p><strong>Risk Factors:</strong></p>
                          <ul style={{ marginLeft: 20 }}>
                            {aiInsights.aiRiskFactors.map((factor, idx) => (
                              <li key={idx}>{factor}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      {aiInsights.alternativePolicies && aiInsights.alternativePolicies.length > 0 && (
                        <>
                          <p><strong>Recommended Alternatives:</strong></p>
                          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                            {aiInsights.alternativePolicies.map((alt, idx) => (
                              <div key={idx} style={{ padding: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 6, marginBottom: 8 }}>
                                <div style={{ fontWeight: 600 }}>{alt.policyName}</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                                  Premium: ₹{alt.premium} | Coverage: ₹{alt.coverage}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: 5 }}>
                                  Match Score: {(alt.matchScore * 100).toFixed(0)}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}

              <label style={{ display: 'block', marginBottom: 10, fontWeight: 600 }}>
                {actionModal.action === 'REJECT' ? 'Additional Notes' : 'Notes'}
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add your notes here..."
                style={{
                  width: '100%',
                  minHeight: 80,
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid var(--card-border)',
                  background: 'var(--card-bg)',
                  color: 'var(--text-main)',
                  marginBottom: 20
                }}
              />
            </>
          )}
        </div>
      </Modal>

      <h1 className="text-gradient" style={{ marginBottom: 30 }}>Agent Appointments</h1>

      {appointments.length === 0 ? (
        <div style={{ textAlign: "center", padding: 50, opacity: 0.6, background: "var(--bg-card)", borderRadius: 12 }}>
          <p>No appointments found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
          <AnimatePresence>
            {appointments.map(apt => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card"
                style={{
                  borderLeft: `4px solid ${getStatusColor(apt.status)}`,
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <span style={{
                    fontSize: 24,
                    filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))'
                  }}>
                    {getStatusIcon(apt.status)}
                  </span>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: getStatusColor(apt.status) + '20',
                    color: getStatusColor(apt.status),
                    border: `1px solid ${getStatusColor(apt.status)}`
                  }}>
                    {apt.status}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 10px 0' }}>{apt.user?.name}</h3>
                <p style={{ margin: '5px 0', fontSize: '0.9rem', opacity: 0.8 }}>
                  📧 {apt.user?.email}
                </p>

                <div style={{ margin: '15px 0', padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                  <div style={{ fontWeight: 600, marginBottom: 5 }}>
                    {apt.policy ? `🛡️ ${apt.policy.name}` : '💬 General Consultation'}
                  </div>
                  {apt.policy && (
                    <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                      Premium: ₹{apt.policy.premium}/mo
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: 15 }}>
                  📅 {new Date(apt.startTime).toLocaleDateString()}<br />
                  ⏰ {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                  {new Date(apt.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                {apt.meetingLink && (
                  <a
                    href={apt.meetingLink}
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

                {getAvailableActions(apt.status).length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: getAvailableActions(apt.status).length === 1 ? '1fr' : '1fr 1fr', gap: 10, marginTop: 15 }}>
                    {getAvailableActions(apt.status).map(action => (
                      <button
                        key={action}
                        onClick={() => openActionModal(apt, action)}
                        className={action === 'REJECT' ? 'secondary-btn' : 'primary-btn'}
                        style={{
                          padding: '10px',
                          fontSize: '0.85rem',
                          ...(action === 'REJECT' && {
                            color: '#ef4444',
                            borderColor: '#ef4444'
                          })
                        }}
                      >
                        {getActionLabel(action)}
                      </button>
                    ))}
                  </div>
                )}

                {apt.status === 'REJECTED' && apt.rejectionReason && (
                  <div style={{ marginTop: 15, padding: 10, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, border: '1px solid #ef4444' }}>
                    <div style={{ fontWeight: 600, color: '#ef4444', marginBottom: 5 }}>Rejection Reason:</div>
                    <div style={{ fontSize: '0.85rem' }}>{apt.rejectionReason}</div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
