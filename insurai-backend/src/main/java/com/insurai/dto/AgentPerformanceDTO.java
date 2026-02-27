package com.insurai.dto;

/**
 * Agent Performance DTO
 */
public class AgentPerformanceDTO {
    private Long agentId;
    private String agentName;
    private Integer totalConsultations;
    private Integer completedConsultations;
    private Integer pendingConsultations;
    private Double approvalRate;
    private Double conversionRate;
    private Double averageResponseTime;
    private Integer slaBreaches;
    private Double customerSatisfaction;
    private Double averageResponseTimeHours;
    private Double rejectionRate;
    private Integer rankPercentile; // New field
    private Integer consultationsThisWeek;
    private Integer consultationsThisMonth;
    private java.util.Map<String, Integer> rejectionReasons;
    private Integer alternativesRecommended;
    private java.time.LocalDateTime lastActiveTime;
    private Integer approvedToday;
    private Integer rejectedToday;
    private Integer claimsCount; // New field
    private java.util.List<String> assignedRegions;
    private java.util.List<String> assignedPolicyTypes;

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

    public Integer getTotalConsultations() {
        return totalConsultations;
    }

    public void setTotalConsultations(Integer totalConsultations) {
        this.totalConsultations = totalConsultations;
    }

    public Integer getCompletedConsultations() {
        return completedConsultations;
    }

    public void setCompletedConsultations(Integer completedConsultations) {
        this.completedConsultations = completedConsultations;
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

    public Double getAverageResponseTime() {
        return averageResponseTime;
    }

    public void setAverageResponseTime(Double averageResponseTime) {
        this.averageResponseTime = averageResponseTime;
    }

    public Integer getSlaBreaches() {
        return slaBreaches;
    }

    public void setSlaBreaches(Integer slaBreaches) {
        this.slaBreaches = slaBreaches;
    }

    public Double getCustomerSatisfaction() {
        return customerSatisfaction;
    }

    public void setCustomerSatisfaction(Double customerSatisfaction) {
        this.customerSatisfaction = customerSatisfaction;
    }

    public Double getAverageResponseTimeHours() {
        return averageResponseTimeHours;
    }

    public void setAverageResponseTimeHours(Double averageResponseTimeHours) {
        this.averageResponseTimeHours = averageResponseTimeHours;
    }

    public Double getRejectionRate() {
        return rejectionRate;
    }

    public void setRejectionRate(Double rejectionRate) {
        this.rejectionRate = rejectionRate;
    }

    public Integer getConsultationsThisWeek() {
        return consultationsThisWeek;
    }

    public void setConsultationsThisWeek(Integer consultationsThisWeek) {
        this.consultationsThisWeek = consultationsThisWeek;
    }

    public Integer getConsultationsThisMonth() {
        return consultationsThisMonth;
    }

    public void setConsultationsThisMonth(Integer consultationsThisMonth) {
        this.consultationsThisMonth = consultationsThisMonth;
    }

    public java.util.Map<String, Integer> getRejectionReasons() {
        return rejectionReasons;
    }

    public void setRejectionReasons(java.util.Map<String, Integer> rejectionReasons) {
        this.rejectionReasons = rejectionReasons;
    }

    public Integer getAlternativesRecommended() {
        return alternativesRecommended;
    }

    public void setAlternativesRecommended(Integer alternativesRecommended) {
        this.alternativesRecommended = alternativesRecommended;
    }

    public java.time.LocalDateTime getLastActiveTime() {
        return lastActiveTime;
    }

    public void setLastActiveTime(java.time.LocalDateTime lastActiveTime) {
        this.lastActiveTime = lastActiveTime;
    }

    public Integer getRankPercentile() {
        return rankPercentile;
    }

    public void setRankPercentile(Integer rankPercentile) {
        this.rankPercentile = rankPercentile;
    }

    public Integer getApprovedToday() {
        return approvedToday;
    }

    public void setApprovedToday(Integer approvedToday) {
        this.approvedToday = approvedToday;
    }

    public Integer getRejectedToday() {
        return rejectedToday;
    }

    public void setRejectedToday(Integer rejectedToday) {
        this.rejectedToday = rejectedToday;
    }

    public Integer getClaimsCount() {
        return claimsCount;
    }

    public void setClaimsCount(Integer claimsCount) {
        this.claimsCount = claimsCount;
    }

    public java.util.List<String> getAssignedRegions() {
        return assignedRegions;
    }

    public void setAssignedRegions(java.util.List<String> assignedRegions) {
        this.assignedRegions = assignedRegions;
    }

    public java.util.List<String> getAssignedPolicyTypes() {
        return assignedPolicyTypes;
    }

    public void setAssignedPolicyTypes(java.util.List<String> assignedPolicyTypes) {
        this.assignedPolicyTypes = assignedPolicyTypes;
    }
}
