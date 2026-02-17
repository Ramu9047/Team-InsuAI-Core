import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useNotification } from "../context/NotificationContext";
import Modal from "../components/Modal";

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' | 'history'

  const [modal, setModal] = useState({ isOpen: false, title: "", content: "", onConfirm: null });
  const [reviewModal, setReviewModal] = useState({ isOpen: false, bookingId: null, agentId: null, rating: 5, feedback: "" });

  const fetchBookings = useCallback(() => {
    if (!user) return;
    api.get(`/bookings/user/${user.id}`)
      .then(r => setList(r.data.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const confirmAction = (title, content, action) => {
    setModal({
      isOpen: true,
      title,
      content,
      onConfirm: async () => {
        await action();
        setModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const cancelBooking = async (id) => {
    confirmAction("Cancel Appointment", "Are you sure you want to cancel this appointment?", async () => {
      try {
        await api.put(`/bookings/${id}/status?status=CANCELLED`);
        notify("Appointment cancelled successfully", "success");
        fetchBookings();
      } catch (e) {
        notify("Failed to cancel appointment", "error");
      }
    });
  };

  const reschedule = async (id) => {
    const booking = list.find(b => b.id === id);
    if (booking) {
      navigate("/schedule", { state: { policy: booking.policy, agent: booking.agent, rescheduleId: booking.id } });
    }
  };

  const openReviewModal = (booking) => {
    setReviewModal({
      isOpen: true,
      bookingId: booking.id,
      agentId: booking.agent.id,
      rating: 5,
      feedback: ""
    });
  };

  const submitReview = async () => {
    if (!reviewModal.feedback.trim()) {
      notify("Please provide some feedback text.", "error");
      return;
    }
    try {
      await api.post(`/agents/${reviewModal.agentId}/reviews`, {
        bookingId: reviewModal.bookingId,
        rating: reviewModal.rating,
        feedback: reviewModal.feedback
      });
      notify("Review submitted successfully!", "success");
      setReviewModal({ ...reviewModal, isOpen: false });
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 409) {
        notify("You have already reviewed this booking.", "warning");
      } else {
        notify("Failed to submit review.", "error");
      }
    }
  };

  if (loading) return <div style={{ textAlign: "center", marginTop: 50 }}>Loading appointments...</div>;

  const now = new Date();

  const upcoming = list.filter(b => {
    const isFuture = new Date(b.startTime) > now;
    const isActive = ['PENDING', 'APPROVED', 'CONFIRMED'].includes(b.status);

    // If it's a policy purchase request (b.policy exists) which is APPROVED, it's considered done.
    // FIX: APPROVED means the appointment is confirmed, NOT that the policy is issued/completed.
    // We should only hide it if status is COMPLETED.
    // if (b.policy && b.status === 'APPROVED') return false; 

    return isFuture && isActive;
  }).reverse(); // Ascending for upcoming

  const history = list.filter(b => {
    const isPast = new Date(b.startTime) <= now;
    const isInactive = ['CANCELLED', 'COMPLETED', 'EXPIRED'].includes(b.status);

    // Include Approved Policy Requests in history as they are fulfilled
    const isApprovedPolicy = b.policy && b.status === 'APPROVED';

    return isPast || isInactive || isApprovedPolicy;
  });

  const displayList = activeTab === 'upcoming' ? upcoming : history;

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: "10px 20px",
        background: activeTab === id ? "var(--primary)" : "transparent",
        color: activeTab === id ? "white" : "var(--text-muted)",
        border: "none",
        borderBottom: activeTab === id ? "2px solid white" : "2px solid transparent",
        cursor: "pointer", fontWeight: 600,
        transition: "all 0.3s"
      }}
    >
      {label}
    </button>
  );

  return (
    <div>
      {/* Confirmation Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        title={modal.title}
        actions={
          <>
            <button className="secondary-btn" onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}>Cancel</button>
            <button className="primary-btn" onClick={modal.onConfirm} style={{ background: "#ef4444", borderColor: "#ef4444" }}>Confirm</button>
          </>
        }
      >
        {modal.content}
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ ...reviewModal, isOpen: false })}
        title="Rate Your Agent"
        actions={
          <>
            <button className="secondary-btn" onClick={() => setReviewModal({ ...reviewModal, isOpen: false })}>Cancel</button>
            <button className="primary-btn" onClick={submitReview}>Submit Review</button>
          </>
        }
      >
        <div style={{ padding: 10 }}>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Rating</label>
            <div style={{ display: 'flex', gap: 5 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  onClick={() => setReviewModal({ ...reviewModal, rating: star })}
                  style={{
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: star <= reviewModal.rating ? '#f59e0b' : '#374151'
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Feedback</label>
            <textarea
              value={reviewModal.feedback}
              onChange={e => setReviewModal({ ...reviewModal, feedback: e.target.value })}
              style={{
                width: '100%',
                minHeight: 80,
                padding: 10,
                borderRadius: 6,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-main)'
              }}
              placeholder="Share your experience (e.g., helpful, knowledgeable)..."
            />
          </div>
        </div>
      </Modal>

      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>My Bookings</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <h1 className="text-gradient" style={{ margin: 0 }}>My Appointments</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate("/feedback")} className="secondary-btn">💬 Give App Feedback</button>
          <button onClick={() => navigate("/schedule")} className="primary-btn">+ New Booking</button>
        </div>
      </div>

      <div style={{ marginBottom: 20, borderBottom: "1px solid var(--card-border)" }}>
        <TabButton id="upcoming" label={`Upcoming (${upcoming.length})`} />
        <TabButton id="history" label="History" />
      </div>

      {displayList.length === 0 ? (
        <div style={{ textAlign: "center", padding: 50, opacity: 0.6, background: "var(--bg-card)", borderRadius: 12 }}>
          <p>No {activeTab} appointments found.</p>
          {activeTab === 'upcoming' && <p>Book a consultation to get started!</p>}
        </div>
      ) : (
        <div className="grid">
          {displayList.map(b => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{ borderLeft: `4px solid ${getColor(b.status)}`, position: "relative" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 12, color: getColor(b.status) }}>
                  {b.status}
                </span>
                <span style={{ fontSize: 12, opacity: 0.6 }}>ID: #{b.id}</span>
              </div>

              <div style={{ display: "flex", gap: 15, alignItems: "center", marginBottom: 15 }}>
                <div style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                  👤
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{b.agent.name}</h3>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>Agent</p>
                </div>
              </div>

              <div style={{ background: "rgba(0,0,0,0.2)", padding: 10, borderRadius: 8, fontSize: "0.9rem", marginBottom: 15 }}>
                📅 <strong>{new Date(b.startTime).toLocaleDateString()}</strong> <br />
                ⏰ {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>

              {b.policy && (
                <div style={{ fontSize: "0.85rem", marginBottom: 15, padding: "5px 10px", background: "rgba(99, 102, 241, 0.1)", color: "var(--primary)", borderRadius: 4, display: "inline-block" }}>
                  🛡️ Linked to: {b.policy.name}
                </div>
              )}

              {activeTab === 'upcoming' && (['PENDING', 'APPROVED', 'CONFIRMED'].includes(b.status)) && (
                <div style={{ marginTop: "auto", borderTop: "1px solid var(--glass-border)", paddingTop: 15 }}>
                  {b.meetingLink && (b.status === 'APPROVED' || b.status === 'CONFIRMED') && (
                    <div style={{ marginBottom: 10 }}>
                      <a
                        href={createCalendarLink(b)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "block",
                          textAlign: "center",
                          width: "100%",
                          marginBottom: 5,
                          fontSize: "0.85rem",
                          color: "var(--text-muted)",
                          textDecoration: "underline"
                        }}
                      >
                        📅 Add to Google Calendar
                      </a>
                      <a
                        href={b.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="primary-btn"
                        style={{
                          display: "block",
                          textAlign: "center",
                          width: "100%",
                          padding: "10px",
                          marginTop: "5px",
                          background: "#22c55e",
                          color: "white",
                          borderColor: "#22c55e",
                          textDecoration: "none",
                          borderRadius: "6px",
                          fontWeight: "600"
                        }}
                      >
                        🎥 Join Google Meet
                      </a>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => cancelBooking(b.id)}
                      style={{
                        flex: 1,
                        background: "transparent", border: "1px solid #ef4444",
                        color: "#ef4444", padding: "8px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 500
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => reschedule(b.id)}
                      style={{
                        flex: 1,
                        background: "var(--primary)", border: "none",
                        color: "white", padding: "8px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 500
                      }}
                    >
                      Reschedule
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'history' && b.status === 'COMPLETED' && (
                <div style={{ marginTop: "auto", paddingTop: 15, borderTop: "1px solid var(--glass-border)" }}>
                  <button
                    onClick={() => openReviewModal(b)}
                    style={{
                      width: '100%',
                      padding: 8,
                      background: 'var(--primary)',
                      border: 'none',
                      color: 'white',
                      borderRadius: 6,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ★ Rate Agent
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function getColor(status) {
  if (status === 'APPROVED' || status === 'CONFIRMED') return '#22c55e';
  if (status === 'PENDING') return '#f59e0b';
  if (status === 'COMPLETED') return '#6366f1';
  return '#ef4444';
}

function createCalendarLink(booking) {
  const start = new Date(booking.startTime).toISOString().replace(/-|:|\.\d\d\d/g, "");
  const end = new Date(booking.endTime).toISOString().replace(/-|:|\.\d\d\d/g, "");

  const title = encodeURIComponent(`Consultation with ${booking.agent.name}`);
  const details = encodeURIComponent(`Insurance consultation regarding policy #${booking.policy?.id || 'N/A'}.\n\nJoin Meeting: ${booking.meetingLink || 'Link pending'}`);
  const location = encodeURIComponent("Google Meet");

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}
