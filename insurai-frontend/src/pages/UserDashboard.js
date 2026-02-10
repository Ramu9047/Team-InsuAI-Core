import { useEffect, useState } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import {
  // LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  // PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// New Enterprise Components
import NotificationCenter from '../components/NotificationCenter';
import DocumentManager from '../components/DocumentManager';
import PolicyComparison from '../components/PolicyComparison';
import InsuranceLiteracy from '../components/InsuranceLiteracy';

// Services
import { policyService } from '../services/policyService';

export default function UserDashboard() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeAgents: 0,
    appointments: 0,
    activePolicies: 0,
    rejectedRequests: 0,
    riskScore: 0,
    healthScore: 0
  });

  const [appointments, setAppointments] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [comparisonPolicies, setComparisonPolicies] = useState([]);
  const [riskData, setRiskData] = useState(null); // Full risk profile
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [policiesRes, bookingsRes, agentsRes, recommendedRes, riskRes] = await Promise.all([
        api.get(`/policies/user/${user.id}`).catch(() => ({ data: [] })),
        api.get(`/bookings/user/${user.id}`).catch(() => ({ data: [] })),
        api.get('/agents').catch(() => ({ data: [] })),
        policyService.getRecommendedPolicies(user),
        api.get(`/ai/user-risk-profile/${user.id}`).catch(() => ({ data: null }))
      ]);

      const allBookings = bookingsRes.data || [];
      const activePolicies = policiesRes.data || [];
      const agents = agentsRes.data || [];
      const recommendedPolicies = recommendedRes || [];
      const riskProfile = riskRes.data;

      setRiskData(riskProfile);

      // Calculate stats
      const upcomingAppointments = allBookings.filter(b => {
        const bookingDate = new Date(b.startTime);
        const now = new Date();
        // Exclude bookings that are linked to an active policy (already issued)
        const isPolicyIssued = activePolicies.some(p => p.bookingId === b.id);
        const isActive = ['PENDING', 'APPROVED', 'CONFIRMED'].includes(b.status) && !isPolicyIssued;
        return bookingDate > now && isActive;
      });

      const rejectedCount = allBookings.filter(b => b.status === 'REJECTED').length;
      const activeAgentsCount = agents.filter(a => a.available).length;

      setStats({
        activeAgents: activeAgentsCount,
        appointments: upcomingAppointments.length,
        activePolicies: activePolicies.length,
        rejectedRequests: rejectedCount,
        riskScore: riskProfile ? riskProfile.riskScore : calculateRiskScore(activePolicies, allBookings),
        healthScore: calculateHealthScore(activePolicies)
      });

      setAppointments(upcomingAppointments.slice(0, 1)); // Next appointment
      setPolicies(activePolicies);

      // Enhance recommended policies with features for comparison
      const enhancedRecommendations = recommendedPolicies.map(p => ({
        ...p,
        id: p.policyId || p.id,
        name: p.policyName || p.name,
        // Ensure features object exists for PolicyComparison
        features: p.features || {
          cashless: true, // Default to true or random for demo
          preExisting: p.benefits?.includes('Pre-existing') || false,
          maternity: p.benefits?.includes('Maternity') || false,
          ambulance: true,
          roomRent: 'Standard',
          copay: '0%',
          restoration: true,
          wellness: false
        },
        aiScore: p.matchScore ? Math.round(p.matchScore) : 75,
        aiReasons: p.recommendationReason
          ? [p.recommendationReason]
          : ['AI Recommended based on your profile', 'Balanced coverage and premium'],
        recommended: p.isRecommended || false,
        provider: p.provider || 'InsurAI Partner'
      }));

      setComparisonPolicies(enhancedRecommendations);

      // Generate AI Insights
      generateAIInsights(activePolicies, user, recommendedPolicies, riskProfile);

      // Generate Recent Activity
      generateRecentActivity(allBookings, activePolicies);

    } catch (err) {
      console.error("Dashboard load error:", err);
      notify("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateRiskScore = (policies, bookings) => {
    let score = 50; // Base score
    if (policies.length > 0) score -= 15;
    if (policies.length > 2) score -= 10;
    if (bookings.filter(b => b.status === 'COMPLETED').length > 3) score -= 10;
    return Math.max(5, Math.min(score, 95));
  };

  const calculateHealthScore = (policies) => {
    let score = 60;
    if (policies.length > 0) score += 15;
    if (policies.length > 1) score += 10;
    if (policies.some(p => p.category === 'HEALTH')) score += 10;
    return Math.min(score, 95);
  };

  const generateAIInsights = (policies, user, recommendedPolicies = [], riskProfile = null) => {
    const insights = [];

    // 1. Risk-based Insights (Real Backend Data)
    if (riskProfile && riskProfile.insights) {
      riskProfile.insights.forEach(insight => {
        insights.push({
          type: 'warning',
          title: 'Risk Factor Detected',
          match: riskProfile.riskScore,
          reason: insight,
          action: 'review'
        });
      });
    }

    // 2. Recommendations from Backend AI
    recommendedPolicies.forEach(rec => {
      if (rec.isRecommended) {
        insights.push({
          type: 'recommended',
          title: rec.policyName,
          match: Math.round(rec.matchScore || 0),
          reason: rec.recommendationReason || 'Fits your profile perfectly',
          action: 'compare'
        });
      }
    });

    if (insights.length === 0) {
      // Fallback or additional static logic if needed
      const hasHealth = policies.some(p => p.category === 'HEALTH' || p.type === 'HEALTH');
      if (!hasHealth) {
        insights.push({
          type: 'recommended',
          title: 'Health Secure Plus',
          match: 85,
          reason: `Essential coverage missing for age ${user.age || 25}`,
          action: 'compare'
        });
      }
    }

    setAiInsights(insights.slice(0, 5)); // Limit to top 5
  };

  const generateRecentActivity = (bookings, policies) => {
    const activities = [];

    const sortedBookings = [...bookings].sort((a, b) =>
      new Date(b.startTime) - new Date(a.startTime)
    );

    sortedBookings.slice(0, 3).forEach(booking => {
      const time = new Date(booking.startTime);
      const timeStr = formatTimeAgo(time);

      if (booking.status === 'APPROVED' || booking.status === 'CONFIRMED') {
        activities.push({
          time: timeStr,
          text: `Appointment booked with Agent ${booking.agent?.name || 'TBD'}`,
          icon: '📅',
          color: '#10b981'
        });
      } else if (booking.status === 'COMPLETED') {
        activities.push({
          time: timeStr,
          text: `Consultation completed with ${booking.agent?.name || 'Agent'}`,
          icon: '✅',
          color: '#3b82f6'
        });
      }
    });

    if (policies.length > 0) {
      const latestPolicy = policies[0];
      activities.push({
        time: 'Recently',
        text: `Policy "${latestPolicy.name}" approved`,
        icon: '🎉',
        color: '#8b5cf6'
      });
    }

    setRecentActivity(activities.slice(0, 5));
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRiskLevel = (score) => {
    if (score < 30) return { label: 'LOW', color: '#10b981', emoji: '🟢' };
    if (score < 60) return { label: 'MODERATE', color: '#f59e0b', emoji: '🟡' };
    return { label: 'HIGH', color: '#ef4444', emoji: '🔴' };
  };

  const getAppointmentStage = () => {
    if (appointments.length === 0) {
      // If there are no upcoming appointments, check past bookings or active policies
      // If user has an active policy, show stage 4
      if (policies.length > 0) return 4;
      return 0;
    }
    const appt = appointments[0];

    // If an appointment exists:
    if (appt.status === 'PENDING') return 1;
    if (appt.status === 'CONFIRMED') return 2;
    if (appt.status === 'APPROVED') {
      // Check if a policy has been issued linked to this appointment or generally
      if (policies.length > 0) return 4;
      return 3;
    }
    if (appt.status === 'COMPLETED') return 4;

    return 0;
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto', width: 50, height: 50, border: '4px solid rgba(79, 70, 229, 0.1)', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: 20, color: 'var(--text-muted)' }}>Loading your dashboard...</p>
      </div>
    );
  }

  const riskInfo = getRiskLevel(stats.riskScore);
  const appointmentStage = getAppointmentStage();

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header with Notification Center */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 40 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h1 className="text-gradient" style={{ margin: 0, fontSize: '2.5rem' }}>
            {getGreeting()}, {user.name.split(' ')[0]}! 👋
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <NotificationCenter userRole="USER" />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                📍 {user.city || 'Chennai'} | 🕒 Last login: {formatTimeAgo(new Date(Date.now() - 600000))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ height: 2, background: 'linear-gradient(90deg, #4f46e5, transparent)', marginTop: 10 }}></div>
      </motion.div>

      {/* Primary Metrics - Clickable Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 40 }}>
        {[
          { icon: '🧑‍💼', title: 'Active Agents', value: stats.activeAgents, subtitle: 'View Agents →', color: '#667eea', action: () => navigate('/choose-agent') },
          { icon: '📅', title: 'Appointments', value: stats.appointments, subtitle: 'View Timeline →', color: '#f59e0b', action: () => navigate('/my-bookings') },
          { icon: '📄', title: 'Active Policies', value: stats.activePolicies, subtitle: 'View Policies →', color: '#10b981', action: () => navigate('/my-policies') },
          { icon: '❌', title: 'Rejected Requests', value: stats.rejectedRequests, subtitle: 'Why rejected? →', color: '#ef4444', action: () => navigate('/my-bookings') }
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}
            className="card"
            onClick={card.action}
            style={{
              cursor: 'pointer',
              borderLeft: `4px solid ${card.color}`,
              background: 'var(--bg-card)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '5rem', opacity: 0.05 }}>{card.icon}</div>
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>{card.icon}</div>
            <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>{card.title}</div>
            <div style={{ fontSize: '3rem', fontWeight: 800, margin: '10px 0', color: 'var(--text-main)' }}>{card.value}</div>
            <div style={{ fontSize: '0.85rem', color: card.color, fontWeight: 600 }}>{card.subtitle}</div>
          </motion.div>
        ))}
      </div>

      {/* Appointment Journey Tracker */}
      {appointments.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card"
          style={{ marginBottom: 40, background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(139, 92, 246, 0.05))' }}
        >
          <h3 style={{ marginBottom: 20, fontSize: '1.3rem' }}>🧭 Appointment Journey Tracker</h3>
          <p style={{ marginBottom: 20, color: 'var(--text-muted)' }}>Next appointment: {new Date(appointments[0].startTime).toLocaleString()}</p>

          <div style={{ position: 'relative', padding: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
              {/* Progress Line */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '10%',
                right: '10%',
                height: 4,
                background: '#e5e7eb',
                zIndex: 0
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(appointmentStage / 4) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #4f46e5, #8b5cf6)', borderRadius: 2 }}
                />
              </div>

              {/* Stages */}
              {['Booked', 'Agent Assigned', 'Consulted', 'Approved', 'Policy Issued'].map((stage, idx) => (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.2 }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: idx <= appointmentStage ? 'linear-gradient(135deg, #4f46e5, #8b5cf6)' : '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      marginBottom: 10,
                      boxShadow: idx === appointmentStage ? '0 4px 20px rgba(79, 70, 229, 0.4)' : 'none',
                      border: idx === appointmentStage ? '3px solid white' : 'none'
                    }}
                  >
                    {idx < appointmentStage ? '✓' : idx + 1}
                  </motion.div>
                  <div style={{
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    color: idx <= appointmentStage ? 'var(--text-main)' : 'var(--text-muted)',
                    fontWeight: idx === appointmentStage ? 700 : 400
                  }}>
                    {stage}
                    {idx === appointmentStage && <div style={{ color: '#4f46e5', marginTop: 5 }}>▲ You are here</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginBottom: 40 }}>

        {/* AI Insurance Insights */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 style={{ marginBottom: 20, fontSize: '1.3rem' }}>🤖 AI Insurance Insights</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 20 }}>AI Insights for You</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            {aiInsights.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 10 }}>🎯</div>
                <p>You're well covered! No recommendations at this time.</p>
              </div>
            ) : (
              aiInsights.map((insight, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  style={{
                    padding: 15,
                    borderRadius: 8,
                    background: insight.type === 'recommended' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                    border: `1px solid ${insight.type === 'recommended' ? '#10b981' : '#f59e0b'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'start', gap: 10 }}>
                    <div style={{ fontSize: '1.5rem' }}>{insight.type === 'recommended' ? '✔' : '⚠️'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, marginBottom: 5, color: 'var(--text-main)' }}>
                        {insight.title} — {insight.match}% Match
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                        Reason: {insight.reason}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="primary-btn" onClick={() => navigate('/plans')} style={{ flex: 1 }}>
              Compare Policies
            </button>
            <button className="secondary-btn" onClick={() => navigate('/choose-agent')} style={{ flex: 1 }}>
              Talk to Agent
            </button>
          </div>
        </motion.div>

        {/* Risk Profile Snapshot */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 style={{ marginBottom: 20, fontSize: '1.3rem' }}>📊 Risk Profile Snapshot</h3>

          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 10 }}>Risk Score</div>
            <div style={{ fontSize: '3.5rem', fontWeight: 800, color: riskInfo.color }}>
              {riskInfo.emoji} {riskInfo.label}
            </div>
            <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>({stats.riskScore}%)</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15, marginTop: 20 }}>
            {riskData && riskData.factors ? Object.entries(riskData.factors).map(([key, value], idx) => {
              const isPositive = ['Good', 'Excellent', 'Clean', 'Stable'].includes(value);
              const isNeutral = ['Moderate', 'Basic', 'Variable'].includes(value);
              const color = isPositive ? '#10b981' : isNeutral ? '#f59e0b' : '#ef4444';

              return (
                <div key={idx} style={{ textAlign: 'center', padding: 15, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase' }}>{key}</div>
                  <div style={{ fontWeight: 700, color: color }}>{value}</div>
                </div>
              );
            }) : (
              [
                { label: 'Health', value: 'Analyzing...', color: '#6b7280' },
                { label: 'Lifestyle', value: 'Analyzing...', color: '#6b7280' },
                { label: 'History', value: 'Analyzing...', color: '#6b7280' }
              ].map((item, idx) => (
                <div key={idx} style={{ textAlign: 'center', padding: 15, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase' }}>{item.label}</div>
                  <div style={{ fontWeight: 700, color: item.color }}>{item.value}</div>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: 25, padding: 15, background: 'rgba(79, 70, 229, 0.05)', borderRadius: 8, border: '1px solid rgba(79, 70, 229, 0.2)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 5 }}>💡 Recommendation</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
              {riskData ? riskData.recommendation : (
                stats.riskScore < 30
                  ? 'Your risk profile is excellent! Consider reviewing coverage limits.'
                  : stats.riskScore < 60
                    ? 'Consider adding health insurance to reduce your risk score.'
                    : 'High risk detected. Speak with an agent immediately.'
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 style={{ marginBottom: 20, fontSize: '1.3rem' }}>🧾 Recent Activity Timeline</h3>

        {recentActivity.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 10 }}>📭</div>
            <p>No recent activity</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {recentActivity.map((activity, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 15,
                  padding: '15px 0',
                  borderBottom: idx < recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                }}
              >
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: activity.color,
                  boxShadow: `0 0 10px ${activity.color}`
                }}></div>
                <div style={{ fontSize: '1.5rem' }}>{activity.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 3 }}>{activity.time}</div>
                  <div style={{ color: 'var(--text-main)' }}>{activity.text}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Policy Comparison Engine */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 40 }}
      >
        <PolicyComparison
          policies={comparisonPolicies}
          onSelect={(policy) => {
            notify(`Selected: ${policy.name}`, 'success');
            navigate('/plans');
          }}
        />
      </motion.div>

      {/* Document Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 40 }}
      >
        <DocumentManager userId={user.id} userRole="USER" />
      </motion.div>

      {/* Insurance Literacy Center */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <InsuranceLiteracy userId={user.id} />
      </motion.div>
    </div>
  );
}
