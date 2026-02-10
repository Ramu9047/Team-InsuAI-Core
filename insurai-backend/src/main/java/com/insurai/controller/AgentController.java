package com.insurai.controller;

import com.insurai.model.Booking;
import com.insurai.model.Policy;
import com.insurai.model.User;
import com.insurai.model.UserPolicy;
import com.insurai.repository.BookingRepository;
import com.insurai.repository.PolicyRepository;
import com.insurai.repository.UserPolicyRepository;
import com.insurai.repository.UserRepository;
import com.insurai.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agents")
@CrossOrigin(origins = "http://localhost:3000")
public class AgentController {

    private final UserRepository userRepo;
    private final BookingRepository bookingRepo;
    private final UserPolicyRepository userPolicyRepo;
    private final PolicyRepository policyRepo;
    private final NotificationService notificationService;
    private final com.insurai.service.AgentConsultationService agentConsultationService;

    public AgentController(UserRepository userRepo, BookingRepository bookingRepo, UserPolicyRepository userPolicyRepo,
            PolicyRepository policyRepo, NotificationService notificationService,
            com.insurai.service.AgentConsultationService agentConsultationService) {
        this.userRepo = userRepo;
        this.bookingRepo = bookingRepo;
        this.userPolicyRepo = userPolicyRepo;
        this.policyRepo = policyRepo;
        this.notificationService = notificationService;
        this.agentConsultationService = agentConsultationService;
    }

