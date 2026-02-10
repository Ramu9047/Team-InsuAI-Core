package com.insurai.model;

/**
 * Appointment/Booking Status Lifecycle
 * Defines the complete lifecycle of a booking/consultation request
 */
public enum BookingStatus {
    // Initial state
    PENDING("Pending", "Awaiting agent assignment"),

    // Agent confirmed the appointment
    CONFIRMED("Confirmed", "Agent confirmed, appointment scheduled"),

    // Appointment completed
    COMPLETED("Completed", "Consultation completed"),

    // Policy issued after approval
    POLICY_ISSUED("Policy Issued", "Policy has been issued to user"),

    // Rejected by agent
    REJECTED("Rejected", "Application rejected"),

    // System auto-expired (no response within SLA)
    EXPIRED("Expired", "Request expired due to inactivity"),

    // Cancelled by user
    CANCELLED("Cancelled", "Cancelled by user"),

    // Pending admin approval (high-risk cases)
    PENDING_ADMIN_APPROVAL("Pending Admin Approval", "Awaiting admin review");

    private final String displayName;
    private final String description;

    BookingStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Check if status is terminal (no further transitions possible)
     */
    public boolean isTerminal() {
        return this == COMPLETED ||
                this == POLICY_ISSUED ||
                this == REJECTED ||
                this == EXPIRED ||
                this == CANCELLED;
    }

    /**
     * Check if status is active (requires action)
     */
    public boolean isActive() {
        return this == PENDING ||
                this == CONFIRMED ||
                this == PENDING_ADMIN_APPROVAL;
    }

    /**
     * Get valid next states for this status
     */
    public BookingStatus[] getValidNextStates() {
        switch (this) {
            case PENDING:
                return new BookingStatus[] { CONFIRMED, REJECTED, EXPIRED, CANCELLED };
            case CONFIRMED:
                return new BookingStatus[] { COMPLETED, CANCELLED, EXPIRED };
            case COMPLETED:
                return new BookingStatus[] { POLICY_ISSUED, REJECTED };
            case PENDING_ADMIN_APPROVAL:
                return new BookingStatus[] { POLICY_ISSUED, REJECTED };
            default:
                return new BookingStatus[] {};
        }
    }

    /**
     * Validate if transition to new status is allowed
     */
    public boolean canTransitionTo(BookingStatus newStatus) {
        for (BookingStatus validStatus : getValidNextStates()) {
            if (validStatus == newStatus) {
                return true;
            }
        }
        return false;
    }
}
