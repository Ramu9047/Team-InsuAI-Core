package com.insurai.dto;

import java.util.Map;

/**
 * DTO for Admin Dashboard Analytics
 * Provides full lifecycle visibility into the insurance funnel
 */
public class AdminAnalyticsDTO {

    // Funnel Metrics
    private FunnelMetrics funnelMetrics;

    // Agent Performance Summary
    private AgentPerformanceSummary agentPerformance;

    // Policy Metrics
    private PolicyMetrics policyMetrics;

    // Financial Metrics
    private FinancialMetrics financialMetrics;

    // Drop-off Analysis
    private DropOffAnalysis dropOffAnalysis;

    // ----- Nested Classes -----

    public static class FunnelMetrics {
        private Long totalPolicyViews;
        private Long totalAppointmentsBooked;
        private Long totalConsultationsCompleted;
        private Long totalApprovalsGiven;
        private Long totalPurchasesCompleted;

        // Conversion Rates
        private Double viewToAppointmentRate;
        private Double appointmentToConsultationRate;
        private Double consultationToApprovalRate;
        private Double approvalToPurchaseRate;
        private Double overallConversionRate;

        // Getters and Setters
        public Long getTotalPolicyViews() {
            return totalPolicyViews;
        }

        public void setTotalPolicyViews(Long totalPolicyViews) {
            this.totalPolicyViews = totalPolicyViews;
        }

        public Long getTotalAppointmentsBooked() {
            return totalAppointmentsBooked;
        }

        public void setTotalAppointmentsBooked(Long totalAppointmentsBooked) {
            this.totalAppointmentsBooked = totalAppointmentsBooked;
        }

        public Long getTotalConsultationsCompleted() {
            return totalConsultationsCompleted;
        }

        public void setTotalConsultationsCompleted(Long totalConsultationsCompleted) {
            this.totalConsultationsCompleted = totalConsultationsCompleted;
        }

        public Long getTotalApprovalsGiven() {
            return totalApprovalsGiven;
        }

        public void setTotalApprovalsGiven(Long totalApprovalsGiven) {
            this.totalApprovalsGiven = totalApprovalsGiven;
        }

        public Long getTotalPurchasesCompleted() {
            return totalPurchasesCompleted;
        }

        public void setTotalPurchasesCompleted(Long totalPurchasesCompleted) {
            this.totalPurchasesCompleted = totalPurchasesCompleted;
        }

        public Double getViewToAppointmentRate() {
            return viewToAppointmentRate;
        }

        public void setViewToAppointmentRate(Double viewToAppointmentRate) {
            this.viewToAppointmentRate = viewToAppointmentRate;
        }

        public Double getAppointmentToConsultationRate() {
            return appointmentToConsultationRate;
        }

        public void setAppointmentToConsultationRate(Double appointmentToConsultationRate) {
            this.appointmentToConsultationRate = appointmentToConsultationRate;
        }

        public Double getConsultationToApprovalRate() {
            return consultationToApprovalRate;
        }

        public void setConsultationToApprovalRate(Double consultationToApprovalRate) {
            this.consultationToApprovalRate = consultationToApprovalRate;
        }

        public Double getApprovalToPurchaseRate() {
            return approvalToPurchaseRate;
        }

        public void setApprovalToPurchaseRate(Double approvalToPurchaseRate) {
            this.approvalToPurchaseRate = approvalToPurchaseRate;
        }

        public Double getOverallConversionRate() {
            return overallConversionRate;
        }

        public void setOverallConversionRate(Double overallConversionRate) {
            this.overallConversionRate = overallConversionRate;
        }
    }

    public static class AgentPerformanceSummary {
        private Integer totalAgents;
        private Integer activeAgents;
        private Integer inactiveAgents;
        private Double averageResponseTime;
        private Double averageApprovalRate;
        private Double averageConversionRate;
        private Integer totalSLABreaches;
        private Integer agentsWithSLABreaches;

        // Getters and Setters
        public Integer getTotalAgents() {
            return totalAgents;
        }

