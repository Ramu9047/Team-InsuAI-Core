package com.insurai.dto;

/**
 * Quote Request DTO
 */
public class QuoteRequest {
    private Long userId;
    private Long policyId;
    private Integer age;
    private String healthInfo;
    private Double income;
    private Integer dependents;
    private String occupation;
    private String smokingStatus;
    private String note;

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getPolicyId() {
        return policyId;
    }

    public void setPolicyId(Long policyId) {
        this.policyId = policyId;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getHealthInfo() {
        return healthInfo;
    }

    public void setHealthInfo(String healthInfo) {
        this.healthInfo = healthInfo;
    }

    public Double getIncome() {
        return income;
    }

    public void setIncome(Double income) {
        this.income = income;
    }

    public Integer getDependents() {
        return dependents;
    }

    public void setDependents(Integer dependents) {
        this.dependents = dependents;
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }

    public String getSmokingStatus() {
        return smokingStatus;
    }

    public void setSmokingStatus(String smokingStatus) {
        this.smokingStatus = smokingStatus;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
