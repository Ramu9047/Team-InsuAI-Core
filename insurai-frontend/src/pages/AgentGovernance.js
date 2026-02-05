import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";

export default function AgentGovernance() {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [filter, setFilter] = useState('all'); // all, active, inactive
    const { notify } = useNotification();

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = () => {
        setLoading(true);
        api.get('/admin/agents/governance')
            .then(r => {
                setAgents(r.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                notify("Failed to load agents", "error");
                setLoading(false);
            });
    };

    const filteredAgents = agents.filter(a => {
        if (filter === 'active') return a.isActive;
        if (filter === 'inactive') return !a.isActive;
        return true;
    });

    const activeCount = agents.filter(a => a.isActive).length;
    const inactiveCount = agents.filter(a => !a.isActive).length;

    return (
        <div>
            <div style={{ marginBottom: 30 }}>
                <h1 className="text-gradient" style={{ marginBottom: 10, fontSize: "2.5rem" }}>
                    👥 Agent Governance
                </h1>
                <p style={{ opacity: 0.8 }}>
                    Manage agent assignments, monitor compliance, and control access
                </p>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
                <FilterTab
                    active={filter === 'all'}
                    onClick={() => setFilter('all')}
                    label="All Agents"
                    count={agents.length}
                />
                <FilterTab
                    active={filter === 'active'}
                    onClick={() => setFilter('active')}
                    label="Active"
                    count={activeCount}
                    color="#22c55e"
                />
                <FilterTab
                    active={filter === 'inactive'}
                    onClick={() => setFilter('inactive')}
                    label="Inactive"
                    count={inactiveCount}
                    color="#ef4444"
                />
            </div>

            {/* Agents Grid */}
            {loading ? (
                <div className="grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="card" style={{ minHeight: 250 }}>
                            <div className="skeleton" style={{ height: 20, width: "60%", marginBottom: 10 }}></div>
                            <div className="skeleton" style={{ height: 40, width: "80%", marginBottom: 20 }}></div>
                        </div>
                    ))}
                </div>
            ) : filteredAgents.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 20 }}>👤</div>
                    <h3>No {filter !== 'all' ? filter : ''} agents</h3>
                </div>
            ) : (
                <div className="grid">
                    {filteredAgents.map((agent, index) => (
                        <AgentCard
                            key={agent.agentId}
                            agent={agent}
                            index={index}
                            onClick={() => setSelectedAgent(agent)}
                            onRefresh={fetchAgents}
                        />
                    ))}
                </div>
            )}

            {/* Agent Detail Modal */}
            {selectedAgent && (
                <AgentDetailModal
                    agent={selectedAgent}
                    onClose={() => setSelectedAgent(null)}
                    onUpdate={fetchAgents}
                />
            )}
        </div>
    );
}

function FilterTab({ active, onClick, label, count, color }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: active ? `2px solid ${color || 'var(--primary)'}` : '1px solid var(--card-border)',
                background: active ? `${color || 'var(--primary)'}10` : 'transparent',
                color: active ? (color || 'var(--primary)') : 'var(--text-main)',
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 8
            }}
        >
            {label}
            <span style={{
                background: active ? (color || 'var(--primary)') : 'var(--card-border)',
                color: active ? 'white' : 'var(--text-main)',
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: '0.75rem',
                fontWeight: 700
            }}>
                {count}
            </span>
        </button>
    );
}

