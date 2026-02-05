package com.insurai.dto;

import com.insurai.model.Policy;

public class PolicyRecommendationDTO {
    private Policy policy;
    private Double matchScore; // 0-100
    private String eligibilityStatus; // ELIGIBLE, PARTIALLY_ELIGIBLE, NOT_ELIGIBLE
    private String eligibilityReason;
    private Double premiumBreakdown; // Calculated premium
    private Double claimSuccessRate;
    private Boolean isRecommended; // AI recommendation
    private String recommendationReason;

    public PolicyRecommendationDTO(Policy policy) {
        this.policy = policy;
        this.matchScore = 0.0;
        this.eligibilityStatus = "ELIGIBLE";
        this.claimSuccessRate = policy.getClaimSettlementRatio();
    }

    // Getters and Setters
    public Policy getPolicy() {
        return policy;
    }

    public void setPolicy(Policy policy) {
        this.policy = policy;
    }

    public Double getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Double matchScore) {
        this.matchScore = matchScore;
    }

    public String getEligibilityStatus() {
        return eligibilityStatus;
    }

    public void setEligibilityStatus(String eligibilityStatus) {
        this.eligibilityStatus = eligibilityStatus;
    }

    public String getEligibilityReason() {
        return eligibilityReason;
    }

    public void setEligibilityReason(String eligibilityReason) {
        this.eligibilityReason = eligibilityReason;
    }

    public Double getPremiumBreakdown() {
        return premiumBreakdown;
    }

    public void setPremiumBreakdown(Double premiumBreakdown) {
        this.premiumBreakdown = premiumBreakdown;
    }

    public Double getClaimSuccessRate() {
        return claimSuccessRate;
    }

    public void setClaimSuccessRate(Double claimSuccessRate) {
        this.claimSuccessRate = claimSuccessRate;
    }

    public Boolean getIsRecommended() {
        return isRecommended;
    }

    public void setIsRecommended(Boolean isRecommended) {
        this.isRecommended = isRecommended;
    }

    public String getRecommendationReason() {
        return recommendationReason;
    }

    public void setRecommendationReason(String recommendationReason) {
        this.recommendationReason = recommendationReason;
    }
}
