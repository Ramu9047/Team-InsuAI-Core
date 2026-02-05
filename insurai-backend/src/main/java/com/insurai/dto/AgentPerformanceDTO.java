package com.insurai.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class AgentPerformanceDTO {
    private Long agentId;
    private String agentName;

    // SLA Metrics
    private Double averageResponseTimeHours;
    private Integer totalConsultations;
    private Integer pendingConsultations;
    private Integer completedConsultations;

    // Performance Metrics
    private Double approvalRate; // % of approved consultations
    private Double rejectionRate; // % of rejected consultations
    private Double conversionRate; // % that led to policy purchase

    // Rejection Analysis
    private Map<String, Integer> rejectionReasons; // Reason -> Count

    // Time-based Metrics
    private LocalDateTime lastActiveTime;
    private Integer consultationsThisWeek;
    private Integer consultationsThisMonth;

    // Quality Metrics
    private Double averageCustomerSatisfaction; // If we have feedback
    private Integer alternativesRecommended;

    // Compliance
    private Integer slaBreaches; // Consultations not responded within SLA

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

    public Double getAverageResponseTimeHours() {
        return averageResponseTimeHours;
    }

    public void setAverageResponseTimeHours(Double averageResponseTimeHours) {
        this.averageResponseTimeHours = averageResponseTimeHours;
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

    public Integer getCompletedConsultations() {
        return completedConsultations;
    }

    public void setCompletedConsultations(Integer completedConsultations) {
        this.completedConsultations = completedConsultations;
    }

    public Double getApprovalRate() {
        return approvalRate;
    }

    public void setApprovalRate(Double approvalRate) {
        this.approvalRate = approvalRate;
    }

    public Double getRejectionRate() {
        return rejectionRate;
    }

    public void setRejectionRate(Double rejectionRate) {
        this.rejectionRate = rejectionRate;
    }

    public Double getConversionRate() {
        return conversionRate;
    }

    public void setConversionRate(Double conversionRate) {
        this.conversionRate = conversionRate;
    }

    public Map<String, Integer> getRejectionReasons() {
        return rejectionReasons;
    }

    public void setRejectionReasons(Map<String, Integer> rejectionReasons) {
        this.rejectionReasons = rejectionReasons;
    }

    public LocalDateTime getLastActiveTime() {
        return lastActiveTime;
    }

    public void setLastActiveTime(LocalDateTime lastActiveTime) {
        this.lastActiveTime = lastActiveTime;
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

    public Double getAverageCustomerSatisfaction() {
        return averageCustomerSatisfaction;
    }

    public void setAverageCustomerSatisfaction(Double averageCustomerSatisfaction) {
        this.averageCustomerSatisfaction = averageCustomerSatisfaction;
    }

    public Integer getAlternativesRecommended() {
        return alternativesRecommended;
    }

    public void setAlternativesRecommended(Integer alternativesRecommended) {
        this.alternativesRecommended = alternativesRecommended;
    }

    public Integer getSlaBreaches() {
        return slaBreaches;
    }

    public void setSlaBreaches(Integer slaBreaches) {
        this.slaBreaches = slaBreaches;
    }
}
