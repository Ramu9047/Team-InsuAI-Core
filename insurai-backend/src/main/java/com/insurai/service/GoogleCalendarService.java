package com.insurai.service;

import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class GoogleCalendarService {

    /**
     * Creates a Google Meet event and returns the meeting link.
     * Note: This is currently a simulated implementation.
     * In a real production environment, this would use the Google Calendar API
     * with OAuth2 or Service Account credentials to create an actual event.
     */
    public String createMeeting(String summary, String description, String startTime, String endTime,
            String... attendees) {
        // Simulation of Google Meet Link generation
        // Format: https://meet.google.com/abc-defg-hij

        String meetingCode = generateMeetingCode();
        return "https://meet.google.com/" + meetingCode;
    }

    private String generateMeetingCode() {
        // Generates a random string in format xxx-yyyy-zzz
        String uuid = UUID.randomUUID().toString();
        return uuid.substring(0, 3) + "-" + uuid.substring(4, 8) + "-" + uuid.substring(9, 12);
    }
}
