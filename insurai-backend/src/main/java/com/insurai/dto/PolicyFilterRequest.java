package com.insurai.dto;

import java.util.List;

/**
 * Policy Filter Request DTO
 */
public class PolicyFilterRequest {
    private String type;
    private String category;
    private Double minPremium;
    private Double maxPremium;
    private Double minCoverage;
    private Double maxCoverage;
    private List<String> features;
    private String sortBy;
    private String sortOrder;

    // Getters and Setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getMinPremium() {
        return minPremium;
    }

    public void setMinPremium(Double minPremium) {
        this.minPremium = minPremium;
    }

    public Double getMaxPremium() {
        return maxPremium;
    }

    public void setMaxPremium(Double maxPremium) {
        this.maxPremium = maxPremium;
    }

    public Double getMinCoverage() {
        return minCoverage;
    }

    public void setMinCoverage(Double minCoverage) {
        this.minCoverage = minCoverage;
    }

    public Double getMaxCoverage() {
        return maxCoverage;
    }

    public void setMaxCoverage(Double maxCoverage) {
        this.maxCoverage = maxCoverage;
    }

    public List<String> getFeatures() {
        return features;
    }

    public void setFeatures(List<String> features) {
        this.features = features;
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }

    public String getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(String sortOrder) {
        this.sortOrder = sortOrder;
    }
}
