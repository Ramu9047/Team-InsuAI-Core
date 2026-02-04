package com.insurai.controller;

import com.insurai.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
@org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepo;
    private final com.insurai.service.BookingService bookingService;
    private final com.insurai.service.ClaimService claimService;
    private final com.insurai.repository.PolicyRepository policyRepo;
    private final com.insurai.repository.AuditLogRepository auditRepo;

    public AdminController(UserRepository userRepo,
            com.insurai.service.BookingService bookingService,
            com.insurai.service.ClaimService claimService,
            com.insurai.repository.PolicyRepository policyRepo,
            com.insurai.repository.AuditLogRepository auditRepo) {
        this.userRepo = userRepo;
        this.bookingService = bookingService;
        this.claimService = claimService;
        this.policyRepo = policyRepo;
        this.auditRepo = auditRepo;
    }

    @GetMapping("/stats")
    public Map<String, Long> stats() {
        Map<String, Long> m = new HashMap<>();
        m.put("users", userRepo.count());
        m.put("agents", (long) userRepo.findByRole("AGENT").size());
        m.put("bookings", (long) bookingService.getAnalytics().getStatusDistribution().values().stream()
                .mapToLong(Long::longValue).sum());
        return m;
    }

    @GetMapping("/analytics")
    public com.insurai.dto.AnalyticsDTO getAnalytics() {
        // 1. Base Booking Analytics
        var stats = bookingService.getAnalytics();

        // 2. Conversion Rate (Completed vs Total)
        long total = stats.getStatusDistribution().values().stream().mapToLong(l -> l).sum();
        long success = stats.getStatusDistribution().getOrDefault("COMPLETED", 0L)
                + stats.getStatusDistribution().getOrDefault("APPROVED", 0L);
        stats.setBookingConversionRate(total == 0 ? 0.0 : ((double) success / total) * 100.0);

        // 3. Claim Resolution Time (Mock logic or real calc)
        var claims = claimService.getAllClaims();
        double totalDays = 0;
        int resolvedCount = 0;
        for (var c : claims) {
            if ("APPROVED".equals(c.getStatus()) || "REJECTED".equals(c.getStatus())) {
                totalDays += 2.5; // Mock
                resolvedCount++;
            }
        }
        stats.setAvgClaimResolutionDays(resolvedCount == 0 ? 0.0 : totalDays / resolvedCount);

        return stats;
    }

    @GetMapping("/users")
    public java.util.List<com.insurai.model.User> getAllUsers() {
        return userRepo.findAll();
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userRepo.deleteById(id);
    }

    // --- New Admin Features ---

    @PostMapping("/policies")
    public com.insurai.model.Policy createPolicy(@RequestBody com.insurai.model.Policy policy) {
        return policyRepo.save(policy);
    }

    @PutMapping("/agents/{id}/status")
    public com.insurai.model.User updateAgentStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        com.insurai.model.User agent = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Agent not found"));
        // Assuming 'verified' or 'available' controls status, or we add a status field.
        // Prompt says "Activate / deactivate agents". 'verified' seems appropriate or
        // 'available'.
        // User model has 'verified' and 'available'.
        if (body.containsKey("verified")) {
            agent.setVerified(body.get("verified"));
        }
        return userRepo.save(agent);
    }

    @GetMapping("/audit-logs")
    public java.util.List<com.insurai.model.AuditLog> getAuditLogs() {
        return auditRepo.findAll();
    }
}
