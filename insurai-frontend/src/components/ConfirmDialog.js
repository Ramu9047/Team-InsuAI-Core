import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ConfirmDialog — A global, promise-based confirm dialog system.
 * Replaces all window.confirm() calls with a beautiful dark-theme modal.
 *
 * Usage:
 *   const confirm = useConfirm();
 *   const ok = await confirm({ title, message, confirmLabel, variant });
 *   if (ok) { ... }
 *
 * Variants: 'danger' | 'warning' | 'info'
 */

const ConfirmContext = createContext(null);

const VARIANT_CONFIG = {
    danger: {
        icon: '🗑️',
        accentColor: '#ef4444',
        accentBg: 'rgba(239,68,68,0.12)',
        accentBorder: 'rgba(239,68,68,0.3)',
        confirmClass: 'danger-btn',
        progressColor: '#ef4444',
    },
    warning: {
        icon: '⚠️',
        accentColor: '#f59e0b',
        accentBg: 'rgba(245,158,11,0.1)',
        accentBorder: 'rgba(245,158,11,0.28)',
        confirmClass: 'warning-btn',
        progressColor: '#f59e0b',
    },
    info: {
        icon: 'ℹ️',
        accentColor: '#6366f1',
        accentBg: 'rgba(99,102,241,0.1)',
        accentBorder: 'rgba(99,102,241,0.28)',
        confirmClass: 'primary-btn',
        progressColor: '#6366f1',
    },
    logout: {
        icon: '🔓',
        accentColor: '#ef4444',
        accentBg: 'rgba(239,68,68,0.1)',
        accentBorder: 'rgba(239,68,68,0.28)',
        confirmClass: 'danger-btn',
        progressColor: '#ef4444',
    },
    complete: {
        icon: '✅',
        accentColor: '#10b981',
        accentBg: 'rgba(16,185,129,0.1)',
        accentBorder: 'rgba(16,185,129,0.28)',
        confirmClass: 'success-btn',
        progressColor: '#10b981',
    },
};

export function ConfirmProvider({ children }) {
    const [dialog, setDialog] = useState(null);
    const resolveRef = useRef(null);

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setDialog({
                title: options.title || 'Are you sure?',
                message: options.message || 'This action cannot be undone.',
                confirmLabel: options.confirmLabel || 'Confirm',
                cancelLabel: options.cancelLabel || 'Cancel',
                variant: options.variant || 'danger',
                detail: options.detail || null,
            });
        });
    }, []);

    const handleConfirm = () => {
        resolveRef.current?.(true);
        setDialog(null);
    };

    const handleCancel = () => {
        resolveRef.current?.(false);
        setDialog(null);
    };

    const cfg = dialog ? (VARIANT_CONFIG[dialog.variant] || VARIANT_CONFIG.danger) : null;

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            <AnimatePresence>
                {dialog && (
                    <motion.div
                        key="confirm-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleCancel}
                        style={{
                            position: 'fixed', inset: 0,
                            background: 'rgba(2, 6, 23, 0.82)',
                            backdropFilter: 'blur(6px)',
                            zIndex: 99999,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: 20,
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.88, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.88, y: 24 }}
                            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: 'rgba(10, 16, 35, 0.98)',
                                backdropFilter: 'blur(24px)',
                                border: `1px solid ${cfg.accentBorder}`,
                                borderRadius: 22,
                                padding: '34px 32px 28px',
                                maxWidth: 420,
                                width: '100%',
                                boxShadow: `0 30px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), 0 0 40px ${cfg.accentColor}18`,
                                color: 'var(--text-main, #f1f5f9)',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Decorative glow */}
                            <div style={{
                                position: 'absolute', top: -40, right: -40,
                                width: 140, height: 140, borderRadius: '50%',
                                background: `${cfg.accentColor}12`,
                                filter: 'blur(30px)', pointerEvents: 'none',
                            }} />

                            {/* Icon */}
                            <motion.div
                                initial={{ scale: 0, rotate: -15 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', delay: 0.07, damping: 15, stiffness: 250 }}
                                style={{
                                    width: 60, height: 60, borderRadius: 16,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.8rem',
                                    background: cfg.accentBg,
                                    border: `1px solid ${cfg.accentBorder}`,
                                    boxShadow: `0 8px 24px ${cfg.accentColor}20`,
                                    marginBottom: 20,
                                }}
                            >
                                {cfg.icon}
                            </motion.div>

                            {/* Title */}
                            <h3 style={{
                                margin: '0 0 10px',
                                fontSize: '1.25rem',
                                fontWeight: 800,
                                color: '#f1f5f9',
                                letterSpacing: '-0.01em',
                            }}>
                                {dialog.title}
                            </h3>

                            {/* Message */}
                            <p style={{
                                margin: '0 0 6px',
                                fontSize: '0.9rem',
                                color: 'rgba(148,163,184,0.9)',
                                lineHeight: 1.65,
                            }}>
                                {dialog.message}
                            </p>

                            {/* Detail note (optional) */}
                            {dialog.detail && (
                                <div style={{
                                    marginTop: 12, padding: '10px 14px',
                                    borderRadius: 10,
                                    background: `${cfg.accentColor}0a`,
                                    border: `1px solid ${cfg.accentBorder}`,
                                    fontSize: '0.8rem',
                                    color: cfg.accentColor,
                                    fontWeight: 500,
                                    marginBottom: 4,
                                }}>
                                    {dialog.detail}
                                </div>
                            )}

                            {/* Divider */}
                            <div style={{
                                height: 1,
                                background: 'rgba(255,255,255,0.06)',
                                margin: '22px -32px 22px',
                            }} />

                            {/* Buttons */}
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleCancel}
                                    style={{
                                        padding: '10px 22px',
                                        borderRadius: 12,
                                        fontSize: '0.88rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        color: 'rgba(148,163,184,0.9)',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                >
                                    {dialog.cancelLabel}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={handleConfirm}
                                    style={{
                                        padding: '10px 24px',
                                        borderRadius: 12,
                                        fontSize: '0.88rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        background: `linear-gradient(135deg, ${cfg.accentColor}, ${cfg.accentColor}cc)`,
                                        border: `1px solid ${cfg.accentColor}`,
                                        color: '#fff',
                                        boxShadow: `0 4px 16px ${cfg.accentColor}40`,
                                        transition: 'all 0.2s',
                                        letterSpacing: '0.01em',
                                    }}
                                >
                                    {dialog.confirmLabel}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
    return ctx;
}
