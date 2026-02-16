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

    private final com.insurai.repository.UserRepository userRepo;
    private final PolicyService policyService;

    public PolicyController(PolicyService policyService, com.insurai.repository.UserRepository userRepo) {
        this.policyService = policyService;
        this.userRepo = userRepo;
    }

    private com.insurai.model.User getCurrentUser() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        // Assuming principal is email (from JwtTokenProvider)
        // or we can cast principal if it's UserDetails
        String email = (String) auth.getPrincipal(); // Check JwtTokenProvider implementation
        // Actually JwtTokenProvider often sets email as principal
        return userRepo.findByEmail(email).orElse(null);
    }

    @GetMapping
    public List<Policy> getAll() {
        com.insurai.model.User user = getCurrentUser();
        String role = (user != null) ? user.getRole() : "USER";
        long userId = (user != null && user.getId() != null) ? user.getId() : 0L;
        return policyService.getAll(role, userId);
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('COMPANY', 'SUPER_ADMIN')")
    public Policy create(@RequestBody Policy policy) {
        return policyService.create(java.util.Objects.requireNonNull(policy), getCurrentUser());
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('COMPANY', 'SUPER_ADMIN', 'ADMIN')")
    public Policy update(@PathVariable long id, @RequestBody Policy policy) {
        return policyService.update(id, java.util.Objects.requireNonNull(policy),
                getCurrentUser());
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('COMPANY', 'SUPER_ADMIN', 'ADMIN')")
    public void delete(@PathVariable long id) {
        policyService.delete(id, getCurrentUser());
    }

    @PostMapping("/{policyId}/buy/{userId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('USER')")
    public UserPolicy buyPolicy(@PathVariable long policyId, @PathVariable long userId) {
        return policyService.buyPolicy(policyId, userId);
    }

    @PostMapping("/{policyId}/quote/{userId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('USER')")
    public UserPolicy quotePolicy(@PathVariable long policyId, @PathVariable long userId,
            @RequestBody(required = false) com.insurai.dto.QuoteRequest request) {
        String note = (request != null) ? request.getNote() : null;
        return policyService.quotePolicy(policyId, userId, note);
    }

    @PostMapping("/{userPolicyId}/purchase")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('USER')")
    public UserPolicy purchasePolicy(@PathVariable long userPolicyId) {
        return policyService.purchasePolicy(userPolicyId);
    }

    @GetMapping("/user/{userId}")
    public List<UserPolicy> getUserPolicies(@PathVariable long userId) {
        return policyService.getUserPolicies(userId);
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
            return policyService.uploadDocument(userPolicyId, fileUrl);

        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    // NEW: Get AI-Powered Recommendations
    @GetMapping("/recommendations/{userId}")
    public List<com.insurai.dto.PolicyRecommendationDTO> getRecommendations(@PathVariable long userId) {
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
            @PathVariable long userId,
            @RequestBody com.insurai.dto.PolicyFilterRequest filter) {
        return policyService.getFilteredPolicies(userId, filter);
    }
}
