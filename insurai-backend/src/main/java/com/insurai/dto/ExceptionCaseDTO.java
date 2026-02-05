package com.insurai.dto;

import java.time.LocalDateTime;

/**
 * DTO for Exception Handling Workflow
 * Handles escalated rejections, disputed claims, and agent misconduct
 */
public class ExceptionCaseDTO {

    private Long caseId;
    private String caseType; // ESCALATED_REJECTION, DISPUTED_CLAIM, AGENT_MISCONDUCT
    private String status; // PENDING, UNDER_REVIEW, RESOLVED, CLOSED
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL

    // Case Details
    private Long userId;
    private String userName;
    private String userEmail;

    private Long agentId;
    private String agentName;
    private String agentEmail;

    private Long policyId;
    private String policyName;

    private Long bookingId;
    private Long claimId;

    // Exception Details
    private String title;
    private String description;
    private String userComplaint;
    private String agentResponse;
    private String evidence; // URL to uploaded evidence

    // Resolution
    private String adminNotes;
    private String resolution;
    private String actionTaken;
    private LocalDateTime resolvedAt;
    private Long resolvedBy; // Admin user ID
    private String resolvedByName;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime escalatedAt;

    // Flags
    private Boolean requiresLegalReview;
    private Boolean requiresComplianceReview;
    private Boolean isUrgent;

    // Getters and Setters
    public Long getCaseId() {
        return caseId;
    }

    public void setCaseId(Long caseId) {
        this.caseId = caseId;
    }

    public String getCaseType() {
        return caseType;
    }

    public void setCaseType(String caseType) {
        this.caseType = caseType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public Long getAgentId() {
        return agentId;
    }

    public void setAgentId(Long agentId) {
        this.agentId = agentId;
    }

    public String getAgentName() {
        return agentName;
    }

    public void setAgentName(String agentName) {
        this.agentName = agentName;
    }

    public String getAgentEmail() {
        return agentEmail;
    }

    public void setAgentEmail(String agentEmail) {
        this.agentEmail = agentEmail;
    }

    public Long getPolicyId() {
        return policyId;
    }

    public void setPolicyId(Long policyId) {
        this.policyId = policyId;
    }

    public String getPolicyName() {
        return policyName;
    }

    public void setPolicyName(String policyName) {
        this.policyName = policyName;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getClaimId() {
        return claimId;
    }

    public void setClaimId(Long claimId) {
        this.claimId = claimId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUserComplaint() {
        return userComplaint;
    }

    public void setUserComplaint(String userComplaint) {
        this.userComplaint = userComplaint;
    }

    public String getAgentResponse() {
        return agentResponse;
    }

    public void setAgentResponse(String agentResponse) {
        this.agentResponse = agentResponse;
    }

    public String getEvidence() {
        return evidence;
    }

    public void setEvidence(String evidence) {
        this.evidence = evidence;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }

    public String getActionTaken() {
        return actionTaken;
    }

    public void setActionTaken(String actionTaken) {
        this.actionTaken = actionTaken;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public Long getResolvedBy() {
        return resolvedBy;
    }

    public void setResolvedBy(Long resolvedBy) {
        this.resolvedBy = resolvedBy;
    }

    public String getResolvedByName() {
        return resolvedByName;
    }

    public void setResolvedByName(String resolvedByName) {
        this.resolvedByName = resolvedByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getEscalatedAt() {
        return escalatedAt;
    }

    public void setEscalatedAt(LocalDateTime escalatedAt) {
        this.escalatedAt = escalatedAt;
    }

    public Boolean getRequiresLegalReview() {
        return requiresLegalReview;
    }

    public void setRequiresLegalReview(Boolean requiresLegalReview) {
        this.requiresLegalReview = requiresLegalReview;
    }

    public Boolean getRequiresComplianceReview() {
        return requiresComplianceReview;
    }

    public void setRequiresComplianceReview(Boolean requiresComplianceReview) {
        this.requiresComplianceReview = requiresComplianceReview;
    }

    public Boolean getIsUrgent() {
        return isUrgent;
    }

    public void setIsUrgent(Boolean isUrgent) {
        this.isUrgent = isUrgent;
    }
}
