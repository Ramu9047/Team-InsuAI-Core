package com.insurai.dto;

public class PolicyFilterRequest {
    private Integer minAge;
    private Integer maxAge;
    private Double minIncome;
    private Double maxIncome;
    private Double minCoverage;
    private Double maxCoverage;
    private Double maxPremium;
    private String type; // Health, Life, Motor, etc.
    private String category;
    private Integer tenure; // Years

    // Getters and Setters
    public Integer getMinAge() {
        return minAge;
    }

    public void setMinAge(Integer minAge) {
        this.minAge = minAge;
    }

    public Integer getMaxAge() {
        return maxAge;
    }

    public void setMaxAge(Integer maxAge) {
        this.maxAge = maxAge;
    }

    public Double getMinIncome() {
        return minIncome;
    }

    public void setMinIncome(Double minIncome) {
        this.minIncome = minIncome;
    }

    public Double getMaxIncome() {
        return maxIncome;
    }

    public void setMaxIncome(Double maxIncome) {
        this.maxIncome = maxIncome;
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

    public Double getMaxPremium() {
        return maxPremium;
    }

    public void setMaxPremium(Double maxPremium) {
        this.maxPremium = maxPremium;
    }

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

    public Integer getTenure() {
        return tenure;
    }

    public void setTenure(Integer tenure) {
        this.tenure = tenure;
    }
}
