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

    @GetMapping("/booking-analytics")
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
        userRepo.deleteById(java.util.Objects.requireNonNull(id));
    }

    // --- New Admin Features ---

    @PostMapping("/policies")
    public com.insurai.model.Policy createPolicy(@RequestBody com.insurai.model.Policy policy) {
        return policyRepo.save(java.util.Objects.requireNonNull(policy));
    }

    @PutMapping("/agents/{id}/status")
    public com.insurai.model.User updateAgentStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        com.insurai.model.User agent = userRepo.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Agent not found"));
        // Assuming 'verified' or 'available' controls status, or we add a status field.
        // Prompt says "Activate / deactivate agents". 'verified' seems appropriate or
        // 'available'.
        // User model has 'verified' and 'available'.
        if (body.containsKey("verified")) {
            agent.setVerified(body.get("verified"));
        }
        return userRepo.save(java.util.Objects.requireNonNull(agent));
    }

    @GetMapping("/audit-logs")
    public java.util.List<com.insurai.model.AuditLog> getAuditLogs() {
        return auditRepo.findAll();
    }

    @GetMapping("/dashboard-stats")
    public com.insurai.dto.AdminDashboardDTO getDashboardStats() {
        com.insurai.dto.AdminDashboardDTO dashboard = new com.insurai.dto.AdminDashboardDTO();

        // 1. Claim Risk Distribution
        Map<String, Integer> riskDist = new HashMap<>();
        riskDist.put("Low", 0);
        riskDist.put("Medium", 0);
        riskDist.put("High", 0);

        java.util.List<com.insurai.model.Claim> claims = claimService.getAllClaims();
        for (com.insurai.model.Claim c : claims) {
            Double score = c.getFraudScore();
            if (score == null)
                score = 0.0;

            if (score <= 0.3)
                riskDist.put("Low", riskDist.get("Low") + 1);
            else if (score <= 0.7)
                riskDist.put("Medium", riskDist.get("Medium") + 1);
            else
                riskDist.put("High", riskDist.get("High") + 1);
        }
        dashboard.setClaimRiskDistribution(riskDist);

        // 2. Agent Leaderboard
        java.util.List<com.insurai.model.Booking> bookings = bookingService.getAllBookings(); // Now available
        Map<com.insurai.model.User, java.util.List<com.insurai.model.Booking>> agentBookings = bookings.stream()
                .filter(b -> b.getAgent() != null)
                .collect(java.util.stream.Collectors.groupingBy(com.insurai.model.Booking::getAgent));

        java.util.List<com.insurai.dto.AgentPerformanceDTO> leaderboard = new java.util.ArrayList<>();

        for (Map.Entry<com.insurai.model.User, java.util.List<com.insurai.model.Booking>> entry : agentBookings
                .entrySet()) {
            com.insurai.model.User agent = entry.getKey();
            java.util.List<com.insurai.model.Booking> abs = entry.getValue();

            int total = abs.size();
            long approved = abs.stream()
                    .filter(b -> "APPROVED".equals(b.getStatus()) || "COMPLETED".equals(b.getStatus())).count();

            // Calc Avg Response Time (minutes)
            double totalMins = 0;
            int countTime = 0;
            for (com.insurai.model.Booking b : abs) {
                if (b.getCreatedAt() != null) {
                    java.time.LocalDateTime end = b.getRespondedAt();
                    if (end == null)
                        end = b.getReviewedAt();
                    if (end == null)
                        end = b.getCompletedAt();

                    if (end != null) {
                        long mins = java.time.Duration.between(b.getCreatedAt(), end).toMinutes();
                        if (mins >= 0) {
                            totalMins += mins;
                            countTime++;
                        }
                    }
                }
            }
            double avgTime = countTime > 0 ? totalMins / countTime : 0;

            com.insurai.dto.AgentPerformanceDTO dto = new com.insurai.dto.AgentPerformanceDTO();
            dto.setAgentId(agent.getId());
            dto.setAgentName(agent.getName());
            dto.setTotalConsultations(total);
            dto.setApprovalRate(total > 0 ? ((double) approved / total) * 100 : 0);
            dto.setAverageResponseTime(avgTime);

            leaderboard.add(dto);
        }

        // Ensure at least empty list
        if (leaderboard.isEmpty())
            dashboard.setAgentLeaderboard(new java.util.ArrayList<>());
        else {
            leaderboard.sort((a, b) -> Double.compare(ifNull(b.getApprovalRate()), ifNull(a.getApprovalRate())));
            dashboard.setAgentLeaderboard(leaderboard);
        }

        // 3. SLA Metrics
        com.insurai.dto.AdminDashboardDTO.SLAMetricsDTO sla = new com.insurai.dto.AdminDashboardDTO.SLAMetricsDTO();
        java.util.List<com.insurai.dto.AdminDashboardDTO.SLATaskDTO> urgent = new java.util.ArrayList<>();
        int onTrack = 0, atRisk = 0, breached = 0;

        java.time.LocalDateTime now = java.time.LocalDateTime.now();

        for (com.insurai.model.Booking b : bookings) {
            if ("PENDING".equals(b.getStatus()) || "CONFIRMED".equals(b.getStatus())) {
                java.time.LocalDateTime deadline = b.getCreatedAt().plusHours(24);
                long hoursLeft = java.time.Duration.between(now, deadline).toHours();

                if (hoursLeft < 0) {
                    breached++;
                    urgent.add(new com.insurai.dto.AdminDashboardDTO.SLATaskDTO(
                            "B-" + b.getId(), "Consultation", deadline.toString(), "HIGH",
                            b.getAgent() != null ? b.getAgent().getName() : "Unassigned"));
                } else if (hoursLeft < 4) {
                    atRisk++;
                    urgent.add(new com.insurai.dto.AdminDashboardDTO.SLATaskDTO(
                            "B-" + b.getId(), "Consultation", deadline.toString(), "MEDIUM",
                            b.getAgent() != null ? b.getAgent().getName() : "Unassigned"));
                } else {
                    onTrack++;
                }
            }
        }

        sla.setOnTrack(onTrack);
        sla.setAtRisk(atRisk);
        sla.setBreached(breached);

        urgent.sort((a, b) -> a.getDeadline().compareTo(b.getDeadline()));
        if (urgent.size() > 5)
            urgent = urgent.subList(0, 5);
        sla.setUrgentTasks(urgent);

        dashboard.setSlaMetrics(sla);

        return dashboard;
    }

    private double ifNull(Double d) {
        return d == null ? 0.0 : d;
    }
}
