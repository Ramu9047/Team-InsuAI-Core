package com.insurai.dto;

import java.util.List;

/**
 * Policy Recommendation DTO
 */
public class PolicyRecommendationDTO {
    private Long policyId;
    private String policyName;
    private String type;
    private String category;
    private Double premium;
    private Double coverage;
    private Double matchScore;
    private String matchReason;
    private Double premiumBreakdown;
    private String eligibilityStatus;
    private Boolean isRecommended;
    private String recommendationReason;
    private List<String> benefits;
    private List<String> exclusions;

    // Default constructor
    public PolicyRecommendationDTO() {
    }

    // Constructor from Policy
    public PolicyRecommendationDTO(com.insurai.model.Policy policy) {
        this.policyId = policy.getId();
        this.policyName = policy.getName();
        this.type = policy.getType();
        this.category = policy.getCategory();
        this.premium = policy.getPremium();
        this.coverage = policy.getCoverage();
    }

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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
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

    public Double getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Double matchScore) {
        this.matchScore = matchScore;
    }

    public String getMatchReason() {
        return matchReason;
    }

    public void setMatchReason(String matchReason) {
        this.matchReason = matchReason;
    }

    public Double getPremiumBreakdown() {
        return premiumBreakdown;
    }

    public void setPremiumBreakdown(Double premiumBreakdown) {
        this.premiumBreakdown = premiumBreakdown;
    }

    public List<String> getBenefits() {
        return benefits;
    }

    public void setBenefits(List<String> benefits) {
        this.benefits = benefits;
    }

    public List<String> getExclusions() {
        return exclusions;
    }

    public void setExclusions(List<String> exclusions) {
        this.exclusions = exclusions;
    }

    public String getEligibilityStatus() {
        return eligibilityStatus;
    }

    public void setEligibilityStatus(String eligibilityStatus) {
        this.eligibilityStatus = eligibilityStatus;
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
