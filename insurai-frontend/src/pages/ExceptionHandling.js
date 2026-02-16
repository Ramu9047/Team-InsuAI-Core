import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";

export default function ExceptionHandling() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCase, setSelectedCase] = useState(null);
    const [filter, setFilter] = useState('PENDING'); // PENDING, UNDER_REVIEW, RESOLVED, CLOSED
    const [typeFilter, setTypeFilter] = useState('all'); // all, ESCALATED_REJECTION, DISPUTED_CLAIM, AGENT_MISCONDUCT
    const { notify } = useNotification();
    const { user } = useAuth();



    const fetchCases = useCallback(() => {
        setLoading(true);
        const endpoint = filter === 'all' ? '/admin/exceptions' : `/admin/exceptions/status/${filter}`;
        api.get(endpoint)
            .then(r => {
                setCases(r.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                notify("Failed to load exception cases", "error");
                setLoading(false);
            });
    }, [filter, notify]);

    useEffect(() => {
        fetchCases();
    }, [fetchCases]);

    const filteredCases = typeFilter === 'all'
        ? cases
        : cases.filter(c => c.caseType === typeFilter);

    const pendingCount = cases.filter(c => c.status === 'PENDING').length;
    const underReviewCount = cases.filter(c => c.status === 'UNDER_REVIEW').length;
    const resolvedCount = cases.filter(c => c.status === 'RESOLVED').length;

    return (
        <div>
            <div style={{ marginBottom: 30 }}>
                <h1 className="text-gradient" style={{ marginBottom: 10, fontSize: "2.5rem" }}>
                    ⚖️ Exception Handling
                </h1>
                <p style={{ opacity: 0.8 }}>
                    Manage escalated rejections, disputed claims, and agent misconduct cases
                </p>
            </div>

            {/* Status Filter Tabs */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <FilterTab
                    active={filter === 'PENDING'}
                    onClick={() => setFilter('PENDING')}
                    label="Pending"
                    count={pendingCount}
                    color="#eab308"
                />
                <FilterTab
                    active={filter === 'UNDER_REVIEW'}
                    onClick={() => setFilter('UNDER_REVIEW')}
                    label="Under Review"
                    count={underReviewCount}
                    color="#3b82f6"
                />
                <FilterTab
                    active={filter === 'RESOLVED'}
                    onClick={() => setFilter('RESOLVED')}
                    label="Resolved"
                    count={resolvedCount}
                    color="#22c55e"
                />
            </div>

            {/* Type Filter */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
                <TypeFilterButton
                    active={typeFilter === 'all'}
                    onClick={() => setTypeFilter('all')}
                    label="All Types"
                    icon="📋"
                />
                <TypeFilterButton
                    active={typeFilter === 'ESCALATED_REJECTION'}
                    onClick={() => setTypeFilter('ESCALATED_REJECTION')}
                    label="Escalations"
                    icon="📢"
                />
                <TypeFilterButton
                    active={typeFilter === 'DISPUTED_CLAIM'}
                    onClick={() => setTypeFilter('DISPUTED_CLAIM')}
                    label="Disputes"
                    icon="⚠️"
                />
                <TypeFilterButton
                    active={typeFilter === 'AGENT_MISCONDUCT'}
                    onClick={() => setTypeFilter('AGENT_MISCONDUCT')}
                    label="Misconduct"
                    icon="🚫"
                />
            </div>

            {/* Cases Grid */}
            {loading ? (
                <div className="grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="card" style={{ minHeight: 250 }}>
                            <div className="skeleton" style={{ height: 20, width: "60%", marginBottom: 10 }}></div>
                            <div className="skeleton" style={{ height: 40, width: "80%", marginBottom: 20 }}></div>
                        </div>
                    ))}
                </div>
            ) : filteredCases.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 20 }}>✅</div>
                    <h3>No {filter.toLowerCase()} cases</h3>
                    <p style={{ opacity: 0.7 }}>All clear! No exceptions to handle.</p>
                </div>
            ) : (
                <div className="grid">
                    {filteredCases.map((exCase, index) => (
                        <ExceptionCaseCard
                            key={exCase.caseId}
                            exCase={exCase}
                            index={index}
                            onClick={() => setSelectedCase(exCase)}
                        />
                    ))}
                </div>
            )}

            {/* Case Detail Modal */}
            {selectedCase && (
                <ExceptionCaseModal
                    exCase={selectedCase}
                    onClose={() => setSelectedCase(null)}
                    onUpdate={fetchCases}
                    adminId={user?.id}
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
                border: active ? `2px solid ${color}` : '1px solid var(--card-border)',
                background: active ? `${color}10` : 'transparent',
                color: active ? color : 'var(--text-main)',
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
                background: active ? color : 'var(--card-border)',
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

function TypeFilterButton({ active, onClick, label, icon }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: active ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                background: active ? 'var(--primary)20' : 'transparent',
                color: active ? 'var(--primary)' : 'var(--text-main)',
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6
            }}
        >
            {icon} {label}
        </button>
    );
}

