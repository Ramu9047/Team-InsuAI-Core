package com.insurai.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for Agent Governance
 * Allows admin to manage agent assignments, regions, and compliance
 */
public class AgentGovernanceDTO {

    private Long agentId;
    private String agentName;
    private String agentEmail;
    private Boolean isActive;
    private Boolean isAvailable;

    // Assignment Details
    private List<String> assignedRegions;
    private List<String> assignedPolicyTypes;
    private List<String> specializations;

    // Compliance Metrics
    private ComplianceMetrics compliance;

    // Activity
    private LocalDateTime lastActive;
    private LocalDateTime createdAt;
    private LocalDateTime deactivatedAt;
    private String deactivationReason;

    // Performance Summary
    private Integer totalConsultations;
    private Integer pendingConsultations;
    private Double approvalRate;
    private Double conversionRate;
    private Integer slaBreaches;

    // Flags
    private Integer misconductFlags;
    private Integer escalatedCases;
    private Integer disputedClaims;

    // Nested Class
    public static class ComplianceMetrics {
        private Boolean hasValidLicense;
        private LocalDateTime licenseExpiryDate;
        private Boolean hasCompletedTraining;
        private LocalDateTime lastTrainingDate;
        private Integer complianceScore; // 0-100
        private List<String> violations;

        // Getters and Setters
        public Boolean getHasValidLicense() {
            return hasValidLicense;
        }

        public void setHasValidLicense(Boolean hasValidLicense) {
            this.hasValidLicense = hasValidLicense;
        }

        public LocalDateTime getLicenseExpiryDate() {
            return licenseExpiryDate;
        }

        public void setLicenseExpiryDate(LocalDateTime licenseExpiryDate) {
            this.licenseExpiryDate = licenseExpiryDate;
        }

        public Boolean getHasCompletedTraining() {
            return hasCompletedTraining;
        }

        public void setHasCompletedTraining(Boolean hasCompletedTraining) {
            this.hasCompletedTraining = hasCompletedTraining;
        }

        public LocalDateTime getLastTrainingDate() {
            return lastTrainingDate;
        }

        public void setLastTrainingDate(LocalDateTime lastTrainingDate) {
            this.lastTrainingDate = lastTrainingDate;
        }

        public Integer getComplianceScore() {
            return complianceScore;
        }

        public void setComplianceScore(Integer complianceScore) {
            this.complianceScore = complianceScore;
        }

        public List<String> getViolations() {
            return violations;
        }

        public void setViolations(List<String> violations) {
            this.violations = violations;
        }
    }

    // Getters and Setters
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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public List<String> getAssignedRegions() {
        return assignedRegions;
    }

    public void setAssignedRegions(List<String> assignedRegions) {
        this.assignedRegions = assignedRegions;
    }

    public List<String> getAssignedPolicyTypes() {
        return assignedPolicyTypes;
    }

    public void setAssignedPolicyTypes(List<String> assignedPolicyTypes) {
        this.assignedPolicyTypes = assignedPolicyTypes;
    }

    public List<String> getSpecializations() {
        return specializations;
    }

    public void setSpecializations(List<String> specializations) {
        this.specializations = specializations;
    }

    public ComplianceMetrics getCompliance() {
        return compliance;
    }

    public void setCompliance(ComplianceMetrics compliance) {
        this.compliance = compliance;
    }

    public LocalDateTime getLastActive() {
        return lastActive;
    }

    public void setLastActive(LocalDateTime lastActive) {
        this.lastActive = lastActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getDeactivatedAt() {
        return deactivatedAt;
    }

    public void setDeactivatedAt(LocalDateTime deactivatedAt) {
        this.deactivatedAt = deactivatedAt;
    }

    public String getDeactivationReason() {
        return deactivationReason;
    }

    public void setDeactivationReason(String deactivationReason) {
        this.deactivationReason = deactivationReason;
    }

    public Integer getTotalConsultations() {
        return totalConsultations;
    }

    public void setTotalConsultations(Integer totalConsultations) {
        this.totalConsultations = totalConsultations;
    }

    public Integer getPendingConsultations() {
        return pendingConsultations;
    }

    public void setPendingConsultations(Integer pendingConsultations) {
        this.pendingConsultations = pendingConsultations;
    }

    public Double getApprovalRate() {
        return approvalRate;
    }

    public void setApprovalRate(Double approvalRate) {
        this.approvalRate = approvalRate;
    }

    public Double getConversionRate() {
        return conversionRate;
    }

    public void setConversionRate(Double conversionRate) {
        this.conversionRate = conversionRate;
    }

    public Integer getSlaBreaches() {
        return slaBreaches;
    }

    public void setSlaBreaches(Integer slaBreaches) {
        this.slaBreaches = slaBreaches;
    }

    public Integer getMisconductFlags() {
        return misconductFlags;
    }

    public void setMisconductFlags(Integer misconductFlags) {
        this.misconductFlags = misconductFlags;
    }

    public Integer getEscalatedCases() {
        return escalatedCases;
    }

    public void setEscalatedCases(Integer escalatedCases) {
        this.escalatedCases = escalatedCases;
    }

    public Integer getDisputedClaims() {
        return disputedClaims;
    }

    public void setDisputedClaims(Integer disputedClaims) {
        this.disputedClaims = disputedClaims;
    }
}
