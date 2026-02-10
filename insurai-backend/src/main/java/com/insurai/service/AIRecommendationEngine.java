package com.insurai.service;

import com.insurai.model.Policy;
import com.insurai.model.User;
import com.insurai.repository.PolicyRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * AI Policy Recommendation Engine
 * Provides explainable, personalized policy recommendations
 */
@Service
public class AIRecommendationEngine {

    private final PolicyRepository policyRepository;

    public AIRecommendationEngine(PolicyRepository policyRepository) {
        this.policyRepository = policyRepository;
    }

    /**
     * Get personalized policy recommendations with explanations
     */
    public List<PolicyRecommendation> getRecommendations(User user, Policy rejectedPolicy, int limit) {
        List<Policy> allPolicies = policyRepository.findAll();
        List<PolicyRecommendation> recommendations = new ArrayList<>();

        for (Policy policy : allPolicies) {
            // Skip the rejected policy itself
            if (rejectedPolicy != null && policy.getId().equals(rejectedPolicy.getId())) {
                continue;
            }

            // Calculate recommendation score
            PolicyRecommendation rec = calculateRecommendation(user, policy, rejectedPolicy);
            recommendations.add(rec);
        }

        // Sort by confidence score (descending) and return top N
        return recommendations.stream()
                .sorted(Comparator.comparingDouble(PolicyRecommendation::getConfidenceScore).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Calculate recommendation with explainable factors
     */
    private PolicyRecommendation calculateRecommendation(User user, Policy policy, Policy rejectedPolicy) {
        PolicyRecommendation rec = new PolicyRecommendation();
        rec.setPolicy(policy);

        // Calculate individual factor scores
        double affordabilityScore = calculateAffordabilityScore(user, policy);
        double ageMatchScore = calculateAgeMatchScore(user, policy);
        double coverageScore = calculateCoverageScore(user, policy);
        double riskProfileScore = calculateRiskProfileScore(user, policy);

        // Weighted overall confidence score
        double confidenceScore = (affordabilityScore * 0.35) + // 35% weight on affordability
                (ageMatchScore * 0.25) + // 25% weight on age match
                (coverageScore * 0.25) + // 25% weight on coverage
                (riskProfileScore * 0.15); // 15% weight on risk profile

        rec.setConfidenceScore(confidenceScore);

        // Generate explanation
        List<String> reasons = new ArrayList<>();
        List<String> concerns = new ArrayList<>();

        // Affordability explanation
        if (affordabilityScore > 0.8) {
            reasons.add(String.format("Premium (₹%,.0f/year) is only %.1f%% of your annual income - highly affordable",
                    policy.getPremium(), (policy.getPremium() / user.getIncome()) * 100));
        } else if (affordabilityScore > 0.6) {
            reasons.add(String.format("Premium (₹%,.0f/year) fits within recommended budget",
                    policy.getPremium()));
        } else {
            concerns.add(String.format("Premium (₹%,.0f/year) is %.1f%% of income - may strain budget",
                    policy.getPremium(), (policy.getPremium() / user.getIncome()) * 100));
        }

        // Age match explanation
        if (ageMatchScore > 0.8) {
            reasons.add(String.format("Designed for your age group (%d years)", user.getAge()));
        }

        // Coverage explanation
        if (coverageScore > 0.8) {
            reasons.add(String.format("Coverage of ₹%,.0f matches your needs based on income and dependents",
                    policy.getCoverage()));
        }

        // Risk profile explanation
        if (riskProfileScore > 0.7) {
            reasons.add("Your health profile qualifies you for standard rates");
        }

        // Comparison with rejected policy
        if (rejectedPolicy != null) {
            rec.setComparisonWithRejected(generateComparison(policy, rejectedPolicy));
        }

        rec.setReasons(reasons);
        rec.setConcerns(concerns);
        rec.setMatchScore(confidenceScore);

        return rec;
    }

    /**
     * Calculate affordability score (0-1)
     * Premium should be <= 20% of annual income for optimal score
     */
    private double calculateAffordabilityScore(User user, Policy policy) {
        if (user.getIncome() == null || user.getIncome() <= 0) {
            return 0.5; // Neutral if income unknown
        }

        double premiumToIncomeRatio = policy.getPremium() / user.getIncome();

        if (premiumToIncomeRatio <= 0.10)
            return 1.0; // <= 10% - Excellent
        if (premiumToIncomeRatio <= 0.15)
            return 0.85; // <= 15% - Very Good
        if (premiumToIncomeRatio <= 0.20)
            return 0.70; // <= 20% - Good
        if (premiumToIncomeRatio <= 0.25)
            return 0.50; // <= 25% - Acceptable
        if (premiumToIncomeRatio <= 0.30)
            return 0.30; // <= 30% - Risky
        return 0.10; // > 30% - Not recommended
    }

    /**
     * Calculate age match score (0-1)
     * Different policies suit different age groups
     */
    private double calculateAgeMatchScore(User user, Policy policy) {
        int age = user.getAge() != null ? user.getAge() : 30;
        String policyType = policy.getType();

        // Term Life Insurance - best for 25-50
        if ("Life".equalsIgnoreCase(policyType)) {
            if (age >= 25 && age <= 40)
                return 1.0;
            if (age >= 18 && age <= 50)
                return 0.8;
            if (age >= 50 && age <= 60)
                return 0.6;
            return 0.4;
        }

        // Health Insurance - important for all ages
        if ("Health".equalsIgnoreCase(policyType)) {
            if (age >= 30 && age <= 60)
                return 1.0;
            if (age >= 18 && age <= 70)
                return 0.9;
            return 0.7;
        }

        // Auto Insurance - best for 25-65
        if ("Auto".equalsIgnoreCase(policyType)) {
            if (age >= 25 && age <= 50)
                return 1.0;
            if (age >= 18 && age <= 65)
                return 0.8;
            return 0.6;
        }

        return 0.7; // Default neutral score
    }

    /**
     * Calculate coverage adequacy score (0-1)
     * Coverage should be 5-10x annual income for life insurance
     */
    private double calculateCoverageScore(User user, Policy policy) {
        if (user.getIncome() == null || user.getIncome() <= 0) {
            return 0.7; // Neutral if income unknown
        }

        double coverageToIncomeRatio = policy.getCoverage() / user.getIncome();

        // For Life Insurance
        if ("Life".equalsIgnoreCase(policy.getType())) {
            if (coverageToIncomeRatio >= 8 && coverageToIncomeRatio <= 12)
                return 1.0; // Optimal
            if (coverageToIncomeRatio >= 5 && coverageToIncomeRatio <= 15)
                return 0.85; // Good
            if (coverageToIncomeRatio >= 3 && coverageToIncomeRatio <= 20)
                return 0.70; // Acceptable
            return 0.5;
        }

        // For Health Insurance
        if ("Health".equalsIgnoreCase(policy.getType())) {
            if (coverageToIncomeRatio >= 3 && coverageToIncomeRatio <= 8)
                return 1.0;
            if (coverageToIncomeRatio >= 2 && coverageToIncomeRatio <= 10)
                return 0.85;
            return 0.7;
        }

        return 0.75; // Default
    }

    /**
     * Calculate risk profile match score (0-1)
     * Based on health status and lifestyle
     */
    private double calculateRiskProfileScore(User user, Policy policy) {
        // Simplified risk scoring
        // In production, this would use medical history, lifestyle factors, etc.

        int age = user.getAge() != null ? user.getAge() : 30;

        // Younger = lower risk
        if (age < 30)
            return 0.95;
        if (age < 40)
            return 0.90;
        if (age < 50)
            return 0.80;
        if (age < 60)
            return 0.70;
        return 0.60;
    }

    /**
     * Generate comparison with rejected policy
     */
    private PolicyComparison generateComparison(Policy recommended, Policy rejected) {
        PolicyComparison comparison = new PolicyComparison();

        // Premium comparison
        double premiumDiff = ((recommended.getPremium() - rejected.getPremium()) / rejected.getPremium()) * 100;
        comparison.setPremiumDifference(premiumDiff);

        if (premiumDiff < -20) {
            comparison
                    .setPremiumExplanation(String.format("%.0f%% cheaper than rejected policy", Math.abs(premiumDiff)));
        } else if (premiumDiff < 0) {
            comparison.setPremiumExplanation(String.format("Slightly cheaper (%.0f%% less)", Math.abs(premiumDiff)));
        } else if (premiumDiff < 20) {
            comparison.setPremiumExplanation(String.format("Similar premium (%.0f%% more)", premiumDiff));
        } else {
            comparison
                    .setPremiumExplanation(String.format("Higher premium but better value (%.0f%% more)", premiumDiff));
        }

        // Coverage comparison
        double coverageDiff = ((recommended.getCoverage() - rejected.getCoverage()) / rejected.getCoverage()) * 100;
        comparison.setCoverageDifference(coverageDiff);

        if (coverageDiff > 20) {
            comparison.setCoverageExplanation(String.format("%.0f%% more coverage", coverageDiff));
        } else if (coverageDiff > 0) {
            comparison.setCoverageExplanation(String.format("Slightly more coverage (%.0f%%)", coverageDiff));
        } else if (coverageDiff > -20) {
            comparison.setCoverageExplanation(String.format("Similar coverage (%.0f%% less)", Math.abs(coverageDiff)));
        } else {
            comparison.setCoverageExplanation(
                    String.format("Lower coverage but more affordable (%.0f%% less)", Math.abs(coverageDiff)));
        }

        // Value score (coverage per rupee of premium)
        double rejectedValue = rejected.getCoverage() / rejected.getPremium();
        double recommendedValue = recommended.getCoverage() / recommended.getPremium();
        double valueDiff = ((recommendedValue - rejectedValue) / rejectedValue) * 100;

        comparison.setValueScore(valueDiff);
        if (valueDiff > 10) {
            comparison.setValueExplanation(String.format("%.0f%% better value for money", valueDiff));
        } else if (valueDiff > 0) {
            comparison.setValueExplanation("Similar value for money");
        } else {
            comparison.setValueExplanation("Focus on affordability over maximum coverage");
        }

        return comparison;
    }

    /**
     * Policy Recommendation DTO
     */
    public static class PolicyRecommendation {
        private Policy policy;
        private double confidenceScore; // 0-1
        private double matchScore; // 0-1
        private List<String> reasons;
        private List<String> concerns;
        private PolicyComparison comparisonWithRejected;

        // Getters and Setters
        public Policy getPolicy() {
            return policy;
        }

        public void setPolicy(Policy policy) {
            this.policy = policy;
        }

        public double getConfidenceScore() {
            return confidenceScore;
        }

        public void setConfidenceScore(double confidenceScore) {
            this.confidenceScore = confidenceScore;
        }

        public double getMatchScore() {
            return matchScore;
        }

        public void setMatchScore(double matchScore) {
            this.matchScore = matchScore;
        }

        public List<String> getReasons() {
            return reasons;
        }

        public void setReasons(List<String> reasons) {
            this.reasons = reasons;
        }

        public List<String> getConcerns() {
            return concerns;
        }

        public void setConcerns(List<String> concerns) {
            this.concerns = concerns;
        }

        public PolicyComparison getComparisonWithRejected() {
            return comparisonWithRejected;
        }

        public void setComparisonWithRejected(PolicyComparison comparisonWithRejected) {
            this.comparisonWithRejected = comparisonWithRejected;
        }
    }

    /**
     * Policy Comparison DTO
     */
    public static class PolicyComparison {
        private double premiumDifference; // % difference
        private String premiumExplanation;
        private double coverageDifference; // % difference
        private String coverageExplanation;
        private double valueScore; // % better/worse value
        private String valueExplanation;

        // Getters and Setters
        public double getPremiumDifference() {
            return premiumDifference;
        }

        public void setPremiumDifference(double premiumDifference) {
            this.premiumDifference = premiumDifference;
        }

        public String getPremiumExplanation() {
            return premiumExplanation;
        }

        public void setPremiumExplanation(String premiumExplanation) {
            this.premiumExplanation = premiumExplanation;
        }

        public double getCoverageDifference() {
            return coverageDifference;
        }

        public void setCoverageDifference(double coverageDifference) {
            this.coverageDifference = coverageDifference;
        }

        public String getCoverageExplanation() {
            return coverageExplanation;
        }

        public void setCoverageExplanation(String coverageExplanation) {
            this.coverageExplanation = coverageExplanation;
        }

        public double getValueScore() {
            return valueScore;
        }

        public void setValueScore(double valueScore) {
            this.valueScore = valueScore;
        }

        public String getValueExplanation() {
            return valueExplanation;
        }

        public void setValueExplanation(String valueExplanation) {
            this.valueExplanation = valueExplanation;
        }
    }
}
