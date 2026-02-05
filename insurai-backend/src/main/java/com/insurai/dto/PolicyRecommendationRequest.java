package com.insurai.dto;

import java.util.List;

public class PolicyRecommendationRequest {
    private Long bookingId;
    private Long userId;
    private String agentNotes;
    private String action; // APPROVE, REJECT, RECOMMEND_ALTERNATIVE

    // For rejection
    private String rejectionReason;

    // For alternative recommendations
    private List<AlternativePolicyDTO> alternatives;

    public static class AlternativePolicyDTO {
        private Long policyId;
        private String reason; // Why this alternative is better
        private Double suggestedSumAssured; // Modified coverage
        private Integer suggestedTenure; // Modified tenure in years
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

        public Double getSuggestedSumAssured() {
            return suggestedSumAssured;
        }

        public void setSuggestedSumAssured(Double suggestedSumAssured) {
            this.suggestedSumAssured = suggestedSumAssured;
        }

        public Integer getSuggestedTenure() {
            return suggestedTenure;
        }

        public void setSuggestedTenure(Integer suggestedTenure) {
            this.suggestedTenure = suggestedTenure;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }

    // Getters and Setters
    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getAgentNotes() {
        return agentNotes;
    }

    public void setAgentNotes(String agentNotes) {
        this.agentNotes = agentNotes;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
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
}
