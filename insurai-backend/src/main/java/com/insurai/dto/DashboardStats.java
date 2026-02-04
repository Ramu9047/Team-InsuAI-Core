package com.insurai.dto;

public class DashboardStats {
    public long activeAgents;
    public long appointmentsToday;
    public long pendingRequests;
    public long totalPolicies;

    // User Insights
    public int healthScore; // 0-100
    public java.util.List<String> coverageGaps = new java.util.ArrayList<>();
    public java.util.List<String> savingsTips = new java.util.ArrayList<>();
}
