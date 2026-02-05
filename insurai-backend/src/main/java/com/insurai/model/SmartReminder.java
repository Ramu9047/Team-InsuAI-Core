package com.insurai.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Smart Reminder Model
 * Stores intelligent reminders for appointments and pending actions
 */
@Entity
@Table(name = "smart_reminders")
public class SmartReminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String type; // APPOINTMENT, PENDING_ACTION, DOCUMENT_UPLOAD, PAYMENT_DUE, POLICY_RENEWAL

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private LocalDateTime reminderTime;

    private LocalDateTime sentAt;

    @Column(nullable = false)
    private Boolean sent = false;

    @Column(nullable = false)
    private String priority; // LOW, MEDIUM, HIGH, URGENT

    // Related entity IDs
    private Long bookingId;
    private Long policyId;
    private Long claimId;

    // Action details
    private String actionUrl;
    private String actionLabel;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getReminderTime() {
        return reminderTime;
    }

    public void setReminderTime(LocalDateTime reminderTime) {
        this.reminderTime = reminderTime;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public Boolean getSent() {
        return sent;
    }

    public void setSent(Boolean sent) {
        this.sent = sent;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getPolicyId() {
        return policyId;
    }

    public void setPolicyId(Long policyId) {
        this.policyId = policyId;
    }

    public Long getClaimId() {
        return claimId;
    }

    public void setClaimId(Long claimId) {
        this.claimId = claimId;
    }

    public String getActionUrl() {
        return actionUrl;
    }

    public void setActionUrl(String actionUrl) {
        this.actionUrl = actionUrl;
    }

    public String getActionLabel() {
        return actionLabel;
    }

    public void setActionLabel(String actionLabel) {
        this.actionLabel = actionLabel;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
