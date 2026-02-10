package com.insurai.dto;

import java.util.List;

/**
 * Policy Recommendation Request DTO
 */
public class PolicyRecommendationRequest {
    private Long userId;
    private Long bookingId;
    private List<Long> recommendedPolicyIds;
    private String notes;
    private String reason;
    private String action;
    private String agentNotes;
    private String rejectionReason;
    private List<AlternativePolicyDTO> alternatives;

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public List<Long> getRecommendedPolicyIds() {
        return recommendedPolicyIds;
    }

    public void setRecommendedPolicyIds(List<Long> recommendedPolicyIds) {
        this.recommendedPolicyIds = recommendedPolicyIds;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getAgentNotes() {
        return agentNotes;
    }

    public void setAgentNotes(String agentNotes) {
        this.agentNotes = agentNotes;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public List<AlternativePolicyDTO> getAlternatives() {
        return alternatives;
    }

    public void setAlternatives(List<AlternativePolicyDTO> alternatives) {
        this.alternatives = alternatives;
    }

    // Inner class for alternative policies
    public static class AlternativePolicyDTO {
        private Long policyId;
        private String reason;
        private String notes;

        public Long getPolicyId() {
            return policyId;
        }

        public void setPolicyId(Long policyId) {
            this.policyId = policyId;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }
}
