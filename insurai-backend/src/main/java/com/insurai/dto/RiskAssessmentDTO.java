package com.insurai.dto;

import java.util.List;

/**
 * AI Risk Assessment DTO
 * Provides pre-consultation risk scoring and eligibility prediction
 */
public class RiskAssessmentDTO {

    private Long userId;
    private Long policyId;

    // Risk Score (0-100, higher = riskier)
    private Integer riskScore;
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL

    // Eligibility Prediction
    private String eligibilityPrediction; // LIKELY_ELIGIBLE, PARTIALLY_ELIGIBLE, LIKELY_INELIGIBLE
    private Double eligibilityConfidence; // 0-100%

    // Risk Factors
    private List<RiskFactor> riskFactors;

    // Recommendations
    private List<String> recommendations;
    private List<String> requiredDocuments;

    // Alternative Suggestions
    private List<Long> alternativePolicyIds;
    private String alternativeReason;

    // Claim Readiness
    private ClaimReadiness claimReadiness;

    // Nested Classes
    public static class RiskFactor {
        private String factor;
        private String severity; // LOW, MEDIUM, HIGH
        private Integer impact; // 0-100
        private String explanation;

        public RiskFactor() {
        }

        public RiskFactor(String factor, String severity, Integer impact, String explanation) {
            this.factor = factor;
            this.severity = severity;
            this.impact = impact;
            this.explanation = explanation;
        }

        // Getters and Setters
        public String getFactor() {
            return factor;
        }

        public void setFactor(String factor) {
            this.factor = factor;
        }

        public String getSeverity() {
            return severity;
        }

        public void setSeverity(String severity) {
            this.severity = severity;
        }

        public Integer getImpact() {
            return impact;
        }

        public void setImpact(Integer impact) {
            this.impact = impact;
        }

        public String getExplanation() {
            return explanation;
        }

        public void setExplanation(String explanation) {
            this.explanation = explanation;
        }
    }

    public static class ClaimReadiness {
        private Integer readinessScore; // 0-100
        private String readinessLevel; // EXCELLENT, GOOD, FAIR, POOR
        private Double claimSuccessProbability; // 0-100%

        private List<String> strengths;
        private List<String> weaknesses;
        private List<String> improvementTips;

        // Getters and Setters
        public Integer getReadinessScore() {
            return readinessScore;
        }

        public void setReadinessScore(Integer readinessScore) {
            this.readinessScore = readinessScore;
        }

        public String getReadinessLevel() {
            return readinessLevel;
        }

        public void setReadinessLevel(String readinessLevel) {
            this.readinessLevel = readinessLevel;
        }

        public Double getClaimSuccessProbability() {
            return claimSuccessProbability;
        }

        public void setClaimSuccessProbability(Double claimSuccessProbability) {
            this.claimSuccessProbability = claimSuccessProbability;
        }

        public List<String> getStrengths() {
            return strengths;
        }

        public void setStrengths(List<String> strengths) {
            this.strengths = strengths;
        }

        public List<String> getWeaknesses() {
            return weaknesses;
        }

        public void setWeaknesses(List<String> weaknesses) {
            this.weaknesses = weaknesses;
        }

        public List<String> getImprovementTips() {
            return improvementTips;
        }

        public void setImprovementTips(List<String> improvementTips) {
            this.improvementTips = improvementTips;
        }
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getPolicyId() {
        return policyId;
    }

    public void setPolicyId(Long policyId) {
        this.policyId = policyId;
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

    public String getEligibilityPrediction() {
        return eligibilityPrediction;
    }

    public void setEligibilityPrediction(String eligibilityPrediction) {
        this.eligibilityPrediction = eligibilityPrediction;
    }

    public Double getEligibilityConfidence() {
        return eligibilityConfidence;
    }

    public void setEligibilityConfidence(Double eligibilityConfidence) {
        this.eligibilityConfidence = eligibilityConfidence;
    }

    public List<RiskFactor> getRiskFactors() {
        return riskFactors;
    }

    public void setRiskFactors(List<RiskFactor> riskFactors) {
        this.riskFactors = riskFactors;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }

    public List<String> getRequiredDocuments() {
        return requiredDocuments;
    }

    public void setRequiredDocuments(List<String> requiredDocuments) {
        this.requiredDocuments = requiredDocuments;
    }

    public List<Long> getAlternativePolicyIds() {
        return alternativePolicyIds;
    }

    public void setAlternativePolicyIds(List<Long> alternativePolicyIds) {
        this.alternativePolicyIds = alternativePolicyIds;
    }

    public String getAlternativeReason() {
        return alternativeReason;
    }

    public void setAlternativeReason(String alternativeReason) {
        this.alternativeReason = alternativeReason;
    }

    public ClaimReadiness getClaimReadiness() {
        return claimReadiness;
    }

    public void setClaimReadiness(ClaimReadiness claimReadiness) {
        this.claimReadiness = claimReadiness;
    }
}
