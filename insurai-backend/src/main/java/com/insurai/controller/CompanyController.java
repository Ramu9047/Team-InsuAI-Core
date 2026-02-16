package com.insurai.controller;

import com.insurai.model.Company;
import com.insurai.model.Policy;
import com.insurai.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/company")
@CrossOrigin(origins = "http://localhost:3000")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    /**
     * Register a new company
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerCompany(@RequestBody Company company) {
        try {
            Company registered = companyService.registerCompany(company);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Company registered successfully. Awaiting approval.",
                    "company", registered));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get company profile
     */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<Company> getProfile(Authentication auth) {
        String email = auth.getName();
        Company company = companyService.getCompanyByEmail(email);
        return ResponseEntity.ok(company);
    }

    /**
     * Update company profile
     */
    @PutMapping("/profile")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<Company> updateProfile(@RequestBody Company updatedCompany, Authentication auth) {
        String email = auth.getName();
        Company company = companyService.getCompanyByEmail(email);
        Company updated = companyService.updateCompany(company.getId(), updatedCompany);
        return ResponseEntity.ok(updated);
    }

    /**
     * Get all policies for the authenticated company
     */
    @GetMapping("/policies")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<List<Policy>> getCompanyPolicies(Authentication auth) {
        String email = auth.getName();
        Company company = companyService.getCompanyByEmail(email);
        List<Policy> policies = companyService.getCompanyPolicies(company.getId());
        return ResponseEntity.ok(policies);
    }

    /**
     * Add a new policy
     */
    @PostMapping("/policies")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> addPolicy(@RequestBody Policy policy, Authentication auth) {
        try {
            String email = auth.getName();
            Company company = companyService.getCompanyByEmail(email);
            Policy created = companyService.addPolicy(company.getId(), policy);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update a policy
     */
    @PutMapping("/policies/{policyId}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> updatePolicy(
            @PathVariable Long policyId,
            @RequestBody Policy updatedPolicy,
            Authentication auth) {
        try {
            String email = auth.getName();
            Company company = companyService.getCompanyByEmail(email);
            Policy updated = companyService.updatePolicy(company.getId(), policyId, updatedPolicy);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete a policy
     */
    @DeleteMapping("/policies/{policyId}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> deletePolicy(@PathVariable Long policyId, Authentication auth) {
        try {
            String email = auth.getName();
            Company company = companyService.getCompanyByEmail(email);
            companyService.deletePolicy(company.getId(), policyId);
            return ResponseEntity.ok(Map.of("message", "Policy deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all active companies (public endpoint for users to see available
     * companies)
     */
    @Autowired
    private com.insurai.repository.UserPolicyRepository userPolicyRepository;

    @Autowired
    private com.insurai.repository.BookingRepository bookingRepository;

    /**
     * Get active companies (public endpoint)
     */
    @GetMapping("/active")
    public ResponseEntity<List<Company>> getActiveCompanies() {
        List<Company> companies = companyService.getActiveCompanies();
        return ResponseEntity.ok(companies);
    }

    /**
     * Get Company Dashboard KPIs
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<Map<String, Object>> getDashboardStats(Authentication auth) {
        String email = auth.getName();
        Company company = companyService.getCompanyByEmail(email);
        Long companyId = company.getId();

        List<Policy> allPolicies = companyService.getCompanyPolicies(companyId);
        long totalPolicies = allPolicies.size();
        long activePolicies = allPolicies.stream().filter(p -> "ACTIVE".equals(p.getStatus())).count();

        List<com.insurai.model.UserPolicy> soldPolicies = userPolicyRepository.findByPolicyCompanyId(companyId);
        long policiesSold = soldPolicies.size();
        double revenue = soldPolicies.stream()
                .mapToDouble(up -> up.getPremium() != null ? up.getPremium() : 0.0)
                .sum();

        // Calculate Conversion Rate: Policies Sold / Total Bookings * 100
        List<com.insurai.model.Booking> bookings = bookingRepository.findByPolicyCompanyId(companyId);
        long totalBookings = bookings.size();
        double conversionRate = totalBookings > 0 ? (double) policiesSold / totalBookings * 100 : 0;

        // Sales Data (Last 6 Months)
        Map<java.time.Month, Double> monthlySales = new java.util.TreeMap<>();
        java.time.LocalDateTime sixMonthsAgo = java.time.LocalDateTime.now().minusMonths(6);

        soldPolicies.stream()
                .filter(up -> up.getCreatedAt() != null && up.getCreatedAt().isAfter(sixMonthsAgo))
                .forEach(up -> {
                    java.time.Month month = up.getCreatedAt().getMonth();
                    monthlySales.put(month,
                            monthlySales.getOrDefault(month, 0.0) + (up.getPremium() != null ? up.getPremium() : 0));
                });

        List<Map<String, Object>> salesData = monthlySales.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new java.util.HashMap<>();
                    m.put("name",
                            e.getKey().getDisplayName(java.time.format.TextStyle.SHORT, java.util.Locale.ENGLISH));
                    m.put("profit", e.getValue());
                    return m;
                })
                .collect(java.util.stream.Collectors.toList());

        // AI Insights
        List<Map<String, String>> aiInsights = new java.util.ArrayList<>();

        // Insight 1: Conversion Rate
        if (conversionRate < 10) {
            aiInsights.add(Map.of("type", "warning", "title", "Low Conversion", "text",
                    "Conversion rate is below 10%. Consider revising policy premiums."));
        } else if (conversionRate > 30) {
            aiInsights.add(Map.of("type", "success", "title", "Strong Conversion", "text",
                    "Excellent conversion rate exceeding 30%."));
        }

        // Insight 2: Top Selling Policy
        if (!soldPolicies.isEmpty()) {
            Map<String, Long> policyCounts = soldPolicies.stream()
                    .filter(up -> up.getPolicy() != null)
                    .collect(java.util.stream.Collectors.groupingBy(up -> up.getPolicy().getName(),
                            java.util.stream.Collectors.counting()));

            policyCounts.entrySet().stream().max(Map.Entry.comparingByValue()).ifPresent(best -> {
                aiInsights.add(Map.of("type", "suggestion", "title", "Top Performer", "text",
                        best.getKey() + " is your best seller with " + best.getValue() + " units sold."));
            });
        } else {
            aiInsights.add(Map.of("type", "suggestion", "title", "No Sales Yet", "text",
                    "Promote your policies to attract customers."));
        }

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("metrics", Map.of(
                "totalPolicies", totalPolicies,
                "activePolicies", activePolicies,
                "policiesSold", policiesSold,
                "revenue", revenue,
                "conversionRate", String.format("%.1f", conversionRate)));
        response.put("recentPolicies", allPolicies.stream().limit(5).collect(java.util.stream.Collectors.toList()));
        response.put("salesData", salesData);
        response.put("aiInsights", aiInsights);

        return ResponseEntity.ok(response);
    }

    /**
     * Get Agent Performance for this Company
     */
    @GetMapping("/agents")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> getCompanyAgents(Authentication auth) {
        String email = auth.getName();
        Company company = companyService.getCompanyByEmail(email);

        List<com.insurai.model.Booking> bookings = bookingRepository.findByPolicyCompanyId(company.getId());

        // Group by Agent
        Map<com.insurai.model.User, List<com.insurai.model.Booking>> agentBookings = bookings.stream()
                .filter(b -> b.getAgent() != null)
                .collect(java.util.stream.Collectors.groupingBy(com.insurai.model.Booking::getAgent));

        List<Map<String, Object>> agentPerformance = agentBookings.entrySet().stream().map(entry -> {
            com.insurai.model.User agent = entry.getKey();
            List<com.insurai.model.Booking> bList = entry.getValue();

            long approvals = bList.stream()
                    .filter(b -> "APPROVED".equals(b.getStatus()) || "COMPLETED".equals(b.getStatus())).count();
            long rejections = bList.stream().filter(b -> "REJECTED".equals(b.getStatus())).count();

            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", agent.getId());
            map.put("name", agent.getName());
            map.put("rating", agent.getRating());
            map.put("approvals", approvals);
            map.put("rejections", rejections);
            map.put("status", Boolean.TRUE.equals(agent.getAvailable()) ? "Online" : "Offline");
            map.put("avgTime", "15 mins");
            return map;
        }).collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(agentPerformance);
    }
}