        public void setTotalAgents(Integer totalAgents) {
            this.totalAgents = totalAgents;
        }

        public Integer getActiveAgents() {
            return activeAgents;
        }

        public void setActiveAgents(Integer activeAgents) {
            this.activeAgents = activeAgents;
        }

        public Integer getInactiveAgents() {
            return inactiveAgents;
        }

        public void setInactiveAgents(Integer inactiveAgents) {
            this.inactiveAgents = inactiveAgents;
        }

        public Double getAverageResponseTime() {
            return averageResponseTime;
        }

        public void setAverageResponseTime(Double averageResponseTime) {
            this.averageResponseTime = averageResponseTime;
        }

        public Double getAverageApprovalRate() {
            return averageApprovalRate;
        }

        public void setAverageApprovalRate(Double averageApprovalRate) {
            this.averageApprovalRate = averageApprovalRate;
        }

        public Double getAverageConversionRate() {
            return averageConversionRate;
        }

        public void setAverageConversionRate(Double averageConversionRate) {
            this.averageConversionRate = averageConversionRate;
        }

        public Integer getTotalSLABreaches() {
            return totalSLABreaches;
        }

        public void setTotalSLABreaches(Integer totalSLABreaches) {
            this.totalSLABreaches = totalSLABreaches;
        }

        public Integer getAgentsWithSLABreaches() {
            return agentsWithSLABreaches;
        }

        public void setAgentsWithSLABreaches(Integer agentsWithSLABreaches) {
            this.agentsWithSLABreaches = agentsWithSLABreaches;
        }
    }

    public static class PolicyMetrics {
        private Integer totalPolicies;
        private Integer activePolicies;
        private Integer quotedPolicies;
        private Integer rejectedPolicies;
        private Map<String, Integer> policiesByType;
        private Map<String, Integer> policiesByCategory;

        // Getters and Setters
        public Integer getTotalPolicies() {
            return totalPolicies;
        }

        public void setTotalPolicies(Integer totalPolicies) {
            this.totalPolicies = totalPolicies;
        }

        public Integer getActivePolicies() {
            return activePolicies;
        }

        public void setActivePolicies(Integer activePolicies) {
            this.activePolicies = activePolicies;
        }

        public Integer getQuotedPolicies() {
            return quotedPolicies;
        }

        public void setQuotedPolicies(Integer quotedPolicies) {
            this.quotedPolicies = quotedPolicies;
        }

        public Integer getRejectedPolicies() {
            return rejectedPolicies;
        }

        public void setRejectedPolicies(Integer rejectedPolicies) {
            this.rejectedPolicies = rejectedPolicies;
        }

        public Map<String, Integer> getPoliciesByType() {
            return policiesByType;
        }

        public void setPoliciesByType(Map<String, Integer> policiesByType) {
            this.policiesByType = policiesByType;
        }

        public Map<String, Integer> getPoliciesByCategory() {
            return policiesByCategory;
        }

        public void setPoliciesByCategory(Map<String, Integer> policiesByCategory) {
            this.policiesByCategory = policiesByCategory;
        }
    }

    public static class FinancialMetrics {
        private Double totalRevenue;
        private Double monthlyRevenue;
        private Double averagePremium;
        private Double totalCoverageIssued;
        private Integer totalUsers;
        private Integer activeUsers;

        // Getters and Setters
        public Double getTotalRevenue() {
            return totalRevenue;
        }

        public void setTotalRevenue(Double totalRevenue) {
            this.totalRevenue = totalRevenue;
        }

        public Double getMonthlyRevenue() {
            return monthlyRevenue;
        }

        public void setMonthlyRevenue(Double monthlyRevenue) {
            this.monthlyRevenue = monthlyRevenue;
        }

        public Double getAveragePremium() {
            return averagePremium;
        }

        public void setAveragePremium(Double averagePremium) {
            this.averagePremium = averagePremium;
        }

        public Double getTotalCoverageIssued() {
            return totalCoverageIssued;
        }

        public void setTotalCoverageIssued(Double totalCoverageIssued) {
            this.totalCoverageIssued = totalCoverageIssued;
        }

