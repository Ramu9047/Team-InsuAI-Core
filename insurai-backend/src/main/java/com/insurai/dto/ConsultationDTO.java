package com.insurai.dto;

import java.time.LocalDateTime;

/**
 * Consultation DTO for agent consultation details
 */
public class ConsultationDTO {
    private Long bookingId;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long policyId;
    private String policyName;
    private String status;
    private LocalDateTime scheduledTime;
    private LocalDateTime completedAt;
    private String agentNotes;
    private String recommendation;
    private String outcome;
    private Boolean isRecommended;

    // Additional fields for agent consultation
    private String appointmentReason;
    private Integer userAge;
    private Double userIncome;
    private Integer userDependents;
    private String userHealthInfo;
    private String policyType;
    private Double policyPremium;
    private Double policyCoverage;
    private Double matchScore;
    private String eligibilityStatus;
    private Double affordabilityRatio;
    private Boolean isAffordable;
    private String riskLevel;
    private String riskReason;

    // Getters and Setters
    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getScheduledTime() {
        return scheduledTime;
    }

    public void setScheduledTime(LocalDateTime scheduledTime) {
        this.scheduledTime = scheduledTime;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public String getAgentNotes() {
        return agentNotes;
    }

    public void setAgentNotes(String agentNotes) {
        this.agentNotes = agentNotes;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public String getOutcome() {
        return outcome;
    }

    public void setOutcome(String outcome) {
        this.outcome = outcome;
    }

    public Boolean getIsRecommended() {
        return isRecommended;
    }

    public void setIsRecommended(Boolean isRecommended) {
        this.isRecommended = isRecommended;
    }

    // Alias methods for compatibility
    public LocalDateTime getAppointmentTime() {
        return scheduledTime;
    }

    public void setAppointmentTime(LocalDateTime appointmentTime) {
        this.scheduledTime = appointmentTime;
    }

    public String getAppointmentReason() {
        return appointmentReason;
    }

    public void setAppointmentReason(String appointmentReason) {
        this.appointmentReason = appointmentReason;
    }

    public Integer getUserAge() {
        return userAge;
    }

    public void setUserAge(Integer userAge) {
        this.userAge = userAge;
    }

    public Double getUserIncome() {
        return userIncome;
    }

    public void setUserIncome(Double userIncome) {
        this.userIncome = userIncome;
    }

    public Integer getUserDependents() {
        return userDependents;
    }

    public void setUserDependents(Integer userDependents) {
        this.userDependents = userDependents;
    }

    public String getUserHealthInfo() {
        return userHealthInfo;
    }

    public void setUserHealthInfo(String userHealthInfo) {
        this.userHealthInfo = userHealthInfo;
    }

    public String getPolicyType() {
        return policyType;
    }

    public void setPolicyType(String policyType) {
        this.policyType = policyType;
    }

    public Double getPolicyPremium() {
        return policyPremium;
    }

    public void setPolicyPremium(Double policyPremium) {
        this.policyPremium = policyPremium;
    }

    public Double getPolicyCoverage() {
        return policyCoverage;
    }

    public void setPolicyCoverage(Double policyCoverage) {
        this.policyCoverage = policyCoverage;
    }

    public Double getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Double matchScore) {
        this.matchScore = matchScore;
    }

    public String getEligibilityStatus() {
        return eligibilityStatus;
    }

    public void setEligibilityStatus(String eligibilityStatus) {
        this.eligibilityStatus = eligibilityStatus;
    }

    public Double getAffordabilityRatio() {
        return affordabilityRatio;
    }

    public void setAffordabilityRatio(Double affordabilityRatio) {
        this.affordabilityRatio = affordabilityRatio;
    }

    public Boolean getIsAffordable() {
        return isAffordable;
    }

    public void setIsAffordable(Boolean isAffordable) {
        this.isAffordable = isAffordable;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getRiskReason() {
        return riskReason;
    }

    public void setRiskReason(String riskReason) {
        this.riskReason = riskReason;
    }
}
