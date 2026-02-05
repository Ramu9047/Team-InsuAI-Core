import { motion, AnimatePresence } from 'framer-motion';

/**
 * Inline Feedback Component
 * Provides contextual feedback directly in the UI
 * Used for form validation, step completion, etc.
 */
export function InlineFeedback({ message, type = 'info', show = true, icon }) {
    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: '#dcfce7',
                    border: '#22c55e',
                    icon: icon || '✓',
                    color: '#166534'
                };
            case 'error':
                return {
                    bg: '#fee2e2',
                    border: '#ef4444',
                    icon: icon || '✕',
                    color: '#991b1b'
                };
            case 'warning':
                return {
                    bg: '#fef9c3',
                    border: '#eab308',
                    icon: icon || '⚠',
                    color: '#854d0e'
                };
            case 'info':
            default:
                return {
                    bg: '#dbeafe',
                    border: '#3b82f6',
                    icon: icon || 'ℹ',
                    color: '#1e40af'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        background: styles.bg,
                        border: `1px solid ${styles.border}`,
                        borderLeft: `4px solid ${styles.border}`,
                        borderRadius: 6,
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: '0.9rem',
                        color: styles.color,
                        overflow: 'hidden'
                    }}
                >
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{styles.icon}</span>
                    <span style={{ flex: 1 }}>{message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/**
 * Progress Banner Component
 * Shows progress through multi-step workflows
 */
export function ProgressBanner({ currentStep, totalSteps, stepLabels, onStepClick }) {
    return (
        <div style={{
            background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
            border: '1px solid #bae6fd',
            borderRadius: 12,
            padding: '20px 30px',
            marginBottom: 30
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <div>
                    <h3 style={{ margin: 0, color: '#0c4a6e', fontSize: '1.1rem' }}>
                        Step {currentStep} of {totalSteps}
                    </h3>
                    <p style={{ margin: '5px 0 0 0', color: '#075985', fontSize: '0.9rem' }}>
                        {stepLabels[currentStep - 1]}
                    </p>
                </div>
                <div style={{
                    background: '#0ea5e9',
                    color: 'white',
                    padding: '6px 16px',
                    borderRadius: 20,
                    fontWeight: 700,
                    fontSize: '0.9rem'
                }}>
                    {Math.round((currentStep / totalSteps) * 100)}% Complete
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{
                height: 8,
                background: '#e0f2fe',
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative'
            }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #0ea5e9, #06b6d4)',
                        borderRadius: 4
                    }}
                />
            </div>

            {/* Step Indicators */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 15 }}>
                {stepLabels.map((label, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;
                    const isClickable = stepNumber <= currentStep && onStepClick;

                    return (
                        <div
                            key={index}
                            onClick={() => isClickable && onStepClick(stepNumber)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                cursor: isClickable ? 'pointer' : 'default',
                                opacity: stepNumber > currentStep ? 0.4 : 1,
                                transition: 'all 0.2s'
                            }}
                        >
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1.1 : 1,
                                    background: isCompleted ? '#22c55e' : isCurrent ? '#0ea5e9' : '#cbd5e1'
                                }}
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    marginBottom: 8,
                                    border: isCurrent ? '3px solid #0284c7' : 'none'
                                }}
                            >
                                {isCompleted ? '✓' : stepNumber}
                            </motion.div>
                            <div style={{
                                fontSize: '0.75rem',
                                color: isCurrent ? '#0c4a6e' : '#64748b',
                                fontWeight: isCurrent ? 700 : 500,
                                textAlign: 'center'
                            }}>
                                {label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Step Completion Indicator
 * Shows completion status for individual steps
 */
export function StepCompletion({ label, completed, required = true, explanation }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                background: completed ? '#f0fdf4' : '#fef3f2',
                border: `1px solid ${completed ? '#bbf7d0' : '#fecaca'}`,
                borderLeft: `4px solid ${completed ? '#22c55e' : '#ef4444'}`,
                borderRadius: 8,
                marginBottom: 10
            }}
        >
            <motion.div
                animate={{ rotate: completed ? 0 : 360 }}
                transition={{ duration: 0.3 }}
                style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: completed ? '#22c55e' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                }}
            >
                {completed ? '✓' : '!'}
            </motion.div>
            <div style={{ flex: 1 }}>
                <div style={{
                    fontWeight: 600,
                    color: completed ? '#166534' : '#991b1b',
                    marginBottom: explanation ? 4 : 0
                }}>
                    {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
                </div>
                {explanation && !completed && (
                    <div style={{ fontSize: '0.85rem', color: '#991b1b', opacity: 0.8 }}>
                        {explanation}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

/**
 * Action Button with Validation
 * Only appears when action is valid
 */
export function ValidatedButton({ label, onClick, isValid, explanation, loading = false, icon }) {
    return (
        <AnimatePresence>
            {isValid ? (
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClick}
                    disabled={loading}
                    className="primary-btn"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        justifyContent: 'center',
                        minWidth: 150
                    }}
                >
                    {loading ? (
                        <>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                style={{ fontSize: '1.2rem' }}
                            >
                                ⟳
                            </motion.div>
                            Processing...
                        </>
                    ) : (
                        <>
                            {icon && <span>{icon}</span>}
                            {label}
                        </>
                    )}
                </motion.button>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        padding: '12px 20px',
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        color: '#64748b',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        fontWeight: 500
                    }}
                >
                    {explanation || 'Complete required steps to continue'}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
