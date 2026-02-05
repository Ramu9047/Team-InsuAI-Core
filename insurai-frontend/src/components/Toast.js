import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

/**
 * Toast Notification Component
 * Provides contextual, non-intrusive feedback
 * Replaces browser alerts with beautiful animations
 */
export default function Toast({ message, type = 'info', duration = 4000, onClose, icon }) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                    border: '#22c55e',
                    icon: icon || '✅',
                    color: '#166534'
                };
            case 'error':
                return {
                    bg: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                    border: '#ef4444',
                    icon: icon || '❌',
                    color: '#991b1b'
                };
            case 'warning':
                return {
                    bg: 'linear-gradient(135deg, #fef9c3, #fef08a)',
                    border: '#eab308',
                    icon: icon || '⚠️',
                    color: '#854d0e'
                };
            case 'info':
            default:
                return {
                    bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                    border: '#3b82f6',
                    icon: icon || 'ℹ️',
                    color: '#1e40af'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
                position: 'fixed',
                top: 20,
                right: 20,
                zIndex: 9999,
                minWidth: 300,
                maxWidth: 500,
                background: styles.bg,
                border: `2px solid ${styles.border}`,
                borderRadius: 12,
                padding: '16px 20px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer'
            }}
            onClick={onClose}
        >
            <div style={{ fontSize: '1.5rem' }}>{styles.icon}</div>
            <div style={{ flex: 1, color: styles.color, fontWeight: 500, lineHeight: 1.4 }}>
                {message}
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: styles.color,
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    opacity: 0.6,
                    transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = '0.6'}
            >
                ×
            </button>

            {/* Progress bar */}
            {duration > 0 && (
                <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: duration / 1000, ease: 'linear' }}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        height: 3,
                        background: styles.border,
                        borderRadius: '0 0 10px 10px'
                    }}
                />
            )}
        </motion.div>
    );
}

/**
 * Toast Container Component
 * Manages multiple toast notifications
 */
export function ToastContainer({ toasts, removeToast }) {
    return (
        <AnimatePresence mode="popLayout">
            {toasts.map((toast, index) => (
                <motion.div
                    key={toast.id}
                    style={{
                        position: 'fixed',
                        top: 20 + index * 90,
                        right: 20,
                        zIndex: 9999 - index
                    }}
                    layout
                >
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        icon={toast.icon}
                        onClose={() => removeToast(toast.id)}
                    />
                </motion.div>
            ))}
        </AnimatePresence>
    );
}
