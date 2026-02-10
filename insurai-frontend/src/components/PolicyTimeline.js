import { motion } from "framer-motion";
import { useToast } from './ToastSystem';

export default function PolicyTimeline({ userPolicy, booking }) {
    const toast = useToast();

    const getStepStatus = (stepIndex) => {
        const workflowStatus = userPolicy?.workflowStatus;
        const policyStatus = userPolicy?.status;

        switch (stepIndex) {
            case 0: // Appointment Booked
                return booking ? 'completed' : 'pending';

            case 1: // Agent Consultation
                if (workflowStatus === 'CONSULTATION_COMPLETED' ||
                    workflowStatus === 'APPROVED' ||
                    workflowStatus === 'REJECTED' ||
                    workflowStatus === 'ALTERNATIVES_SUGGESTED') {
                    return 'completed';
                }
                if (workflowStatus === 'CONSULTATION_PENDING' || booking?.status === 'PENDING') {
                    return 'current';
                }
                return 'pending';

            case 2: // Approval Decision
                if (workflowStatus === 'APPROVED' || policyStatus === 'PAYMENT_PENDING' || policyStatus === 'ACTIVE') {
                    return 'completed';
                }
                if (workflowStatus === 'REJECTED' || workflowStatus === 'ALTERNATIVES_SUGGESTED') {
                    return 'rejected';
                }
                if (workflowStatus === 'CONSULTATION_COMPLETED') {
                    return 'current';
                }
                return 'pending';

            case 3: // Payment Processing
                if (policyStatus === 'ACTIVE') {
                    return 'completed';
                }
                if (policyStatus === 'PAYMENT_PENDING') {
                    return 'current';
                }
                return 'pending';

            case 4: // Policy Active
                if (policyStatus === 'ACTIVE') {
                    return 'completed';
                }
                return 'pending';

            default:
                return 'pending';
        }
    };

    const steps = [
        {
            icon: '📋',
            title: 'Appointment Booked',
            description: booking ? `Booked on ${new Date(booking.createdAt).toLocaleDateString()}` : 'Waiting for appointment',
            date: booking?.createdAt
        },
        {
            icon: '👨‍💼',
            title: 'Agent Consultation',
            description: userPolicy?.agentNotes || (booking?.status === 'PENDING' ? 'Awaiting agent review' : 'Consultation in progress'),
            date: booking?.respondedAt || booking?.completedAt,
            notes: userPolicy?.agentNotes
        },
        {
            icon: '✅',
            title: 'Approval Decision',
            description: userPolicy?.workflowStatus === 'APPROVED'
                ? 'Policy approved! Proceed to payment'
                : userPolicy?.workflowStatus === 'REJECTED'
                    ? `Rejected: ${userPolicy.rejectionReason}`
                    : userPolicy?.workflowStatus === 'ALTERNATIVES_SUGGESTED'
                        ? 'Agent suggested alternative policies'
                        : 'Awaiting approval decision',
            date: booking?.completedAt,
            rejectionReason: userPolicy?.rejectionReason,
            hasAlternatives: userPolicy?.alternativePolicyIds?.length > 0
        },
        {
            icon: '💳',
            title: 'Payment Processing',
            description: userPolicy?.status === 'PAYMENT_PENDING'
                ? 'Complete your payment to activate policy'
                : userPolicy?.status === 'ACTIVE'
                    ? 'Payment completed'
                    : 'Pending approval',
            date: null
        },
        {
            icon: '🎉',
            title: 'Policy Active',
            description: userPolicy?.status === 'ACTIVE'
                ? `Active since ${userPolicy.startDate ? new Date(userPolicy.startDate).toLocaleDateString() : 'N/A'}`
                : 'Policy not yet active',
            date: userPolicy?.startDate
        }
    ];

    return (
        <div style={{ padding: '20px 0' }}>
            <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: '1.2rem' }}>Policy Journey</h3>

            <div style={{ position: 'relative' }}>
                {/* Vertical Line */}
                <div style={{
                    position: 'absolute',
                    left: 20,
                    top: 30,
                    bottom: 30,
                    width: 2,
                    background: 'linear-gradient(to bottom, var(--primary) 0%, rgba(0,0,0,0.1) 100%)',
                    zIndex: 0
                }} />

                {/* Steps */}
                {steps.map((step, index) => {
                    const status = getStepStatus(index);

                    return (
                        <TimelineStep
                            key={index}
                            step={step}
                            status={status}
                            index={index}
                            isLast={index === steps.length - 1}
                            toast={toast}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function TimelineStep({ step, status, index, isLast, toast }) {
    const getStatusColor = () => {
        switch (status) {
            case 'completed': return '#22c55e';
            case 'current': return 'var(--primary)';
            case 'rejected': return '#ef4444';
            case 'pending': return '#9ca3af';
            default: return '#9ca3af';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'completed': return '✓';
            case 'current': return '●';
            case 'rejected': return '✕';
            case 'pending': return '○';
            default: return '○';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
                position: 'relative',
                paddingLeft: 60,
                paddingBottom: isLast ? 0 : 30,
                zIndex: 1
            }}
        >
            {/* Icon Circle */}
            <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: status === 'current' ? getStatusColor() : 'white',
                border: `3px solid ${getStatusColor()}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: status === 'current' ? 'white' : getStatusColor(),
                boxShadow: status === 'current' ? `0 0 20px ${getStatusColor()}40` : 'none',
                transition: 'all 0.3s ease'
            }}>
                {status === 'completed' || status === 'rejected' ? getStatusIcon() : step.icon}
            </div>

            {/* Content */}
            <div style={{
                background: status === 'current' ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent',
                padding: status === 'current' ? 15 : 0,
                borderRadius: 8,
                border: status === 'current' ? '1px solid var(--primary)' : 'none'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 5 }}>
                    <h4 style={{
                        margin: 0,
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: status === 'pending' ? '#9ca3af' : 'var(--text-main)'
                    }}>
                        {step.title}
                    </h4>

                    {step.date && (
                        <span style={{
                            fontSize: '0.75rem',
                            opacity: 0.6,
                            whiteSpace: 'nowrap',
                            marginLeft: 10
                        }}>
                            {new Date(step.date).toLocaleDateString()}
                        </span>
                    )}
                </div>

                <p style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    opacity: status === 'pending' ? 0.5 : 0.7,
                    lineHeight: 1.5
                }}>
                    {step.description}
                </p>

                {/* Agent Notes */}
                {step.notes && status === 'completed' && (
                    <div style={{
                        marginTop: 10,
                        padding: 10,
                        background: 'rgba(0,0,0,0.03)',
                        borderRadius: 6,
                        borderLeft: '3px solid var(--primary)'
                    }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6, marginBottom: 5 }}>
                            AGENT'S NOTES
                        </div>
                        <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                            {step.notes}
                        </div>
                    </div>
                )}

                {/* Rejection Reason */}
                {step.rejectionReason && status === 'rejected' && (
                    <div style={{
                        marginTop: 10,
                        padding: 10,
                        background: '#ef444410',
                        borderRadius: 6,
                        borderLeft: '3px solid #ef4444'
                    }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', marginBottom: 5 }}>
                            REJECTION REASON
                        </div>
                        <div style={{ fontSize: '0.85rem', lineHeight: 1.5, color: '#ef4444' }}>
                            {step.rejectionReason}
                        </div>
                    </div>
                )}

                {/* Alternative Policies Indicator */}
                {step.hasAlternatives && (
                    <div style={{
                        marginTop: 10,
                        padding: 10,
                        background: '#eab30810',
                        borderRadius: 6,
                        borderLeft: '3px solid #eab308',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        <span style={{ fontSize: '1.2rem' }}>💡</span>
                        <div style={{ fontSize: '0.85rem', color: '#eab308', fontWeight: 600 }}>
                            Agent has suggested alternative policies for you
                        </div>
                    </div>
                )}

                {/* Payment CTA */}
                {status === 'current' && step.title === 'Payment Processing' && (
                    <button
                        className="primary-btn"
                        style={{ marginTop: 15, width: '100%' }}
                        onClick={() => toast.info('Payment integration coming soon! 💳', 'Feature In Progress')}
                    >
                        Proceed to Payment
                    </button>
                )}
            </div>
        </motion.div>
    );
}
