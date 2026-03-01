import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { policyService } from '../services/policyService';
import {
  // LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  // PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import KPICard from '../components/KPICard';

// New Enterprise Components
import NotificationCenter from '../components/NotificationCenter';
import PolicyComparison from '../components/PolicyComparison';
import InsuranceLiteracy from '../components/InsuranceLiteracy';

// Services



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

const getRiskLevel = (score) => {
  if (score < 30) return { label: 'LOW', color: '#10b981', emoji: '🟢' };
  if (score < 60) return { label: 'MODERATE', color: '#f59e0b', emoji: '🟡' };
  return { label: 'HIGH', color: '#ef4444', emoji: '🔴' };
};

export default function UserDashboard() {
  const { user } = useAuth();
  const { notify, refreshSignal } = useNotification();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeAgents: 0,
    appointments: 0,
    activePolicies: 0,
    rejectedRequests: 0,
    riskScore: 0,
    healthScore: 0,
    claims: 0
  });

  const [appointments, setAppointments] = useState([]);
  // const [policies, setPolicies] = useState([]); // policies removed as unused state, using local vars
  const [aiInsights, setAiInsights] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [comparisonPolicies, setComparisonPolicies] = useState([]);
  const [riskData, setRiskData] = useState(null); // Full risk profile
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);







  const generateAIInsights = useCallback((policies, user, recommendedPolicies = [], riskProfile = null) => {
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
  }, []);

  const generateRecentActivity = useCallback((bookings, policies) => {
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
  }, []);



  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };



  const getAppointmentStage = () => {
    if (appointments.length === 0) return 0;
    const appt = appointments[0];

    if (appt.status === 'PENDING') return 1;
    if (appt.status === 'APPROVED' || appt.status === 'CONFIRMED') return 2;
    if (appt.status === 'COMPLETED') return 3;
    return 0;
  };



  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [policiesRes, bookingsRes, agentsRes, recommendedRes, riskRes, claimRes] = await Promise.all([
        api.get(`/policies/user/${user.id}`).catch(() => ({ data: [] })),
        api.get(`/bookings/user/${user.id}`).catch(() => ({ data: [] })),
        api.get('/agents').catch(() => ({ data: [] })),
        policyService.getRecommendedPolicies(user),
        api.get(`/ai/user-risk-profile/${user.id}`).catch(() => ({ data: null })),
        api.get(`/claims/user/${user.id}`).catch(() => ({ data: [] }))
      ]);

      const allBookings = bookingsRes.data || [];
      const activePolicies = policiesRes.data || [];
      const agents = agentsRes.data || [];
      const recommendedPolicies = recommendedRes || [];
      const riskProfile = riskRes.data;
      const allClaims = Array.isArray(claimRes?.data) ? claimRes.data : [];

      setRiskData(riskProfile);

      // Calculate stats
      const upcomingAppointments = allBookings.filter(b => {
        const bookingDate = new Date(b.startTime);
        const now = new Date();
        const isActive = ['PENDING', 'APPROVED', 'CONFIRMED'].includes(b.status);
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
        healthScore: calculateHealthScore(activePolicies),
        claims: allClaims.length
      });

      setAppointments(upcomingAppointments.slice(0, 1)); // Next appointment
      // setPolicies(activePolicies);

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
  }, [user, notify, generateAIInsights, generateRecentActivity]);

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user, loadDashboardData, refreshSignal]);

  const riskInfo = getRiskLevel(stats.riskScore);
  const appointmentStage = getAppointmentStage();

  if (loading) {
    return (
      <div style={{ padding: '60px 40px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Hero skeleton */}
        <div style={{ marginBottom: 40 }}>
          <div className="skeleton" style={{ height: 36, width: '35%', marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 18, width: '20%' }} />
        </div>
        {/* Quick actions skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 16 }} />
          ))}
        </div>
        {/* KPI skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 16, marginBottom: 32 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>

      {/* ── Hero Header ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <span className="badge badge-user" style={{ fontSize: '0.7rem' }}>👤 User Account</span>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, color: '#10b981',
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulseGlow 2s infinite' }} />
                Live
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: "'Space Grotesk',sans-serif" }}>
              {getGreeting()}, <span className="text-gradient">{user.name.split(' ')[0]}</span> 👋
            </h1>
            <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              📍 {user.city || 'India'} &nbsp;·&nbsp; Last login: {formatTimeAgo(new Date(Date.now() - 600000))}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <NotificationCenter userRole="USER" />
          </div>
        </div>
        <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(99,102,241,0.5), transparent)', marginTop: 20 }} />
      </motion.div>

      {/* ── Quick Action Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
        {[
          { icon: '📋', label: 'Browse Plans', sub: 'AI-matched policies', path: '/plans', color: '#6366f1', glow: 'rgba(99,102,241,0.15)' },
          { icon: '📅', label: 'Book Consultation', sub: 'Talk to an agent', path: '/choose-agent', color: '#8b5cf6', glow: 'rgba(139,92,246,0.15)' },
          { icon: '📄', label: 'My Policies', sub: `${stats.activePolicies} active`, path: '/my-policies', color: '#10b981', glow: 'rgba(16,185,129,0.12)' },
          { icon: '🛡️', label: 'My Claims', sub: `${stats.claims} filed`, path: '/claims', color: '#f59e0b', glow: 'rgba(245,158,11,0.12)' },
        ].map((action, i) => (
          <motion.div key={action.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate(action.path)}
            style={{
              padding: '18px 20px',
              borderRadius: 'var(--radius-lg)',
              background: action.glow,
              border: `1px solid ${action.color}28`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              transition: 'all 0.25s ease',
            }}
          >
            <div style={{ width: 42, height: 42, borderRadius: 10, background: `${action.color}18`, border: `1px solid ${action.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
              {action.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{action.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{action.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── KPI Metrics Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 18, marginBottom: 40 }}>
        <KPICard icon="🧑‍💼" label="Active Agents" value={stats.activeAgents} color="#667eea" link="/choose-agent" linkText="View Agents →" idx={0} />
        <KPICard icon="📅" label="Appointments" value={stats.appointments} color="#f59e0b" link="/my-bookings" linkText="View Timeline →" idx={1} />
        <KPICard icon="📄" label="Active Policies" value={stats.activePolicies} color="#10b981" link="/my-policies" linkText="View Policies →" idx={2} />
        <KPICard icon="❌" label="Rejected" value={stats.rejectedRequests} color="#ef4444" link="/my-bookings" linkText="Why rejected? →" idx={3} />
        <KPICard icon="🛡️" label="My Claims" value={stats.claims} color="#3b82f6" link="/claims" linkText="Track Claims →" idx={4} />
        <KPICard icon="💬" label="Feedback" value="Support" color="#8b5cf6" link="/feedback" linkText="Contact Us →" idx={5} />
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
                  animate={{ width: `${(appointmentStage / (appointments[0]?.bookingType === 'ENQUIRY' ? 3 : 4)) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #4f46e5, #8b5cf6)', borderRadius: 2 }}
                />
              </div>

              {/* Stages */}
              {(appointments[0]?.bookingType === 'ENQUIRY'
                ? ['Booked', 'Agent Assigned', 'Consulted', 'Resolved']
                : ['Booked', 'Agent Assigned', 'Consulted', 'Approved', 'Policy Issued']
              ).map((stage, idx, totalStages) => (
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