function AgentCard({ agent, index, onClick, onRefresh }) {
    const { notify } = useNotification();
    const [toggling, setToggling] = useState(false);

    const handleToggleStatus = async (e) => {
        e.stopPropagation();

        const newStatus = !agent.isActive;
        const reason = newStatus ? null : prompt("Reason for deactivation:");

        if (!newStatus && !reason) {
            notify("Deactivation reason is required", "error");
            return;
        }

        setToggling(true);
        try {
            await api.put(`/admin/agents/${agent.agentId}/status`, {
                isActive: newStatus,
                reason: reason
            });
            notify(`Agent ${newStatus ? 'activated' : 'deactivated'} successfully`, "success");
            onRefresh();
        } catch (err) {
            console.error(err);
            notify("Failed to update agent status", "error");
        } finally {
            setToggling(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card"
            style={{
                cursor: 'pointer',
                border: !agent.isActive ? '2px solid #ef4444' : undefined,
                opacity: !agent.isActive ? 0.7 : 1
            }}
            onClick={onClick}
        >
            {/* Status Badge */}
            <div style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: agent.isActive ? '#22c55e' : '#ef4444',
                color: 'white',
                padding: '4px 10px',
                borderRadius: 12,
                fontSize: '0.75rem',
                fontWeight: 700
            }}>
                {agent.isActive ? 'ACTIVE' : 'INACTIVE'}
            </div>

            {/* Agent Info */}
            <div style={{ marginBottom: 15, marginTop: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.5rem'
                    }}>
                        {agent.agentName?.charAt(0) || 'A'}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{agent.agentName}</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.6 }}>{agent.agentEmail}</p>
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div style={{ marginBottom: 15, padding: 10, background: 'rgba(0,0,0,0.03)', borderRadius: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.85rem' }}>
                    <div>
                        <div style={{ opacity: 0.6 }}>Consultations</div>
                        <div style={{ fontWeight: 700 }}>{agent.totalConsultations || 0}</div>
                    </div>
                    <div>
                        <div style={{ opacity: 0.6 }}>Pending</div>
                        <div style={{ fontWeight: 700, color: '#eab308' }}>{agent.pendingConsultations || 0}</div>
                    </div>
                    <div>
                        <div style={{ opacity: 0.6 }}>Approval Rate</div>
                        <div style={{ fontWeight: 700, color: '#22c55e' }}>
                            {agent.approvalRate ? `${agent.approvalRate.toFixed(0)}%` : 'N/A'}
                        </div>
                    </div>
                    <div>
                        <div style={{ opacity: 0.6 }}>SLA Breaches</div>
                        <div style={{ fontWeight: 700, color: agent.slaBreaches > 0 ? '#ef4444' : '#22c55e' }}>
                            {agent.slaBreaches || 0}
                        </div>
                    </div>
                </div>
            </div>

            {/* Flags */}
            {(agent.misconductFlags > 0 || agent.escalatedCases > 0) && (
                <div style={{ marginBottom: 15, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {agent.misconductFlags > 0 && (
                        <span style={{
                            background: '#ef444420',
                            color: '#ef4444',
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 700
                        }}>
                            ⚠️ {agent.misconductFlags} Misconduct
                        </span>
                    )}
                    {agent.escalatedCases > 0 && (
                        <span style={{
                            background: '#eab30820',
                            color: '#eab308',
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 700
                        }}>
                            📢 {agent.escalatedCases} Escalations
                        </span>
                    )}
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
                <button
                    className="primary-btn"
                    style={{ flex: 1 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                    }}
                >
                    Manage
                </button>
                <button
                    onClick={handleToggleStatus}
                    disabled={toggling}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 8,
                        border: '1px solid var(--card-border)',
                        background: agent.isActive ? '#ef444420' : '#22c55e20',
                        color: agent.isActive ? '#ef4444' : '#22c55e',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    {toggling ? 'Processing...' : agent.isActive ? 'Deactivate' : 'Activate'}
                </button>
            </div>
        </motion.div>
    );
}

function AgentDetailModal({ agent, onClose, onUpdate }) {
    const { notify } = useNotification();
    const [regions, setRegions] = useState(agent.assignedRegions || []);
    const [policyTypes, setPolicyTypes] = useState(agent.assignedPolicyTypes || []);
    const [saving, setSaving] = useState(false);

    const availableRegions = ['North', 'South', 'East', 'West', 'Central'];
    const availablePolicyTypes = ['Health', 'Life', 'Motor', 'Travel', 'Home'];

    const handleSaveAssignments = async () => {
        setSaving(true);
        try {
            await api.put(`/admin/agents/${agent.agentId}/assignments`, {
                regions,
                policyTypes
            });
            notify("Agent assignments updated successfully", "success");
            onUpdate();
            onClose();
        } catch (err) {
            console.error(err);
            notify("Failed to update assignments", "error");
        } finally {
            setSaving(false);
        }
    };

    const toggleRegion = (region) => {
        setRegions(prev =>
            prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
        );
    };

    const togglePolicyType = (type) => {
        setPolicyTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000,
            padding: 20,
            overflowY: 'auto'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card"
                style={{ width: 700, maxWidth: "100%", maxHeight: '90vh', overflowY: 'auto' }}
            >
                <h2 style={{ marginTop: 0 }}>Agent Management</h2>

                {/* Agent Info */}
                <div className="card" style={{ background: 'rgba(0,0,0,0.03)', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 15 }}>
                        <div style={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1.8rem'
                        }}>
                            {agent.agentName?.charAt(0) || 'A'}
                        </div>
                        <div>
                            <h3 style={{ margin: 0 }}>{agent.agentName}</h3>
                            <p style={{ margin: 0, opacity: 0.7 }}>{agent.agentEmail}</p>
                            <div style={{
                                marginTop: 5,
                                padding: '4px 10px',
                                background: agent.isActive ? '#22c55e20' : '#ef444420',
                                color: agent.isActive ? '#22c55e' : '#ef4444',
                                borderRadius: 12,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                display: 'inline-block'
                            }}>
                                {agent.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Total Consultations</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{agent.totalConsultations || 0}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Approval Rate</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#22c55e' }}>
                                {agent.approvalRate ? `${agent.approvalRate.toFixed(0)}%` : 'N/A'}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>SLA Breaches</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: agent.slaBreaches > 0 ? '#ef4444' : '#22c55e' }}>
                                {agent.slaBreaches || 0}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assigned Regions */}
                <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 10 }}>Assigned Regions</h3>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {availableRegions.map(region => (
                            <button
                                key={region}
                                onClick={() => toggleRegion(region)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                    border: regions.includes(region) ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                                    background: regions.includes(region) ? 'var(--primary)20' : 'transparent',
                                    color: regions.includes(region) ? 'var(--primary)' : 'var(--text-main)',
                                    fontWeight: regions.includes(region) ? 700 : 500,
                                    cursor: 'pointer'
                                }}
                            >
                                {regions.includes(region) && '✓ '}{region}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Assigned Policy Types */}
                <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 10 }}>Assigned Policy Types</h3>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {availablePolicyTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => togglePolicyType(type)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                    border: policyTypes.includes(type) ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                                    background: policyTypes.includes(type) ? 'var(--primary)20' : 'transparent',
                                    color: policyTypes.includes(type) ? 'var(--primary)' : 'var(--text-main)',
                                    fontWeight: policyTypes.includes(type) ? 700 : 500,
                                    cursor: 'pointer'
                                }}
                            >
                                {policyTypes.includes(type) && '✓ '}{type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        className="primary-btn"
                        onClick={handleSaveAssignments}
                        disabled={saving}
                        style={{ flex: 1 }}
                    >
                        {saving ? 'Saving...' : 'Save Assignments'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={saving}
                        style={{
                            flex: 1,
                            padding: '10px 20px',
                            borderRadius: 8,
                            border: '1px solid var(--card-border)',
                            background: 'transparent',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
