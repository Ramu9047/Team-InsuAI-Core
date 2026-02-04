package com.insurai.controller;

import com.insurai.model.Claim;
import com.insurai.service.ClaimService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
@CrossOrigin(origins = "http://localhost:3000")
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    // User: File a claim
    @PostMapping("/{userId}")
    public Claim fileClaim(@PathVariable Long userId, @RequestBody Claim claim) {
        return claimService.fileClaim(java.util.Objects.requireNonNull(userId), claim);
    }

    // User: Get my claims
    @GetMapping("/user/{userId}")
    public List<Claim> getUserClaims(@PathVariable Long userId) {
        return claimService.getUserClaims(java.util.Objects.requireNonNull(userId));
    }

    // Admin: Get all claims
    @GetMapping
    public List<Claim> getAllClaims() {
        return claimService.getAllClaims();
    }

    // Admin: Update status
    @PutMapping("/{id}/status")
    public Claim updateStatus(@PathVariable Long id, @RequestParam String status) {
        return claimService.updateStatus(java.util.Objects.requireNonNull(id), status);
    }

    // User: Upload document to claim
    @PostMapping("/{id}/upload")
    public Claim uploadDoc(@PathVariable Long id, @RequestParam String url) {
        return claimService.uploadDoc(java.util.Objects.requireNonNull(id), url);
    }
}
