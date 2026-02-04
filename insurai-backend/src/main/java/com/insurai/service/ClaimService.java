package com.insurai.service;

import com.insurai.model.Claim;
import com.insurai.model.User;
import com.insurai.repository.ClaimRepository;
import com.insurai.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ClaimService {

    private final ClaimRepository claimRepo;
    private final UserRepository userRepo;
    private final AIService aiService;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public ClaimService(ClaimRepository claimRepo, UserRepository userRepo, AIService aiService,
            NotificationService notificationService, AuditService auditService) {
        this.claimRepo = claimRepo;
        this.userRepo = userRepo;
        this.aiService = aiService;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    public Claim fileClaim(@org.springframework.lang.NonNull Long userId, Claim claim) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        claim.setUser(user);

        // AI Fraud Check
        double risk = aiService.calculateFraudRisk(claim);
        claim.setFraudScore(risk);

        // Probability & Next Action based on description length/amount (Mock
        // Intelligence)
        if (risk > 0.8) {
            claim.setStatus("FLAGGED_FRAUD");
            claim.setNextAction("Contact Support Immediately");
            claim.setSuccessProbability(10);
        } else {
            // Respect frontend status (e.g., PENDING) if set, otherwise default
            if (claim.getStatus() == null || claim.getStatus().trim().isEmpty()) {
                claim.setStatus("INITIATED");
            }
            claim.setNextAction("Upload required documents (Medical Report, Bills)");
            // Simple probability logic
            int prob = 90 - (int) (risk * 100);
            if (claim.getAmount() > 50000)
                prob -= 20; // High value = harder to approve
            claim.setSuccessProbability(Math.max(10, prob));
        }

        Claim saved = claimRepo.save(claim);

        auditService.log("CLAIM_FILED: ID " + saved.getId(), userId);

        return saved;
    }

    public Claim uploadDoc(@org.springframework.lang.NonNull Long id, String url) {
        Claim claim = claimRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Claim not found"));

        claim.getDocumentUrls().add(url);
        claim.setStatus("DOCS_UPLOADED");
        claim.setDocsUploadedAt(java.time.LocalDateTime.now());
        claim.setNextAction("Wait for admin review");
        claim.setSuccessProbability(claim.getSuccessProbability() + 5); // Docs increase chance

        return claimRepo.save(claim);
    }

    public List<Claim> getUserClaims(@org.springframework.lang.NonNull Long userId) {
        return claimRepo.findByUserId(userId);
    }

    public List<Claim> getAllClaims() {
        return claimRepo.findAll();
    }

    public Claim updateStatus(@org.springframework.lang.NonNull Long id, String status) {
        Claim claim = claimRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Claim not found"));
        claim.setStatus(status);

        // Audit & Notify
        auditService.log("CLAIM_STATUS_UPDATE: ID " + claim.getId() + " to " + status, claim.getUser().getId());

        // Notify User
        notificationService.createNotification(
                claim.getUser(),
                "Claim #" + claim.getId() + " updated to " + status,
                status.equals("APPROVED") ? "SUCCESS" : "INFO");

        return claimRepo.save(claim);
    }
}