    // Public/User: Find agents
    @GetMapping
    public List<User> getAllAgents() {
        var agents = userRepo.findByRole("AGENT");
        for (User a : agents) {
            if (a.getSpecialization() == null) {
                a.setSpecialization(a.getId() % 2 == 0 ? "Life & Health" : "Motor & Corporate");
                a.setRating(4.5 + (a.getId() % 5) / 10.0);
                a.setBio("Certified " + a.getSpecialization() + " expert.");
                userRepo.save(a);
            }
        }
        return agents;
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<?> toggleAvailability(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        User agent = userRepo.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found"));
        Boolean available = body.get("available");
        agent.setAvailable(Boolean.TRUE.equals(available));
        userRepo.save(agent);
        return ResponseEntity.ok(Map.of("message", "Updated", "available", Boolean.TRUE.equals(available)));
    }

    // --- New Agent Features ---

    @PatchMapping("/{id}/activation")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleActivation(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        User agent = userRepo.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found"));

        Boolean active = body.get("active");
        agent.setIsActive(Boolean.TRUE.equals(active));

        // Sync availability with activation
        if (Boolean.TRUE.equals(active)) {
            agent.setAvailable(true); // Activating -> Online
        } else {
            agent.setAvailable(false); // Deactivating -> Offline
        }

        userRepo.save(agent);
        return ResponseEntity.ok(
                Map.of("message", "Updated", "active", Boolean.TRUE.equals(active), "available", agent.getAvailable()));
    }

    @GetMapping("/appointments")
    @PreAuthorize("hasRole('AGENT')")
    public List<Booking> getMyAppointments(Authentication auth) {
        User agent = userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (Boolean.FALSE.equals(agent.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is deactivated. Contact Admin.");
        }

        if (Boolean.FALSE.equals(agent.getAvailable())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are currently offline. Go Online to view tasks.");
        }

        return bookingRepo.findByAgentId(java.util.Objects.requireNonNull(agent.getId()));
    }

    @PutMapping("/appointments/{id}/status")
    @PreAuthorize("hasRole('AGENT')")
    public Booking updateAppointmentStatus(@PathVariable Long id, @RequestBody Map<String, String> body,
            Authentication auth) {
        User agent = userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (Boolean.FALSE.equals(agent.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is deactivated. Contact Admin.");
        }

        if (Boolean.FALSE.equals(agent.getAvailable())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are currently offline. Go Online to perform actions.");
        }

        Booking booking = bookingRepo.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        String newStatus = body.get("status");
        if (newStatus == null)
            return booking;

        if (!"PENDING".equals(booking.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking is already processed");
        }

        if ("APPROVED".equals(newStatus)) {
            // Task Group 1: Approve triggers Policy Purchase Creation
            if (booking.getPolicy() != null) {
                UserPolicy up = new UserPolicy();
                up.setUser(booking.getUser());
                up.setPolicy(booking.getPolicy());
                up.setStatus("PAYMENT_PENDING"); // Require payment
                up.setStartDate(java.time.LocalDate.now());
                up.setEndDate(java.time.LocalDate.now().plusYears(1));
                userPolicyRepo.save(up);

                // Notify User
                notificationService.createNotification(
                        booking.getUser(),
                        "Policy Purchase Approved for " + booking.getPolicy().getName() + ". Please complete payment.",
                        "SUCCESS");

                // Auto-complete the booking since the policy request is handled
                booking.setStatus("COMPLETED");
                return bookingRepo.save(booking);
            }
        }

        booking.setStatus(newStatus);

        // Notify User of general status change
        notificationService.createNotification(
                booking.getUser(),
                "Appointment status updated to: " + newStatus,
                "APPROVED".equals(newStatus) ? "SUCCESS" : "INFO");

        return bookingRepo.save(booking);
    }

    @PostMapping("/recommendations")
    @PreAuthorize("hasRole('AGENT')")
    public UserPolicy recommendPolicy(@RequestBody Map<String, Object> payload, Authentication auth) {
        User agent = userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (Boolean.FALSE.equals(agent.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is deactivated.");
        }

        if (Boolean.FALSE.equals(agent.getAvailable())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are currently offline. Go Online to make recommendations.");
        }

        Object uIdObj = payload.get("userId");
        Object pIdObj = payload.get("policyId");

        if (uIdObj == null || pIdObj == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing userId or policyId");
        }

        Long userId = Long.valueOf(uIdObj.toString());
        Long policyId = Long.valueOf(pIdObj.toString());
        String note = (String) payload.get("note");

        User user = userRepo.findById(java.util.Objects.requireNonNull(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Policy policy = policyRepo.findById(java.util.Objects.requireNonNull(policyId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Policy not found"));

        UserPolicy up = new UserPolicy();
        up.setUser(user);
        up.setPolicy(policy);
        up.setStatus("QUOTED");
        up.setRecommendationNote(note);

        UserPolicy saved = userPolicyRepo.save(up);

        // Notify User
        notificationService.createNotification(
                user,
                "New Policy Recommendation from " + agent.getName() + ": " + policy.getName(),
                "INFO");

        return saved;
    }

    // NEW: Get Agent's Consultations with AI-Assisted Risk Indicators
    @GetMapping("/consultations")
    @PreAuthorize("hasRole('AGENT')")
    public List<com.insurai.dto.ConsultationDTO> getMyConsultations(Authentication auth) {
        String email = auth.getName();
        User agent = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found"));

        return agentConsultationService.getAgentConsultations(agent.getId());
    }

    // NEW: Process Consultation Decision (Approve/Reject/Recommend Alternative)
    @PostMapping("/consultations/decision")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<String> processConsultationDecision(
            Authentication auth,
            @RequestBody com.insurai.dto.PolicyRecommendationRequest request) {

        String email = auth.getName();
        User agent = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found"));

        agentConsultationService.processConsultationDecision(agent.getId(), request);

        return ResponseEntity.ok("Consultation decision processed successfully");
    }

    // NEW: Get Agent Performance Metrics
    @GetMapping("/performance")
    @PreAuthorize("hasRole('AGENT')")
    public com.insurai.dto.AgentPerformanceDTO getMyPerformance(Authentication auth) {
        String email = auth.getName();
        User agent = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found"));

        return agentConsultationService.getAgentPerformance(agent.getId());
    }

    // NEW: Admin - Get Any Agent's Performance
    @GetMapping("/{agentId}/performance")
    @PreAuthorize("hasRole('ADMIN')")
    public com.insurai.dto.AgentPerformanceDTO getAgentPerformance(@PathVariable Long agentId) {
        return agentConsultationService.getAgentPerformance(agentId);
    }
}
