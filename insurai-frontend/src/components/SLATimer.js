import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SLATimer({ deadline, taskName, onExpire, priority = 'MEDIUM' }) {
    const [timeLeft, setTimeLeft] = useState(null);
    const [status, setStatus] = useState('ACTIVE'); // ACTIVE, WARNING, CRITICAL, EXPIRED

    useEffect(() => {
        if (!deadline) return;

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const deadlineTime = new Date(deadline).getTime();
            const diff = deadlineTime - now;

            if (diff <= 0) {
                setStatus('EXPIRED');
                setTimeLeft({ total: 0, hours: 0, minutes: 0, seconds: 0 });
                if (onExpire) onExpire();
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ total: diff, hours, minutes, seconds });

            // Update status based on time left
            if (diff < 5 * 60 * 1000) { // Less than 5 minutes
                setStatus('CRITICAL');
            } else if (diff < 15 * 60 * 1000) { // Less than 15 minutes
                setStatus('WARNING');
            } else {
                setStatus('ACTIVE');
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [deadline, onExpire]);

    const getStatusColor = () => {
        switch (status) {
            case 'EXPIRED': return '#ef4444';
            case 'CRITICAL': return '#f59e0b';
            case 'WARNING': return '#fbbf24';
            case 'ACTIVE': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'EXPIRED': return '🚨';
            case 'CRITICAL': return '⚠️';
            case 'WARNING': return '⏰';
            case 'ACTIVE': return '✅';
            default: return '⏱️';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'EXPIRED': return 'SLA BREACH';
            case 'CRITICAL': return 'URGENT';
            case 'WARNING': return 'EXPIRING SOON';
            case 'ACTIVE': return 'ON TRACK';
            default: return 'PENDING';
        }
    };

    const getPriorityColor = () => {
        switch (priority) {
            case 'CRITICAL': return '#dc2626';
            case 'HIGH': return '#f59e0b';
            case 'MEDIUM': return '#3b82f6';
            case 'LOW': return '#10b981';
            default: return '#6b7280';
        }
    };

    if (!timeLeft) {
        return (
            <div style={{
                padding: '12px 16px',
                background: 'rgba(107,114,128,0.1)',
                border: '1px solid rgba(107,114,128,0.3)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 10
            }}>
                <div className="spinner" style={{ width: 16, height: 16 }}></div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Loading timer...
                </span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                padding: '16px 20px',
                background: `${getStatusColor()}10`,
                border: `2px solid ${getStatusColor()}`,
                borderRadius: 12,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Animated background pulse for critical status */}
            {status === 'CRITICAL' && (
                <motion.div
                    animate={{
                        opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: getStatusColor(),
                        pointerEvents: 'none'
                    }}
                />
            )}

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.2rem' }}>{getStatusIcon()}</span>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: getStatusColor(),
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            {getStatusText()}
                        </span>
                    </div>

                    <div style={{
                        padding: '4px 10px',
                        background: `${getPriorityColor()}20`,
                        border: `1px solid ${getPriorityColor()}40`,
                        borderRadius: 8,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: getPriorityColor(),
                        textTransform: 'uppercase'
                    }}>
                        {priority}
                    </div>
                </div>

                {/* Task Name */}
                {taskName && (
                    <div style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        marginBottom: 12
                    }}>
                        {taskName}
                    </div>
                )}

                {/* Timer Display */}
                {status === 'EXPIRED' ? (
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: '#ef4444',
                        textAlign: 'center',
                        padding: '12px 0'
                    }}>
                        ⚠️ SLA BREACH DETECTED
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        {/* Hours */}
                        {timeLeft.hours > 0 && (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: 800,
                                    color: getStatusColor(),
                                    fontFamily: 'monospace',
                                    lineHeight: 1
                                }}>
                                    {String(timeLeft.hours).padStart(2, '0')}
                                </div>
                                <div style={{
                                    fontSize: '0.7rem',
                                    color: 'var(--text-muted)',
                                    marginTop: 4,
                                    textTransform: 'uppercase',
                                    fontWeight: 600
                                }}>
                                    Hours
                                </div>
                            </div>
                        )}

                        {/* Minutes */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: 800,
                                color: getStatusColor(),
                                fontFamily: 'monospace',
                                lineHeight: 1
                            }}>
                                {String(timeLeft.minutes).padStart(2, '0')}
                            </div>
                            <div style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-muted)',
                                marginTop: 4,
                                textTransform: 'uppercase',
                                fontWeight: 600
                            }}>
                                Minutes
                            </div>
                        </div>

                        {/* Seconds */}
                        <div style={{ textAlign: 'center' }}>
                            <motion.div
                                key={timeLeft.seconds}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    fontSize: '2rem',
                                    fontWeight: 800,
                                    color: getStatusColor(),
                                    fontFamily: 'monospace',
                                    lineHeight: 1
                                }}
                            >
                                {String(timeLeft.seconds).padStart(2, '0')}
                            </motion.div>
                            <div style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-muted)',
                                marginTop: 4,
                                textTransform: 'uppercase',
                                fontWeight: 600
                            }}>
                                Seconds
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                {status !== 'EXPIRED' && (
                    <div style={{
                        marginTop: 16,
                        height: 6,
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: 3,
                        overflow: 'hidden'
                    }}>
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{
                                width: `${Math.max(0, Math.min(100, (timeLeft.total / (60 * 60 * 1000)) * 100))}%`
                            }}
                            transition={{ duration: 0.5 }}
                            style={{
                                height: '100%',
                                background: `linear-gradient(90deg, ${getStatusColor()}, ${getStatusColor()}dd)`,
                                borderRadius: 3
                            }}
                        />
                    </div>
                )}

                {/* Deadline Info */}
                <div style={{
                    marginTop: 12,
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textAlign: 'center'
                }}>
                    Deadline: {new Date(deadline).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            </div>
        </motion.div>
    );
}

