package com.insurai.controller;

import com.insurai.model.Policy;
import com.insurai.model.UserPolicy;
import com.insurai.service.PolicyService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policies")
@CrossOrigin(origins = "http://localhost:3000")
public class PolicyController {

    private final PolicyService policyService;

    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }

    @GetMapping
    public List<Policy> getAll() {
        return policyService.getAll();
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public Policy create(@RequestBody Policy policy) {
        return policyService.create(java.util.Objects.requireNonNull(policy));
    }

    @PostMapping("/{policyId}/buy/{userId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('USER')")
    public UserPolicy buyPolicy(@PathVariable Long policyId, @PathVariable Long userId) {
        return policyService.buyPolicy(java.util.Objects.requireNonNull(policyId),
                java.util.Objects.requireNonNull(userId));
    }

    @PostMapping("/{policyId}/quote/{userId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('USER')")
    public UserPolicy quotePolicy(@PathVariable Long policyId, @PathVariable Long userId,
            @RequestBody(required = false) com.insurai.dto.QuoteRequest request) {
        String note = (request != null) ? request.getNote() : null;
        return policyService.quotePolicy(java.util.Objects.requireNonNull(policyId),
                java.util.Objects.requireNonNull(userId), note);
    }

    @PostMapping("/{userPolicyId}/purchase")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('USER')")
    public UserPolicy purchasePolicy(@PathVariable Long userPolicyId) {
        return policyService.purchasePolicy(java.util.Objects.requireNonNull(userPolicyId));
    }

    @GetMapping("/user/{userId}")
    public List<UserPolicy> getUserPolicies(@PathVariable Long userId) {
        return policyService.getUserPolicies(java.util.Objects.requireNonNull(userId));
    }

    @PostMapping("/upload/{userPolicyId}")
    public UserPolicy uploadDocument(@PathVariable Long userPolicyId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            // Save file locally
            if (file.isEmpty())
                throw new RuntimeException("Empty file");

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            java.nio.file.Path path = java.nio.file.Paths.get("uploads/" + fileName);
            java.nio.file.Files.copy(file.getInputStream(), path, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            // Return URL (simulated local URL)
            String fileUrl = "http://localhost:8080/uploads/" + fileName;
            return policyService.uploadDocument(java.util.Objects.requireNonNull(userPolicyId), fileUrl);

        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    // NEW: Get AI-Powered Recommendations
    @GetMapping("/recommendations/{userId}")
    public List<com.insurai.dto.PolicyRecommendationDTO> getRecommendations(@PathVariable Long userId) {
        return policyService.getRecommendedPolicies(userId);
    }

    @GetMapping("/issued")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public List<UserPolicy> getAllUserPolicies() {
        return policyService.getAllUserPolicies();
    }

    // NEW: Get Filtered Policies
    @PostMapping("/filter/{userId}")
    public List<com.insurai.dto.PolicyRecommendationDTO> filterPolicies(
            @PathVariable Long userId,
            @RequestBody com.insurai.dto.PolicyFilterRequest filter) {
        return policyService.getFilteredPolicies(userId, filter);
    }
}
