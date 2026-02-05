import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Smart Reminders Component
 * Displays intelligent reminders for appointments and pending actions
 */
export default function SmartReminders({ compact = false }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        if (user) {
            fetchReminders();
        }
        // eslint-disable-next-line
    }, [user]);

    const fetchReminders = async () => {
        try {
            const endpoint = compact ? '/reminders/pending' : '/reminders/all';
            const response = await api.get(endpoint, { params: { userId: user.id } });
            setReminders(response.data);
        } catch (error) {
            console.error('Failed to fetch reminders:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsSent = async (reminderId) => {
        try {
            await api.put(`/reminders/${reminderId}/mark-sent`);
            setReminders(prev => prev.map(r =>
                r.id === reminderId ? { ...r, sent: true } : r
            ));
        } catch (error) {
            console.error('Failed to mark reminder:', error);
        }
    };

    const deleteReminder = async (reminderId) => {
        try {
            await api.delete(`/reminders/${reminderId}`);
            setReminders(prev => prev.filter(r => r.id !== reminderId));
        } catch (error) {
            console.error('Failed to delete reminder:', error);
        }
    };

    const handleAction = (reminder) => {
        if (reminder.actionUrl) {
            navigate(reminder.actionUrl);
        }
        markAsSent(reminder.id);
    };

    const getPriorityStyles = (priority) => {
        switch (priority) {
            case 'URGENT':
                return { bg: '#fee2e2', border: '#ef4444', color: '#991b1b', icon: '🔴' };
            case 'HIGH':
                return { bg: '#fed7aa', border: '#f97316', color: '#9a3412', icon: '🟠' };
            case 'MEDIUM':
                return { bg: '#fef9c3', border: '#eab308', color: '#854d0e', icon: '🟡' };
            case 'LOW':
            default:
                return { bg: '#dbeafe', border: '#3b82f6', color: '#1e40af', icon: '🔵' };
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'APPOINTMENT': return '📅';
            case 'PENDING_ACTION': return '⚡';
            case 'DOCUMENT_UPLOAD': return '📄';
            case 'PAYMENT_DUE': return '💳';
            case 'POLICY_RENEWAL': return '🔄';
            default: return '🔔';
        }
    };

    if (loading) {
        return (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading reminders...
            </div>
        );
    }

    const pendingReminders = reminders.filter(r => !r.sent);
    const displayReminders = showAll ? reminders : pendingReminders.slice(0, compact ? 3 : 10);

    if (compact && pendingReminders.length === 0) {
        return null;
    }

    return (
        <div style={{ width: '100%' }}>
            {!compact && (
                <div style={{ marginBottom: 20 }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🔔 Smart Reminders</h2>
                    <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {pendingReminders.length} pending reminder{pendingReminders.length !== 1 ? 's' : ''}
                    </p>
                </div>
            )}

            {compact && pendingReminders.length > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, #fef3c3, #fef08a)',
                    border: '2px solid #eab308',
                    borderRadius: 12,
                    padding: '12px 16px',
                    marginBottom: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                }}>
                    <div style={{ fontSize: '1.5rem' }}>🔔</div>
                    <div style={{ flex: 1 }}>
                        <strong style={{ color: '#854d0e' }}>
                            You have {pendingReminders.length} pending reminder{pendingReminders.length !== 1 ? 's' : ''}
                        </strong>
                    </div>
                    <button
                        onClick={() => setShowAll(!showAll)}
                        style={{
                            background: '#eab308',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                        }}
                    >
                        {showAll ? 'Hide' : 'View All'}
                    </button>
                </div>
            )}

            <AnimatePresence mode="popLayout">
                {displayReminders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            padding: 40,
                            textAlign: 'center',
                            color: 'var(--text-muted)'
                        }}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: 10 }}>✅</div>
                        <p>No pending reminders. You're all caught up!</p>
                    </motion.div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {displayReminders.map((reminder, index) => {
                            const priorityStyles = getPriorityStyles(reminder.priority);
                            const typeIcon = getTypeIcon(reminder.type);

                            return (
                                <motion.div
                                    key={reminder.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    style={{
                                        background: reminder.sent ? '#f8fafc' : priorityStyles.bg,
                                        border: `2px solid ${reminder.sent ? '#e2e8f0' : priorityStyles.border}`,
                                        borderLeft: `6px solid ${priorityStyles.border}`,
                                        borderRadius: 12,
                                        padding: 16,
                                        opacity: reminder.sent ? 0.6 : 1,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                        <div style={{ fontSize: '2rem' }}>{typeIcon}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <h4 style={{
                                                    margin: 0,
                                                    color: reminder.sent ? 'var(--text-muted)' : priorityStyles.color,
                                                    fontSize: '1.05rem'
                                                }}>
                                                    {reminder.title}
                                                </h4>
                                                <span style={{ fontSize: '0.9rem' }}>{priorityStyles.icon}</span>
                                                {reminder.sent && (
                                                    <span style={{
                                                        background: '#22c55e',
                                                        color: 'white',
                                                        padding: '2px 8px',
                                                        borderRadius: 4,
                                                        fontSize: '0.7rem',
                                                        fontWeight: 700
                                                    }}>
                                                        ✓ READ
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{
                                                margin: 0,
                                                color: reminder.sent ? 'var(--text-muted)' : priorityStyles.color,
                                                fontSize: '0.9rem',
                                                opacity: 0.9
                                            }}>
                                                {reminder.message}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                        {reminder.actionUrl && !reminder.sent && (
                                            <button
                                                onClick={() => handleAction(reminder)}
                                                className="primary-btn"
                                                style={{
                                                    padding: '8px 16px',
                                                    fontSize: '0.85rem',
                                                    background: priorityStyles.border,
                                                    borderColor: priorityStyles.border
                                                }}
                                            >
                                                {reminder.actionLabel || 'Take Action'}
                                            </button>
                                        )}
                                        {!reminder.sent && (
                                            <button
                                                onClick={() => markAsSent(reminder.id)}
                                                className="secondary-btn"
                                                style={{
                                                    padding: '8px 16px',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                Mark as Read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteReminder(reminder.id)}
                                            className="secondary-btn"
                                            style={{
                                                padding: '8px 16px',
                                                fontSize: '0.85rem',
                                                color: '#ef4444',
                                                borderColor: '#ef4444'
                                            }}
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </AnimatePresence>

            {!compact && reminders.length > 10 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="secondary-btn"
                    style={{ width: '100%', marginTop: 20 }}
                >
                    {showAll ? 'Show Less' : `Show All (${reminders.length})`}
                </button>
            )}
        </div>
    );
}
