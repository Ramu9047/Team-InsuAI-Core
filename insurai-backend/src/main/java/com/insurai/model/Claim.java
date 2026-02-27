package com.insurai.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Claim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "policy_id")
    private Policy policy;

    private String policyName;
    private String claimType; // HEALTH, ACCIDENT, DEATH, PROPERTY_DAMAGE, etc.
    private String description;
    private Double amount;
    private String status; // INITIATED, DOCS_UPLOADED, UNDER_REVIEW, APPROVED, REJECTED
    private LocalDateTime date;

    // Detailed Timeline
    private LocalDateTime docsUploadedAt;

    // Next Best Action (AI suggestion)
    private String nextAction;

    // Probability of Approval (0-100)
    private Integer successProbability;

    @ElementCollection
    private java.util.List<String> documentUrls = new java.util.ArrayList<>();

    // AI Analysis
    private Double fraudScore; // 0.0 to 1.0 (Low to High Risk)

    public Double getFraudScore() {
        return fraudScore;
    }

    public void setFraudScore(Double fraudScore) {
        this.fraudScore = fraudScore;
    }

    @PrePersist
    protected void onCreate() {
        date = LocalDateTime.now();
        if (status == null)
            status = "INITIATED";
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Policy getPolicy() {
        return policy;
    }

    public void setPolicy(Policy policy) {
        this.policy = policy;
    }

    public String getPolicyName() {
        return policyName;
    }

    public void setPolicyName(String policyName) {
        this.policyName = policyName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public java.util.List<String> getDocumentUrls() {
        return documentUrls;
    }

    public void setDocumentUrls(java.util.List<String> documentUrls) {
        this.documentUrls = documentUrls;
    }

    public String getNextAction() {
        return nextAction;
    }

    public void setNextAction(String nextAction) {
        this.nextAction = nextAction;
    }

    public Integer getSuccessProbability() {
        return successProbability;
    }

    public void setSuccessProbability(Integer successProbability) {
        this.successProbability = successProbability;
    }

    public LocalDateTime getDocsUploadedAt() {
        return docsUploadedAt;
    }

    public void setDocsUploadedAt(LocalDateTime t) {
        this.docsUploadedAt = t;
    }

    public String getClaimType() {
        return claimType;
    }

    public void setClaimType(String claimType) {
        this.claimType = claimType;
    }

    private String proofUrl;

    @Transient
    private Long policyId;

    public Long getPolicyId() {
        return policyId;
    }

    public void setPolicyId(Long policyId) {
        this.policyId = policyId;
    }

    public String getProofUrl() {
        return proofUrl;
    }

    public void setProofUrl(String proofUrl) {
        this.proofUrl = proofUrl;
    }
}
