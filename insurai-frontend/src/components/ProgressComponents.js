import React from 'react';

/**
 * Step Indicator Component
 * Visual progress tracker for multi-step processes
 */
export function StepIndicator({ steps, currentStep }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 0',
            maxWidth: '800px',
            margin: '0 auto'
        }}>
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isCurrent = stepNumber === currentStep;
                const isPending = stepNumber > currentStep;

                return (
                    <React.Fragment key={index}>
                        {/* Step Circle */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: index < steps.length - 1 ? 0 : 1
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: isCompleted
                                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                                    : isCurrent
                                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                        : '#e5e7eb',
                                color: isCompleted || isCurrent ? 'white' : '#9ca3af',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '1.125rem',
                                transition: 'all 0.3s ease',
                                boxShadow: isCurrent ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none',
                                animation: isCurrent ? 'pulse 2s infinite' : 'none'
                            }}>
                                {isCompleted ? '✓' : stepNumber}
                            </div>

                            <div style={{
                                marginTop: '8px',
                                fontSize: '0.875rem',
                                fontWeight: isCurrent ? '600' : '400',
                                color: isCurrent ? '#667eea' : isCompleted ? '#22c55e' : '#9ca3af',
                                textAlign: 'center',
                                maxWidth: '100px'
                            }}>
                                {step.label}
                            </div>

                            {step.description && isCurrent && (
                                <div style={{
                                    marginTop: '4px',
                                    fontSize: '0.75rem',
                                    color: '#6b7280',
                                    textAlign: 'center',
                                    maxWidth: '120px'
                                }}>
                                    {step.description}
                                </div>
                            )}
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div style={{
                                flex: 1,
                                height: '4px',
                                background: isCompleted
                                    ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                                    : '#e5e7eb',
                                margin: '0 12px',
                                borderRadius: '2px',
                                transition: 'all 0.5s ease',
                                position: 'relative',
                                top: '-20px'
                            }} />
                        )}
                    </React.Fragment>
                );
            })}

            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                    }
                    50% {
                        transform: scale(1.05);
                        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
                    }
                }
            `}</style>
        </div>
    );
}

/**
 * Progress Bar Component
 * Simple linear progress indicator
 */
export function ProgressBar({ progress, showPercentage = true, color = '#667eea' }) {
    return (
        <div style={{ width: '100%' }}>
            {showPercentage && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                }}>
                    <span>Progress</span>
                    <span style={{ fontWeight: '600', color: color }}>{progress}%</span>
                </div>
            )}

            <div style={{
                width: '100%',
                height: '8px',
                background: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                    boxShadow: `0 0 8px ${color}66`
                }} />
            </div>
        </div>
    );
}

/**
 * Timeline Component
 * Vertical timeline for showing history
 */
export function Timeline({ events }) {
    return (
        <div style={{ position: 'relative', paddingLeft: '40px' }}>
            {/* Vertical Line */}
            <div style={{
                position: 'absolute',
                left: '16px',
                top: '8px',
                bottom: '8px',
                width: '2px',
                background: '#e5e7eb'
            }} />

            {events.map((event, index) => (
                <div key={index} style={{
                    position: 'relative',
                    marginBottom: '24px',
                    animation: `slideInLeft 0.5s ease ${index * 0.1}s backwards`
                }}>
                    {/* Timeline Dot */}
                    <div style={{
                        position: 'absolute',
                        left: '-32px',
                        top: '4px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: event.color || '#667eea',
                        border: '3px solid white',
                        boxShadow: '0 0 0 2px #e5e7eb'
                    }} />

                    {/* Event Content */}
                    <div style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--card-border)',
                        borderRadius: '8px',
                        padding: '12px 16px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            marginBottom: '4px'
                        }}>
                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                {event.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {event.time}
                            </div>
                        </div>
                        {event.description && (
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                {event.description}
                            </div>
                        )}
                    </div>
                </div>
            ))}

            <style>{`
                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}</style>
        </div>
    );
}

/**
 * Loading Skeleton Component
 * Placeholder while content loads
 */
export function LoadingSkeleton({ width = '100%', height = '20px', borderRadius = '4px' }) {
    return (
        <div style={{
            width,
            height,
            borderRadius,
            background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
        }}>
            <style>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}

/**
 * Empty State Component
 * Friendly message when no data
 */
export function EmptyState({ icon = '📭', title, message, action }) {
    return (
        <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            animation: 'fadeIn 0.5s ease'
        }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.5 }}>
                {icon}
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>
                {title}
            </h3>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                {message}
            </p>
            {action && action}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

export default { StepIndicator, ProgressBar, Timeline, LoadingSkeleton, EmptyState };
