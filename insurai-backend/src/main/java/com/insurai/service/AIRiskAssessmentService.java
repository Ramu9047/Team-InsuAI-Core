package com.insurai.service;

import com.insurai.dto.RiskAssessmentDTO;
import com.insurai.model.Policy;
import com.insurai.model.User;
import com.insurai.repository.PolicyRepository;
import com.insurai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * AI-Driven Risk Assessment Service
 * Provides intelligent risk scoring and eligibility prediction
 */
@Service
public class AIRiskAssessmentService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PolicyRepository policyRepository;

    /**
     * Assess risk for a user applying for a specific policy
     */
    public RiskAssessmentDTO assessRisk(Long userId, Long policyId) {
        User user = userRepository.findById(java.util.Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        Policy policy = policyRepository.findById(java.util.Objects.requireNonNull(policyId))
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        RiskAssessmentDTO assessment = new RiskAssessmentDTO();
        assessment.setUserId(userId);
        assessment.setPolicyId(policyId);

        // Calculate risk score
        int riskScore = calculateRiskScore(user, policy);
        assessment.setRiskScore(riskScore);
        assessment.setRiskLevel(getRiskLevel(riskScore));

        // Predict eligibility
        String eligibilityPrediction = predictEligibility(user, policy, riskScore);
        assessment.setEligibilityPrediction(eligibilityPrediction);
        assessment.setEligibilityConfidence(calculateEligibilityConfidence(user, policy));

        // Identify risk factors
        assessment.setRiskFactors(identifyRiskFactors(user, policy));

        // Generate recommendations
        assessment.setRecommendations(generateRecommendations(user, policy, riskScore));
        assessment.setRequiredDocuments(getRequiredDocuments(policy));

        // Suggest alternatives if high risk
        if (riskScore > 70) {
            assessment.setAlternativePolicyIds(findAlternativePolicies(user, policy));
            assessment.setAlternativeReason("Your risk profile suggests these alternatives may be more suitable");
        }

        // Calculate claim readiness
        assessment.setClaimReadiness(calculateClaimReadiness(user, policy));

        return assessment;
    }

    /**
     * Get general risk profile for user
     */
    public com.insurai.dto.UserRiskProfileDTO getUserRiskProfile(Long userId) {
        User user = userRepository.findById(java.util.Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        int riskScore = 20; // Base optimal score

        // Age Logic
        Integer age = user.getAge();
        if (age != null) {
            if (age > 60)
                riskScore += 30;
            else if (age > 45)
                riskScore += 15;
            else if (age < 25)
                riskScore += 5;
        }

        // Health Logic
        String healthInfo = user.getHealthInfo();
        String healthStatus = "Good";
        if (healthInfo != null && !healthInfo.isEmpty()) {
            if (healthInfo.toLowerCase().contains("diabetes")) {
                riskScore += 20;
                healthStatus = "Moderate";
            }
            if (healthInfo.toLowerCase().contains("heart")) {
                riskScore += 25;
                healthStatus = "At Risk";
            }
            if (healthInfo.toLowerCase().contains("smoker")) {
                riskScore += 15;
                healthStatus = "At Risk";
            }
        }

        // Income Logic (Financial Stability reduces risk)
        Double income = user.getIncome();
        String lifestyle = "Stable";
        if (income != null) {
            if (income > 1500000) {
                riskScore -= 10;
                lifestyle = "Excellent";
            } else if (income < 300000) {
                riskScore += 10;
                lifestyle = "Variable";
            }
        }

        riskScore = Math.min(100, Math.max(5, riskScore));

        com.insurai.dto.UserRiskProfileDTO profile = new com.insurai.dto.UserRiskProfileDTO();
        profile.setUserId(userId);
        profile.setRiskScore(riskScore);
        profile.setRiskLevel(getRiskLevel(riskScore));

        java.util.Map<String, String> factors = new java.util.HashMap<>();
        factors.put("Health", healthStatus);
        factors.put("Lifestyle", lifestyle);
        factors.put("History", "Clean"); // Placeholder for claims history check
        profile.setFactors(factors);

        if (riskScore < 30) {
            profile.setRecommendation("Excellent profile! Eligible for premium discounts.");
            profile.setInsights(java.util.List.of("Low health risk detected", "Financial stability is a plus"));
        } else if (riskScore < 60) {
            profile.setRecommendation("Standard profile. Consider comprehensive health coverage.");
            profile.setInsights(java.util.List.of("Moderate risk factors identified", "Gap in critical illness cover"));
        } else {
            profile.setRecommendation("High risk detected. Specialized plans recommended.");
            profile.setInsights(
                    java.util.List.of("Health conditions affect premium", "Consider guaranteed issuance plans"));
        }

        return profile;
    }

    private int calculateRiskScore(User user, Policy policy) {
        int score = 0;

        // Age-based risk (Health insurance)
        if ("Health".equalsIgnoreCase(policy.getType())) {
            Integer age = user.getAge();
            if (age != null) {
                if (age > 60)
                    score += 30;
                else if (age > 45)
                    score += 20;
                else if (age < 25)
                    score += 10;
            }
        }

        // Health info risk
        String healthInfo = user.getHealthInfo();
        if (healthInfo != null && !healthInfo.isEmpty()) {
            if (healthInfo.toLowerCase().contains("diabetes"))
                score += 25;
            if (healthInfo.toLowerCase().contains("heart"))
                score += 30;
            if (healthInfo.toLowerCase().contains("cancer"))
                score += 35;
            if (healthInfo.toLowerCase().contains("smoker"))
                score += 20;
        }

        // Income vs Premium risk
        Double income = user.getIncome();
        Double premium = policy.getPremium();
        if (income != null && premium != null) {
            double affordabilityRatio = (premium * 12) / income;
            if (affordabilityRatio > 0.15)
                score += 25; // More than 15% of income
            else if (affordabilityRatio > 0.10)
                score += 15;
        }

        // Dependents risk (Life insurance)
        if ("Life".equalsIgnoreCase(policy.getType())) {
            Integer dependents = user.getDependents();
            if (dependents != null && dependents > 3)
                score += 10;
        }

        // Coverage vs Income risk
        Double coverage = policy.getCoverage();
        if (income != null && coverage != null) {
            double coverageRatio = coverage / income;
            if (coverageRatio > 20)
                score -= 10; // Good coverage
            else if (coverageRatio < 5)
                score += 15; // Insufficient coverage
        }

        return Math.min(100, Math.max(0, score));
    }

    private String getRiskLevel(int riskScore) {
        if (riskScore >= 75)
            return "CRITICAL";
        if (riskScore >= 50)
            return "HIGH";
        if (riskScore >= 25)
            return "MEDIUM";
        return "LOW";
    }

    private String predictEligibility(User user, Policy policy, int riskScore) {
        if (riskScore < 30)
            return "LIKELY_ELIGIBLE";
        if (riskScore < 60)
            return "PARTIALLY_ELIGIBLE";
        return "LIKELY_INELIGIBLE";
    }

    private Double calculateEligibilityConfidence(User user, Policy policy) {
        // Base confidence
        double confidence = 70.0;

        // Increase confidence if we have complete profile
        if (user.getAge() != null)
            confidence += 5;
        if (user.getIncome() != null)
            confidence += 5;
        if (user.getHealthInfo() != null && !user.getHealthInfo().isEmpty())
            confidence += 10;
        if (user.getDependents() != null)
            confidence += 5;
        if (user.getPhone() != null)
            confidence += 5;

        return Math.min(100.0, confidence);
    }

    private List<RiskAssessmentDTO.RiskFactor> identifyRiskFactors(User user, Policy policy) {
        List<RiskAssessmentDTO.RiskFactor> factors = new ArrayList<>();

        // Age factor
        Integer age = user.getAge();
        if (age != null && age > 60) {
            factors.add(new RiskAssessmentDTO.RiskFactor(
                    "Age",
                    "HIGH",
                    30,
                    "Age over 60 increases health insurance risk"));
        }

        // Health conditions
        String healthInfo = user.getHealthInfo();
        if (healthInfo != null && !healthInfo.isEmpty()) {
            if (healthInfo.toLowerCase().contains("diabetes") ||
                    healthInfo.toLowerCase().contains("heart") ||
                    healthInfo.toLowerCase().contains("cancer")) {
                factors.add(new RiskAssessmentDTO.RiskFactor(
                        "Pre-existing Conditions",
                        "HIGH",
                        35,
                        "Pre-existing medical conditions may affect eligibility"));
            }
        }

        // Affordability
        Double income = user.getIncome();
        Double premium = policy.getPremium();
        if (income != null && premium != null) {
            double ratio = (premium * 12) / income;
            if (ratio > 0.15) {
                factors.add(new RiskAssessmentDTO.RiskFactor(
                        "Affordability",
                        "MEDIUM",
                        20,
                        "Premium is more than 15% of annual income"));
            }
        }

        return factors;
    }

    private List<String> generateRecommendations(User user, Policy policy, int riskScore) {
        List<String> recommendations = new ArrayList<>();

        if (riskScore > 70) {
            recommendations.add("Consider policies with lower coverage amounts");
            recommendations.add("Consult with an agent for personalized advice");
            recommendations.add("Improve health metrics before applying");
        } else if (riskScore > 40) {
            recommendations.add("Provide detailed health information for accurate assessment");
            recommendations.add("Consider adding riders for better coverage");
        } else {
            recommendations.add("You're a good candidate for this policy");
            recommendations.add("Consider increasing coverage for better protection");
        }

        return recommendations;
    }

    private List<String> getRequiredDocuments(Policy policy) {
        List<String> documents = new ArrayList<>(Arrays.asList(
                "Identity Proof (Aadhar/PAN)",
                "Address Proof",
                "Income Proof (Salary Slips/ITR)",
                "Passport Size Photos"));

        if ("Health".equalsIgnoreCase(policy.getType())) {
            documents.add("Medical Reports (if applicable)");
            documents.add("Previous Health Insurance Policy (if any)");
        } else if ("Life".equalsIgnoreCase(policy.getType())) {
            documents.add("Nominee Details");
            documents.add("Medical Certificate");
        }

        return documents;
    }

    private List<Long> findAlternativePolicies(User user, Policy policy) {
        // Find policies of same type but with lower coverage/premium
        List<Policy> alternatives = policyRepository.findAll().stream()
                .filter(p -> p.getType().equals(policy.getType()))
                .filter(p -> p.getPremium() != null && policy.getPremium() != null)
                .filter(p -> p.getPremium() < policy.getPremium())
                .limit(3)
                .toList();

        return alternatives.stream().map(Policy::getId).toList();
    }

    private RiskAssessmentDTO.ClaimReadiness calculateClaimReadiness(User user, Policy policy) {
        RiskAssessmentDTO.ClaimReadiness readiness = new RiskAssessmentDTO.ClaimReadiness();

        int score = 50; // Base score
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        List<String> tips = new ArrayList<>();

        // Complete profile increases readiness
        if (user.getAge() != null && user.getIncome() != null && user.getHealthInfo() != null) {
            score += 20;
            strengths.add("Complete profile information");
        } else {
            weaknesses.add("Incomplete profile information");
            tips.add("Complete your profile for better claim success rate");
        }

        // Good income-to-premium ratio
        if (user.getIncome() != null && policy.getPremium() != null) {
            double ratio = (policy.getPremium() * 12) / user.getIncome();
            if (ratio < 0.10) {
                score += 15;
                strengths.add("Excellent affordability ratio");
            }
        }

        // No major health issues
        if (user.getHealthInfo() == null || user.getHealthInfo().isEmpty()) {
            score += 15;
            strengths.add("No declared health issues");
        } else {
            weaknesses.add("Pre-existing health conditions");
            tips.add("Maintain proper medical documentation");
        }

        readiness.setReadinessScore(Math.min(100, score));
        readiness.setReadinessLevel(getReadinessLevel(readiness.getReadinessScore()));
        readiness.setClaimSuccessProbability((double) readiness.getReadinessScore());
        readiness.setStrengths(strengths);
        readiness.setWeaknesses(weaknesses);
        readiness.setImprovementTips(tips);

        return readiness;
    }

    private String getReadinessLevel(int score) {
        if (score >= 80)
            return "EXCELLENT";
        if (score >= 60)
            return "GOOD";
        if (score >= 40)
            return "FAIR";
        return "POOR";
    }
}
