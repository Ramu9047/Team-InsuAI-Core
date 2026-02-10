package com.insurai.service;

import com.insurai.model.Booking;
import com.insurai.model.User;
import com.insurai.model.UserPolicy;
import com.insurai.repository.BookingRepository;
import com.insurai.repository.UserPolicyRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Context-Aware AI Assistant
 * Remembers user history and provides personalized guidance
 */
@Service
public class AIAssistantService {

    private final BookingRepository bookingRepository;
    private final UserPolicyRepository userPolicyRepository;

    public AIAssistantService(
            BookingRepository bookingRepository,
            UserPolicyRepository userPolicyRepository) {
        this.bookingRepository = bookingRepository;
        this.userPolicyRepository = userPolicyRepository;
    }

    /**
     * Get AI assistant response with context awareness
     */
    public AssistantResponse getResponse(User user, String query) {
        AssistantResponse response = new AssistantResponse();
        response.setQuery(query);
        response.setTimestamp(LocalDateTime.now());

        // Load user context
        UserContext context = loadUserContext(user);
        response.setContext(context);

        // Analyze query intent
        String intent = detectIntent(query);
        response.setIntent(intent);

        // Generate contextual response
        String answer = generateContextualResponse(user, context, query, intent);
        response.setAnswer(answer);

        // Add suggested actions
        response.setSuggestedActions(getSuggestedActions(user, context, intent));

        return response;
    }

    /**
     * Load user context (recent activity, policies, bookings)
     */
    private UserContext loadUserContext(User user) {
        UserContext context = new UserContext();

        // Get recent bookings
        List<Booking> bookings = bookingRepository.findByUserId(user.getId());
        context.setTotalBookings(bookings.size());

        // Get last booking
        if (!bookings.isEmpty()) {
            Booking lastBooking = bookings.get(bookings.size() - 1);
            context.setLastBooking(lastBooking);
            context.setLastBookingStatus(lastBooking.getStatus());
            context.setLastBookingDate(lastBooking.getCreatedAt());
        }

        // Get rejected bookings
        long rejectedCount = bookings.stream()
                .filter(b -> "REJECTED".equals(b.getStatus()))
                .count();
        context.setRejectedBookings((int) rejectedCount);

        // Get active policies
        List<UserPolicy> policies = userPolicyRepository.findByUserId(user.getId());
        context.setActivePolicies(policies.size());

        // Get pending bookings
        long pendingCount = bookings.stream()
                .filter(b -> "PENDING".equals(b.getStatus()) || "CONFIRMED".equals(b.getStatus()))
                .count();
        context.setPendingBookings((int) pendingCount);

        return context;
    }

    /**
     * Detect user query intent
     */
    private String detectIntent(String query) {
        String lowerQuery = query.toLowerCase();

        if (lowerQuery.contains("reject") || lowerQuery.contains("denied") || lowerQuery.contains("why")) {
            return "REJECTION_INQUIRY";
        }
        if (lowerQuery.contains("appointment") || lowerQuery.contains("booking")
                || lowerQuery.contains("consultation")) {
            return "APPOINTMENT_STATUS";
        }
        if (lowerQuery.contains("recommend") || lowerQuery.contains("suggest") || lowerQuery.contains("best policy")) {
            return "POLICY_RECOMMENDATION";
        }
        if (lowerQuery.contains("next") || lowerQuery.contains("what should") || lowerQuery.contains("how to")) {
            return "NEXT_STEPS";
        }
        if (lowerQuery.contains("policy") && lowerQuery.contains("active")) {
            return "POLICY_STATUS";
        }
        if (lowerQuery.contains("premium") || lowerQuery.contains("payment")) {
            return "PAYMENT_INQUIRY";
        }

        return "GENERAL_INQUIRY";
    }

