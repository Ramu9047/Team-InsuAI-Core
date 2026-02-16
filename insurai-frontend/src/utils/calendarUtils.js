/**
 * Calendar Utilities
 * Generate ICS files for calendar integration (Google, Outlook, Apple Calendar)
 */

/**
 * Format date for ICS file (YYYYMMDDTHHMMSSZ)
 */
const formatDateForICS = (date) => {
    const d = new Date(date);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
    const seconds = String(d.getUTCSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
};

/**
 * Generate ICS file content
 */
export const generateICS = (appointment) => {
    const { startTime, endTime, reason, agent, meetingLink, policy } = appointment;

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//InsurAI//Consultation Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${appointment.id}@insurai.com
DTSTAMP:${formatDateForICS(new Date())}
DTSTART:${formatDateForICS(startTime)}
DTEND:${formatDateForICS(endTime)}
SUMMARY:Consultation with ${agent?.name || 'Agent'}
DESCRIPTION:Insurance Consultation\\n\\nAgent: ${agent?.name || 'Agent'}\\nPolicy: ${policy?.name || 'General Consultation'}\\nReason: ${reason || 'Consultation'}\\n\\nMeeting Link: ${meetingLink || 'To be provided'}
LOCATION:${meetingLink || 'Online Meeting'}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
DESCRIPTION:Reminder: Consultation in 15 minutes
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;

    return icsContent;
};

/**
 * Download ICS file
 */
export const downloadICS = (appointment) => {
    const icsContent = generateICS(appointment);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `consultation-${appointment.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};

/**
 * Generate Google Calendar URL
 */
export const getGoogleCalendarUrl = (appointment) => {
    const { startTime, endTime, reason, agent, meetingLink, policy } = appointment;

    const start = new Date(startTime);
    const end = new Date(endTime);

    const formatGoogleDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `Consultation with ${agent?.name || 'Agent'}`,
        dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
        details: `Insurance Consultation\n\nAgent: ${agent?.name || 'Agent'}\nPolicy: ${policy?.name || 'General Consultation'}\nReason: ${reason || 'Consultation'}\n\nMeeting Link: ${meetingLink || 'To be provided'}`,
        location: meetingLink || 'Online Meeting'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Add to calendar with multiple options
 */
export const addToCalendar = (appointment, provider = 'google') => {
    switch (provider) {
        case 'google':
            window.open(getGoogleCalendarUrl(appointment), '_blank', 'noopener,noreferrer');
            break;
        case 'outlook':
        case 'apple':
        case 'ics':
            downloadICS(appointment);
            break;
        default:
            downloadICS(appointment);
    }
};

/**
 * Validate meeting link
 */
export const validateMeetingLink = (link) => {
    if (!link || link.trim() === '') {
        return { valid: false, error: 'Meeting link is empty' };
    }

    try {
        const url = new URL(link);
        // Check if it's a valid HTTP/HTTPS URL
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return { valid: false, error: 'Invalid URL protocol' };
        }
        return { valid: true, url: link };
    } catch (e) {
        return { valid: false, error: 'Invalid URL format' };
    }
};

/**
 * Join meeting with validation
 */
export const joinMeeting = (meetingLink, notifyCallback) => {
    const validation = validateMeetingLink(meetingLink);

    if (!validation.valid) {
        if (notifyCallback) {
            notifyCallback(validation.error, 'error');
        }
        return false;
    }

    try {
        window.open(validation.url, '_blank', 'noopener,noreferrer');
        if (notifyCallback) {
            notifyCallback('Opening meeting...', 'success');
        }
        return true;
    } catch (e) {
        if (notifyCallback) {
            notifyCallback('Failed to open meeting link', 'error');
        }
        return false;
    }
};

export default {
    generateICS,
    downloadICS,
    getGoogleCalendarUrl,
    addToCalendar,
    validateMeetingLink,
    joinMeeting
};
