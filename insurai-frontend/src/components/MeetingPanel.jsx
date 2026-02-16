import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import './MeetingPanel.css';

/**
 * Meeting Panel Component
 * Displays meeting interface with video call integration
 */
const MeetingPanel = () => {
    const { appointmentId } = useParams();
    const { notify } = useNotification();

    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);

    useEffect(() => {
        fetchMeetingDetails();
    }, [appointmentId]);

    const fetchMeetingDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/meeting/${appointmentId}`);
            setMeeting(response.data);
        } catch (error) {
            console.error('Error fetching meeting:', error);
            notify('Failed to load meeting details', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinMeeting = () => {
        if (meeting && meeting.meetingLink) {
            window.open(meeting.meetingLink, '_blank');
            notify('Opening meeting in new tab...', 'info');
        }
    };

    const handleSaveNotes = async () => {
        if (!notes.trim()) {
            notify('Please enter some notes', 'warning');
            return;
        }

        setSavingNotes(true);
        try {
            await api.post(`/api/appointments/${appointmentId}/notes`, {
                notes: notes
            });
            notify('Notes saved successfully', 'success');
        } catch (error) {
            console.error('Error saving notes:', error);
            notify('Failed to save notes', 'error');
        } finally {
            setSavingNotes(false);
        }
    };

    const handleCompleteMeeting = async () => {
        if (window.confirm('Mark this consultation as complete?')) {
            try {
                await api.put(`/api/appointments/${appointmentId}/complete`);
                notify('Consultation marked as complete', 'success');
                fetchMeetingDetails(); // Refresh
            } catch (error) {
                console.error('Error completing meeting:', error);
                notify('Failed to complete meeting', 'error');
            }
        }
    };

    const handleAddToCalendar = async () => {
        try {
            // Download ICS file
            const response = await api.get(`/api/calendar/add/${appointmentId}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `appointment_${appointmentId}.ics`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            notify('Calendar file downloaded', 'success');
        } catch (error) {
            console.error('Error downloading calendar file:', error);
            notify('Failed to download calendar file', 'error');
        }
    };

    const handleOpenGoogleCalendar = async () => {
        try {
            const response = await api.get(`/api/calendar/google/${appointmentId}`);
            window.open(response.data.url, '_blank');
            notify('Opening Google Calendar...', 'info');
        } catch (error) {
            console.error('Error opening Google Calendar:', error);
            notify('Failed to open Google Calendar', 'error');
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeUntilMeeting = () => {
        if (!meeting || !meeting.startTime) return null;

        const now = new Date();
        const meetingTime = new Date(meeting.startTime);
        const diff = meetingTime - now;

        if (diff < 0) return 'Meeting time has passed';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days} day${days > 1 ? 's' : ''} away`;
        }

        if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''} away`;
        }

        return `${minutes} minute${minutes !== 1 ? 's' : ''} away`;
    };

    if (loading) {
        return (
            <div className="meeting-panel-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading meeting details...</p>
                </div>
            </div>
        );
    }

    if (!meeting) {
        return (
            <div className="meeting-panel-container">
                <div className="error-state">
                    <h2>Meeting Not Found</h2>
                    <p>Unable to load meeting details</p>
                </div>
            </div>
        );
    }

    const timeUntil = getTimeUntilMeeting();
    const isMeetingActive = meeting.status === 'MEETING_APPROVED' || meeting.status === 'CONSULTED';

    return (
        <div className="meeting-panel-container">
            <div className="meeting-panel-wrapper">
                {/* Header */}
                <div className="meeting-header">
                    <div className="meeting-title-section">
                        <h1>{meeting.title}</h1>
                        <div className="meeting-status-badge">
                            {meeting.status === 'CONSULTED' ? '✅ Completed' : '🔴 Active'}
                        </div>
                    </div>

                    {timeUntil && (
                        <div className="time-until-badge">
                            <span className="clock-icon">⏰</span>
                            <span>{timeUntil}</span>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="meeting-content">
                    {/* Meeting Info Card */}
                    <div className="meeting-info-card">
                        <h2>📅 Meeting Details</h2>

                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Date & Time:</span>
                                <span className="info-value">{formatDateTime(meeting.startTime)}</span>
                            </div>

                            <div className="info-item">
                                <span className="info-label">Duration:</span>
                                <span className="info-value">1 hour</span>
                            </div>

                            {meeting.userEmail && (
                                <div className="info-item">
                                    <span className="info-label">User:</span>
                                    <span className="info-value">{meeting.userEmail}</span>
                                </div>
                            )}

                            {meeting.agentEmail && (
                                <div className="info-item">
                                    <span className="info-label">Agent:</span>
                                    <span className="info-value">{meeting.agentEmail}</span>
                                </div>
                            )}
                        </div>

                        {/* Meeting Link */}
                        {meeting.meetingLink && (
                            <div className="meeting-link-section">
                                <h3>🔗 Join Meeting</h3>
                                <div className="link-container">
                                    <input
                                        type="text"
                                        value={meeting.meetingLink}
                                        readOnly
                                        className="link-input"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(meeting.meetingLink);
                                            notify('Link copied to clipboard', 'success');
                                        }}
                                        className="copy-btn"
                                    >
                                        📋 Copy
                                    </button>
                                </div>

                                <button
                                    onClick={handleJoinMeeting}
                                    className="join-meeting-btn"
                                    disabled={meeting.status === 'CONSULTED'}
                                >
                                    <span className="video-icon">🎥</span>
                                    {meeting.status === 'CONSULTED' ? 'Meeting Completed' : 'Join Meeting'}
                                </button>
                            </div>
                        )}

                        {/* Calendar Actions */}
                        <div className="calendar-actions">
                            <h3>📆 Add to Calendar</h3>
                            <div className="calendar-buttons">
                                <button onClick={handleOpenGoogleCalendar} className="calendar-btn google">
                                    <span>📅</span>
                                    Google Calendar
                                </button>
                                <button onClick={handleAddToCalendar} className="calendar-btn ics">
                                    <span>📥</span>
                                    Download ICS
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="notes-card">
                        <h2>📝 Meeting Notes</h2>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes about this consultation..."
                            className="notes-textarea"
                            rows="8"
                        />
                        <button
                            onClick={handleSaveNotes}
                            className="save-notes-btn"
                            disabled={savingNotes}
                        >
                            {savingNotes ? 'Saving...' : 'Save Notes'}
                        </button>
                    </div>

                    {/* Action Buttons */}
                    {meeting.status !== 'CONSULTED' && (
                        <div className="action-buttons">
                            <button
                                onClick={handleCompleteMeeting}
                                className="complete-btn"
                            >
                                ✅ Mark as Complete
                            </button>
                        </div>
                    )}

                    {/* Meeting Tips */}
                    <div className="meeting-tips-card">
                        <h3>💡 Meeting Tips</h3>
                        <ul className="tips-list">
                            <li>Join the meeting 5 minutes early to test your audio and video</li>
                            <li>Ensure you're in a quiet environment with good lighting</li>
                            <li>Have your documents and questions ready</li>
                            <li>Take notes during the consultation for future reference</li>
                            <li>Ask questions if anything is unclear</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeetingPanel;
