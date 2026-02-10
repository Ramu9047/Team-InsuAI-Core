package com.insurai.dto;

import java.util.List;

/**
 * Agent Review Decision Request
 */
public class AgentReviewDecisionDTO {
    private String decision; // APPROVE, REJECT, REQUEST_MORE_INFO
    private String agentNotes;
    private String rejectionReason;
    private List<String> riskFactors;
    private List<Long> alternativePolicyIds; // If rejected, suggest alternatives
    private Boolean requiresAdminApproval; // Flag for high-risk cases

    // Getters and Setters
    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getAgentNotes() {
        return agentNotes;
    }

    public void setAgentNotes(String agentNotes) {
        this.agentNotes = agentNotes;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public List<String> getRiskFactors() {
        return riskFactors;
    }

    public void setRiskFactors(List<String> riskFactors) {
        this.riskFactors = riskFactors;
    }

    public List<Long> getAlternativePolicyIds() {
        return alternativePolicyIds;
    }

    public void setAlternativePolicyIds(List<Long> alternativePolicyIds) {
        this.alternativePolicyIds = alternativePolicyIds;
    }

    public Boolean getRequiresAdminApproval() {
        return requiresAdminApproval;
    }

    public void setRequiresAdminApproval(Boolean requiresAdminApproval) {
        this.requiresAdminApproval = requiresAdminApproval;
    }
}
