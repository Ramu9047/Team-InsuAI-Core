import React from 'react';
import { motion } from 'framer-motion';
import './ProgressTracker.css';

/**
 * Appointment Journey Tracker Component
 * Shows the 5-stage booking lifecycle with animated progress
 */
export const ProgressTracker = ({ currentStage, stages, estimatedTime }) => {
    const defaultStages = [
        { id: 1, name: 'Booked', icon: '📅', status: 'completed' },
        { id: 2, name: 'Agent Assigned', icon: '👨‍💼', status: 'current' },
        { id: 3, name: 'Consulted', icon: '💬', status: 'pending' },
        { id: 4, name: 'Approved', icon: '✅', status: 'pending' },
        { id: 5, name: 'Policy Issued', icon: '📄', status: 'pending' }
    ];

    const journeyStages = stages || defaultStages;
    const current = currentStage || 2;

    const getStageStatus = (stageId) => {
        if (stageId < current) return 'completed';
        if (stageId === current) return 'current';
        return 'pending';
    };

    return (
        <div className="progress-tracker">
            <div className="progress-tracker-header">
                <h3>📍 Appointment Journey</h3>
                {estimatedTime && (
                    <span className="estimated-time">
                        ⏱️ Next stage in: <strong>{estimatedTime}</strong>
                    </span>
                )}
            </div>

            <div className="progress-stages">
                {journeyStages.map((stage, index) => {
                    const status = getStageStatus(stage.id);
                    const isLast = index === journeyStages.length - 1;

                    return (
                        <React.Fragment key={stage.id}>
                            <motion.div
                                className={`progress-stage ${status}`}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="stage-icon">
                                    {status === 'completed' && <span className="check-mark">✓</span>}
                                    {status === 'current' && (
                                        <motion.div
                                            className="pulse-ring"
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                        />
                                    )}
                                    <span className="icon">{stage.icon}</span>
                                </div>
                                <div className="stage-info">
                                    <div className="stage-name">{stage.name}</div>
                                    {status === 'current' && (
                                        <div className="stage-label">You are here</div>
                                    )}
                                    {status === 'completed' && (
                                        <div className="stage-label completed-label">Completed</div>
                                    )}
                                </div>
                            </motion.div>

                            {!isLast && (
                                <div className={`progress-connector ${status === 'completed' ? 'completed' : ''}`}>
                                    <motion.div
                                        className="connector-fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: status === 'completed' ? '100%' : '0%' }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Progress Bar */}
            <div className="progress-bar-container">
                <div className="progress-bar-track">
                    <motion.div
                        className="progress-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${((current - 1) / (journeyStages.length - 1)) * 100}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                </div>
                <div className="progress-percentage">
                    {Math.round(((current - 1) / (journeyStages.length - 1)) * 100)}% Complete
                </div>
            </div>
        </div>
    );
};

export default ProgressTracker;
