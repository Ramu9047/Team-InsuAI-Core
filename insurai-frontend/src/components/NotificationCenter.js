import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';

export default function NotificationCenter({ userRole }) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const notifs = await notificationService.getNotifications(userRole);
                const data = notifs || [];
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.read).length); // Recalculate unread from fresh data
            } catch (err) {
                console.error("Failed to load notifications", err);
                setNotifications([]);
                setUnreadCount(0);
            }
        };

        loadNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [userRole]);

    const markAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
        } catch (err) {
            console.error('Failed to mark notification as read');
        }

        setNotifications(prev => {
            const updated = prev.map(n => n.id === notificationId ? { ...n, read: true } : n);
            setUnreadCount(updated.filter(n => !n.read).length); // Recalculate accurately
            return updated;
        });
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        if (notification.action) {
            navigate(notification.action);
        }
        setIsOpen(false);
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
        } catch (error) {
            console.error('Failed to mark all as read');
        }

        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return '#ef4444';
            case 'high': return '#f59e0b';
            case 'normal': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Just now';
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return 'Just now';

        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        return date.toLocaleDateString();
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Notification Bell */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            >
                <span style={{ fontSize: '1.3rem' }}>🔔</span>
                {unreadCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                            position: 'absolute',
                            top: -5,
                            right: -5,
                            background: '#ef4444',
                            color: 'white',
                            borderRadius: '50%',
                            width: 22,
                            height: 22,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            border: '2px solid var(--bg-primary)'
                        }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.div>
                )}
            </button>

            {/* Notification Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            key="backdrop"
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 998
                            }}
                        />

                        {/* Panel */}
                        <motion.div
                            key="panel"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: 'absolute',
                                top: 'calc(100% + 10px)',
                                right: 0,
                                width: 420,
                                maxHeight: 600,
                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 16,
                                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                zIndex: 999,
                                overflow: 'hidden'
                            }}
                        >
                            {/* Header */}
                            <div style={{
                                padding: '20px 24px',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                        🔔 Notifications
                                    </h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {unreadCount} unread
                                    </p>
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#3b82f6',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            padding: '6px 12px',
                                            borderRadius: 8,
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            {/* Notifications List */}
                            <div style={{
                                maxHeight: 480,
                                overflowY: 'auto',
                                padding: '8px 0'
                            }}>
                                {notifications.length === 0 ? (
                                    <div style={{
                                        padding: 60,
                                        textAlign: 'center',
                                        color: 'var(--text-muted)'
                                    }}>
                                        <div style={{ fontSize: '3rem', marginBottom: 15 }}>🔕</div>
                                        <p style={{ margin: 0, fontSize: '0.95rem' }}>No notifications yet</p>
                                        <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', opacity: 0.7 }}>
                                            You're all caught up!
                                        </p>
                                    </div>
                                ) : (
                                    notifications.map((notif, idx) => (
                                        <motion.div
                                            key={notif.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => handleNotificationClick(notif)}
                                            style={{
                                                padding: '16px 24px',
                                                borderBottom: idx < notifications.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                                cursor: 'pointer',
                                                background: notif.read ? 'transparent' : 'rgba(59,130,246,0.05)',
                                                borderLeft: `3px solid ${getPriorityColor(notif.priority)}`,
                                                transition: 'background 0.2s',
                                                position: 'relative'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(59,130,246,0.05)'}
                                        >
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                                                    {notif.icon}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                        <h4 style={{
                                                            margin: 0,
                                                            fontSize: '0.95rem',
                                                            fontWeight: 600,
                                                            color: 'var(--text-main)',
                                                            flex: 1
                                                        }}>
                                                            {notif.title}
                                                        </h4>
                                                        {!notif.read && (
                                                            <div style={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                background: '#3b82f6',
                                                                flexShrink: 0
                                                            }} />
                                                        )}
                                                    </div>
                                                    <p style={{
                                                        margin: '4px 0',
                                                        fontSize: '0.85rem',
                                                        color: 'var(--text-muted)',
                                                        lineHeight: 1.4
                                                    }}>
                                                        {notif.message}
                                                    </p>
                                                    <div style={{
                                                        fontSize: '0.75rem',
                                                        color: 'var(--text-muted)',
                                                        marginTop: 6,
                                                        opacity: 0.7
                                                    }}>
                                                        {formatTimestamp(notif.timestamp)}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div style={{
                                    padding: '16px 24px',
                                    borderTop: '1px solid rgba(255,255,255,0.1)',
                                    textAlign: 'center'
                                }}>
                                    <button
                                        onClick={() => {
                                            navigate('/notifications');
                                            setIsOpen(false);
                                        }}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#3b82f6',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            padding: '8px 16px',
                                            borderRadius: 8,
                                            transition: 'background 0.2s',
                                            width: '100%'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        View All Notifications →
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
