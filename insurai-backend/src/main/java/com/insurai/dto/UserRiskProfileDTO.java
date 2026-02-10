package com.insurai.dto;

import java.util.List;
import java.util.Map;

public class UserRiskProfileDTO {
    private Long userId;
    private Integer riskScore;
    private String riskLevel;
    private Map<String, String> factors; // e.g. "Health": "Good", "Lifestyle": "Moderate"
    private String recommendation;
    private List<String> insights;

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Integer getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Integer riskScore) {
        this.riskScore = riskScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public Map<String, String> getFactors() {
        return factors;
    }

    public void setFactors(Map<String, String> factors) {
        this.factors = factors;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public List<String> getInsights() {
        return insights;
    }

    public void setInsights(List<String> insights) {
        this.insights = insights;
    }
}
