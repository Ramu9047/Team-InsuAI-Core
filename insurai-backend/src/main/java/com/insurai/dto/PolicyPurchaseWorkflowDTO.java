package com.insurai.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Policy Purchase Workflow DTO
 * Tracks the complete journey from browsing to purchase
 */
public class PolicyPurchaseWorkflowDTO {
    private Long workflowId;
    private Long userId;
    private String userName;
    private String userEmail;

    // Policy Information
    private Long policyId;
    private String policyName;
    private String policyType;
    private Double premium;
    private Double coverage;

    // Workflow Status
    private String status; // BROWSING, CONSULTATION_REQUESTED, UNDER_REVIEW, APPROVED, REJECTED, PURCHASED
    private LocalDateTime requestedAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime purchasedAt;

    // Booking Information
    private Long bookingId;
    private LocalDateTime appointmentTime;
    private String appointmentReason;

    // Agent Review
    private Long agentId;
    private String agentName;
    private String agentDecision; // APPROVE, REJECT, PENDING
    private String agentNotes;
    private String rejectionReason;

    // Risk Assessment
    private String riskLevel; // LOW, MEDIUM, HIGH
    private Double riskScore;
    private String eligibilityStatus; // ELIGIBLE, NOT_ELIGIBLE, CONDITIONAL
    private List<String> riskFactors;
    private List<String> eligibilityCriteria;

    // AI Recommendations (if rejected)
    private List<AlternativePolicyDTO> aiRecommendations;

    // Admin Audit
    private Boolean requiresAdminApproval;
    private Long adminReviewerId;
    private String adminNotes;
    private LocalDateTime adminReviewedAt;

    // Getters and Setters
    public Long getWorkflowId() {
        return workflowId;
    }

    public void setWorkflowId(Long workflowId) {
        this.workflowId = workflowId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public Long getPolicyId() {
        return policyId;
    }

    public void setPolicyId(Long policyId) {
        this.policyId = policyId;
    }

    public String getPolicyName() {
        return policyName;
    }

    public void setPolicyName(String policyName) {
        this.policyName = policyName;
    }

    public String getPolicyType() {
        return policyType;
    }

    public void setPolicyType(String policyType) {
        this.policyType = policyType;
    }

    public Double getPremium() {
        return premium;
    }

    public void setPremium(Double premium) {
        this.premium = premium;
    }

    public Double getCoverage() {
        return coverage;
    }

    public void setCoverage(Double coverage) {
        this.coverage = coverage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public LocalDateTime getPurchasedAt() {
        return purchasedAt;
    }

    public void setPurchasedAt(LocalDateTime purchasedAt) {
        this.purchasedAt = purchasedAt;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public LocalDateTime getAppointmentTime() {
        return appointmentTime;
    }

    public void setAppointmentTime(LocalDateTime appointmentTime) {
        this.appointmentTime = appointmentTime;
    }

    public String getAppointmentReason() {
        return appointmentReason;
    }

    public void setAppointmentReason(String appointmentReason) {
        this.appointmentReason = appointmentReason;
    }

    public Long getAgentId() {
        return agentId;
    }

    public void setAgentId(Long agentId) {
        this.agentId = agentId;
    }

    public String getAgentName() {
        return agentName;
    }

    public void setAgentName(String agentName) {
        this.agentName = agentName;
    }

    public String getAgentDecision() {
        return agentDecision;
    }

    public void setAgentDecision(String agentDecision) {
        this.agentDecision = agentDecision;
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

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public Double getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Double riskScore) {
        this.riskScore = riskScore;
    }

    public String getEligibilityStatus() {
        return eligibilityStatus;
    }

    public void setEligibilityStatus(String eligibilityStatus) {
        this.eligibilityStatus = eligibilityStatus;
    }

    public List<String> getRiskFactors() {
        return riskFactors;
    }

    public void setRiskFactors(List<String> riskFactors) {
        this.riskFactors = riskFactors;
    }

    public List<String> getEligibilityCriteria() {
        return eligibilityCriteria;
    }

    public void setEligibilityCriteria(List<String> eligibilityCriteria) {
        this.eligibilityCriteria = eligibilityCriteria;
    }

    public List<AlternativePolicyDTO> getAiRecommendations() {
        return aiRecommendations;
    }

    public void setAiRecommendations(List<AlternativePolicyDTO> aiRecommendations) {
        this.aiRecommendations = aiRecommendations;
    }

    public Boolean getRequiresAdminApproval() {
        return requiresAdminApproval;
    }

    public void setRequiresAdminApproval(Boolean requiresAdminApproval) {
        this.requiresAdminApproval = requiresAdminApproval;
    }

    public Long getAdminReviewerId() {
        return adminReviewerId;
    }

    public void setAdminReviewerId(Long adminReviewerId) {
        this.adminReviewerId = adminReviewerId;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public LocalDateTime getAdminReviewedAt() {
        return adminReviewedAt;
    }

    public void setAdminReviewedAt(LocalDateTime adminReviewedAt) {
        this.adminReviewedAt = adminReviewedAt;
    }

    // Inner class for alternative policy recommendations
    public static class AlternativePolicyDTO {
        private Long policyId;
        private String policyName;
        private String policyType;
        private Double premium;
        private Double coverage;
        private String recommendationReason;
        private Double matchScore;

        public Long getPolicyId() {
            return policyId;
        }

        public void setPolicyId(Long policyId) {
            this.policyId = policyId;
        }

        public String getPolicyName() {
            return policyName;
        }

        public void setPolicyName(String policyName) {
            this.policyName = policyName;
        }

        public String getPolicyType() {
            return policyType;
        }

        public void setPolicyType(String policyType) {
            this.policyType = policyType;
        }

        public Double getPremium() {
            return premium;
        }

        public void setPremium(Double premium) {
            this.premium = premium;
        }

        public Double getCoverage() {
            return coverage;
        }

        public void setCoverage(Double coverage) {
            this.coverage = coverage;
        }

        public String getRecommendationReason() {
            return recommendationReason;
        }

        public void setRecommendationReason(String recommendationReason) {
            this.recommendationReason = recommendationReason;
        }

        public Double getMatchScore() {
            return matchScore;
        }

        public void setMatchScore(Double matchScore) {
            this.matchScore = matchScore;
        }
    }
}
