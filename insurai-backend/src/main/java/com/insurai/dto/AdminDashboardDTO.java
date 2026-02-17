package com.insurai.dto;

import java.util.List;
import java.util.Map;

public class AdminDashboardDTO {
    // Claim Risk Distribution
    private Map<String, Integer> claimRiskDistribution; // "Low": 50, "Medium": 20...
    private List<AgentPerformanceDTO> agentLeaderboard;
    private SLAMetricsDTO slaMetrics;
    private Integer fraudAlerts;

    public Integer getFraudAlerts() {
        return fraudAlerts;
    }

    public void setFraudAlerts(Integer fraudAlerts) {
        this.fraudAlerts = fraudAlerts;
    }

    // Inner DTO for SLA
    public Map<String, Integer> getClaimRiskDistribution() {
        return claimRiskDistribution;
    }

    public void setClaimRiskDistribution(Map<String, Integer> claimRiskDistribution) {
        this.claimRiskDistribution = claimRiskDistribution;
    }

    public List<AgentPerformanceDTO> getAgentLeaderboard() {
        return agentLeaderboard;
    }

    public void setAgentLeaderboard(List<AgentPerformanceDTO> agentLeaderboard) {
        this.agentLeaderboard = agentLeaderboard;
    }

    public SLAMetricsDTO getSlaMetrics() {
        return slaMetrics;
    }

    public void setSlaMetrics(SLAMetricsDTO slaMetrics) {
        this.slaMetrics = slaMetrics;
    }

    // Inner DTO for SLA
    public static class SLAMetricsDTO {
        private int onTrack;
        private int atRisk;
        private int breached;
        private List<SLATaskDTO> urgentTasks;

        public int getOnTrack() {
            return onTrack;
        }

        public void setOnTrack(int onTrack) {
            this.onTrack = onTrack;
        }

        public int getAtRisk() {
            return atRisk;
        }

        public void setAtRisk(int atRisk) {
            this.atRisk = atRisk;
        }

        public int getBreached() {
            return breached;
        }

        public void setBreached(int breached) {
            this.breached = breached;
        }

        public List<SLATaskDTO> getUrgentTasks() {
            return urgentTasks;
        }

        public void setUrgentTasks(List<SLATaskDTO> urgentTasks) {
            this.urgentTasks = urgentTasks;
        }
    }

    public static class SLATaskDTO {
        private String id;
        private String taskName;
        private String deadline;
        private String priority; // HIGH, MEDIUM
        private String assignedTo;

        public SLATaskDTO(String id, String taskName, String deadline, String priority, String assignedTo) {
            this.id = id;
            this.taskName = taskName;
            this.deadline = deadline;
            this.priority = priority;
            this.assignedTo = assignedTo;
        }

        // Getters
        public String getId() {
            return id;
        }

        public String getTaskName() {
            return taskName;
        }

        public String getDeadline() {
            return deadline;
        }

        public String getPriority() {
            return priority;
        }

        public String getAssignedTo() {
            return assignedTo;
        }
    }
}
