package com.insurai.controller;

import com.insurai.model.Feedback;
import com.insurai.model.User;
import com.insurai.repository.UserRepository;
import com.insurai.service.FeedbackService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "http://localhost:3000")
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final UserRepository userRepo;

    public FeedbackController(FeedbackService feedbackService, UserRepository userRepo) {
        this.feedbackService = feedbackService;
        this.userRepo = userRepo;
    }

    // Submit Feedback
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('COMPANY')")
    public ResponseEntity<Feedback> submitFeedback(@RequestBody Map<String, String> body, Authentication auth) {
        String email = auth.getName();
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String category = body.get("category");
        String subject = body.get("subject");
        String description = body.get("description");

        Feedback feedback = feedbackService.submitFeedback(user.getId(), category, subject, description);
        return ResponseEntity.ok(feedback);
    }

    // Get My Feedback
    @GetMapping("/my")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('COMPANY')")
    public List<Feedback> getMyFeedback(Authentication auth) {
        String email = auth.getName();
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return feedbackService.getUserFeedback(user.getId());
    }

    // Admin: Get All Feedback
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Feedback> getAllFeedback() {
        return feedbackService.getAllFeedback();
    }

    // Admin: Update Status
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Feedback updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        String adminResponse = body.get("adminResponse");
        return feedbackService.updateStatus(id, status, adminResponse);
    }

    // Admin: Assign Feedback
    @PatchMapping("/{id}/assign/{assigneeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public Feedback assignFeedback(@PathVariable Long id, @PathVariable Long assigneeId) {
        return feedbackService.assignFeedback(id, assigneeId);
    }
}
