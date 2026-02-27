import { useEffect, useState, useCallback } from "react";
import { agentService } from '../services/agentService';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// New Enterprise Components
import NotificationCenter from '../components/NotificationCenter';
import CalendarView from '../components/CalendarView';
import SLATimer from '../components/SLATimer';
import DocumentManager from '../components/DocumentManager';
import KPICard from '../components/KPICard';

export default function AgentDashboardAdvanced() {
    const { user } = useAuth();
    const { notify } = useNotification();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [isAvailable, setIsAvailable] = useState(false);

    // Agent Stats
    const [stats, setStats] = useState({
        rating: 4.8,
        approvalRate: 92,
        pendingReviews: 5,
        approvedToday: 3,
        rejectedToday: 1,
        claims: 0,
        conversionRate: 0,
        weeklyVolume: 0,
        avgDecisionTime: 14,
        assignedRegions: [],
        assignedPolicyTypes: []
    });

    // Consultation Queue
    const [consultationQueue, setConsultationQueue] = useState([]);
    const [allAppointments, setAllAppointments] = useState([]);
    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [aiRecommendation, setAiRecommendation] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [sortBy, setSortBy] = useState('time'); // 'time' or 'risk'

    // Performance Data
    const [performanceData, setPerformanceData] = useState({
        approved: 92,
        rejected: 8
    });

    // Achievements
    // Achievements
    const [achievements, setAchievements] = useState([
        { icon: '🏅', title: 'Top Agent', subtitle: 'Fetching...' },
        { icon: '⚡', title: 'Fastest Approval', subtitle: 'Fetching...' },
        { icon: '🎯', title: 'High Accuracy', subtitle: 'Fetching...' }
    ]);

    const loadAgentData = useCallback(async () => {
        try {
            setLoading(true);
            setIsAvailable(user.available || false);

            const [consultations, perf] = await Promise.all([
                agentService.getAgentConsultations(),
                agentService.getAgentPerformance()
            ]);

            console.log("DEBUG: Agent Performance Data:", perf);

            // 1. Prepare Calendar Data (All Consultations)
            const calendarData = consultations.map(c => {
                const d = new Date(c.scheduledTime);
                let hours = d.getHours();
                const minutes = d.getMinutes().toString().padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12;
                const timeStr = `${hours}:${minutes} ${ampm}`;

                return {
                    id: c.bookingId,
                    time: timeStr,
                    duration: 60, // Default duration
                    userName: c.userName,
                    policyType: c.policyName || 'General Inquiry',
                    riskLevel: c.riskLevel || 'LOW', // Use backend risk level
                    status: c.status === 'APPROVED' ? 'CONFIRMED' : c.status,
                    date: d
                };
            });
            setAllAppointments(calendarData);

            // 2. Prepare Pending Queue (Filter Pending only)
            const queue = consultations
                .filter(c => c.status === 'PENDING')
                .map(c => ({
                    id: c.bookingId,
                    userName: c.userName,
                    policy: c.policyName || 'General Inquiry',
                    riskScore: c.matchScore ? (100 - c.matchScore) : 30, // Invert match or use risk
                    slot: new Date(c.scheduledTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }),
                    startTime: c.scheduledTime,
                    user: { id: c.userId, name: c.userName },
                    policyDetails: { id: c.policyId, name: c.policyName },
                    // Extra fields from DTO
                    riskLevel: c.riskLevel,
                    riskReason: c.riskReason,
                    recommendation: c.recommendation
                }))
                .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

            setConsultationQueue(queue);

            // 3. Process Performance Data
            if (perf) {
                setStats({
                    rating: perf.customerSatisfaction || 4.5,
                    approvalRate: Math.round(perf.approvalRate || 0),
                    pendingReviews: perf.pendingConsultations || queue.length,
                    approvedToday: perf.approvedToday || 0,
                    rejectedToday: perf.rejectedToday || 0,
                    claims: perf.claimsCount || 0,
                    conversionRate: Math.round(perf.conversionRate || 0),
                    weeklyVolume: perf.consultationsThisWeek || 0,
                    avgDecisionTime: perf.averageResponseTimeHours ? Math.round(perf.averageResponseTimeHours * 60) : 15, // Mins
                    assignedRegions: perf.assignedRegions || [],
                    assignedPolicyTypes: perf.assignedPolicyTypes || []
                });

                setPerformanceData({
                    approved: perf.approvalRate || 0,
                    rejected: perf.rejectionRate || 0
                });

                // Dynamic Achievements
                const newAchievements = [];
                if (perf.rankPercentile <= 10) newAchievements.push({ icon: '🏆', title: 'Top 10% Agent', subtitle: 'Ranked among best' });
                else newAchievements.push({ icon: '🏅', title: 'Top Performer', subtitle: 'Consistent Effort' });

                if (perf.customerSatisfaction >= 4.5) newAchievements.push({ icon: '⭐', title: 'Super Star', subtitle: 'High Ratings' });
                else newAchievements.push({ icon: '🎯', title: 'High Accuracy', subtitle: 'Consistent Quality' });

                if (perf.averageResponseTimeHours < 2) newAchievements.push({ icon: '⚡', title: 'Lightning Fast', subtitle: '< 2h Response' });
                else newAchievements.push({ icon: '⏱️', title: 'Reliable', subtitle: 'Always on time' });

                setAchievements(newAchievements);
            } else {
                // Fallback stats from local calc
                const approvedToday = consultations.filter(c => (c.status === 'APPROVED' || c.status === 'COMPLETED') && new Date(c.scheduledTime).toDateString() === new Date().toDateString()).length;
                const rejectedToday = consultations.filter(c => c.status === 'REJECTED' && new Date(c.scheduledTime).toDateString() === new Date().toDateString()).length;

                setStats({
                    rating: 4.8,
                    approvalRate: 92,
                    pendingReviews: queue.length,
                    approvedToday,
                    rejectedToday,
                    claims: 0,
                    conversionRate: 0,
                    weeklyVolume: 0,
                    avgDecisionTime: 14,
                    assignedRegions: user.assignedRegions || [],
                    assignedPolicyTypes: user.assignedPolicyTypes || []
                });
            }

        } catch (err) {
            console.error("Agent dashboard load error:", err);
            notify("Failed to load dashboard data", "error");
        } finally {
            setLoading(false);
        }
    }, [user, notify]);

    useEffect(() => {
        if (!user || user.role !== 'AGENT') return;
        loadAgentData();
    }, [user, loadAgentData]);


    // Check policy type
    const getRiskLevel = (score) => {
        if (score < 40) return { label: 'LOW', color: '#10b981', emoji: '🟢' };
        if (score < 70) return { label: 'MED', color: '#f59e0b', emoji: '🟡' };
        return { label: 'HIGH', color: '#ef4444', emoji: '🔴' };
    };

    const generateAIRecommendation = (consultation) => {
        // Use backend recommendation if available
        if (consultation.recommendation) {
            const risk = getRiskLevel(consultation.riskScore);
            return {
                user: consultation.userName,
                riskScore: consultation.riskScore,
                riskLevel: risk,
                suggestedAction: consultation.recommendation, // Map backend fields if needed
                reasons: consultation.riskReason ? [consultation.riskReason] : ['AI Analysis Completed']
            };
        }

        // Fallback logic
        const risk = getRiskLevel(consultation.riskScore);

        let recommendation = {
            user: consultation.userName,
            riskScore: consultation.riskScore,
            riskLevel: risk,
            suggestedAction: '',
            reasons: []
        };

        if (consultation.riskScore < 40) {
            recommendation.suggestedAction = 'Approve';
            recommendation.reasons = [
                '✓ Low risk profile',
                '✓ Standard policy requirements met',
                '✓ No red flags detected'
            ];
        } else if (consultation.riskScore < 70) {
            recommendation.suggestedAction = 'Review carefully';
            recommendation.reasons = [
                '⚠️ Moderate risk indicators',
                '⚠️ Verify income documentation',
                '⚠️ Check medical history if applicable'
            ];
        } else {
            recommendation.suggestedAction = 'Request additional documents';
            recommendation.reasons = [
                '⚠️ High risk score detected',
                '⚠️ Previous claim mismatch possible',
                '⚠️ Income-policy ratio anomaly',
                '⚠️ Recommend thorough verification'
            ];
        }

        return recommendation;
    };

    const handleConsultationAction = async (consultationId, action) => {
        try {
            let status = '';
            if (action === 'approve') status = 'APPROVED';
            if (action === 'reject') status = 'REJECTED';
            if (action === 'review') {
                // Open detailed review
                navigate(`/agent/requests`);
                return;
            }

            if (status) {
                await agentService.reviewConsultation(consultationId, status);
                notify(`Consultation ${action}d successfully`, "success");
                loadAgentData(); // Reload data
                setSelectedConsultation(null);
                setAiRecommendation(null);
            }
        } catch (err) {
            notify(`Failed to ${action} consultation`, "error");
        }
    };

    const toggleAvailability = async () => {
        try {
            const newState = !isAvailable;
            await agentService.updateAvailability(user.id, newState);
            setIsAvailable(newState);
            notify(`You are now ${newState ? 'Online 🟢' : 'Offline 🔴'}`, "success");
        } catch (e) {
            notify("Failed to update status", "error");
        }
    };

    const showAIAssist = async (consultation) => {
        setSelectedConsultation(consultation);
        setAiRecommendation(null); // Clear previous recommendation
        setAiLoading(true); // Start loading

        try {
            // 1. Try real AI backend
            if (consultation.user?.id && consultation.policyDetails?.id) {
                const aiData = await agentService.getRiskAssessment(consultation.user.id, consultation.policyDetails.id);

                if (aiData) {
                    const risk = getRiskLevel(aiData.riskScore);
                    setAiRecommendation({
                        user: consultation.userName,
                        riskScore: aiData.riskScore,
                        riskLevel: risk,
                        suggestedAction: aiData.recommendations?.[0] || 'Review Manually',
                        reasons: [
                            ...(aiData.riskFactors?.map(f => `⚠️ ${f.factor}: ${f.description}`) || []),
                            ...(aiData.recommendations?.slice(1).map(r => `ℹ️ ${r}`) || [])
                        ]
                    });
                    return; // Exit if backend data is successfully used
                }
            }
        } catch (e) {
            console.error("AI Fetch failed", e);
            // Fallback to local logic if backend fails
        } finally {
            setAiLoading(false); // Always stop loading
        }

        // 2. Fallback to local logic (if backend fails or missing data)
        const recommendation = generateAIRecommendation(consultation);
        setAiRecommendation(recommendation);
    };

    // Derived state for sorting
    const sortedQueue = [...consultationQueue].sort((a, b) => {
        if (sortBy === 'risk') return b.riskScore - a.riskScore; // High risk first
        return new Date(a.startTime) - new Date(b.startTime); // Earliest first
    });

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto', width: 50, height: 50, border: '4px solid rgba(79, 70, 229, 0.1)', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ marginTop: 20, color: 'var(--text-muted)' }}>Loading agent workspace...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 40 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="text-gradient" style={{ margin: 0, fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: 15 }}>
                            👨‍💼 Agent {user.name.split(' ')[0]}
                            <span style={{ fontSize: '0.7rem', padding: '4px 10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: 20, fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                🔄 Real-time Sync Active
                            </span>
                        </h1>
                        <div style={{ marginTop: 10, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '1.2rem' }}>⭐</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    Rating: {stats.rating}
                                </span>
                            </div>
                            <div style={{ width: 2, height: 20, background: 'var(--text-muted)', opacity: 0.3 }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '1.2rem' }}>📊</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    Approval Rate: {stats.approvalRate}%
                                </span>
                            </div>
                            <div style={{ width: 2, height: 20, background: 'var(--text-muted)', opacity: 0.3 }}></div>

                            {/* Region & Type Assignments */}
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>📡 Coverage:</span>
                                {(stats.assignedRegions || []).length > 0 ? (
                                    (stats.assignedRegions || []).map(r => (
                                        <span key={r} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', padding: '2px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>
                                            📍 {r}
                                        </span>
                                    ))
                                ) : (
                                    <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>⚠️ No Region Assigned</span>
                                )}
                            </div>

                            <div style={{ width: 2, height: 20, background: 'var(--text-muted)', opacity: 0.3 }}></div>

                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>🛡️ Specialization:</span>
                                {(stats.assignedPolicyTypes || []).length > 0 ? (
                                    (stats.assignedPolicyTypes || []).map(t => (
                                        <span key={t} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '2px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>
                                            {t}
                                        </span>
                                    ))
                                ) : (
                                    <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>⚠️ No Specialization</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <NotificationCenter userRole="AGENT" />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleAvailability}
                            style={{
                                background: isAvailable ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                                padding: '15px 30px',
                                color: 'white',
                                borderRadius: 30,
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10
                            }}
                        >
                            <div style={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                background: 'white',
                                boxShadow: '0 0 10px rgba(255,255,255,0.5)'
                            }}></div>
                            {isAvailable ? "Online 🟢" : "Offline 🔴"}
                        </motion.button>
                    </div>
                </div>
                <div style={{ height: 2, background: 'linear-gradient(90deg, #4f46e5, transparent)', marginTop: 15 }}></div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 18, marginBottom: 40 }}>
                <KPICard icon="⏳" label="Pending Status" value={stats.pendingReviews} color="#f59e0b" link="/agent/requests" linkText="View Queue →" idx={0} />
                <KPICard icon="✅" label="Approved Today" value={stats.approvedToday} color="#10b981" link="/agent/consultations?filter=approved_today" linkText="View Today →" idx={1} />
                <KPICard icon="❌" label="Rejected Today" value={stats.rejectedToday} color="#ef4444" link="/agent/consultations?filter=rejected_today" linkText="View Today →" idx={2} />
                <KPICard icon="🛡️" label="Policy Claims" value={stats.claims} color="#3b82f6" link="/agent/requests?tab=claims" linkText="Process Claims →" idx={3} />
                <KPICard icon="📅" label="Weekly Volume" value={stats.weeklyVolume} color="#6366f1" link="/agent/consultations" linkText="Weekly Log →" idx={4} />
                <KPICard icon="📊" label="Avg Response" value={`${stats.avgDecisionTime}m`} color="#3b82f6" link="/agent/performance" linkText="SLA Report →" idx={5} />
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 30, marginBottom: 40 }}>

                {/* Consultation Queue */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card"
                    style={{ padding: 0, overflow: 'hidden' }}
                >
                    <div style={{ padding: '25px 30px', background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'white' }}>🧾 Consultation Queue</h3>
                            <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>Prioritize and make decisions faster</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10, background: 'rgba(255,255,255,0.2)', padding: 4, borderRadius: 8 }}>
                            <button
                                onClick={() => setSortBy('time')}
                                style={{
                                    border: 'none',
                                    background: sortBy === 'time' ? 'white' : 'transparent',
                                    color: sortBy === 'time' ? '#4f46e5' : 'white',
                                    padding: '6px 12px',
                                    borderRadius: 6,
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                🕒 Time
                            </button>
                            <button
                                onClick={() => setSortBy('risk')}
                                style={{
                                    border: 'none',
                                    background: sortBy === 'risk' ? 'white' : 'transparent',
                                    color: sortBy === 'risk' ? '#ef4444' : 'white',
                                    padding: '6px 12px',
                                    borderRadius: 6,
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                ⚠️ Risk
                            </button>
                        </div>
                    </div>

                    {sortedQueue.length === 0 ? (
                        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '4rem', marginBottom: 15 }}>🎉</div>
                            <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>All Caught Up!</h3>
                            <p>No pending consultations at the moment.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <tr>
                                        <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>User Name</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Policy</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Risk</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Slot</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedQueue.map((consultation, idx) => {
                                        const risk = getRiskLevel(consultation.riskScore);
                                        return (
                                            <motion.tr
                                                key={consultation.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                style={{
                                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                    background: selectedConsultation?.id === consultation.id ? 'rgba(79, 70, 229, 0.1)' : 'transparent'
                                                }}
                                                className="hover-row"
                                            >
                                                <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-main)' }}>
                                                    {consultation.userName}
                                                </td>
                                                <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                    {consultation.policy}
                                                </td>
                                                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                    <span style={{
                                                        padding: '6px 12px',
                                                        borderRadius: 12,
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        background: `${risk.color}20`,
                                                        color: risk.color,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 5
                                                    }}>
                                                        {risk.emoji} {risk.label}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-main)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                                    {consultation.slot}
                                                </td>
                                                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                        <button
                                                            onClick={() => showAIAssist(consultation)}
                                                            style={{
                                                                padding: '6px 12px',
                                                                borderRadius: 6,
                                                                border: '1px solid #8b5cf6',
                                                                background: 'rgba(139, 92, 246, 0.1)',
                                                                color: '#8b5cf6',
                                                                fontSize: '0.8rem',
                                                                cursor: 'pointer',
                                                                fontWeight: 600
                                                            }}
                                                        >
                                                            🤖 AI Assist
                                                        </button>
                                                        <button
                                                            onClick={() => handleConsultationAction(consultation.id, 'approve')}
                                                            style={{
                                                                padding: '6px 12px',
                                                                borderRadius: 6,
                                                                border: 'none',
                                                                background: '#10b981',
                                                                color: 'white',
                                                                fontSize: '0.8rem',
                                                                cursor: 'pointer',
                                                                fontWeight: 600
                                                            }}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleConsultationAction(consultation.id, 'reject')}
                                                            style={{
                                                                padding: '6px 12px',
                                                                borderRadius: 6,
                                                                border: 'none',
                                                                background: '#ef4444',
                                                                color: 'white',
                                                                fontSize: '0.8rem',
                                                                cursor: 'pointer',
                                                                fontWeight: 600
                                                            }}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>

                {/* AI Decision Assist */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card"
                >
                    <h3 style={{ marginBottom: 20, fontSize: '1.3rem' }}>🤖 AI Decision Assist</h3>

                    {aiLoading ? (
                        <div style={{ padding: 40, textAlign: 'center' }}>
                            <div className="spinner" style={{ margin: '0 auto', width: 40, height: 40, border: '3px solid rgba(139, 92, 246, 0.1)', borderTop: '3px solid #8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <p style={{ marginTop: 15, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Analyzing risk factors...</p>
                        </div>
                    ) : !aiRecommendation ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 15 }}>🤖</div>
                            <p>Click "AI Assist" on any consultation to get smart recommendations</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 5 }}>User:</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>{aiRecommendation.user}</div>
                                </div>

                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>Risk Score:</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: '2rem' }}>{aiRecommendation.riskLevel.emoji}</span>
                                        <div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: aiRecommendation.riskLevel.color }}>
                                                {aiRecommendation.riskLevel.label}
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                ({aiRecommendation.riskScore}%)
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    padding: 15,
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    borderRadius: 8,
                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                    marginBottom: 20
                                }}>
                                    <div style={{ fontSize: '0.85rem', color: '#8b5cf6', marginBottom: 8, fontWeight: 600 }}>
                                        ⚠️ Suggested Action:
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                        {aiRecommendation.suggestedAction}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>
                                        Reason:
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {aiRecommendation.reasons.map((reason, idx) => (
                                            <div key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-main)', paddingLeft: 10 }}>
                                                {reason}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginTop: 25, display: 'flex', gap: 10 }}>
                                    <button
                                        className="primary-btn"
                                        onClick={() => handleConsultationAction(selectedConsultation.id, 'approve')}
                                        style={{ flex: 1, fontSize: '0.9rem', padding: '10px 20px' }}
                                    >
                                        ✅ Approve
                                    </button>
                                    <button
                                        className="secondary-btn"
                                        onClick={() => handleConsultationAction(selectedConsultation.id, 'reject')}
                                        style={{ flex: 1, fontSize: '0.9rem', padding: '10px 20px' }}
                                    >
                                        ❌ Reject
                                    </button>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </motion.div>
            </div>

            {/* Performance & Achievements */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>

                {/* Performance Analytics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                >
                    <h3 style={{ marginBottom: 20, fontSize: '1.3rem' }}>📈 Performance Analytics</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 20 }}>Approval vs Rejection (Last 30 Days)</p>

                    <div style={{ marginBottom: 30 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'flex-end' }}>
                            <div>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Approval Rate</span>
                                <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10b981' }}>{performanceData.approved}%</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target: 85%</span>
                            </div>
                        </div>
                        <div style={{ height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${performanceData.approved}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                style={{
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #10b981, #34d399)',
                                    borderRadius: 5
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {(performanceData.approved + performanceData.rejected) > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Approved', value: performanceData.approved, color: '#10b981' },
                                            { name: 'Rejected', value: performanceData.rejected, color: '#ef4444' }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {[
                                            { name: 'Approved', value: performanceData.approved, color: '#10b981' },
                                            { name: 'Rejected', value: performanceData.rejected, color: '#ef4444' }
                                        ].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: 'rgba(30, 41, 59, 0.95)', border: 'none', borderRadius: 8, color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: 'white' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', opacity: 0.7 }}>
                                <div style={{ fontSize: '2rem', marginBottom: 10 }}>📊</div>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>Not enough data for chart</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Achievements */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                >
                    <h3 style={{ marginBottom: 20, fontSize: '1.3rem' }}>🏆 Achievements</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {achievements.map((achievement, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 15,
                                    padding: 20,
                                    background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(139, 92, 246, 0.1))',
                                    borderRadius: 12,
                                    border: '1px solid rgba(79, 70, 229, 0.2)'
                                }}
                            >
                                <div style={{ fontSize: '3rem' }}>{achievement.icon}</div>
                                <div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 3 }}>
                                        {achievement.title}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {achievement.subtitle}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Calendar View */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 40 }}
            >
                <CalendarView
                    appointments={allAppointments}
                    userRole="AGENT"
                    onSlotClick={(date, time) => {
                        notify(`Slot clicked: ${date.toDateString()} at ${time}`, 'info');
                    }}
                />
            </motion.div>

            {/* Document Manager (for selected consultation) */}
            {selectedConsultation && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 40 }}
                >
                    <DocumentManager
                        userId={selectedConsultation.user?.id || 1}
                        userRole="AGENT"
                    />
                </motion.div>
            )}

            {/* SLA Timer for Pending Reviews */}
            {stats.pendingReviews > 0 && consultationQueue.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                        {consultationQueue.slice(0, 3).map((consultation, idx) => (
                            <SLATimer
                                key={consultation.id}
                                deadline={new Date(new Date(consultation.startTime).getTime() + 30 * 60 * 1000).toISOString()}
                                taskName={`Review: ${consultation.userName}`}
                                priority={getRiskLevel(consultation.riskScore).label === 'HIGH' ? 'HIGH' : 'MEDIUM'}
                                onExpire={() => notify(`SLA breach for ${consultation.userName}!`, 'error')}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
