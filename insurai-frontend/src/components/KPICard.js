import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/**
 * KPICard – Single source of truth for metric/KPI tiles across all dashboards.
 *
 * Props:
 *   icon    {string}   – emoji icon
 *   label   {string}   – uppercase label text (e.g. "TOTAL USERS")
 *   value   {any}      – the numeric / text value to display
 *   color   {string}   – accent hex color (#10b981)
 *   link    {string}   – optional route to navigate to on click
 *   onClick {function} – optional override click handler
 *   linkText{string}   – text for the bottom link line (default: "View →")
 *   trend   {string}   – optional small badge text ("+12%", "-2", etc.)
 *   idx     {number}   – stagger index for entrance animation
 */
export default function KPICard({
    icon,
    label,
    value,
    color = '#6366f1',
    link,
    onClick,
    linkText,
    trend,
    idx = 0,
}) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) { onClick(); return; }
        if (link) navigate(link);
    };

    const displayLink = linkText || (link ? `View ${label.split(' ').pop()} →` : null);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            whileHover={{ y: -5, boxShadow: `0 14px 40px ${color}22` }}
            whileTap={{ scale: 0.97 }}
            onClick={handleClick}
            style={{
                // ── Fixed dimensions – never grow/shrink based on content ──
                height: 148,
                minWidth: 140,
                boxSizing: 'border-box',
                padding: '20px 18px 16px',
                // ── Appearance ──
                borderRadius: 14,
                background: 'var(--bg-card, rgba(255,255,255,0.04))',
                border: '1px solid rgba(255,255,255,0.07)',
                borderTop: `4px solid ${color}`,
                position: 'relative',
                overflow: 'hidden',
                cursor: (onClick || link) ? 'pointer' : 'default',
                // ── Layout ──
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            {/* Ghost icon watermark */}
            <div style={{
                position: 'absolute', top: 10, right: 12,
                fontSize: '2.2rem', opacity: 0.1, userSelect: 'none',
                pointerEvents: 'none',
            }}>{icon}</div>

            {/* Top row: icon + trend badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '1.7rem', lineHeight: 1 }}>{icon}</div>
                {trend && (
                    <span style={{
                        fontSize: '0.68rem', fontWeight: 700, color,
                        background: `${color}18`,
                        padding: '2px 7px', borderRadius: 20,
                        border: `1px solid ${color}30`,
                        whiteSpace: 'nowrap',
                    }}>{trend}</span>
                )}
            </div>

            {/* Middle: value */}
            <div style={{
                fontSize: '2rem', fontWeight: 800, color, lineHeight: 1,
                // Prevent text from overflowing and stretching the card
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{value ?? '—'}</div>

            {/* Bottom: label + link */}
            <div>
                <div style={{
                    fontSize: '0.72rem', textTransform: 'uppercase',
                    color: 'var(--text-muted, #6b7280)', fontWeight: 700,
                    letterSpacing: '0.5px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{label}</div>
                {displayLink && (
                    <div style={{
                        fontSize: '0.75rem', color, fontWeight: 600,
                        marginTop: 3, opacity: 0.85,
                    }}>{displayLink}</div>
                )}
            </div>
        </motion.div>
    );
}
