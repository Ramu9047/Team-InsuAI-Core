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
        Policy policy = policyRepo.findById(policyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Policy not found"));
        User user = userRepo.findById(userId)
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
        Policy policy = policyRepo.findById(policyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Policy not found"));
        User user = userRepo.findById(userId)
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
        UserPolicy up = userPolicyRepo.findById(userPolicyId)
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

    public UserPolicy uploadDocument(@org.springframework.lang.NonNull Long userPolicyId, String url) {
        UserPolicy up = userPolicyRepo.findById(userPolicyId)
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
}