function ExceptionCaseCard({ exCase, index, onClick }) {
    const getCaseTypeColor = (type) => {
        switch (type) {
            case 'ESCALATED_REJECTION': return '#eab308';
            case 'DISPUTED_CLAIM': return '#ef4444';
            case 'AGENT_MISCONDUCT': return '#dc2626';
            default: return '#9ca3af';
        }
    };

    const getCaseTypeIcon = (type) => {
        switch (type) {
            case 'ESCALATED_REJECTION': return '📢';
            case 'DISPUTED_CLAIM': return '⚠️';
            case 'AGENT_MISCONDUCT': return '🚫';
            default: return '📋';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'CRITICAL': return '#dc2626';
            case 'HIGH': return '#ef4444';
            case 'MEDIUM': return '#eab308';
            case 'LOW': return '#22c55e';
            default: return '#9ca3af';
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
                borderLeft: `4px solid ${getCaseTypeColor(exCase.caseType)}`,
                position: 'relative'
            }}
            onClick={onClick}
        >
            {/* Priority Badge */}
            {exCase.isUrgent && (
                <div style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: '#dc2626',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: 12,
                    fontSize: '0.75rem',
                    fontWeight: 700
                }}>
                    🚨 URGENT
                </div>
            )}

            {/* Case Type */}
            <div style={{ marginBottom: 15, marginTop: exCase.isUrgent ? 30 : 0 }}>
                <div style={{
                    display: 'inline-block',
                    background: `${getCaseTypeColor(exCase.caseType)}20`,
                    color: getCaseTypeColor(exCase.caseType),
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginBottom: 10
                }}>
                    {getCaseTypeIcon(exCase.caseType)} {exCase.caseType.replace('_', ' ')}
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{exCase.title}</h3>
            </div>

            {/* Parties Involved */}
            <div style={{ marginBottom: 15, padding: 10, background: 'rgba(0,0,0,0.03)', borderRadius: 8 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6, marginBottom: 8 }}>
                    PARTIES INVOLVED
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.85rem' }}>
                    <div>
                        <div style={{ opacity: 0.6 }}>User</div>
                        <div style={{ fontWeight: 600 }}>{exCase.userName || 'N/A'}</div>
                    </div>
                    <div>
                        <div style={{ opacity: 0.6 }}>Agent</div>
                        <div style={{ fontWeight: 600 }}>{exCase.agentName || 'N/A'}</div>
                    </div>
                </div>
                {exCase.policyName && (
                    <div style={{ marginTop: 8 }}>
                        <div style={{ opacity: 0.6, fontSize: '0.75rem' }}>Policy</div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{exCase.policyName}</div>
                    </div>
                )}
            </div>

            {/* Description Preview */}
            <div style={{ marginBottom: 15 }}>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.4, opacity: 0.8 }}>
                    {exCase.description?.substring(0, 100) || 'No description'}
                    {exCase.description?.length > 100 && '...'}
                </div>
            </div>

            {/* Metadata */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={{
                    background: `${getPriorityColor(exCase.priority)}20`,
                    color: getPriorityColor(exCase.priority),
                    padding: '4px 8px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 700
                }}>
                    {exCase.priority} Priority
                </span>
                {exCase.requiresLegalReview && (
                    <span style={{
                        background: '#dc262620',
                        color: '#dc2626',
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        fontWeight: 700
                    }}>
                        ⚖️ Legal Review
                    </span>
                )}
                {exCase.requiresComplianceReview && (
                    <span style={{
                        background: '#eab30820',
                        color: '#eab308',
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        fontWeight: 700
                    }}>
                        📋 Compliance Review
                    </span>
                )}
            </div>

            {/* Timestamp */}
            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                Created {new Date(exCase.createdAt).toLocaleDateString()}
            </div>
        </motion.div>
    );
}

