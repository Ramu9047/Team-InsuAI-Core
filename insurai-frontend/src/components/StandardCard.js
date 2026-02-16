import React from 'react';
import PropTypes from 'prop-types';
import '../styles/design-tokens.css';
import '../styles/animations.css';
import './StandardCard.css';

/**
 * StandardCard - Uniform card component for consistent UI across the platform
 * 
 * Variants:
 * - policy: For policy listings
 * - agent: For agent cards
 * - appointment: For appointment/booking cards
 * - claim: For claim cards
 * - company: For company cards
 * - default: Generic card
 */
const StandardCard = ({
    variant = 'default',
    title,
    subtitle,
    status,
    statusColor,
    icon,
    children,
    actions,
    footer,
    onClick,
    className = '',
    animate = true,
    ...props
}) => {
    const getStatusColor = (status) => {
        const colors = {
            'PENDING': 'var(--status-pending)',
            'PENDING_APPROVAL': 'var(--status-pending)',
            'APPROVED': 'var(--status-approved)',
            'MEETING_APPROVED': 'var(--status-approved)',
            'REJECTED': 'var(--status-rejected)',
            'ACTIVE': 'var(--status-active)',
            'INACTIVE': 'var(--status-inactive)',
            'CONSULTED': 'var(--status-info)',
            'POLICY_APPROVED': 'var(--status-approved)',
            'ISSUED': 'var(--status-approved)',
            'SUSPENDED': 'var(--status-warning)',
        };
        return statusColor || colors[status] || 'var(--status-info)';
    };

    const getStatusBg = (status) => {
        const backgrounds = {
            'PENDING': 'var(--status-pending-bg)',
            'PENDING_APPROVAL': 'var(--status-pending-bg)',
            'APPROVED': 'var(--status-approved-bg)',
            'MEETING_APPROVED': 'var(--status-approved-bg)',
            'REJECTED': 'var(--status-rejected-bg)',
            'ACTIVE': 'var(--status-active-bg)',
            'INACTIVE': 'rgba(107, 114, 128, 0.1)',
            'CONSULTED': 'var(--status-info-bg)',
            'POLICY_APPROVED': 'var(--status-approved-bg)',
            'ISSUED': 'var(--status-approved-bg)',
            'SUSPENDED': 'var(--status-warning-bg)',
        };
        return backgrounds[status] || 'var(--status-info-bg)';
    };

    return (
        <div
            className={`standard-card standard-card--${variant} ${animate ? 'animate-scaleIn' : ''} ${onClick ? 'standard-card--clickable' : ''} ${className}`}
            onClick={onClick}
            {...props}
        >
            {/* Header */}
            <div className="standard-card__header">
                <div className="standard-card__header-left">
                    {icon && <div className="standard-card__icon">{icon}</div>}
                    <div className="standard-card__title-group">
                        {title && <h3 className="standard-card__title">{title}</h3>}
                        {subtitle && <p className="standard-card__subtitle">{subtitle}</p>}
                    </div>
                </div>
                {status && (
                    <span
                        className="standard-card__status"
                        style={{
                            backgroundColor: getStatusBg(status),
                            color: getStatusColor(status),
                            border: `1px solid ${getStatusColor(status)}`,
                        }}
                    >
                        {status.replace(/_/g, ' ')}
                    </span>
                )}
            </div>

            {/* Content */}
            {children && <div className="standard-card__content">{children}</div>}

            {/* Actions */}
            {actions && actions.length > 0 && (
                <div className="standard-card__actions">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            className={`standard-card__action ${action.variant || 'primary'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                action.onClick && action.onClick();
                            }}
                            disabled={action.disabled}
                            style={action.style}
                        >
                            {action.icon && <span className="action-icon">{action.icon}</span>}
                            {action.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Footer */}
            {footer && <div className="standard-card__footer">{footer}</div>}
        </div>
    );
};

StandardCard.propTypes = {
    variant: PropTypes.oneOf(['default', 'policy', 'agent', 'appointment', 'claim', 'company']),
    title: PropTypes.string,
    subtitle: PropTypes.string,
    status: PropTypes.string,
    statusColor: PropTypes.string,
    icon: PropTypes.node,
    children: PropTypes.node,
    actions: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            onClick: PropTypes.func,
            variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success']),
            disabled: PropTypes.bool,
            icon: PropTypes.node,
            style: PropTypes.object,
        })
    ),
    footer: PropTypes.node,
    onClick: PropTypes.func,
    className: PropTypes.string,
    animate: PropTypes.bool,
};

export default StandardCard;
