package com.insurai.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Audit Log Entity
 * Tracks all critical actions in the system for compliance and security
 */
@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action; // APPROVE, REJECT, CREATE, UPDATE, DELETE, LOGIN, LOGOUT

    @Column(nullable = false)
    private String entityType; // BOOKING, POLICY, USER, AGENT

    @Column(nullable = false)
    private Long entityId;

    @Column(nullable = false)
    private Long performedBy; // User ID who performed the action

    @Column(nullable = false)
    private String performedByRole; // USER, AGENT, ADMIN

    @Column(nullable = false)
    private String performedByName;

    @Column(columnDefinition = "TEXT")
    private String details; // JSON or text details

    @Column(columnDefinition = "TEXT")
    private String previousState; // State before action

    @Column(columnDefinition = "TEXT")
    private String newState; // State after action

    @Column
    private String ipAddress;

    @Column
    private String userAgent;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column
    private String severity; // INFO, WARNING, CRITICAL

    @Column
    private Boolean success; // Whether action succeeded

    @Column(columnDefinition = "TEXT")
    private String errorMessage; // If action failed

    // Legacy fields for backward compatibility
    private Long userId;

    // Constructors
    public AuditLog() {
        this.timestamp = LocalDateTime.now();
        this.success = true;
    }

    public AuditLog(String action, String entityType, Long entityId, Long performedBy,
            String performedByRole, String performedByName) {
        this();
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.performedBy = performedBy;
        this.performedByRole = performedByRole;
        this.performedByName = performedByName;
        this.userId = performedBy; // For backward compatibility
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public Long getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(Long performedBy) {
        this.performedBy = performedBy;
        this.userId = performedBy; // Keep in sync
    }

    public String getPerformedByRole() {
        return performedByRole;
    }

    public void setPerformedByRole(String performedByRole) {
        this.performedByRole = performedByRole;
    }

    public String getPerformedByName() {
        return performedByName;
    }

    public void setPerformedByName(String performedByName) {
        this.performedByName = performedByName;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getPreviousState() {
        return previousState;
    }

    public void setPreviousState(String previousState) {
        this.previousState = previousState;
    }

    public String getNewState() {
        return newState;
    }

    public void setNewState(String newState) {
        this.newState = newState;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
        this.performedBy = userId; // Keep in sync
    }
}