    /**
     * Generate contextual response based on user history
     */
    private String generateContextualResponse(User user, UserContext context, String query, String intent) {
        StringBuilder response = new StringBuilder();

        switch (intent) {
            case "REJECTION_INQUIRY":
                if (context.getLastBooking() != null && "REJECTED".equals(context.getLastBookingStatus())) {
                    Booking rejected = context.getLastBooking();
                    response.append(String.format("Your recent consultation for %s was not approved. ",
                            rejected.getPolicy() != null ? rejected.getPolicy().getName() : "the policy"));

                    if (rejected.getRejectionReason() != null) {
                        response.append(String.format("\n\n**Reason:** %s\n\n", rejected.getRejectionReason()));
                    }

                    response.append("**What this means:**\n");
                    response.append("- The policy premium or coverage didn't match your current profile\n");
                    response.append("- This is not a permanent rejection - you can apply for other policies\n");
                    response.append("- We have alternative recommendations that better suit your needs\n\n");

                    response.append("**Next Steps:**\n");
                    response.append("1. Review our AI-recommended alternative policies\n");
                    response.append("2. Request consultation for a more suitable policy\n");
                    response.append("3. Update your profile if your income/situation has changed");
                } else {
                    response.append("I don't see any recent rejections in your account. ");
                    response.append("If you have questions about policy eligibility, I'm here to help!");
                }
                break;

            case "APPOINTMENT_STATUS":
                if (context.getLastBooking() != null) {
                    Booking last = context.getLastBooking();
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy");

                    response.append(String.format("**Your Last Consultation:**\n"));
                    response.append(String.format("- Policy: %s\n",
                            last.getPolicy() != null ? last.getPolicy().getName() : "N/A"));
                    response.append(String.format("- Status: %s\n", formatStatus(last.getStatus())));
                    response.append(String.format("- Requested: %s\n",
                            last.getCreatedAt().format(formatter)));

                    if ("PENDING".equals(last.getStatus())) {
                        response.append("\n**Status:** Awaiting agent assignment. ");
                        response.append("You'll be notified within 24-48 hours.");
                    } else if ("CONFIRMED".equals(last.getStatus())) {
                        response.append("\n**Status:** Your consultation is confirmed! ");
                        if (last.getStartTime() != null) {
                            response.append(String.format("Scheduled for %s.",
                                    last.getStartTime().format(DateTimeFormatter.ofPattern("MMM dd at hh:mm a"))));
                        }
                    } else if ("COMPLETED".equals(last.getStatus())) {
                        response.append("\n**Status:** Consultation completed. ");
                        response.append("The agent is reviewing your application.");
                    }
                } else {
                    response.append("You don't have any consultation requests yet. ");
                    response.append("Browse our policies and click 'Request Consultation' to get started!");
                }
                break;

            case "POLICY_RECOMMENDATION":
                response.append(String.format("Based on your profile:\n"));
                response.append(String.format("- Age: %d years\n", user.getAge()));
                response.append(String.format("- Annual Income: ₹%,.0f\n", user.getIncome()));
                response.append(String.format("- Active Policies: %d\n\n", context.getActivePolicies()));

                response.append("**I recommend:**\n");
                response.append("1. **Health Insurance** - Essential protection for medical emergencies\n");
                response.append("2. **Term Life Insurance** - Financial security for your dependents\n");
                response.append("3. **Auto Insurance** - If you own a vehicle\n\n");

                response.append("Would you like me to show you specific policies that match your budget and needs?");
                break;

            case "NEXT_STEPS":
                if (context.getLastBooking() != null) {
                    String status = context.getLastBookingStatus();

                    if ("REJECTED".equals(status)) {
                        response.append("**Recommended Next Steps:**\n\n");
                        response.append(
                                "1. **Review AI Recommendations** - I've identified 3 alternative policies that better match your profile\n");
                        response.append("2. **Request New Consultation** - Apply for a recommended policy\n");
                        response.append(
                                "3. **Update Profile** - If your income or situation has changed, update your profile for better matches\n");
                    } else if ("PENDING".equals(status)) {
                        response.append("**Your consultation is pending. Here's what happens next:**\n\n");
                        response.append(
                                "1. **Agent Assignment** (within 24-48 hours) - An expert will be assigned to review your request\n");
                        response.append("2. **Confirmation** - You'll receive appointment confirmation\n");
                        response.append("3. **Consultation** - Discuss your needs with the agent\n");
                        response.append("4. **Decision** - Approval or alternative recommendations\n");
                    } else if ("POLICY_ISSUED".equals(status)) {
                        response.append("**Congratulations! Your policy is active. Next steps:**\n\n");
                        response.append("1. **Download Policy Document** - Save for your records\n");
                        response.append("2. **Set Up Auto-Pay** - Never miss a premium payment\n");
                        response.append("3. **Add Nominees** - Ensure smooth claims process\n");
                        response.append("4. **Explore Add-ons** - Consider additional coverage options\n");
                    }
                } else {
                    response.append("**Getting Started:**\n\n");
                    response.append("1. **Browse Policies** - Explore our insurance options\n");
                    response.append("2. **Request Consultation** - Get expert guidance\n");
                    response.append("3. **Complete Profile** - Help us recommend the best policies\n");
                }
                break;

            case "POLICY_STATUS":
                if (context.getActivePolicies() > 0) {
                    response.append(String.format("You have **%d active %s**.\n\n",
                            context.getActivePolicies(),
                            context.getActivePolicies() == 1 ? "policy" : "policies"));
                    response.append(
                            "Visit 'My Policies' to view details, download documents, or manage your coverage.");
                } else {
                    response.append("You don't have any active policies yet. ");
                    response.append("Let me help you find the right coverage for your needs!");
                }
                break;

            case "PAYMENT_INQUIRY":
                response.append("**Payment Information:**\n\n");
                response.append("- **Premium Frequency:** Annual, Semi-Annual, or Monthly\n");
                response.append("- **Payment Methods:** Credit/Debit Card, Net Banking, UPI\n");
                response.append("- **Auto-Pay:** Set up automatic premium payments\n");
                response.append("- **Grace Period:** 30 days from due date\n\n");
                response.append("Need help with a specific payment? Let me know!");
                break;

            default:
                response.append("I'm your AI insurance assistant! I can help you with:\n\n");
                response.append("- Understanding policy recommendations\n");
                response.append("- Checking consultation status\n");
                response.append("- Explaining rejection reasons\n");
                response.append("- Guiding you through next steps\n");
                response.append("- Answering policy questions\n\n");
                response.append("What would you like to know?");
        }

        return response.toString();
    }

