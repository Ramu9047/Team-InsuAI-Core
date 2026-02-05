package com.insurai.controller;

import com.insurai.dto.RiskAssessmentDTO;
import com.insurai.service.AIRiskAssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * AI Risk Assessment Controller
 * Provides endpoints for AI-driven risk scoring and eligibility prediction
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIRiskAssessmentController {

    @Autowired
    private AIRiskAssessmentService aiRiskAssessmentService;

    /**
     * Get risk assessment for a user and policy
     */
    @GetMapping("/risk-assessment")
    @PreAuthorize("hasAnyRole('USER', 'AGENT', 'ADMIN')")
    public ResponseEntity<RiskAssessmentDTO> getRiskAssessment(
            @RequestParam Long userId,
            @RequestParam Long policyId) {
        RiskAssessmentDTO assessment = aiRiskAssessmentService.assessRisk(userId, policyId);
        return ResponseEntity.ok(assessment);
    }
}