// SLA Dashboard Component for Admin
export function SLADashboard({ slaItems = [] }) {
    const itemsToShow = slaItems;

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'APPROVAL': return '✅';
            case 'VERIFICATION': return '🔍';
            case 'SUPPORT': return '💬';
            case 'CLAIMS': return '📋';
            default: return '📌';
        }
    };

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
                padding: '25px 30px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white'
            }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>
                    ⏱️ SLA Monitoring Dashboard
                </h3>
                <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '0.95rem' }}>
                    Real-time tracking of service level agreements
                </p>
            </div>

            <div style={{ padding: 30 }}>
                {/* Summary Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 30 }}>
                    <div style={{
                        padding: 16,
                        background: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: 12
                    }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                            On Track
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>
                            {itemsToShow.filter(item => new Date(item.deadline) - Date.now() > 15 * 60 * 1000).length}
                        </div>
                    </div>

                    <div style={{
                        padding: 16,
                        background: 'rgba(251,191,36,0.1)',
                        border: '1px solid rgba(251,191,36,0.3)',
                        borderRadius: 12
                    }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                            At Risk
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>
                            {itemsToShow.filter(item => {
                                const diff = new Date(item.deadline) - Date.now();
                                return diff > 0 && diff <= 15 * 60 * 1000;
                            }).length}
                        </div>
                    </div>

                    <div style={{
                        padding: 16,
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: 12
                    }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                            Breached
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>
                            {itemsToShow.filter(item => new Date(item.deadline) - Date.now() <= 0).length}
                        </div>
                    </div>
                </div>

                {/* SLA Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {itemsToShow.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                            <div style={{ fontSize: '2rem', marginBottom: 10 }}>✅</div>
                            <div>No urgent tasks pending</div>
                        </div>
                    ) : (
                        itemsToShow.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <div style={{
                                    padding: 20,
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 12
                                }}>
                                    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                                        {/* Category Icon */}
                                        <div style={{ fontSize: '2rem', flexShrink: 0 }}>
                                            {getCategoryIcon(item.category)}
                                        </div>

                                        {/* Task Info */}
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                                {item.taskName}
                                            </h4>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                                                Assigned to: {item.assignedTo} • Category: {item.category || 'GENERAL'}
                                            </div>

                                            {/* Timer */}
                                            <SLATimer
                                                deadline={item.deadline}
                                                priority={item.priority}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
