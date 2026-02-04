import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { motion } from "framer-motion";

export default function ScheduleAppointment() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const location = useLocation();
  const interestedPolicy = location.state?.policy;
  const preSelectedAgent = location.state?.agent;

  const [agents, setAgents] = useState([]);
  const [step, setStep] = useState(preSelectedAgent ? 2 : 1); // 1: Select Agent, 2: Select Date, 3: Select Slot, 4: Confirm
  const [selectedAgent, setSelectedAgent] = useState(preSelectedAgent || null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [userPolicies, setUserPolicies] = useState([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState(interestedPolicy ? interestedPolicy.id : "");
  const [reason, setReason] = useState(interestedPolicy ? `Interested in purchasing ${interestedPolicy.name}` : "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/agents")
      .then(res => setAgents(res.data))
      .catch(() => notify("Failed to load agents", "error"));

    // Fetch user policies for selection
    if (user) {
      api.get(`/policies/user/${user.id}`).then(res => setUserPolicies(res.data)).catch(console.error);
    }
  }, [user, notify]);

  useEffect(() => {
    if (selectedDate && selectedAgent) {
      // Mock fetching slots from backend
      api.get(`/bookings/availability?date=${selectedDate}&agentId=${selectedAgent.id}`)
        .then(res => setAvailableSlots(res.data))
        .catch(console.error);
    }
  }, [selectedDate, selectedAgent]);

  const [error, setError] = useState("");

  const confirmBooking = async () => {
    if (!reason) {
      setError("Please enter a reason for the appointment");
      notify("Please enter a reason", "error");
      return;
    }
    setLoading(true);
    setError("");

    // Construct ISO strings
    const startISO = `${selectedDate}T${selectedSlot}:00`;
    // End is +1 hour for simplicity in this visual mode
    const [h, m] = selectedSlot.split(":");
    const endH = parseInt(h) + 1;
    const endISO = `${selectedDate}T${endH < 10 ? '0' + endH : endH}:${m}:00`;

    const rescheduleId = location.state?.rescheduleId;

    try {
      if (rescheduleId) {
        await api.put(`/bookings/${rescheduleId}/reschedule`, {
          start: startISO,
          end: endISO
        });
        notify("Appointment Rescheduled Successfully! 📅", "success");
      } else {
        await api.post("/bookings", {
          userId: user.id,
          agentId: selectedAgent.id,
          start: startISO,
          end: endISO,
          policyId: selectedPolicyId || null
        });
        notify("Appointment Confirmed! 📅", "success");
      }

      // Reset or redirect
      setStep(1); setSelectedAgent(null); setSelectedDate("");
    } catch (e) {
      if (e.response?.status === 409) {
        setError("Slot already booked. Please pick another.");
        notify("Slot already booked", "error");
      }
      else {
        setError("Failed to book appointment. Please try again.");
        notify("Failed to book appointment", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ... (keep render same until step 4)

  return (
    <div>
      <h1 className="text-gradient" style={{ marginBottom: 40 }}>Schedule a Consultation</h1>

      {/* Progress */}
      <div style={{ display: "flex", gap: 10, marginBottom: 40, opacity: 0.7 }}>
        <span style={{ fontWeight: step >= 1 ? "bold" : "normal", color: step >= 1 ? "var(--primary)" : "inherit" }}>1. Agent</span>
        <span>→</span>
        <span style={{ fontWeight: step >= 2 ? "bold" : "normal", color: step >= 2 ? "var(--primary)" : "inherit" }}>2. Date</span>
        <span>→</span>
        <span style={{ fontWeight: step >= 3 ? "bold" : "normal", color: step >= 3 ? "var(--primary)" : "inherit" }}>3. Slot</span>
        <span>→</span>
        <span style={{ fontWeight: step >= 4 ? "bold" : "normal", color: step >= 4 ? "var(--primary)" : "inherit" }}>4. Confirm</span>
      </div>

      <div className="card" style={{ maxWidth: 800 }}>

        {/* Step 1: Agents */}
        {step === 1 && (
          <div className="grid">
            {agents.map(a => (
              <motion.div
                key={a.id}
                className="card"
                whileHover={{ scale: a.available ? 1.02 : 1 }}
                onClick={() => {
                  if (a.available) {
                    setSelectedAgent(a);
                    setStep(2);
                  }
                }}
                style={{
                  cursor: a.available ? "pointer" : "not-allowed",
                  display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", minHeight: 200,
                  opacity: a.available ? 1 : 0.6,
                  filter: a.available ? "none" : "grayscale(100%)"
                }}
              >
                <div style={{ width: 50, height: 50, borderRadius: "50%", background: a.available ? "#22c55e" : "#ddd", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "white" }}>
                  {a.available ? "👤" : "🚫"}
                </div>
                <h3>{a.name}</h3>
                <p style={{ opacity: 0.7, color: a.available ? "var(--text-main)" : "var(--error)" }}>
                  {a.available ? "Available Agent" : "Offline"}
                </p>
                {!a.available && (
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Please select another agent. This agent will be back soon.
                  </p>
                )}
                <button
                  className="primary-btn"
                  disabled={!a.available}
                  style={{
                    width: "100%", marginTop: 10, fontSize: "0.9rem",
                    background: a.available ? "var(--primary)" : "#555",
                    borderColor: a.available ? "var(--primary)" : "#555",
                    cursor: a.available ? "pointer" : "not-allowed"
                  }}
                >
                  {a.available ? "Select" : "Unavailable"}
                </button>
              </motion.div>
            ))}
            {agents.length === 0 && <p>No agents currently online.</p>}
          </div>
        )}

        {/* Step 2: Date */}
        {step === 2 && (
          <div style={{ animation: "fadeIn 0.5s" }}>
            <button onClick={() => setStep(1)} style={{ marginBottom: 20, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>← Back</button>

            <div className="form-group" style={{ marginBottom: 30 }}>
              <label className="form-label">Select Date (Mon-Fri only)</label>
              <input
                type="date"
                className="form-input"
                onChange={e => {
                  const d = new Date(e.target.value);
                  const day = d.getDay();
                  if (day === 0 || day === 6) {
                    notify("Agents are available Monday to Friday only.", "error");
                    e.target.value = "";
                    setSelectedDate("");
                    return;
                  }
                  setSelectedDate(e.target.value);
                }}
                min={new Date().toISOString().split("T")[0]}
              />
              {selectedDate && (
                <button className="primary-btn" style={{ marginTop: 20 }} onClick={() => setStep(3)}>Next →</button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Slot */}
        {step === 3 && (
          <div style={{ animation: "fadeIn 0.5s" }}>
            <button onClick={() => setStep(2)} style={{ marginBottom: 20, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>← Back</button>
            <label style={{ display: "block", marginBottom: 15 }}>Available Slots for {selectedDate}</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 10 }}>
              {availableSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => { setSelectedSlot(slot); setStep(4); }}
                  style={{
                    padding: "10px", borderRadius: 8, border: "1px solid var(--primary)",
                    background: selectedSlot === slot ? "var(--primary)" : "transparent",
                    color: selectedSlot === slot ? "white" : "var(--primary)",
                    cursor: "pointer", fontWeight: 600
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div style={{ textAlign: "center", padding: 20 }}>
            <button onClick={() => { setStep(3); setError(""); }} style={{ float: "left", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>← Back</button>
            <div style={{ clear: "both", fontSize: 50, marginBottom: 20 }}>📅</div>
            <h2>Confirm Booking</h2>
            <p>with <strong>{selectedAgent?.name}</strong></p>
            <p>on <strong>{selectedDate}</strong> at <strong>{selectedSlot}</strong></p>

            {error && <div className="error-msg" style={{ justifyContent: "center", marginTop: 20 }}>{error}</div>}

            <div className="form-group" style={{ textAlign: 'left', marginTop: 20 }}>
              <label className="form-label">Reason for Appointment</label>
              <input
                className="form-input"
                placeholder="e.g. Policy Enquiry, Claim Assistance"
                value={reason}
                onChange={e => { setReason(e.target.value); if (error) setError(""); }}
              />
            </div>

            {/* If interested policy passed from Plans, show it */}
            {interestedPolicy && (
              <div style={{ textAlign: "left", marginBottom: 15, padding: 10, background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", borderRadius: 8 }}>
                <strong>Interested in Buying:</strong> {interestedPolicy.name}
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Premium: ₹{interestedPolicy.premium}/mo</div>
              </div>
            )}

            {!interestedPolicy && (
              <div style={{ textAlign: 'left', marginTop: 20 }} className="form-group">
                <label className="form-label">Select Policy (Optional) - <small style={{ opacity: 0.7 }}>Link a policy to this discussion</small></label>
                <select
                  className="form-input"
                  value={selectedPolicyId}
                  onChange={(e) => setSelectedPolicyId(e.target.value)}
                >
                  <option value="">-- No Specific Policy --</option>
                  {userPolicies.map(up => (
                    <option key={up.id} value={up.policy.id}>
                      {up.policy.name} ({up.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button className="primary-btn" onClick={confirmBooking} disabled={loading} style={{ width: "100%", marginTop: 10 }}>
              {loading ? "Confirming..." : "Confirm & Book"}
            </button>
          </div>
        )}

      </div>
    </div >
  );
}