        public Integer getTotalUsers() {
            return totalUsers;
        }

        public void setTotalUsers(Integer totalUsers) {
            this.totalUsers = totalUsers;
        }

        public Integer getActiveUsers() {
            return activeUsers;
        }

        public void setActiveUsers(Integer activeUsers) {
            this.activeUsers = activeUsers;
        }
    }

    public static class DropOffAnalysis {
        private DropOffPoint viewToAppointment;
        private DropOffPoint appointmentToConsultation;
        private DropOffPoint consultationToApproval;
        private DropOffPoint approvalToPurchase;

        public static class DropOffPoint {
            private String stage;
            private Long entered;
            private Long exited;
            private Long dropped;
            private Double dropOffRate;
            private String primaryReason;
            private Map<String, Integer> reasonsBreakdown;

            // Getters and Setters
            public String getStage() {
                return stage;
            }

            public void setStage(String stage) {
                this.stage = stage;
            }

            public Long getEntered() {
                return entered;
            }

            public void setEntered(Long entered) {
                this.entered = entered;
            }

            public Long getExited() {
                return exited;
            }

            public void setExited(Long exited) {
                this.exited = exited;
            }

            public Long getDropped() {
                return dropped;
            }

            public void setDropped(Long dropped) {
                this.dropped = dropped;
            }

            public Double getDropOffRate() {
                return dropOffRate;
            }

            public void setDropOffRate(Double dropOffRate) {
                this.dropOffRate = dropOffRate;
            }

            public String getPrimaryReason() {
                return primaryReason;
            }

            public void setPrimaryReason(String primaryReason) {
                this.primaryReason = primaryReason;
            }

            public Map<String, Integer> getReasonsBreakdown() {
                return reasonsBreakdown;
            }

            public void setReasonsBreakdown(Map<String, Integer> reasonsBreakdown) {
                this.reasonsBreakdown = reasonsBreakdown;
            }
        }

        // Getters and Setters
        public DropOffPoint getViewToAppointment() {
            return viewToAppointment;
        }

        public void setViewToAppointment(DropOffPoint viewToAppointment) {
            this.viewToAppointment = viewToAppointment;
        }

        public DropOffPoint getAppointmentToConsultation() {
            return appointmentToConsultation;
        }

        public void setAppointmentToConsultation(DropOffPoint appointmentToConsultation) {
            this.appointmentToConsultation = appointmentToConsultation;
        }

        public DropOffPoint getConsultationToApproval() {
            return consultationToApproval;
        }

        public void setConsultationToApproval(DropOffPoint consultationToApproval) {
            this.consultationToApproval = consultationToApproval;
        }

        public DropOffPoint getApprovalToPurchase() {
            return approvalToPurchase;
        }

        public void setApprovalToPurchase(DropOffPoint approvalToPurchase) {
            this.approvalToPurchase = approvalToPurchase;
        }
    }

    // Main Getters and Setters
    public FunnelMetrics getFunnelMetrics() {
        return funnelMetrics;
    }

    public void setFunnelMetrics(FunnelMetrics funnelMetrics) {
        this.funnelMetrics = funnelMetrics;
    }

    public AgentPerformanceSummary getAgentPerformance() {
        return agentPerformance;
    }

    public void setAgentPerformance(AgentPerformanceSummary agentPerformance) {
        this.agentPerformance = agentPerformance;
    }

    public PolicyMetrics getPolicyMetrics() {
        return policyMetrics;
    }

    public void setPolicyMetrics(PolicyMetrics policyMetrics) {
        this.policyMetrics = policyMetrics;
    }

    public FinancialMetrics getFinancialMetrics() {
        return financialMetrics;
    }

    public void setFinancialMetrics(FinancialMetrics financialMetrics) {
        this.financialMetrics = financialMetrics;
    }

    public DropOffAnalysis getDropOffAnalysis() {
        return dropOffAnalysis;
    }

    public void setDropOffAnalysis(DropOffAnalysis dropOffAnalysis) {
        this.dropOffAnalysis = dropOffAnalysis;
    }
}