function ExceptionCaseModal({ exCase, onClose, onUpdate, adminId }) {
    const { notify } = useNotification();
    const [resolution, setResolution] = useState('');
    const [actionTaken, setActionTaken] = useState('APPROVED');
    const [resolving, setResolving] = useState(false);

    const handleResolve = async () => {
        if (!resolution.trim()) {
            notify("Please provide a resolution", "error");
            return;
        }

        setResolving(true);
        try {
            await api.put(`/admin/exceptions/${exCase.caseId}/resolve`, {
                resolution,
                actionTaken
            });
            notify("Exception case resolved successfully", "success");
            onUpdate();
            onClose();
        } catch (err) {
            console.error(err);
            notify("Failed to resolve case", "error");
        } finally {
            setResolving(false);
        }
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
                style={{ width: 800, maxWidth: "100%", maxHeight: '90vh', overflowY: 'auto' }}
            >
                <h2 style={{ marginTop: 0 }}>Exception Case Details</h2>

                {/* Case Header */}
                <div className="card" style={{ background: 'rgba(0,0,0,0.03)', marginBottom: 20 }}>
                    <h3 style={{ marginTop: 0 }}>{exCase.title}</h3>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                        <span style={{
                            background: 'var(--primary)20',
                            color: 'var(--primary)',
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontSize: '0.85rem',
                            fontWeight: 700
                        }}>
                            {exCase.caseType.replace('_', ' ')}
                        </span>
                        <span style={{
                            background: '#eab30820',
                            color: '#eab308',
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontSize: '0.85rem',
                            fontWeight: 700
                        }}>
                            {exCase.priority} Priority
                        </span>
                        <span style={{
                            background: '#3b82f620',
                            color: '#3b82f6',
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontSize: '0.85rem',
                            fontWeight: 700
                        }}>
                            {exCase.status}
                        </span>
                    </div>
                </div>

                {/* Parties */}
                <div className="card" style={{ background: 'rgba(0,0,0,0.03)', marginBottom: 20 }}>
                    <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>Parties Involved</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: 4 }}>USER</div>
                            <div style={{ fontWeight: 600 }}>{exCase.userName}</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>{exCase.userEmail}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: 4 }}>AGENT</div>
                            <div style={{ fontWeight: 600 }}>{exCase.agentName}</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>{exCase.agentEmail}</div>
                        </div>
                    </div>
                    {exCase.policyName && (
                        <div style={{ marginTop: 15, paddingTop: 15, borderTop: '1px solid var(--card-border)' }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: 4 }}>POLICY</div>
                            <div style={{ fontWeight: 600 }}>{exCase.policyName}</div>
                        </div>
                    )}
                </div>

                {/* Description */}
                <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 10 }}>Description</h3>
                    <div className="card" style={{ background: 'rgba(0,0,0,0.03)' }}>
                        <p style={{ margin: 0, lineHeight: 1.6 }}>{exCase.description}</p>
                    </div>
                </div>

                {/* User Complaint */}
                {exCase.userComplaint && (
                    <div style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: 10 }}>User Complaint</h3>
                        <div className="card" style={{ background: '#ef444410', borderLeft: '3px solid #ef4444' }}>
                            <p style={{ margin: 0, lineHeight: 1.6 }}>{exCase.userComplaint}</p>
                        </div>
                    </div>
                )}

                {/* Agent Response */}
                {exCase.agentResponse && (
                    <div style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: 10 }}>Agent Response</h3>
                        <div className="card" style={{ background: '#3b82f610', borderLeft: '3px solid #3b82f6' }}>
                            <p style={{ margin: 0, lineHeight: 1.6 }}>{exCase.agentResponse}</p>
                        </div>
                    </div>
                )}

                {/* Resolution Form (if not resolved) */}
                {exCase.status !== 'RESOLVED' && (
                    <div style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: 15 }}>Resolution</h3>

                        {/* Action Taken */}
                        <div style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                                Action Taken
                            </label>
                            <div style={{ display: 'flex', gap: 10 }}>
                                {['APPROVED', 'REJECTED', 'AGENT_WARNED', 'AGENT_SUSPENDED', 'POLICY_MODIFIED'].map(action => (
                                    <button
                                        key={action}
                                        onClick={() => setActionTaken(action)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: 8,
                                            border: actionTaken === action ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                                            background: actionTaken === action ? 'var(--primary)20' : 'transparent',
                                            color: actionTaken === action ? 'var(--primary)' : 'var(--text-main)',
                                            fontWeight: actionTaken === action ? 700 : 500,
                                            cursor: 'pointer',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        {action.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Resolution Text */}
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                                Resolution Details *
                            </label>
                            <textarea
                                value={resolution}
                                onChange={e => setResolution(e.target.value)}
                                placeholder="Explain the resolution and actions taken..."
                                rows={5}
                                style={{
                                    width: '100%',
                                    padding: 10,
                                    borderRadius: 8,
                                    border: '1px solid var(--card-border)',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Existing Resolution (if resolved) */}
                {exCase.status === 'RESOLVED' && (
                    <div style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: 10 }}>Resolution</h3>
                        <div className="card" style={{ background: '#22c55e10', borderLeft: '3px solid #22c55e' }}>
                            <div style={{ marginBottom: 10 }}>
                                <strong>Action Taken:</strong> {exCase.actionTaken?.replace('_', ' ')}
                            </div>
                            <p style={{ margin: 0, lineHeight: 1.6 }}>{exCase.resolution}</p>
                            <div style={{ marginTop: 10, fontSize: '0.85rem', opacity: 0.7 }}>
                                Resolved by {exCase.resolvedByName} on {new Date(exCase.resolvedAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                    {exCase.status !== 'RESOLVED' && (
                        <button
                            className="primary-btn"
                            onClick={handleResolve}
                            disabled={resolving}
                            style={{ flex: 1 }}
                        >
                            {resolving ? 'Resolving...' : 'Resolve Case'}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        disabled={resolving}
                        style={{
                            flex: 1,
                            padding: '10px 20px',
                            borderRadius: 8,
                            border: '1px solid var(--card-border)',
                            background: 'transparent',
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
