import React, { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";
import Modal from "../components/Modal";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function SuperAdminDashboard() {
    const { notify } = useNotification();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [actionModal, setActionModal] = useState({ isOpen: false, company: null, action: null });
    const [reason, setReason] = useState('');

    const fetchData = useCallback(() => {
        // setLoading(true); // Removed to prevent flicker
        api.get('/super-admin/dashboard')
            .then(res => setData(res.data))
            .catch(err => {
                console.error(err);
                notify("Failed to load dashboard", "error");
            })
            .finally(() => setLoading(false));
    }, [notify]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleAction = async () => {
        if ((actionModal.action === 'reject' || actionModal.action === 'suspend') && !reason.trim()) {
            notify("Reason is required", "error");
            return;
        }

        try {
            const endpoint = `/super-admin/companies/${actionModal.company.id}/${actionModal.action}`;
            await api.post(endpoint, { reason });
            notify(`Company ${actionModal.action}ed successfully`, "success");
            setActionModal({ isOpen: false, company: null, action: null });
            setReason('');
            fetchData();
        } catch (err) {
            notify(err.response?.data?.error || "Action failed", "error");
        }
    };

    if (loading && !data) return (
        <div style={{ padding: 40, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto', width: 50, height: 50, border: '4px solid rgba(79, 70, 229, 0.1)', borderTop: '4px solid #4f46e5', borderRadius: '50%' }}></div>
            <p style={{ marginTop: 20, color: 'var(--text-muted)' }}>Loading Super Admin Control Center...</p>
        </div>
    );

    if (!data) return <div style={{ padding: 40, textAlign: 'center', color: 'white' }}>Failed to load data</div>;

    const { metrics, funnel, riskOversight, companies } = data;
    const filteredCompanies = companies.filter(c => filter === 'ALL' || c.status === filter);

    const funnelData = [
        { label: 'Registered', value: funnel.registered, color: '#3b82f6', height: 100 },
        { label: 'Appointments', value: funnel.appointments, color: '#8b5cf6', height: 80 },
        { label: 'Consulted', value: funnel.consulted, color: '#ec4899', height: 70 },
        { label: 'Approved', value: funnel.approved, color: '#f59e0b', height: 60 },
        { label: 'Issued', value: funnel.policiesIssued, color: '#10b981', height: 50 }
    ];

    const riskData = [
        { name: 'Low Risk', value: riskOversight.lowRisk || 0, color: '#10b981' },
        { name: 'Medium Risk', value: riskOversight.mediumRisk || 0, color: '#f59e0b' },
        { name: 'High Risk', value: riskOversight.highRisk || 0, color: '#ef4444' }
    ];

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
                            🛠️ Super Admin Control Center
                        </h1>
                        <p style={{ marginTop: 10, color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}>
                            Govern the entire insurance ecosystem
                        </p>
                    </div>
                </div>
                <div style={{ height: 2, background: 'linear-gradient(90deg, #4f46e5, transparent)', marginTop: 15 }}></div>
            </motion.div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
                {[
                    { icon: '🏢', title: 'Total Companies', value: metrics.totalCompanies, color: '#3b82f6' },
                    { icon: '⏳', title: 'Pending Approval', value: metrics.pendingApprovals, color: '#f59e0b' },
                    { icon: '✅', title: 'Active Companies', value: metrics.activeCompanies, color: '#10b981' },
                    { icon: '🚫', title: 'Suspended', value: metrics.suspendedCompanies, color: '#ef4444' },
                    { icon: '⚠️', title: 'Fraud Alerts', value: metrics.fraudAlerts, color: '#ec4899' }
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        className="card"
                        style={{
                            borderTop: `4px solid ${metric.color}`,
                            padding: 25,
                            background: 'rgba(30, 41, 59, 0.7)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: 16
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                            <div style={{ fontSize: '2.5rem' }}>{metric.icon}</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: metric.color }}>
                                {metric.value}
                            </div>
                        </div>
                        <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.5px' }}>
                            {metric.title}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Funnel & Risk Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 30, marginBottom: 40 }}>
                {/* Conversion Funnel */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card"
                    style={{ padding: 0, overflow: 'hidden', background: 'rgba(30, 41, 59, 0.7)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <div style={{ padding: '25px 30px', background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', color: 'white' }}>
                        <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'white' }}>🔄 System Conversion Funnel</h3>
                        <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>User journey across all companies</p>
                    </div>
                    <div style={{ padding: 40 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 }}>
                            {funnelData.map((stage, idx) => (
                                <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${stage.height}%` }}
                                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                                        style={{
                                            background: `linear-gradient(180deg, ${stage.color}, ${stage.color}80)`,
                                            borderRadius: '8px 8px 0 0',
                                            minHeight: 80,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-end',
                                            padding: '10px 5px',
                                        }}
                                    >
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{stage.value}</div>
                                    </motion.div>
                                    <div style={{ marginTop: 10, fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                                        {stage.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Risk Distribution */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card"
                    style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', padding: 25 }}
                >
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.4rem' }}>🚨 Risk Oversight</h3>
                    <div style={{ height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={riskData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {riskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1e293b', borderRadius: 8, border: 'none' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 10 }}>
                        {riskData.map((risk, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: risk.color }}></div>
                                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>{risk.name} ({Math.round(risk.value)}%)</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Company Governance Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ padding: 0, overflow: 'hidden', background: 'rgba(30, 41, 59, 0.7)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}
            >
                <div style={{ padding: '25px 30px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'white' }}>🏢 Company Governance</h3>
                        <p style={{ margin: '5px 0 0 0', opacity: 0.7, fontSize: '0.9rem' }}>Manage registered insurance providers</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'SUSPENDED'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: 20,
                                    border: 'none',
                                    background: filter === status ? '#4f46e5' : 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <tr>
                                <th style={{ padding: '20px 30px', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Company Name</th>
                                <th style={{ padding: '20px 30px', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '20px 30px', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Email</th>
                                <th style={{ padding: '20px 30px', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Reg #</th>
                                <th style={{ padding: '20px 30px', textAlign: 'right', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCompanies.map((company, idx) => (
                                <motion.tr
                                    key={company.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                                >
                                    <td style={{ padding: '20px 30px', fontWeight: 600, fontSize: '1rem' }}>{company.name}</td>
                                    <td style={{ padding: '20px 30px' }}>
                                        <span style={{
                                            padding: '6px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700,
                                            background: company.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' :
                                                company.status === 'PENDING_APPROVAL' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                            color: company.status === 'APPROVED' ? '#10b981' :
                                                company.status === 'PENDING_APPROVAL' ? '#f59e0b' : '#ef4444'
                                        }}>
                                            {company.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px 30px', color: 'rgba(255,255,255,0.7)' }}>{company.email}</td>
                                    <td style={{ padding: '20px 30px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>{company.registrationNumber}</td>
                                    <td style={{ padding: '20px 30px', textAlign: 'right' }}>
                                        {company.status === 'PENDING_APPROVAL' && (
                                            <>
                                                <button onClick={() => setActionModal({ isOpen: true, company, action: 'approve' })} className="primary-btn" style={{ fontSize: '0.8rem', padding: '8px 16px', marginRight: 10 }}>Approve</button>
                                                <button onClick={() => setActionModal({ isOpen: true, company, action: 'reject' })} className="secondary-btn" style={{ fontSize: '0.8rem', padding: '8px 16px', color: '#ef4444', borderColor: '#ef4444' }}>Reject</button>
                                            </>
                                        )}
                                        {company.status === 'APPROVED' && (
                                            <button onClick={() => setActionModal({ isOpen: true, company, action: 'suspend' })} className="secondary-btn" style={{ fontSize: '0.8rem', padding: '8px 16px', color: '#ef4444', borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>Suspend</button>
                                        )}
                                        {company.status === 'SUSPENDED' && (
                                            <button onClick={() => setActionModal({ isOpen: true, company, action: 'approve' })} className="primary-btn" style={{ fontSize: '0.8rem', padding: '8px 16px', background: '#10b981' }}>Re-Activate</button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Action Modal */}
            <Modal isOpen={actionModal.isOpen} onClose={() => setActionModal({ isOpen: false, company: null, action: null })} title={`${actionModal.action === 'approve' ? 'Approve' : actionModal.action === 'reject' ? 'Reject' : 'Suspend'} Company`}>
                <div>
                    <p>Are you sure you want to {actionModal.action} <strong>{actionModal.company?.name}</strong>?</p>
                    {(actionModal.action === 'reject' || actionModal.action === 'suspend') && (
                        <textarea
                            placeholder="Reason for action..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            style={{
                                width: '100%',
                                padding: 12,
                                marginTop: 10,
                                borderRadius: 8,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)',
                                color: 'white',
                                fontFamily: 'inherit'
                            }}
                            rows={4}
                        />
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                        <button onClick={() => setActionModal({ isOpen: false, company: null, action: null })} className="secondary-btn">Cancel</button>
                        <button onClick={handleAction} className="primary-btn" style={{ background: actionModal.action === 'approve' ? '#10b981' : '#ef4444' }}>Confirm</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
