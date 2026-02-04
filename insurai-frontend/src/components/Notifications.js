import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Notifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!user) return;

        const client = new Client({
            brokerURL: 'ws://localhost:8080/ws',
            onConnect: () => {
                console.log('Connected to WS');

                // Subscribe to user-specific channel
                client.subscribe(`/topic/user/${user.id}`, (message) => {
                    const msg = message.body;
                    addNotification(msg);
                });

                // Subscribe to public/agent channels if needed
                if (user.role === 'AGENT') {
                    client.subscribe(`/topic/agent/${user.id}`, (message) => {
                        addNotification(message.body);
                    });
                }
            },
            onDisconnect: () => {
                console.log('Disconnected from WS');
            },
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [user]);

    const addNotification = (text) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, text }]);
        // Auto remove after 5s
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    return (
        <div style={{
            position: 'fixed', top: 20, right: 20, zIndex: 9999,
            display: 'flex', flexDirection: 'column', gap: 10
        }}>
            <AnimatePresence>
                {notifications.map(n => (
                    <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            padding: '12px 20px',
                            borderRadius: 12,
                            boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
                            borderLeft: '5px solid #4f46e5',
                            maxWidth: 300,
                            fontSize: '0.9rem',
                            color: '#1e293b'
                        }}
                    >
                        <strong>🔔 Notification</strong>
                        <p style={{ margin: '5px 0 0 0', opacity: 0.8 }}>{n.text}</p>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
