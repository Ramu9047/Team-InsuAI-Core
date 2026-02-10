package com.insurai.service;

import com.insurai.model.Policy;
import com.insurai.model.User;
import com.insurai.model.UserPolicy;
import com.insurai.repository.PolicyRepository;
import com.insurai.repository.UserPolicyRepository;
import com.insurai.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PolicyService {

    private final PolicyRepository policyRepo;
    private final UserPolicyRepository userPolicyRepo;
    private final UserRepository userRepo;

    public PolicyService(PolicyRepository policyRepo,
            UserPolicyRepository userPolicyRepo,
            UserRepository userRepo) {
        this.policyRepo = policyRepo;
        this.userPolicyRepo = userPolicyRepo;
        this.userRepo = userRepo;
    }

    public List<Policy> getAll() {
        return policyRepo.findAll();
    }

    public Policy create(@org.springframework.lang.NonNull Policy policy) {
        return policyRepo.save(policy);
    }

    public UserPolicy buyPolicy(@org.springframework.lang.NonNull Long policyId,
            @org.springframework.lang.NonNull Long userId) {
        Policy policy = policyRepo.findById(java.util.Objects.requireNonNull(policyId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Policy not found"));
        User user = userRepo.findById(java.util.Objects.requireNonNull(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!"USER".equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only clients can buy policies.");
        }

        UserPolicy up = new UserPolicy();
        up.setPolicy(policy);
        up.setUser(user);
        // User immediately buys in this simplified flow, but we can set to PENDING
        // first if payment gateway existed
        up.setStatus("ACTIVE");

        return userPolicyRepo.save(up);
    }

    public UserPolicy quotePolicy(@org.springframework.lang.NonNull Long policyId,
            @org.springframework.lang.NonNull Long userId, String note) {
        Policy policy = policyRepo.findById(java.util.Objects.requireNonNull(policyId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Policy not found"));
        User user = userRepo.findById(java.util.Objects.requireNonNull(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!"USER".equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only clients can receive policy quotes.");
        }

        UserPolicy up = new UserPolicy();
        up.setPolicy(policy);
        up.setUser(user);
        up.setStatus("QUOTED");
        up.setRecommendationNote(note);

        return userPolicyRepo.save(up);
    }

    public UserPolicy purchasePolicy(@org.springframework.lang.NonNull Long userPolicyId) {
        UserPolicy up = userPolicyRepo.findById(java.util.Objects.requireNonNull(userPolicyId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User Policy not found"));

        // Simulate Payment Success
        // In a real system, this would happen via a webhook from Stripe/Razorpay
        // Transition: QUOTED -> PURCHASED -> ACTIVE

        up.setStatus("ACTIVE"); // Final state after payment
        up.setStartDate(java.time.LocalDate.now());
        up.setEndDate(up.getStartDate().plusYears(1));

        return userPolicyRepo.save(up);
    }

    // Renewal Prediction Logic
    public boolean needsRenewal(UserPolicy up) {
        if (up.getEndDate() == null)
            return false;
        // "Needs Renewal" if expiring within 30 days
        return up.getEndDate().minusDays(30).isBefore(java.time.LocalDate.now());
    }

    // Coverage Gap
    public boolean isUnderInsured(UserPolicy up) {
        // Simple logic: if premium is very low compared to coverage (mock logic)
        // Or if coverage < 50,000 for Health
        if ("Health".equalsIgnoreCase(up.getPolicy().getType()) && up.getPolicy().getCoverage() < 100000) {
            return true;
        }
        return false;
    }

    public List<UserPolicy> getUserPolicies(@org.springframework.lang.NonNull Long userId) {
        return userPolicyRepo.findByUserId(userId);
    }

    public List<UserPolicy> getAllUserPolicies() {
        return userPolicyRepo.findAll();
    }

    public UserPolicy uploadDocument(@org.springframework.lang.NonNull Long userPolicyId, String url) {
        UserPolicy up = userPolicyRepo.findById(java.util.Objects.requireNonNull(userPolicyId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Policy not found"));
        up.setPdfUrl(url);
        return userPolicyRepo.save(up);
    }

    // Scheduler helper to expire policies
    public void checkExpirations() {
        List<UserPolicy> active = userPolicyRepo.findByStatus("ACTIVE");
        for (UserPolicy up : active) {
            if (up.getEndDate().isBefore(java.time.LocalDate.now())) {
                up.setStatus("EXPIRED");
                userPolicyRepo.save(up);
            }
        }
    }

    // NEW: AI-Powered Policy Recommendations with Eligibility
    public List<com.insurai.dto.PolicyRecommendationDTO> getRecommendedPolicies(Long userId) {
        User user = userRepo.findById(java.util.Objects.requireNonNull(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<Policy> allPolicies = policyRepo.findAll();
        List<com.insurai.dto.PolicyRecommendationDTO> recommendations = new java.util.ArrayList<>();

        for (Policy policy : allPolicies) {
            com.insurai.dto.PolicyRecommendationDTO dto = new com.insurai.dto.PolicyRecommendationDTO(policy);

            // Calculate eligibility
            String eligibility = checkEligibility(user, policy);
            dto.setEligibilityStatus(eligibility);

            // Calculate match score (0-100)
            double matchScore = calculateMatchScore(user, policy);
            dto.setMatchScore(matchScore);

            // Set premium breakdown (can be adjusted based on user profile)
            dto.setPremiumBreakdown(policy.getPremium());

            // AI recommendation logic
            if (matchScore >= 70 && "ELIGIBLE".equals(eligibility)) {
                dto.setIsRecommended(true);
                dto.setRecommendationReason("Best match for your profile");
            } else if (matchScore >= 50) {
                dto.setIsRecommended(false);
                dto.setRecommendationReason("Good option, consult agent for details");
            } else {
                dto.setIsRecommended(false);
                dto.setRecommendationReason("Consider alternatives");
            }

            recommendations.add(dto);
        }

        // Sort by match score (highest first)
        recommendations.sort((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()));

        return recommendations;
    }

    // NEW: Filtered Policy Search
    public List<com.insurai.dto.PolicyRecommendationDTO> getFilteredPolicies(
            Long userId, com.insurai.dto.PolicyFilterRequest filter) {

        User user = userRepo.findById(java.util.Objects.requireNonNull(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<Policy> allPolicies = policyRepo.findAll();
        List<com.insurai.dto.PolicyRecommendationDTO> filtered = new java.util.ArrayList<>();

        for (Policy policy : allPolicies) {
            // Apply filters
            if (filter.getType() != null && !filter.getType().equalsIgnoreCase(policy.getType())) {
                continue;
            }
            if (filter.getCategory() != null && !filter.getCategory().equalsIgnoreCase(policy.getCategory())) {
                continue;
            }
            if (filter.getMaxPremium() != null && policy.getPremium() > filter.getMaxPremium()) {
                continue;
            }
            if (filter.getMinCoverage() != null && policy.getCoverage() < filter.getMinCoverage()) {
                continue;
            }
            if (filter.getMaxCoverage() != null && policy.getCoverage() > filter.getMaxCoverage()) {
                continue;
            }

            com.insurai.dto.PolicyRecommendationDTO dto = new com.insurai.dto.PolicyRecommendationDTO(policy);

            // Calculate eligibility
            String eligibility = checkEligibility(user, policy);
            dto.setEligibilityStatus(eligibility);

            // Calculate match score
            double matchScore = calculateMatchScore(user, policy);
            dto.setMatchScore(matchScore);
            dto.setPremiumBreakdown(policy.getPremium());

            filtered.add(dto);
        }

        // Sort by match score
        filtered.sort((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()));

        return filtered;
    }

    // Helper: Check Eligibility
    private String checkEligibility(User user, Policy policy) {
        StringBuilder reason = new StringBuilder();
        boolean eligible = true;
        boolean partiallyEligible = false;

        // Age check
        if (policy.getMinAge() != null && user.getAge() != null && user.getAge() < policy.getMinAge()) {
            eligible = false;
            reason.append("Age below minimum requirement. ");
        }
        if (policy.getMaxAge() != null && user.getAge() != null && user.getAge() > policy.getMaxAge()) {
            eligible = false;
            reason.append("Age above maximum limit. ");
        }

        // Income check
        if (policy.getMinIncome() != null && user.getIncome() != null && user.getIncome() < policy.getMinIncome()) {
            partiallyEligible = true;
            reason.append("Income below recommended level. ");
        }

        if (!eligible) {
            return "NOT_ELIGIBLE";
        } else if (partiallyEligible) {
            return "PARTIALLY_ELIGIBLE";
        } else {
            return "ELIGIBLE";
        }
    }

    // Helper: Calculate Match Score (0-100)
    private double calculateMatchScore(User user, Policy policy) {
        double score = 50.0; // Base score

        // Age match
        if (policy.getMinAge() != null && policy.getMaxAge() != null && user.getAge() != null) {
            int midAge = (policy.getMinAge() + policy.getMaxAge()) / 2;
            int ageDiff = Math.abs(user.getAge() - midAge);
            score += Math.max(0, 20 - ageDiff); // Up to +20 for perfect age match
        }

        // Income match
        if (policy.getMinIncome() != null && user.getIncome() != null) {
            if (user.getIncome() >= policy.getMinIncome() * 1.5) {
                score += 15; // Good income buffer
            } else if (user.getIncome() >= policy.getMinIncome()) {
                score += 10; // Meets minimum
            }
        }

        // Premium affordability (premium should be < 10% of monthly income)
        if (user.getIncome() != null && policy.getPremium() != null) {
            double monthlyIncome = user.getIncome() / 12;
            double affordabilityRatio = policy.getPremium() / monthlyIncome;
            if (affordabilityRatio < 0.05) {
                score += 15; // Very affordable
            } else if (affordabilityRatio < 0.10) {
                score += 10; // Affordable
            } else if (affordabilityRatio > 0.20) {
                score -= 10; // Too expensive
            }
        }

        // Claim settlement ratio
        if (policy.getClaimSettlementRatio() != null) {
            if (policy.getClaimSettlementRatio() >= 95) {
                score += 10;
            } else if (policy.getClaimSettlementRatio() >= 90) {
                score += 5;
            }
        }

        return Math.min(100, Math.max(0, score));
    }
}
