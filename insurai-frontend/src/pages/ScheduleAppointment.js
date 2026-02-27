import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { motion } from "framer-motion";

export default function ScheduleAppointment() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
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
  const [reason, setReason] = useState(""); // Default empty or based on type
  const [loading, setLoading] = useState(false);
  const [ownershipWarning, setOwnershipWarning] = useState(false);

  const [userRegion, setUserRegion] = useState("");
  const availableRegions = ['North', 'South', 'East', 'West', 'Central'];

  useEffect(() => {
    if (interestedPolicy && userPolicies.length > 0) {
      const alreadyOwned = userPolicies.some(up =>
        up.policy.id === interestedPolicy.id &&
        ['ACTIVE', 'PENDING', 'PAYMENT_PENDING'].includes(up.status)
      );
      if (alreadyOwned) {
        setOwnershipWarning(true);
        setReason(`Inquiry about my existing ${interestedPolicy.name} policy.`);
      } else {
        setReason(`Interested in purchasing ${interestedPolicy.name}`);
      }
    }
  }, [interestedPolicy, userPolicies]);

  useEffect(() => {
    api.get("/agents")
      .then(res => setAgents(res.data))
      .catch(() => notify("Failed to load agents", "error"));

    // Fetch user policies for selection
    if (user) {
      api.get(`/policies/user/${user.id}`).then(res => {
        setUserPolicies(res.data);
      }).catch(console.error);
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

  const filteredAgents = agents.filter(a => {
    // 1. Company Match (if specified by policy)
    const companyMatch = !interestedPolicy || a.company?.id === interestedPolicy.company?.id;

    // 2. Policy Type Match
    // If agent has assigned types, must include interested policy's type.
    // Otherwise, agent is a generalist.
    const agentPolicyTypes = a.assignedPolicyTypes || [];
    const policyTypeMatch = !interestedPolicy ||
      agentPolicyTypes.length === 0 ||
      agentPolicyTypes.includes(interestedPolicy.type) ||
      (interestedPolicy.type === 'Car' && agentPolicyTypes.includes('Motor')) || // Alias mapping
      (interestedPolicy.type === 'Motor' && agentPolicyTypes.includes('Car'));

    // 3. Region Match
    // If agent has assigned regions, must include user selected region.
    const agentRegions = a.assignedRegions || [];
    const regionMatch = !userRegion ||
      agentRegions.length === 0 ||
      agentRegions.includes(userRegion);

    return companyMatch && policyTypeMatch && regionMatch;
  });

  const confirmBooking = async () => {
    if (!reason.trim()) {
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
        const isAlreadyOwned = interestedPolicy && userPolicies.some(up =>
          up.policy.id === interestedPolicy.id &&
          ['ACTIVE', 'PENDING', 'PAYMENT_PENDING'].includes(up.status)
        );

        const payload = {
          userId: user.id,
          agentId: selectedAgent.id,
          start: startISO,
          end: endISO,
          reason: reason,
          policyId: selectedPolicyId ? parseInt(selectedPolicyId) : (interestedPolicy ? interestedPolicy.id : null),
          bookingType: isAlreadyOwned ? "ENQUIRY" : (interestedPolicy ? "PURCHASE" : (selectedPolicyId ? "ENQUIRY" : "PURCHASE"))
        };
        console.log("Booking Payload:", payload);
        await api.post("/bookings", payload);
        notify("Appointment Confirmed! 📅", "success");
      }

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (e) {
      let errorMsg = e.response?.data?.message || e.response?.data || "Failed to book appointment. Please try again.";

      // Clean up common technical prefixes if they exist
      if (typeof errorMsg === 'string') {
        errorMsg = errorMsg.replace(/^(409|400|500|CONFLICT|BAD REQUEST|INTERNAL SERVER ERROR)\s*[:"-]*/i, '').trim();
        // Also remove leading quotes if any
      }

      if (e.response?.status === 409) {
        const isSlotConflict = errorMsg.toLowerCase().includes("slot");
        const displayMsg = isSlotConflict ? "This time slot is already booked. Please pick another." : errorMsg;
        setError(displayMsg);
        notify(displayMsg, "error", 5000, isSlotConflict ? "🕒" : "🛡️");
      } else {
        setError(errorMsg);
        notify(errorMsg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-gradient" style={{ marginBottom: 40 }}>Schedule a Consultation</h1>

      {/* Progress */}
      <div style={{ display: "flex", gap: 10, marginBottom: 40, opacity: 0.7 }}>
        <span style={{ fontWeight: step >= 1 ? "bold" : "normal", color: step >= 1 ? "var(--primary)" : "inherit" }}>1. Region & Agent</span>
        <span>→</span>
        <span style={{ fontWeight: step >= 2 ? "bold" : "normal", color: step >= 2 ? "var(--primary)" : "inherit" }}>2. Date</span>
        <span>→</span>
        <span style={{ fontWeight: step >= 3 ? "bold" : "normal", color: step >= 3 ? "var(--primary)" : "inherit" }}>3. Slot</span>
        <span>→</span>
        <span style={{ fontWeight: step >= 4 ? "bold" : "normal", color: step >= 4 ? "var(--primary)" : "inherit" }}>4. Confirm</span>
      </div>

      <div className="card" style={{ maxWidth: 800 }}>

        {/* Step 1: Region & Agents */}
        {step === 1 && (
          <div style={{ animation: "fadeIn 0.5s" }}>
            <div style={{ marginBottom: 30 }}>
              <label className="form-label" style={{ fontSize: '1.1rem' }}>📍 Select Your Region</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                {availableRegions.map(r => (
                  <button
                    key={r}
                    onClick={() => setUserRegion(r === userRegion ? "" : r)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 20,
                      border: userRegion === r ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                      background: userRegion === r ? 'var(--primary)10' : 'transparent',
                      color: userRegion === r ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: userRegion === r ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {r}
                  </button>
                ))}
                <button
                  onClick={() => setUserRegion("")}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 20,
                    border: userRegion === "" ? '2px solid var(--text-muted)' : '1px solid transparent',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  Clear Selection
                </button>
              </div>
            </div>

            <hr style={{ border: 0, borderTop: '1px solid var(--card-border)', marginBottom: 30 }} />

            {interestedPolicy && (
              <div style={{
                background: "rgba(59, 130, 246, 0.1)",
                border: "1px solid #3b82f6",
                borderRadius: 12,
                padding: "12px 20px",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 15
              }}>
                <span style={{ fontSize: "1.5rem" }}>🏢</span>
                <div style={{ fontSize: "0.95rem", color: "#1e40af" }}>
                  Showing agents specialized in <strong>{interestedPolicy.type}</strong> from <strong>{interestedPolicy.company?.name || "the provider"}</strong>{userRegion ? ` serving the ${userRegion} region.` : '.'}
                </div>
              </div>
            )}

            <div className="grid">
              {filteredAgents.map(a => (
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
                    display: "flex", flexDirection: "column",
                    opacity: a.available ? 1 : 0.6,
                    filter: a.available ? "none" : "grayscale(100%)",
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', gap: 15, marginBottom: 15 }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: "50%",
                      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, color: "white", fontWeight: 700
                    }}>
                      {a.name.charAt(0)}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <h3 style={{ margin: 0 }}>{a.name}</h3>
                      <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
                        {a.available ? (
                          <span style={{ color: "#22c55e", fontSize: '0.8rem', fontWeight: 600 }}>● Online</span>
                        ) : (
                          <span style={{ color: "#ef4444", fontSize: '0.8rem', fontWeight: 600 }}>● Offline</span>
                        )}
                        <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>|</span>
                        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>★ {a.rating || '4.5'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: 10 }}>{a.bio || "Policy Expert"}</p>

                    {/* Regions & Specialization Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 15 }}>
                      {(a.assignedPolicyTypes || []).map(t => (
                        <span key={t} style={{
                          background: 'var(--primary)15',
                          color: 'var(--primary)',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: '0.7rem',
                          fontWeight: 700
                        }}>
                          {t}
                        </span>
                      ))}
                      {(a.assignedRegions || []).map(r => (
                        <span key={r} style={{
                          background: '#f3f4f6',
                          color: '#4b5563',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: '0.7rem',
                          fontWeight: 700
                        }}>
                          📍 {r}
                        </span>
                      ))}
                      {(!a.assignedPolicyTypes || a.assignedPolicyTypes.length === 0) && (
                        <span style={{ background: '#eee', color: '#666', padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem' }}>Generalist</span>
                      )}
                    </div>
                  </div>

                  <button
                    className="primary-btn"
                    disabled={!a.available}
                    style={{
                      width: "100%", marginTop: 'auto', fontSize: "0.9rem",
                      background: a.available ? "var(--primary)" : "#555",
                      cursor: a.available ? "pointer" : "not-allowed"
                    }}
                  >
                    {a.available ? "Select Agent" : "Unavailable"}
                  </button>
                </motion.div>
              ))}
            </div>

            {filteredAgents.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60, opacity: 0.7 }}>
                <div style={{ fontSize: '3rem', marginBottom: 20 }}>🕵️</div>
                <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>No matching agents found.</p>
                <p>Try selecting a different region or choosing a different policy.</p>
                <button
                  className="secondary-btn"
                  style={{ marginTop: 20 }}
                  onClick={() => { setUserRegion(""); }}
                >
                  Show All Agents
                </button>
              </div>
            )}
            {agents.length === 0 && <p style={{ textAlign: 'center', padding: 20 }}>No agents currently online.</p>}
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

            {/* Time validation warning */}
            {selectedDate === new Date().toISOString().split("T")[0] && (
              <div style={{
                padding: '12px',
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: 8,
                marginBottom: 15,
                fontSize: '0.9rem',
                color: '#92400e'
              }}>
                ⏰ <strong>Today's Booking:</strong> Past time slots are automatically disabled
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 10 }}>
              {availableSlots.map(slot => {
                const now = new Date();
                const slotDateTime = new Date(`${selectedDate}T${slot}:00`);
                const isPast = slotDateTime < now;

                return (
                  <button
                    key={slot}
                    onClick={() => {
                      if (!isPast) {
                        setSelectedSlot(slot);
                        setStep(4);
                      }
                    }}
                    disabled={isPast}
                    style={{
                      padding: "10px",
                      borderRadius: 8,
                      border: isPast ? "1px solid #d1d5db" : "1px solid var(--primary)",
                      background: isPast ? "#f3f4f6" : (selectedSlot === slot ? "var(--primary)" : "transparent"),
                      color: isPast ? "#9ca3af" : (selectedSlot === slot ? "white" : "var(--primary)"),
                      cursor: isPast ? "not-allowed" : "pointer",
                      fontWeight: 600,
                      opacity: isPast ? 0.5 : 1,
                      textDecoration: isPast ? "line-through" : "none",
                      position: "relative"
                    }}
                    title={isPast ? "This time slot has passed" : `Book appointment at ${slot}`}
                  >
                    {slot}
                    {isPast && <span style={{ fontSize: '0.7rem', display: 'block' }}>Past</span>}
                  </button>
                );
              })}
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

            {interestedPolicy && (
              <div style={{
                textAlign: "left",
                marginBottom: 15,
                padding: 15,
                background: ownershipWarning ? "rgba(59, 130, 246, 0.1)" : "rgba(16, 185, 129, 0.1)",
                border: ownershipWarning ? "1px solid #3b82f6" : "1px solid #10b981",
                borderRadius: 12
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <strong style={{ color: ownershipWarning ? '#2563eb' : '#059669' }}>
                    {ownershipWarning ? "🔍 Policy Enquiry:" : "🛡️ Purchase Request:"}
                  </strong>
                  {ownershipWarning && (
                    <span style={{ fontSize: '0.7rem', background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: 10 }}>Owned</span>
                  )}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{interestedPolicy.name}</div>
                {ownershipWarning && (
                  <div style={{ fontSize: "0.85rem", color: "#3b82f6", marginTop: 8, fontStyle: 'italic' }}>
                    * You already have this policy. This appointment has been set as a <strong>Policy Enquiry</strong>.
                  </div>
                )}
                {!ownershipWarning && <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 5 }}>Premium: ₹{interestedPolicy.premium}/mo</div>}
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
                  {userPolicies
                    .filter(up => !selectedAgent || up.policy.company?.id === selectedAgent.company?.id)
                    .map(up => (
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
    </div>
  );
}
