package com.insurai.dto;

import java.util.List;

/**
 * Response DTO for appointment decisions with AI insights
 */
public class AppointmentDecisionResponse {
    private Long bookingId;
    private Long userPolicyId;
    private String status;
    private String message;
    private String meetingLink;
    private String rejectionReason;

    // AI Insights
    private Double aiRiskScore;
    private List<String> aiRiskFactors;
    private String aiExplanation;
    private List<AlternativePolicy> alternativePolicies;

    // Nested class for alternative policies
    public static class AlternativePolicy {
        private Long policyId;
        private String policyName;
        private String policyType;
        private Double premium;
        private Double coverage;
        private String recommendationReason;
        private Double matchScore;

        // Getters and Setters
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

    // Getters and Setters
    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getUserPolicyId() {
        return userPolicyId;
    }

    public void setUserPolicyId(Long userPolicyId) {
        this.userPolicyId = userPolicyId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public Double getAiRiskScore() {
        return aiRiskScore;
    }

    public void setAiRiskScore(Double aiRiskScore) {
        this.aiRiskScore = aiRiskScore;
    }

    public List<String> getAiRiskFactors() {
        return aiRiskFactors;
    }

    public void setAiRiskFactors(List<String> aiRiskFactors) {
        this.aiRiskFactors = aiRiskFactors;
    }

    public String getAiExplanation() {
        return aiExplanation;
    }

    public void setAiExplanation(String aiExplanation) {
        this.aiExplanation = aiExplanation;
    }

    public List<AlternativePolicy> getAlternativePolicies() {
        return alternativePolicies;
    }

    public void setAlternativePolicies(List<AlternativePolicy> alternativePolicies) {
        this.alternativePolicies = alternativePolicies;
    }
}
