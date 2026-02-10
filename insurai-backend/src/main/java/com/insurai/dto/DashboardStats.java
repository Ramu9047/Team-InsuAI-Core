package com.insurai.dto;

/**
 * Dashboard Statistics DTO
 */
public class DashboardStats {
    public Integer totalPolicies;
    public Integer activePolicies;
    public Integer pendingBookings;
    public Integer completedConsultations;
    public Double totalRevenue;
    public Double monthlyRevenue;
    public Integer totalUsers;
    public Integer activeAgents;
    public Integer appointmentsToday;
    public Integer pendingRequests;
    public Integer healthScore;
    public java.util.List<String> coverageGaps = new java.util.ArrayList<>();
    public java.util.List<String> savingsTips = new java.util.ArrayList<>();

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

    public Integer getPendingBookings() {
        return pendingBookings;
    }

    public void setPendingBookings(Integer pendingBookings) {
        this.pendingBookings = pendingBookings;
    }

    public Integer getCompletedConsultations() {
        return completedConsultations;
    }

    public void setCompletedConsultations(Integer completedConsultations) {
        this.completedConsultations = completedConsultations;
    }

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

    public Integer getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(Integer totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Integer getActiveAgents() {
        return activeAgents;
    }

    public void setActiveAgents(Integer activeAgents) {
        this.activeAgents = activeAgents;
    }
}
