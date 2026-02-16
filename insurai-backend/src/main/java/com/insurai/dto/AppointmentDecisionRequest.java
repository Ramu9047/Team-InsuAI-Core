package com.insurai.dto;

/**
 * Request DTO for appointment decisions
 */
public class AppointmentDecisionRequest {
    private Long bookingId;
    private String action; // APPROVE_MEETING, MARK_COMPLETED, APPROVE_POLICY, REJECT
    private String notes;
    private String rejectionReason;
    private Boolean includeAIRecommendations;

    // Getters and Setters
    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public Boolean getIncludeAIRecommendations() {
        return includeAIRecommendations;
    }

    public void setIncludeAIRecommendations(Boolean includeAIRecommendations) {
        this.includeAIRecommendations = includeAIRecommendations;
    }
}
