import React from 'react';

/**
 * Primary Button Component
 * Consistent button styling across the application
 */
export function PrimaryButton({
    children,
    onClick,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    fullWidth = false,
    icon = null,
    loading = false,
    ...props
}) {
    const variants = {
        primary: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            hoverTransform: 'translateY(-2px)',
            hoverShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
        },
        secondary: {
            background: 'white',
            color: '#667eea',
            border: '2px solid #667eea',
            hoverTransform: 'translateY(-2px)',
            hoverShadow: '0 8px 16px rgba(102, 126, 234, 0.2)'
        },
        success: {
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            color: 'white',
            hoverTransform: 'translateY(-2px)',
            hoverShadow: '0 8px 16px rgba(34, 197, 94, 0.3)'
        },
        danger: {
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            hoverTransform: 'translateY(-2px)',
            hoverShadow: '0 8px 16px rgba(239, 68, 68, 0.3)'
        },
        ghost: {
            background: 'transparent',
            color: '#667eea',
            hoverBackground: '#f3f4f6'
        }
    };

    const sizes = {
        small: { padding: '8px 16px', fontSize: '0.875rem' },
        medium: { padding: '12px 24px', fontSize: '1rem' },
        large: { padding: '16px 32px', fontSize: '1.125rem' }
    };

    const style = variants[variant];
    const sizeStyle = sizes[size];

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            style={{
                ...sizeStyle,
                background: style.background,
                color: style.color,
                border: style.border || 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: disabled || loading ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: fullWidth ? '100%' : 'auto',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
                if (!disabled && !loading) {
                    e.currentTarget.style.transform = style.hoverTransform || 'none';
                    e.currentTarget.style.boxShadow = style.hoverShadow || 'none';
                    if (style.hoverBackground) {
                        e.currentTarget.style.background = style.hoverBackground;
                    }
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled && !loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    if (style.hoverBackground) {
                        e.currentTarget.style.background = style.background;
                    }
                }
            }}
            {...props}
        >
            {loading && (
                <div className="spinner" style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                }} />
            )}
            {icon && !loading && <span>{icon}</span>}
            {children}
        </button>
    );
}

/**
 * Status Badge Component
 * Color-coded status indicators
 */
export function StatusBadge({ status, size = 'medium' }) {
    const statusConfig = {
        PENDING: { color: '#eab308', bg: '#fef3c7', icon: '⏳', text: 'Pending' },
        CONFIRMED: { color: '#3b82f6', bg: '#dbeafe', icon: '✅', text: 'Confirmed' },
        COMPLETED: { color: '#8b5cf6', bg: '#ede9fe', icon: '🎯', text: 'Completed' },
        POLICY_ISSUED: { color: '#22c55e', bg: '#dcfce7', icon: '🎉', text: 'Policy Issued' },
        REJECTED: { color: '#ef4444', bg: '#fee2e2', icon: '❌', text: 'Rejected' },
        EXPIRED: { color: '#6b7280', bg: '#f3f4f6', icon: '⌛', text: 'Expired' },
        CANCELLED: { color: '#f59e0b', bg: '#fed7aa', icon: '🚫', text: 'Cancelled' },
        PENDING_ADMIN_APPROVAL: { color: '#f59e0b', bg: '#fed7aa', icon: '🔍', text: 'Admin Review' },
        ACTIVE: { color: '#22c55e', bg: '#dcfce7', icon: '✓', text: 'Active' },
        INACTIVE: { color: '#6b7280', bg: '#f3f4f6', icon: '○', text: 'Inactive' }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const sizes = {
        small: { padding: '4px 8px', fontSize: '0.75rem' },
        medium: { padding: '6px 12px', fontSize: '0.85rem' },
        large: { padding: '8px 16px', fontSize: '1rem' }
    };

    return (
        <span style={{
            ...sizes[size],
            background: config.bg,
            color: config.color,
            borderRadius: '20px',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
        }}>
            <span>{config.icon}</span>
            <span>{config.text}</span>
        </span>
    );
}

/**
 * Stat Card Component
 * Dashboard statistics cards
 */
export function StatCard({
    title,
    value,
    icon,
    trend = null,
    color = '#667eea',
    subtitle = null
}) {
    return (
        <div style={{
            padding: '24px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}>
            {/* Background Icon */}
            <div style={{
                position: 'absolute',
                right: '-10px',
                top: '-10px',
                fontSize: '5rem',
                opacity: 0.1
            }}>
                {icon}
            </div>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    marginBottom: '8px',
                    fontWeight: '500'
                }}>
                    {title}
                </div>

                <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: color,
                    marginBottom: '8px'
                }}>
                    {value}
                </div>

                {subtitle && (
                    <div style={{
                        fontSize: '0.875rem',
                        color: '#6b7280'
                    }}>
                        {subtitle}
                    </div>
                )}

                {trend && (
                    <div style={{
                        marginTop: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.875rem',
                        color: trend > 0 ? '#22c55e' : '#ef4444',
                        fontWeight: '600'
                    }}>
                        <span>{trend > 0 ? '↑' : '↓'}</span>
                        <span>{Math.abs(trend)}%</span>
                        <span style={{ color: '#6b7280', fontWeight: '400' }}>vs last month</span>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Animated Modal Component
 */
export function AnimatedModal({ isOpen, onClose, title, children, maxWidth = '600px' }) {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                animation: 'fadeIn 0.3s ease'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '16px',
                    maxWidth: maxWidth,
                    width: '90%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    animation: 'slideUp 0.3s ease',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: '#6b7280',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f3f4f6';
                            e.currentTarget.style.color = '#111827';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.color = '#6b7280';
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px' }}>
                    {children}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default { PrimaryButton, StatusBadge, StatCard, AnimatedModal };
