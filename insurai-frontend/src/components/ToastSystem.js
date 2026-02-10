import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * Toast Notification System
 * Replaces all alert() calls with beautiful animated toasts
 */

const ToastContext = createContext();

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        const toast = { id, message, type, duration };

        setToasts(prev => [...prev, toast]);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, [removeToast]);

    const success = useCallback((message, duration) => {
        return addToast(message, 'success', duration);
    }, [addToast]);

    const error = useCallback((message, duration) => {
        return addToast(message, 'error', duration);
    }, [addToast]);

    const warning = useCallback((message, duration) => {
        return addToast(message, 'warning', duration);
    }, [addToast]);

    const info = useCallback((message, duration) => {
        return addToast(message, 'info', duration);
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ success, error, warning, info, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}


function ToastContainer({ toasts, onRemove }) {
    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '400px'
        }}>
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

function Toast({ toast, onRemove }) {
    const { id, message, type } = toast;

    const typeConfig = {
        success: {
            icon: '✅',
            color: '#22c55e',
            bg: '#dcfce7',
            border: '#86efac'
        },
        error: {
            icon: '❌',
            color: '#ef4444',
            bg: '#fee2e2',
            border: '#fca5a5'
        },
        warning: {
            icon: '⚠️',
            color: '#f59e0b',
            bg: '#fed7aa',
            border: '#fcd34d'
        },
        info: {
            icon: 'ℹ️',
            color: '#3b82f6',
            bg: '#dbeafe',
            border: '#93c5fd'
        }
    };

    const config = typeConfig[type] || typeConfig.info;

    return (
        <div
            style={{
                background: config.bg,
                border: `2px solid ${config.border}`,
                borderRadius: '12px',
                padding: '16px 20px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                animation: 'slideInRight 0.3s ease, fadeOut 0.3s ease 3.7s',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: '300px'
            }}
            onClick={() => onRemove(id)}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
            }}
        >
            <div style={{ fontSize: '1.5rem' }}>{config.icon}</div>
            <div style={{ flex: 1, color: '#111827', fontWeight: '500' }}>
                {message}
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(id);
                }}
                style={{
                    background: 'none',
                    border: 'none',
                    color: config.color,
                    fontSize: '1.25rem',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                }}
            >
                ×
            </button>

            <style>{`
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `}</style>
        </div>
    );
}

/**
 * Inline Banner Component
 * For page-level notifications
 */
export function InlineBanner({ type = 'info', message, onClose, icon }) {
    const typeConfig = {
        success: {
            icon: icon || '✅',
            color: '#22c55e',
            bg: '#dcfce7',
            border: '#86efac'
        },
        error: {
            icon: icon || '❌',
            color: '#ef4444',
            bg: '#fee2e2',
            border: '#fca5a5'
        },
        warning: {
            icon: icon || '⚠️',
            color: '#f59e0b',
            bg: '#fed7aa',
            border: '#fcd34d'
        },
        info: {
            icon: icon || 'ℹ️',
            color: '#3b82f6',
            bg: '#dbeafe',
            border: '#93c5fd'
        }
    };

    const config = typeConfig[type] || typeConfig.info;

    return (
        <div style={{
            background: config.bg,
            border: `2px solid ${config.border}`,
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
            animation: 'slideDown 0.3s ease'
        }}>
            <div style={{ fontSize: '1.5rem' }}>{config.icon}</div>
            <div style={{ flex: 1, color: '#111827', fontWeight: '500' }}>
                {message}
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: config.color,
                        fontSize: '1.25rem',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none';
                    }}
                >
                    ×
                </button>
            )}

            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}

/**
 * Success Card Component
 * Animated success confirmation
 */
export function SuccessCard({ title, message, actions }) {
    return (
        <div style={{
            background: 'linear-gradient(135deg, #dcfce7 0%, #86efac 100%)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            animation: 'scaleIn 0.5s ease',
            boxShadow: '0 8px 32px rgba(34, 197, 94, 0.2)'
        }}>
            <div style={{
                fontSize: '4rem',
                marginBottom: '16px',
                animation: 'bounce 0.6s ease'
            }}>
                ✅
            </div>

            <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 'bold',
                color: '#166534',
                marginBottom: '12px'
            }}>
                {title}
            </h2>

            <p style={{
                fontSize: '1.125rem',
                color: '#15803d',
                marginBottom: '24px'
            }}>
                {message}
            </p>

            {actions && (
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {actions}
                </div>
            )}

            <style>{`
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
            `}</style>
        </div>
    );
}

const ToastSystem = { ToastProvider, useToast, InlineBanner, SuccessCard };
export default ToastSystem;
