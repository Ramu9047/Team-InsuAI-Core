package com.insurai.controller;

import com.insurai.dto.DashboardStats;
import com.insurai.repository.UserRepository;
import com.insurai.repository.BookingRepository;
import com.insurai.repository.UserPolicyRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {

    private final UserRepository userRepo;
    private final BookingRepository bookingRepo;
    private final UserPolicyRepository userPolicyRepo;

    public DashboardController(UserRepository userRepo, BookingRepository bookingRepo,
            UserPolicyRepository userPolicyRepo) {
        this.userRepo = userRepo;
        this.bookingRepo = bookingRepo;
        this.userPolicyRepo = userPolicyRepo;
    }

    @GetMapping("/stats")
    public DashboardStats stats(@RequestParam(required = false) Long userId) {

        DashboardStats s = new DashboardStats();

        s.activeAgents = userRepo.countByRole("AGENT");

        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();

        s.appointmentsToday = bookingRepo.countAppointmentsBetween(start, end);
        s.pendingRequests = bookingRepo.countByStatus("PENDING");

        if (userId != null) {
            // Calculate User Health & Insights (Mock Logic until we inject PolicyService)
            // In real app, we would query UserPolicyRepo
            s.totalPolicies = userPolicyRepo.countByUserIdAndStatus(userId, "ACTIVE");
            s.healthScore = 65;
            s.coverageGaps.add("No Life Insurance Found");
            s.coverageGaps.add("Health Cover < 3L");

            s.savingsTips.add("Bundle Home & Auto to save 15%");
            s.savingsTips.add("Renew Health before Aug 10 to lock premium");
        } else {
            // Admin view
            s.healthScore = 0;
        }

        return s;
    }

    @GetMapping("/debug")
    public long debug() {
        return bookingRepo.countByStatus("PENDING");
    }

}
