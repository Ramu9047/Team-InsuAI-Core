package com.insurai.dto;

import java.time.LocalDateTime;

public class CompanyUserDTO {
    private Long userId;
    private String userName;
    private String email;
    private String policyName;
    private String policyStatus;
    private String mapStatus;
    private LocalDateTime joinedAt;

    public CompanyUserDTO(Long userId, String userName, String email, String policyName, String policyStatus,
            String mapStatus, LocalDateTime joinedAt) {
        this.userId = userId;
        this.userName = userName;
        this.email = email;
        this.policyName = policyName;
        this.policyStatus = policyStatus;
        this.mapStatus = mapStatus;
        this.joinedAt = joinedAt;
    }

    // Getters and Setters
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPolicyName() {
        return policyName;
    }

    public void setPolicyName(String policyName) {
        this.policyName = policyName;
    }

    public String getPolicyStatus() {
        return policyStatus;
    }

    public void setPolicyStatus(String policyStatus) {
        this.policyStatus = policyStatus;
    }

    public String getMapStatus() {
        return mapStatus;
    }

    public void setMapStatus(String mapStatus) {
        this.mapStatus = mapStatus;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}