    /**
     * Get suggested actions based on context
     */
    private List<String> getSuggestedActions(User user, UserContext context, String intent) {
        List<String> actions = new java.util.ArrayList<>();

        if ("REJECTION_INQUIRY".equals(intent) && context.getRejectedBookings() > 0) {
            actions.add("View AI Recommendations");
            actions.add("Request New Consultation");
            actions.add("Update My Profile");
        } else if ("APPOINTMENT_STATUS".equals(intent)) {
            if ("PENDING".equals(context.getLastBookingStatus())) {
                actions.add("View Booking Details");
                actions.add("Cancel Booking");
            } else if ("CONFIRMED".equals(context.getLastBookingStatus())) {
                actions.add("View Appointment Time");
                actions.add("Reschedule");
            }
        } else if ("POLICY_RECOMMENDATION".equals(intent)) {
            actions.add("Browse Policies");
            actions.add("Get Personalized Recommendations");
            actions.add("Talk to an Agent");
        } else {
            actions.add("Browse Policies");
            actions.add("My Consultations");
            actions.add("My Policies");
        }

        return actions;
    }

    /**
     * Format status for display
     */
    private String formatStatus(String status) {
        switch (status) {
            case "PENDING":
                return "⏳ Pending Agent Assignment";
            case "CONFIRMED":
                return "✅ Confirmed";
            case "COMPLETED":
                return "🎯 Completed";
            case "POLICY_ISSUED":
                return "🎉 Policy Issued";
            case "REJECTED":
                return "❌ Not Approved";
            case "EXPIRED":
                return "⌛ Expired";
            case "CANCELLED":
                return "🚫 Cancelled";
            default:
                return status;
        }
    }

    /**
     * User Context DTO
     */
    public static class UserContext {
        private int totalBookings;
        private int activePolicies;
        private int pendingBookings;
        private int rejectedBookings;
        private Booking lastBooking;
        private String lastBookingStatus;
        private LocalDateTime lastBookingDate;

        // Getters and Setters
        public int getTotalBookings() {
            return totalBookings;
        }

        public void setTotalBookings(int totalBookings) {
            this.totalBookings = totalBookings;
        }

        public int getActivePolicies() {
            return activePolicies;
        }

        public void setActivePolicies(int activePolicies) {
            this.activePolicies = activePolicies;
        }

        public int getPendingBookings() {
            return pendingBookings;
        }

        public void setPendingBookings(int pendingBookings) {
            this.pendingBookings = pendingBookings;
        }

        public int getRejectedBookings() {
            return rejectedBookings;
        }

        public void setRejectedBookings(int rejectedBookings) {
            this.rejectedBookings = rejectedBookings;
        }

        public Booking getLastBooking() {
            return lastBooking;
        }

        public void setLastBooking(Booking lastBooking) {
            this.lastBooking = lastBooking;
        }

        public String getLastBookingStatus() {
            return lastBookingStatus;
        }

        public void setLastBookingStatus(String lastBookingStatus) {
            this.lastBookingStatus = lastBookingStatus;
        }

        public LocalDateTime getLastBookingDate() {
            return lastBookingDate;
        }

        public void setLastBookingDate(LocalDateTime lastBookingDate) {
            this.lastBookingDate = lastBookingDate;
        }
    }

    /**
     * Assistant Response DTO
     */
    public static class AssistantResponse {
        private String query;
        private String intent;
        private String answer;
        private UserContext context;
        private List<String> suggestedActions;
        private LocalDateTime timestamp;

        // Getters and Setters
        public String getQuery() {
            return query;
        }

        public void setQuery(String query) {
            this.query = query;
        }

        public String getIntent() {
            return intent;
        }

        public void setIntent(String intent) {
            this.intent = intent;
        }

        public String getAnswer() {
            return answer;
        }

        public void setAnswer(String answer) {
            this.answer = answer;
        }

        public UserContext getContext() {
            return context;
        }

        public void setContext(UserContext context) {
            this.context = context;
        }

        public List<String> getSuggestedActions() {
            return suggestedActions;
        }

        public void setSuggestedActions(List<String> suggestedActions) {
            this.suggestedActions = suggestedActions;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }
    }
}
