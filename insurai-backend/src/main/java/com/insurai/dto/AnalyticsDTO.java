package com.insurai.dto;

import java.util.Map;

public class AnalyticsDTO {
    private Map<String, Long> statusDistribution;
    private Map<String, Long> agentWorkload;
    private Map<Integer, Long> peakHours;
    private Map<String, Long> weeklyVolume;

    // Advanced Metrics
    private Double avgClaimResolutionDays; // e.g. 2.5 days
    private Double bookingConversionRate; // e.g. 75.0%

    // Getters Setters
    public Double getAvgClaimResolutionDays() {
        return avgClaimResolutionDays;
    }

    public void setAvgClaimResolutionDays(Double d) {
        this.avgClaimResolutionDays = d;
    }

    public Double getBookingConversionRate() {
        return bookingConversionRate;
    }

    public void setBookingConversionRate(Double d) {
        this.bookingConversionRate = d;
    }

    public Map<String, Long> getStatusDistribution() {
        return statusDistribution;
    }

    public void setStatusDistribution(Map<String, Long> statusDistribution) {
        this.statusDistribution = statusDistribution;
    }

    public Map<String, Long> getAgentWorkload() {
        return agentWorkload;
    }

    public void setAgentWorkload(Map<String, Long> agentWorkload) {
        this.agentWorkload = agentWorkload;
    }

    public Map<Integer, Long> getPeakHours() {
        return peakHours;
    }

    public void setPeakHours(Map<Integer, Long> peakHours) {
        this.peakHours = peakHours;
    }

    public Map<String, Long> getWeeklyVolume() {
        return weeklyVolume;
    }

    public void setWeeklyVolume(Map<String, Long> weeklyVolume) {
        this.weeklyVolume = weeklyVolume;
    }
}
