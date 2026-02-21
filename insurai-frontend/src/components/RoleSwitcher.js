import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RoleSwitcher({ currentRole, onRoleSwitch }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(currentRole);

    const roles = [
        {
            id: 'USER',
            name: 'User',
            icon: '👤',
            description: 'View as a regular customer',
            color: '#3b82f6'
        },
        {
            id: 'AGENT',
            name: 'Agent',
            icon: '👨‍💼',
            description: 'View as an insurance agent',
            color: '#8b5cf6'
        },
        {
            id: 'SUPER_ADMIN',
            name: 'Super Admin',
            icon: '👑',
            description: 'View as system administrator',
            color: '#ef4444'
        },
        {
            id: 'COMPANY_ADMIN',
            name: 'Company Admin',
            icon: '🏢',
            description: 'View as company administrator',
            color: '#db2777'
        }
    ];

    const handleRoleSwitch = (roleId) => {
        setSelectedRole(roleId);
        if (onRoleSwitch) {
            onRoleSwitch(roleId);
        }
        setIsOpen(false);
    };

    const getCurrentRoleData = () => {
        return roles.find(r => r.id === selectedRole) || roles[0];
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 16px',
                    background: `${getCurrentRoleData().color}20`,
                    border: `2px solid ${getCurrentRoleData().color}`,
                    borderRadius: 12,
                    color: getCurrentRoleData().color,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${getCurrentRoleData().color}30`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${getCurrentRoleData().color}20`;
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                <span style={{ fontSize: '1.2rem' }}>{getCurrentRoleData().icon}</span>
                <span>View as: {getCurrentRoleData().name}</span>
                <span style={{ fontSize: '0.8rem', marginLeft: 4 }}>
                    {isOpen ? '▲' : '▼'}
                </span>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            right: 0,
                            minWidth: 320,
                            background: 'var(--card-bg)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 16,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                            overflow: 'hidden',
                            zIndex: 1000
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '16px 20px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white',
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                                🔄 Switch View
                            </h4>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', opacity: 0.9 }}>
                                Test different user perspectives
                            </p>
                        </div>

                        {/* Role Options */}
                        <div style={{ padding: 12 }}>
                            {roles.map((role, idx) => (
                                <motion.button
                                    key={role.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => handleRoleSwitch(role.id)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        background: selectedRole === role.id
                                            ? `${role.color}20`
                                            : 'rgba(255,255,255,0.02)',
                                        border: selectedRole === role.id
                                            ? `2px solid ${role.color}`
                                            : '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: 12,
                                        marginBottom: 8,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        textAlign: 'left'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedRole !== role.id) {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                            e.currentTarget.style.transform = 'translateX(4px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedRole !== role.id) {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                            e.currentTarget.style.transform = 'translateX(0)';
                                        }
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        {/* Icon */}
                                        <div style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 10,
                                            background: `${role.color}20`,
                                            border: `1px solid ${role.color}40`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.3rem',
                                            flexShrink: 0
                                        }}>
                                            {role.icon}
                                        </div>

                                        {/* Info */}
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontSize: '0.95rem',
                                                fontWeight: 700,
                                                color: 'var(--text-main)',
                                                marginBottom: 2
                                            }}>
                                                {role.name}
                                            </div>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--text-muted)'
                                            }}>
                                                {role.description}
                                            </div>
                                        </div>

                                        {/* Selected Indicator */}
                                        {selectedRole === role.id && (
                                            <div style={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                background: role.color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '0.9rem',
                                                fontWeight: 700,
                                                flexShrink: 0
                                            }}>
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '12px 20px',
                            background: 'rgba(255,255,255,0.02)',
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            textAlign: 'center'
                        }}>
                            💡 Changes are temporary for testing only
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay to close dropdown */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999
                    }}
                />
            )}
        </div>
    );
}

// Compact version for navbar
export function RoleSwitcherCompact({ currentRole, onRoleSwitch }) {
    const roles = {
        USER: { icon: '👤', color: '#3b82f6' },
        AGENT: { icon: '👨‍💼', color: '#8b5cf6' },
        COMPANY_ADMIN: { icon: '🏢', color: '#db2777' },
        SUPER_ADMIN: { icon: '👑', color: '#ef4444' }
    };

    const roleOrder = ['USER', 'AGENT', 'COMPANY_ADMIN', 'SUPER_ADMIN'];
    const currentIndex = roleOrder.indexOf(currentRole);

    const switchToNext = () => {
        const nextIndex = (currentIndex + 1) % roleOrder.length;
        const nextRole = roleOrder[nextIndex];
        if (onRoleSwitch) {
            onRoleSwitch(nextRole);
        }
    };

    const currentRoleData = roles[currentRole] || roles.USER;

    return (
        <button
            onClick={switchToNext}
            title={`Switch to ${roleOrder[(currentIndex + 1) % roleOrder.length]}`}
            style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${currentRoleData.color}20`,
                border: `2px solid ${currentRoleData.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = `${currentRoleData.color}30`;
                e.currentTarget.style.transform = 'rotate(180deg)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = `${currentRoleData.color}20`;
                e.currentTarget.style.transform = 'rotate(0deg)';
            }}
        >
            {currentRoleData.icon}
            <div style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: currentRoleData.color,
                border: '2px solid var(--bg-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6rem',
                color: 'white',
                fontWeight: 700
            }}>
                🔄
            </div>
        </button>
    );
}
