import React, { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext"; // Re-enable notify
import Modal from "../components/Modal";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CompanyDashboard() {
    const { notify } = useNotification();
    const [stats, setStats] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [aiInsights, setAiInsights] = useState([]);
    const [agents, setAgents] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    // Policy Management State
    const [policyModal, setPolicyModal] = useState({ isOpen: false, mode: 'add', policy: null });
    const [policyForm, setPolicyForm] = useState({
        name: '', type: 'Health', premium: '', coverage: '', description: '', tenure: 1, category: 'Personal'
    });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, policyId: null });

    const fetchData = useCallback(() => {
        // setLoading(true); 
        Promise.all([
            api.get('/company/dashboard'),
            api.get('/company/agents'),
            api.get('/company/policies')
        ])
            .then(([dashRes, agentsRes, policiesRes]) => {
                const dashboardData = dashRes.data || {};
                setStats(dashboardData.metrics || null);
                setSalesData(dashboardData.salesData || []);
                setAiInsights(dashboardData.aiInsights || []);
                setAgents(Array.isArray(agentsRes.data) ? agentsRes.data : []);
                setPolicies(Array.isArray(policiesRes.data) ? policiesRes.data : []);
            })
            .catch(err => {
                console.error(err);
                notify(err.response?.data?.error || "Failed to load dashboard data", "error");
            })
            .finally(() => setLoading(false));
    }, [notify]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handlePolicySubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...policyForm, premium: parseFloat(policyForm.premium), coverage: parseFloat(policyForm.coverage) };
            if (policyModal.mode === 'add') {
                await api.post('/company/policies', payload);
                notify("Policy created successfully", "success");
            } else {
                await api.put(`/company/policies/${policyModal.policy.id}`, payload);
                notify("Policy updated successfully", "success");
            }
            setPolicyModal({ isOpen: false, mode: 'add', policy: null });
            fetchData();
        } catch (err) {
            notify(err.response?.data?.error || "Operation failed", "error");
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/company/policies/${confirmModal.policyId}`);
            notify("Policy deleted successfully", "success");
            setConfirmModal({ isOpen: false, action: null, policyId: null });
            fetchData();
        } catch (err) {
            notify("Failed to delete policy", "error");
        }
    };

    const handleToggleStatus = async () => {
        try {
            const policy = policies.find(p => p.id === confirmModal.policyId);
            const newStatus = policy.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
            await api.put(`/company/policies/${confirmModal.policyId}`, { status: newStatus });
            notify(`Policy ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`, "success");
            setConfirmModal({ isOpen: false, action: null, policyId: null });
            fetchData();
        } catch (err) {
            notify("Failed to update status", "error");
        }
    };

    const openEditModal = (policy) => {
        setPolicyForm({
            name: policy.name,
            type: policy.type,
            premium: policy.premium,
            coverage: policy.coverage,
            description: policy.description,
            tenure: policy.tenure || 1,
            category: policy.category || 'Personal'
        });
        setPolicyModal({ isOpen: true, mode: 'edit', policy });
    };

    const openAddModal = () => {
        setPolicyForm({
            name: '', type: 'Health', premium: '', coverage: '', description: '', tenure: 1, category: 'Personal'
        });
        setPolicyModal({ isOpen: true, mode: 'add', policy: null });
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (loading && !stats) return <div style={{ padding: 40, textAlign: 'center', color: 'white' }}>Loading Company Dashboard...</div>;

    return (
        <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto', color: 'white' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 40 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="text-gradient" style={{ margin: 0, fontSize: '2.8rem' }}>
                            Company Command Center
                        </h1>
                        <p style={{ marginTop: 10, color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}>
                            Manage policies, track sales, and monitor agent performance
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ padding: '10px 20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 20, border: '1px solid #10b981', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>✅ Compliance: Approved</span>
                        </div>
                    </div>
                </div>
                <div style={{ height: 2, background: 'linear-gradient(90deg, #10b981, transparent)', marginTop: 15 }}></div>
            </motion.div>

            {/* Business KPI Snapshot */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
                {[
                    { label: 'Total Policies', value: stats?.totalPolicies || 0, color: '#3b82f6', icon: '📄', action: () => scrollToSection('policy-management') },
                    { label: 'Active Policies', value: stats?.activePolicies || 0, color: '#10b981', icon: '✅', action: () => scrollToSection('policy-management') },
                    { label: 'Policies Sold', value: stats?.policiesSold || 0, color: '#8b5cf6', icon: '🛒', action: () => scrollToSection('sales-analytics') },
                    { label: 'Revenue', value: `₹${(stats?.revenue || 0).toLocaleString()}`, color: '#f59e0b', icon: '💰', action: () => scrollToSection('sales-analytics') },
                    { label: 'Conversion Rate', value: `${stats?.conversionRate || 0}%`, color: '#ec4899', icon: '📈', action: () => scrollToSection('sales-analytics') }
                ].map((kpi, index) => (
                    <motion.div
                        key={index}
                        onClick={kpi.action}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, cursor: 'pointer' }}
                        className="card"
                        style={{
                            cursor: 'pointer',
                            borderTop: `4px solid ${kpi.color}`,
                            padding: 25,
                            background: 'rgba(30, 41, 59, 0.7)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: 16
                        }}
                    >
                        <div style={{ fontSize: '2rem', marginBottom: 10 }}>{kpi.icon}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: kpi.color, marginBottom: 5 }}>{kpi.value}</div>
                        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{kpi.label}</div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 30, marginBottom: 40 }}>
                {/* Sales Analytics */}
                <motion.div
                    id="sales-analytics"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card"
                    style={{ padding: 25, background: 'rgba(30, 41, 59, 0.7)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.4rem' }}>📈 Sales & Revenue</h3>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                                <YAxis stroke="rgba(255,255,255,0.5)" />
                                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                                <Bar dataKey="profit" fill="#8884d8" name="Revenue (₹)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* AI Insights */}
                <motion.div
                    id="ai-insights"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card"
                    style={{ padding: 25, background: 'rgba(30, 41, 59, 0.7)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.4rem' }}>🤖 AI Strategic Insights</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                        {aiInsights.length > 0 ? aiInsights.map((insight, idx) => (
                            <div key={idx} style={{
                                padding: 15,
                                background: insight.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : insight.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                borderRadius: 12,
                                borderLeft: `4px solid ${insight.type === 'warning' ? '#f59e0b' : insight.type === 'success' ? '#10b981' : '#8b5cf6'}`
                            }}>
                                <strong style={{ color: insight.type === 'warning' ? '#f59e0b' : insight.type === 'success' ? '#10b981' : '#8b5cf6', display: 'block', marginBottom: 5 }}>{insight.title}</strong>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>{insight.text}</p>
                            </div>
                        )) : (
                            <div style={{ padding: 10, fontStyle: 'italic', opacity: 0.7 }}>No insights generated yet. Sell more policies!</div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Policy Management Section */}
            <motion.div
                id="policy-management"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ marginBottom: 40, padding: 0, overflow: 'hidden', background: 'rgba(30, 41, 59, 0.7)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}
            >
                <div style={{ padding: '25px 30px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'white' }}>📄 Policy Management</h3>
                        <p style={{ margin: '5px 0 0 0', opacity: 0.7, fontSize: '0.9rem' }}>Create, edit, and manage your insurance products</p>
                    </div>
                    <button onClick={openAddModal} className="primary-btn" style={{ background: '#3b82f6', border: 'none', borderRadius: 20, padding: '10px 20px', fontWeight: 600 }}>
                        + Add New Policy
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <tr>
                                <th style={{ padding: '20px 30px', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Policy Name</th>
                                <th style={{ padding: '20px 30px', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Type</th>
                                <th style={{ padding: '20px 30px', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Premium</th>
                                <th style={{ padding: '20px 30px', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '20px 30px', textAlign: 'right', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {policies.map((p, idx) => (
                                <motion.tr
                                    key={p.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                                >
                                    <td style={{ padding: '20px 30px', fontWeight: 600 }}>{p.name}</td>
                                    <td style={{ padding: '20px 30px' }}>{p.type}</td>
                                    <td style={{ padding: '20px 30px', color: '#f59e0b', fontWeight: 600 }}>₹{p.premium}</td>
                                    <td style={{ padding: '20px 30px' }}>
                                        <span style={{
                                            padding: '6px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700,
                                            background: p.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                            color: p.status === 'ACTIVE' ? '#10b981' : '#ef4444'
                                        }}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px 30px', textAlign: 'right' }}>
                                        <button onClick={() => openEditModal(p)} className="secondary-btn" style={{ fontSize: '0.8rem', padding: '6px 12px', marginRight: 10 }}>Edit</button>
                                        <button onClick={() => setConfirmModal({ isOpen: true, action: 'toggle', policyId: p.id })} className="secondary-btn" style={{ fontSize: '0.8rem', padding: '6px 12px', marginRight: 10, color: p.status === 'ACTIVE' ? '#ef4444' : '#10b981', borderColor: p.status === 'ACTIVE' ? '#ef4444' : '#10b981' }}>
                                            {p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button onClick={() => setConfirmModal({ isOpen: true, action: 'delete', policyId: p.id })} className="secondary-btn" style={{ fontSize: '0.8rem', padding: '6px 12px', color: '#ef4444', borderColor: '#ef4444' }}>🗑️</button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Agent Performance */}
            <motion.div
                id="agent-performance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ padding: 25, background: 'rgba(30, 41, 59, 0.7)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}
            >
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.4rem' }}>👨‍💼 Agent Performance</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '15px 20px', textAlign: 'left', color: 'rgba(255,255,255,0.5)' }}>Agent</th>
                                <th style={{ padding: '15px 20px', textAlign: 'left', color: 'rgba(255,255,255,0.5)' }}>Rating</th>
                                <th style={{ padding: '15px 20px', textAlign: 'left', color: 'rgba(255,255,255,0.5)' }}>Approvals</th>
                                <th style={{ padding: '15px 20px', textAlign: 'left', color: 'rgba(255,255,255,0.5)' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {agents.map((agent, idx) => (
                                <tr key={agent.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '15px 20px' }}>{agent.name}</td>
                                    <td style={{ padding: '15px 20px', color: '#f59e0b' }}>⭐ {agent.rating}</td>
                                    <td style={{ padding: '15px 20px' }}>{agent.approvals}</td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span style={{ color: agent.status === 'Online' ? '#10b981' : '#9ca3af' }}>● {agent.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Policy Modal */}
            <Modal isOpen={policyModal.isOpen} onClose={() => setPolicyModal({ isOpen: false, mode: 'add', policy: null })} title={`${policyModal.mode === 'add' ? 'Add New' : 'Edit'} Policy`}>
                <form onSubmit={handlePolicySubmit} style={{ color: 'white', display: 'grid', gap: 15 }}>
                    <input
                        type="text"
                        placeholder="Policy Name"
                        value={policyForm.name}
                        onChange={e => setPolicyForm({ ...policyForm, name: e.target.value })}
                        required
                        style={{ padding: 10, borderRadius: 5, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <select value={policyForm.type} onChange={e => setPolicyForm({ ...policyForm, type: e.target.value })} style={{ padding: 10, borderRadius: 5, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                            <option value="Health" style={{ color: 'black' }}>Health</option>
                            <option value="Life" style={{ color: 'black' }}>Life</option>
                            <option value="Car" style={{ color: 'black' }}>Car</option>
                            <option value="Corporate" style={{ color: 'black' }}>Corporate</option>
                            <option value="Travel" style={{ color: 'black' }}>Travel</option>
                        </select>
                        <select value={policyForm.category} onChange={e => setPolicyForm({ ...policyForm, category: e.target.value })} style={{ padding: 10, borderRadius: 5, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                            <option value="Personal" style={{ color: 'black' }}>Personal</option>
                            <option value="Business" style={{ color: 'black' }}>Business</option>
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <input
                            type="number"
                            placeholder="Premium (₹)"
                            value={policyForm.premium}
                            onChange={e => setPolicyForm({ ...policyForm, premium: e.target.value })}
                            required
                            style={{ padding: 10, borderRadius: 5, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                        />
                        <input
                            type="number"
                            placeholder="Coverage Amount (₹)"
                            value={policyForm.coverage}
                            onChange={e => setPolicyForm({ ...policyForm, coverage: e.target.value })}
                            required
                            style={{ padding: 10, borderRadius: 5, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>
                    <textarea
                        placeholder="Description"
                        value={policyForm.description}
                        onChange={e => setPolicyForm({ ...policyForm, description: e.target.value })}
                        rows="3"
                        style={{ padding: 10, borderRadius: 5, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', width: '100%' }}
                    />
                    <button type="submit" className="primary-btn" style={{ marginTop: 10 }}>
                        {policyModal.mode === 'add' ? 'Create Policy' : 'Update Policy'}
                    </button>
                </form>
            </Modal>

            {/* Confirm Modal */}
            <Modal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, action: null, policyId: null })}
                title="Confirm Action"
                actions={
                    <>
                        <button onClick={() => setConfirmModal({ isOpen: false, action: null, policyId: null })} className="secondary-btn" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>Cancel</button>
                        <button onClick={confirmModal.action === 'delete' ? handleDelete : handleToggleStatus} className="primary-btn" style={{ background: confirmModal.action === 'delete' ? '#ef4444' : '#3b82f6' }}>Confirm</button>
                    </>
                }
            >
                <div style={{ color: 'var(--text-main)' }}>
                    <p>Are you sure you want to {confirmModal.action === 'delete' ? 'DELETE' : 'change status of'} this policy?</p>
                </div>
            </Modal>
        </div>
    );
}
