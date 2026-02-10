import { useState } from 'react';
import { motion } from 'framer-motion';

export default function CalendarView({ appointments = [], userRole, onSlotClick }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'

    // Mock appointments relative to today
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const nextDay = new Date(today); nextDay.setDate(today.getDate() + 2);

    const setTime = (date, h, m) => {
        const d = new Date(date);
        d.setHours(h, m, 0, 0);
        return d;
    };

    const defaultAppointments = [
        {
            id: 1,
            time: '10:00 AM',
            duration: 60,
            userName: 'Arjun Patel',
            policyType: 'Health Insurance',
            riskLevel: 'LOW',
            status: 'CONFIRMED',
            date: setTime(today, 10, 0)
        },
        {
            id: 2,
            time: '11:30 AM',
            duration: 45,
            userName: 'Priya Sharma',
            policyType: 'Life Insurance',
            riskLevel: 'MEDIUM',
            status: 'CONFIRMED',
            date: setTime(today, 11, 30)
        },
        {
            id: 3,
            time: '03:30 PM',
            duration: 90,
            userName: 'Suresh Kumar',
            policyType: 'Vehicle Insurance',
            riskLevel: 'HIGH',
            status: 'PENDING',
            date: setTime(today, 15, 30)
        },
        {
            id: 4,
            time: '10:00 AM',
            duration: 60,
            userName: 'Anjali Mehta',
            policyType: 'Health Insurance',
            riskLevel: 'LOW',
            status: 'CONFIRMED',
            date: setTime(tomorrow, 10, 0)
        },
        {
            id: 5,
            time: '02:00 PM',
            duration: 45,
            userName: 'Rajesh Gupta',
            policyType: 'Term Insurance',
            riskLevel: 'MEDIUM',
            status: 'CONFIRMED',
            date: setTime(nextDay, 14, 0)
        }
    ];

    const appointmentsToShow = appointments.length > 0 ? appointments : defaultAppointments;

    const getRiskColor = (risk) => {
        switch (risk) {
            case 'HIGH': return '#ef4444';
            case 'MEDIUM': return '#f59e0b';
            case 'LOW': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMED': return '#10b981';
            case 'PENDING': return '#f59e0b';
            case 'CANCELLED': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getWeekDays = () => {
        const start = new Date(currentDate);
        start.setDate(start.getDate() - start.getDay()); // Start from Sunday

        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            return day;
        });
    };

    const getTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour <= 18; hour++) {
            slots.push(`${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`);
            if (hour < 18) {
                slots.push(`${hour > 12 ? hour - 12 : hour}:30 ${hour >= 12 ? 'PM' : 'AM'}`);
            }
        }
        return slots;
    };

    const getAppointmentsForDate = (date) => {
        return appointmentsToShow.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate.toDateString() === date.toDateString();
        });
    };

    const getAppointmentForSlot = (date, timeSlot) => {
        const appointments = getAppointmentsForDate(date);
        return appointments.find(apt => apt.time === timeSlot);
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDayName = (date) => {
        return date.toLocaleDateString('en-IN', { weekday: 'short' });
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const navigateWeek = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + (direction * 7));
        setCurrentDate(newDate);
    };

    const navigateDay = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + direction);
        setCurrentDate(newDate);
    };

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
                padding: '25px 30px',
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                color: 'white'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>
                            📅 Appointment Calendar
                        </h3>
                        <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '0.95rem' }}>
                            {viewMode === 'week' ? 'Weekly Schedule' : formatDate(currentDate)}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {/* View Mode Toggle */}
                        <div style={{
                            display: 'flex',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: 8,
                            padding: 4
                        }}>
                            <button
                                onClick={() => setViewMode('week')}
                                style={{
                                    padding: '6px 16px',
                                    background: viewMode === 'week' ? 'white' : 'transparent',
                                    color: viewMode === 'week' ? '#3b82f6' : 'white',
                                    border: 'none',
                                    borderRadius: 6,
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Week
                            </button>
                            <button
                                onClick={() => setViewMode('day')}
                                style={{
                                    padding: '6px 16px',
                                    background: viewMode === 'day' ? 'white' : 'transparent',
                                    color: viewMode === 'day' ? '#3b82f6' : 'white',
                                    border: 'none',
                                    borderRadius: 6,
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Day
                            </button>
                        </div>

                        {/* Navigation */}
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={() => viewMode === 'week' ? navigateWeek(-1) : navigateDay(-1)}
                                style={{
                                    padding: '8px 12px',
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    borderRadius: 6,
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 700
                                }}
                            >
                                ←
                            </button>
                            <button
                                onClick={() => setCurrentDate(new Date())}
                                style={{
                                    padding: '8px 16px',
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    borderRadius: 6,
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => viewMode === 'week' ? navigateWeek(1) : navigateDay(1)}
                                style={{
                                    padding: '8px 12px',
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    borderRadius: 6,
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 700
                                }}
                            >
                                →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ padding: 30 }}>
                {viewMode === 'week' ? (
                    // Week View
                    <div style={{ overflowX: 'auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', gap: 1, minWidth: 900 }}>
                            {/* Header Row */}
                            <div style={{ padding: 12 }}></div>
                            {getWeekDays().map((day, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: 12,
                                        textAlign: 'center',
                                        background: isToday(day) ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                                        border: isToday(day) ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 8
                                    }}
                                >
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                        {formatDayName(day)}
                                    </div>
                                    <div style={{
                                        fontSize: '1.2rem',
                                        fontWeight: 700,
                                        color: isToday(day) ? '#3b82f6' : 'var(--text-main)'
                                    }}>
                                        {day.getDate()}
                                    </div>
                                </div>
                            ))}

                            {/* Time Slots */}
                            {getTimeSlots().map((timeSlot, slotIdx) => (
                                <>
                                    <div
                                        key={`time-${slotIdx}`}
                                        style={{
                                            padding: '12px 8px',
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)',
                                            textAlign: 'right',
                                            borderTop: slotIdx === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)'
                                        }}
                                    >
                                        {timeSlot}
                                    </div>
                                    {getWeekDays().map((day, dayIdx) => {
                                        const appointment = getAppointmentForSlot(day, timeSlot);
                                        return (
                                            <div
                                                key={`slot-${slotIdx}-${dayIdx}`}
                                                onClick={() => !appointment && onSlotClick && onSlotClick(day, timeSlot)}
                                                style={{
                                                    padding: 8,
                                                    minHeight: 60,
                                                    background: appointment
                                                        ? `${getRiskColor(appointment.riskLevel)}20`
                                                        : 'rgba(255,255,255,0.02)',
                                                    border: appointment
                                                        ? `2px solid ${getRiskColor(appointment.riskLevel)}`
                                                        : '1px solid rgba(255,255,255,0.05)',
                                                    borderRadius: 6,
                                                    cursor: appointment ? 'pointer' : 'default',
                                                    transition: 'all 0.2s',
                                                    borderTop: slotIdx === 0 ? 'inherit' : 'none'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (appointment) {
                                                        e.currentTarget.style.transform = 'scale(1.02)';
                                                        e.currentTarget.style.zIndex = '10';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (appointment) {
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                        e.currentTarget.style.zIndex = '1';
                                                    }
                                                }}
                                            >
                                                {appointment && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                    >
                                                        <div style={{
                                                            fontSize: '0.75rem',
                                                            fontWeight: 700,
                                                            color: getRiskColor(appointment.riskLevel),
                                                            marginBottom: 4
                                                        }}>
                                                            {appointment.time}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600,
                                                            color: 'var(--text-main)',
                                                            marginBottom: 2
                                                        }}>
                                                            {appointment.userName}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.7rem',
                                                            color: 'var(--text-muted)'
                                                        }}>
                                                            {appointment.policyType}
                                                        </div>
                                                        <div style={{
                                                            marginTop: 4,
                                                            display: 'inline-block',
                                                            padding: '2px 6px',
                                                            background: `${getRiskColor(appointment.riskLevel)}40`,
                                                            borderRadius: 4,
                                                            fontSize: '0.65rem',
                                                            fontWeight: 700,
                                                            color: getRiskColor(appointment.riskLevel)
                                                        }}>
                                                            {appointment.riskLevel}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </>
                            ))}
                        </div>
                    </div>
                ) : (
                    // Day View
                    <div>
                        <div style={{ marginBottom: 20 }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>
                                {formatDate(currentDate)} - {formatDayName(currentDate)}
                            </h4>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {getTimeSlots().map((timeSlot, idx) => {
                                const appointment = getAppointmentForSlot(currentDate, timeSlot);
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.02 }}
                                        onClick={() => !appointment && onSlotClick && onSlotClick(currentDate, timeSlot)}
                                        style={{
                                            padding: 20,
                                            background: appointment
                                                ? `${getRiskColor(appointment.riskLevel)}10`
                                                : 'rgba(255,255,255,0.02)',
                                            border: appointment
                                                ? `2px solid ${getRiskColor(appointment.riskLevel)}`
                                                : '1px dashed rgba(255,255,255,0.1)',
                                            borderRadius: 12,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 20,
                                            cursor: appointment ? 'pointer' : 'default',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (appointment) {
                                                e.currentTarget.style.transform = 'translateX(8px)';
                                                e.currentTarget.style.boxShadow = `0 8px 24px ${getRiskColor(appointment.riskLevel)}40`;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (appointment) {
                                                e.currentTarget.style.transform = 'translateX(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }
                                        }}
                                    >
                                        {/* Time */}
                                        <div style={{
                                            minWidth: 100,
                                            fontSize: '1.1rem',
                                            fontWeight: 700,
                                            color: appointment ? getRiskColor(appointment.riskLevel) : 'var(--text-muted)'
                                        }}>
                                            {timeSlot}
                                        </div>

                                        {/* Appointment Details */}
                                        {appointment ? (
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                                        {appointment.userName}
                                                    </h4>
                                                    <div style={{
                                                        padding: '4px 12px',
                                                        background: `${getRiskColor(appointment.riskLevel)}30`,
                                                        border: `1px solid ${getRiskColor(appointment.riskLevel)}`,
                                                        borderRadius: 12,
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        color: getRiskColor(appointment.riskLevel)
                                                    }}>
                                                        {appointment.riskLevel} RISK
                                                    </div>
                                                    <div style={{
                                                        padding: '4px 12px',
                                                        background: `${getStatusColor(appointment.status)}20`,
                                                        border: `1px solid ${getStatusColor(appointment.status)}40`,
                                                        borderRadius: 12,
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        color: getStatusColor(appointment.status)
                                                    }}>
                                                        {appointment.status}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                    {appointment.policyType} • {appointment.duration} mins
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ flex: 1, fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                                Available slot - Click to book
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div style={{ marginTop: 30, padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        Risk Level Legend
                    </h4>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 16, height: 16, background: '#10b981', borderRadius: 4 }}></div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Low Risk</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 16, height: 16, background: '#f59e0b', borderRadius: 4 }}></div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Medium Risk</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 16, height: 16, background: '#ef4444', borderRadius: 4 }}></div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>High Risk</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
