import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';

export default function InsuranceLiteracy({ userId }) {
    const { notify } = useNotification();
    const [literacyScore, setLiteracyScore] = useState(0);
    const [completedModules, setCompletedModules] = useState([]);
    const [showQuiz, setShowQuiz] = useState(false);

    const modules = [
        {
            id: 1,
            title: 'Understanding Insurance Basics',
            icon: '📚',
            description: 'Learn the fundamentals of insurance, premiums, and coverage',
            duration: '5 mins',
            points: 10,
            topics: [
                'What is insurance?',
                'Types of insurance',
                'Premium vs Coverage',
                'Claim process basics'
            ]
        },
        {
            id: 2,
            title: 'Health Insurance Essentials',
            icon: '🏥',
            description: 'Master health insurance terms and make informed decisions',
            duration: '8 mins',
            points: 15,
            topics: [
                'Cashless vs Reimbursement',
                'Pre-existing conditions',
                'Co-payment explained',
                'Room rent limits'
            ]
        },
        {
            id: 3,
            title: 'Life Insurance Planning',
            icon: '🛡️',
            description: 'Plan your life insurance for financial security',
            duration: '10 mins',
            points: 15,
            topics: [
                'Term vs Endowment',
                'Sum assured calculation',
                'Riders and add-ons',
                'Tax benefits'
            ]
        },
        {
            id: 4,
            title: 'Smart Insurance Tips',
            icon: '💡',
            description: 'Pro tips to save money and maximize coverage',
            duration: '6 mins',
            points: 20,
            topics: [
                'When to buy insurance',
                'Avoiding common mistakes',
                'Comparing policies',
                'Renewal strategies'
            ]
        }
    ];

    const tips = [
        {
            id: 1,
            icon: '💰',
            title: 'Buy Term Insurance Before 30',
            description: 'Premiums are 40% lower when you buy before age 30',
            impact: 'HIGH',
            savings: '₹50,000+ over lifetime'
        },
        {
            id: 2,
            icon: '🏥',
            title: 'Avoid Overlapping Coverage',
            description: 'Multiple health policies with same coverage waste money',
            impact: 'MEDIUM',
            savings: '₹15,000/year'
        },
        {
            id: 3,
            icon: '📋',
            title: 'Review Policies Annually',
            description: 'Update coverage as your life situation changes',
            impact: 'HIGH',
            savings: 'Optimal protection'
        },
        {
            id: 4,
            icon: '✅',
            title: 'Disclose All Medical History',
            description: 'Non-disclosure can lead to claim rejection',
            impact: 'CRITICAL',
            savings: 'Avoid claim denial'
        },
        {
            id: 5,
            icon: '🔄',
            title: 'Port Your Policy Wisely',
            description: 'Keep waiting period benefits when switching insurers',
            impact: 'MEDIUM',
            savings: 'No waiting period restart'
        }
    ];

    const quizQuestions = [
        {
            id: 1,
            question: 'What is the ideal time to buy term insurance?',
            options: [
                'After 40 years',
                'Before 30 years',
                'After retirement',
                'When you fall sick'
            ],
            correct: 1,
            explanation: 'Buying before 30 gives you lower premiums and better coverage options'
        },
        {
            id: 2,
            question: 'What does co-payment mean in health insurance?',
            options: [
                'Full payment by insurer',
                'You pay a percentage of claim',
                'No payment required',
                'Premium payment method'
            ],
            correct: 1,
            explanation: 'Co-payment means you share a percentage of the claim amount with the insurer'
        },
        {
            id: 3,
            question: 'Which insurance should you prioritize first?',
            options: [
                'Vehicle insurance',
                'Travel insurance',
                'Term life insurance',
                'Gadget insurance'
            ],
            correct: 2,
            explanation: 'Term life insurance provides maximum financial protection for your family'
        }
    ];

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [quizScore, setQuizScore] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);

    useEffect(() => {
        // Calculate literacy score based on completed modules
        const score = Math.min(100, completedModules.length * 25);
        setLiteracyScore(score);
    }, [completedModules]);

    const completeModule = (moduleId) => {
        if (!completedModules.includes(moduleId)) {
            setCompletedModules([...completedModules, moduleId]);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 75) return '#10b981';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const getImpactColor = (impact) => {
        switch (impact) {
            case 'CRITICAL': return '#dc2626';
            case 'HIGH': return '#f59e0b';
            case 'MEDIUM': return '#3b82f6';
            default: return '#10b981';
        }
    };

    const handleAnswerSelect = (answerIndex) => {
        setSelectedAnswer(answerIndex);
        setShowExplanation(true);

        if (answerIndex === quizQuestions[currentQuestion].correct) {
            setQuizScore(quizScore + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestion < quizQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
        } else {
            const score = quizScore;
            notify(`Quiz Complete! You scored ${score}/${quizQuestions.length}`, 'success');
            setShowQuiz(false);
            setCurrentQuestion(0);
            setQuizScore(0);
            setSelectedAnswer(null);
            setShowExplanation(false);
        }
    };

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
                padding: '25px 30px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white'
            }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>
                    📘 Insurance Literacy Center
                </h3>
                <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '0.95rem' }}>
                    Learn, grow, and make smarter insurance decisions
                </p>
            </div>

            <div style={{ padding: 30 }}>
                {!showQuiz ? (
                    <>
                        {/* Literacy Score */}
                        <div style={{
                            padding: 30,
                            background: `${getScoreColor(literacyScore)}10`,
                            border: `2px solid ${getScoreColor(literacyScore)}`,
                            borderRadius: 16,
                            marginBottom: 30,
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                                Your Insurance Literacy Score
                            </div>
                            <div style={{
                                fontSize: '4rem',
                                fontWeight: 800,
                                color: getScoreColor(literacyScore),
                                lineHeight: 1,
                                marginBottom: 12
                            }}>
                                {literacyScore}%
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                                {literacyScore >= 75 ? '🎉 Expert Level!' : literacyScore >= 50 ? '📈 Good Progress!' : '🌱 Keep Learning!'}
                            </div>

                            {/* Progress Bar */}
                            <div style={{
                                height: 12,
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: 6,
                                overflow: 'hidden',
                                marginBottom: 16
                            }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${literacyScore}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    style={{
                                        height: '100%',
                                        background: `linear-gradient(90deg, ${getScoreColor(literacyScore)}, ${getScoreColor(literacyScore)}dd)`,
                                        borderRadius: 6
                                    }}
                                />
                            </div>

                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Complete modules to increase your score
                            </div>
                        </div>

                        {/* Learning Modules */}
                        <div style={{ marginBottom: 30 }}>
                            <h4 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>
                                📚 Learning Modules
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                                {modules.map((module, idx) => {
                                    const isCompleted = completedModules.includes(module.id);
                                    return (
                                        <motion.div
                                            key={module.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            style={{
                                                padding: 20,
                                                background: isCompleted ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)',
                                                border: isCompleted ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: 12,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                position: 'relative'
                                            }}
                                            onClick={() => completeModule(module.id)}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(16,185,129,0.2)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            {isCompleted && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    right: 12,
                                                    width: 32,
                                                    height: 32,
                                                    background: '#10b981',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1rem',
                                                    color: 'white'
                                                }}>
                                                    ✓
                                                </div>
                                            )}

                                            <div style={{ fontSize: '3rem', marginBottom: 12 }}>
                                                {module.icon}
                                            </div>
                                            <h5 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                                {module.title}
                                            </h5>
                                            <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                                {module.description}
                                            </p>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    ⏱️ {module.duration}
                                                </span>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    background: 'rgba(16,185,129,0.2)',
                                                    borderRadius: 8,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    color: '#10b981'
                                                }}>
                                                    +{module.points} pts
                                                </span>
                                            </div>

                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                Topics:
                                                <ul style={{ margin: '8px 0 0 0', padding: '0 0 0 20px', lineHeight: 1.6 }}>
                                                    {module.topics.slice(0, 3).map((topic, i) => (
                                                        <li key={i}>{topic}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Smart Tips */}
                        <div style={{ marginBottom: 30 }}>
                            <h4 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>
                                💡 Smart Insurance Tips
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {tips.map((tip, idx) => (
                                    <motion.div
                                        key={tip.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        style={{
                                            padding: 20,
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 12,
                                            display: 'flex',
                                            gap: 16,
                                            alignItems: 'flex-start'
                                        }}
                                    >
                                        <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>
                                            {tip.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                                <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                                    {tip.title}
                                                </h5>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    background: `${getImpactColor(tip.impact)}20`,
                                                    border: `1px solid ${getImpactColor(tip.impact)}40`,
                                                    borderRadius: 8,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    color: getImpactColor(tip.impact)
                                                }}>
                                                    {tip.impact}
                                                </span>
                                            </div>
                                            <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                                {tip.description}
                                            </p>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>
                                                💰 {tip.savings}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Quiz CTA */}
                        <div style={{
                            padding: 30,
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
                            border: '2px solid rgba(99,102,241,0.3)',
                            borderRadius: 16,
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎯</div>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '1.3rem', color: 'var(--text-main)' }}>
                                Test Your Knowledge
                            </h4>
                            <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Take a quick quiz to see how much you've learned
                            </p>
                            <button
                                onClick={() => setShowQuiz(true)}
                                className="primary-btn"
                                style={{ background: '#6366f1', fontSize: '1rem', padding: '12px 32px' }}
                            >
                                Start Quiz
                            </button>
                        </div>
                    </>
                ) : (
                    // Quiz View
                    <div>
                        <div style={{ marginBottom: 30 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>
                                    Question {currentQuestion + 1} of {quizQuestions.length}
                                </h4>
                                <button
                                    onClick={() => {
                                        setShowQuiz(false);
                                        setCurrentQuestion(0);
                                        setQuizScore(0);
                                        setSelectedAnswer(null);
                                        setShowExplanation(false);
                                    }}
                                    className="primary-btn"
                                    style={{ background: '#6b7280' }}
                                >
                                    Exit Quiz
                                </button>
                            </div>

                            {/* Progress */}
                            <div style={{
                                height: 8,
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: 4,
                                overflow: 'hidden',
                                marginBottom: 30
                            }}>
                                <div style={{
                                    width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`,
                                    height: '100%',
                                    background: '#6366f1',
                                    transition: 'width 0.3s'
                                }} />
                            </div>
                        </div>

                        {/* Question */}
                        <div style={{
                            padding: 30,
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 16,
                            marginBottom: 20
                        }}>
                            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.3rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                                {quizQuestions[currentQuestion].question}
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {quizQuestions[currentQuestion].options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => !showExplanation && handleAnswerSelect(idx)}
                                        disabled={showExplanation}
                                        style={{
                                            padding: '16px 20px',
                                            background: showExplanation
                                                ? idx === quizQuestions[currentQuestion].correct
                                                    ? 'rgba(16,185,129,0.2)'
                                                    : idx === selectedAnswer
                                                        ? 'rgba(239,68,68,0.2)'
                                                        : 'rgba(255,255,255,0.02)'
                                                : selectedAnswer === idx
                                                    ? 'rgba(99,102,241,0.2)'
                                                    : 'rgba(255,255,255,0.02)',
                                            border: showExplanation
                                                ? idx === quizQuestions[currentQuestion].correct
                                                    ? '2px solid #10b981'
                                                    : idx === selectedAnswer
                                                        ? '2px solid #ef4444'
                                                        : '1px solid rgba(255,255,255,0.1)'
                                                : selectedAnswer === idx
                                                    ? '2px solid #6366f1'
                                                    : '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 12,
                                            color: 'var(--text-main)',
                                            fontSize: '0.95rem',
                                            textAlign: 'left',
                                            cursor: showExplanation ? 'default' : 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                background: showExplanation && idx === quizQuestions[currentQuestion].correct
                                                    ? '#10b981'
                                                    : showExplanation && idx === selectedAnswer
                                                        ? '#ef4444'
                                                        : selectedAnswer === idx
                                                            ? '#6366f1'
                                                            : 'rgba(255,255,255,0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 700,
                                                color: selectedAnswer === idx || (showExplanation && (idx === quizQuestions[currentQuestion].correct || idx === selectedAnswer))
                                                    ? 'white'
                                                    : 'var(--text-muted)',
                                                flexShrink: 0
                                            }}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span>{option}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Explanation */}
                            {showExplanation && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        marginTop: 20,
                                        padding: 16,
                                        background: 'rgba(99,102,241,0.1)',
                                        border: '1px solid rgba(99,102,241,0.3)',
                                        borderRadius: 12
                                    }}
                                >
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6366f1', marginBottom: 6 }}>
                                        💡 Explanation
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        {quizQuestions[currentQuestion].explanation}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {showExplanation && (
                            <button
                                onClick={nextQuestion}
                                className="primary-btn"
                                style={{ width: '100%', background: '#6366f1', fontSize: '1rem', padding: '14px' }}
                            >
                                {currentQuestion < quizQuestions.length - 1 ? 'Next Question →' : 'Finish Quiz'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
