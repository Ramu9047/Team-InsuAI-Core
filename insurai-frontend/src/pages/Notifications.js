import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'urgent'
    const navigate = useNavigate();

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const data = await notificationService.getNotifications(user?.role);
                setNotifications(data || notificationService.generateMockNotifications(user?.role));
            } catch (err) {
                setNotifications(notificationService.generateMockNotifications(user?.role));
            }
        };
        loadNotifications();
    }, [user]);

    const handleMarkAsRead = async (id) => {
        await notificationService.markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleMarkAllRead = async () => {
        await notificationService.markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        if (filter === 'urgent') return n.priority === 'urgent';
        return true;
    });

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

        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="container" style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                <div>
                    <h2 style={{ fontSize: '2rem', marginBottom: 8, background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Notifications
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>Stay updated with your latest activities</p>
                </div>
                <button
                    onClick={handleMarkAllRead}
                    className="secondary-btn"
                    style={{ fontSize: '0.9rem' }}
                >
                    Mark all as read
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {['all', 'unread', 'urgent'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: 20,
                            border: filter === f ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                            background: filter === f ? 'rgba(99,102,241,0.2)' : 'transparent',
                            color: filter === f ? '#fff' : 'var(--text-muted)',
                            textTransform: 'capitalize',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {filteredNotifications.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 16 }}>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
                        <h3 style={{ color: 'var(--text-muted)' }}>No notifications found</h3>
                    </div>
                ) : (
                    filteredNotifications.map((notif, idx) => (
                        <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            style={{
                                padding: 20,
                                background: notif.read ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.05)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderLeft: `4px solid ${getPriorityColor(notif.priority)}`,
                                borderRadius: 12,
                                display: 'flex',
                                gap: 16,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onClick={() => {
                                handleMarkAsRead(notif.id);
                                if (notif.action) navigate(notif.action);
                            }}
                            whileHover={{ transform: 'translateX(4px)', background: 'rgba(255,255,255,0.05)' }}
                        >
                            <div style={{ fontSize: '2rem', flexShrink: 0 }}>
                                {notif.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <h4 style={{ margin: 0, color: 'var(--text-main)' }}>{notif.title}</h4>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {formatTimestamp(notif.timestamp)}
                                    </span>
                                </div>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                    {notif.message}
                                </p>
                            </div>
                            {notif.read ? null : (
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#6366f1', alignSelf: 'center' }} />
                            )}
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
