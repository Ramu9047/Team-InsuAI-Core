package com.insurai.service;

import com.insurai.model.Booking;
import com.insurai.model.User;
import com.insurai.repository.BookingRepository;
import com.insurai.repository.PolicyRepository;
import com.insurai.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;
    private final PolicyRepository policyRepo;
    private final AIService aiService;
    private final AuditService auditService;

    public BookingService(BookingRepository bookingRepo, UserRepository userRepo,
            NotificationService notificationService, PolicyRepository policyRepo, AIService aiService,
            AuditService auditService) {
        this.bookingRepo = bookingRepo;
        this.userRepo = userRepo;
        this.notificationService = notificationService;
        this.policyRepo = policyRepo;
        this.aiService = aiService;
        this.auditService = auditService;
    }

    public double predictSuccess(@org.springframework.lang.NonNull Long bookingId) {
        Booking booking = bookingRepo.findById(java.util.Objects.requireNonNull(bookingId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        return aiService.predictAppointmentSuccess(booking);
    }

    public Booking createBooking(@org.springframework.lang.NonNull Long userId,
            @org.springframework.lang.NonNull Long agentId, String start, String end, Long policyId, String reason) {

        if (userId.equals(agentId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot book an appointment with yourself.");
        }
        // validation block start
        LocalDateTime startTime;
        LocalDateTime endTime;

        try {
            startTime = LocalDateTime.parse(start);
            endTime = LocalDateTime.parse(end);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date-time format");
        }

        if (startTime.isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot book appointment in the past");
        }

        if (endTime.isBefore(startTime) || endTime.equals(startTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        List<Booking> conflicts = bookingRepo.findConflicts(agentId, startTime, endTime);
        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Agent already booked for this time slot");
        }
        // validation block end

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Only clients can book appointments
        if (!"USER".equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Only clients with valid USER role can book appointments.");
        }

        User agent = userRepo.findById(agentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found"));

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setAgent(agent);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setStatus("PENDING");
        booking.setReason(reason);

        if (policyId != null) {
            com.insurai.model.Policy policy = policyRepo.findById(policyId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Policy not found"));
            booking.setPolicy(policy);
        }

        Booking saved = bookingRepo.save(booking);

        // Audit & Notify
        auditService.log("BOOKING_CREATED: ID " + saved.getId(), userId);

        // Send Persistent Notification to Agent
        notificationService.createNotification(
                agent,
                "New appointment request from " + user.getName() + " for " + startTime.toString(),
                "INFO");

        return saved;
    }

    // ... existing getters ...

    public List<Booking> getUserBookings(@org.springframework.lang.NonNull Long id) {
        return bookingRepo.findByUserId(id);
    }

    public List<Booking> getAgentBookings(@org.springframework.lang.NonNull Long id) {
        return bookingRepo.findByAgentId(id);
    }

    public List<Booking> getAllBookings() {
        return bookingRepo.findAll();
    }

    // ... existing ...
    public Booking updateStatus(@org.springframework.lang.NonNull Long id, String status) {
        Booking booking = bookingRepo.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Booking not found"));

        if ("APPROVED".equals(status) && booking.getStartTime().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot approve an appointment in the past.");
        }

        booking.setStatus(status);

        // Audit & Notify
        auditService.log("BOOKING_STATUS_UPDATE: ID " + booking.getId() + " to " + status, booking.getUser().getId()); // logging
                                                                                                                       // under
                                                                                                                       // user
                                                                                                                       // ID
                                                                                                                       // for
                                                                                                                       // now

        // Notify user of status change
        notificationService.createNotification(
                booking.getUser(),
                "Your appointment status updated to: " + status,
                "APPROVED".equals(status) ? "SUCCESS" : "INFO");

        return bookingRepo.save(booking);
    }

    // NEW: Get slot availability for the date
    // NEW: Get slot availability for the date
    public List<String> getAvailableSlots(String date, Long agentId) {
        // defined standard business hours
        List<String> allSlots = new java.util.ArrayList<>(List.of(
                "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"));

        // Parse date boundaries
        LocalDateTime startOfDay = java.time.LocalDate.parse(date).atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        // Fetch bookings for this agent on this day
        // We use findConflicts essentially, or a simplified check
        // Ideally we should use a custom repo method but for now iterating is fine for
        // <10 bookings/day
        List<Booking> dayBookings = bookingRepo.findConflicts(agentId, startOfDay, endOfDay);

        // Filter out occupied slots
        List<String> available = new java.util.ArrayList<>();
        for (String slot : allSlots) {
            LocalDateTime slotStart = LocalDateTime.parse(date + "T" + slot + ":00");
            boolean isTaken = dayBookings.stream().anyMatch(b ->
            // Strict equality check for simplified slots
            b.getStartTime().isEqual(slotStart)
                    // OR overlap check if bookings are variable length
                    || (b.getStartTime().isBefore(slotStart.plusHours(1)) && b.getEndTime().isAfter(slotStart)));

            if (!isTaken && slotStart.isAfter(LocalDateTime.now())) {
                available.add(slot);
            }
        }
        return available;
    }

    public void blockSlot(@org.springframework.lang.NonNull Long agentId, String start, String end) {
        LocalDateTime startTime = LocalDateTime.parse(start);
        LocalDateTime endTime = LocalDateTime.parse(end);

        List<Booking> conflicts = bookingRepo.findConflicts(agentId, startTime, endTime);
        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Slot already occupied");
        }

        User agent = userRepo.findById(agentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found"));

        Booking booking = new Booking();
        booking.setAgent(agent);
        booking.setUser(agent); // Self-booking for blocking
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setStatus("BLOCKED");
        booking.setCreatedAt(LocalDateTime.now());

        auditService.log("SLOT_BLOCKED: Agent " + agentId, agentId);

        bookingRepo.save(booking);
    }

    public Booking rescheduleBooking(Long bookingId, String start, String end) {
        Booking booking = bookingRepo.findById(java.util.Objects.requireNonNull(bookingId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        LocalDateTime startTime = LocalDateTime.parse(start);
        LocalDateTime endTime = LocalDateTime.parse(end);

        if (startTime.isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot reschedule to the past");
        }

        // Check for conflicts at new time
        List<Booking> conflicts = bookingRepo.findConflicts(booking.getAgent().getId(), startTime, endTime);
        // We must exclude the current booking from conflicts if it overlaps with itself
        // (though moving usually implies different slot)
        // Since we are changing time, if we move to a slot occupied by THIS booking,
        // it's fine.
        // But usually findConflicts checks overlap. If we are moving to a new slot, we
        // just check if any OTHER booking overlaps.
        // Simple check: if conflict list has > 0, check if it contains *other*
        // bookings.
        boolean hasConflict = conflicts.stream().anyMatch(b -> !b.getId().equals(bookingId));

        if (hasConflict) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Slot already occupied");
        }

        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setStatus("PENDING"); // Reset to pending for approval

        Booking saved = bookingRepo.save(booking);

        auditService.log("BOOKING_RESCHEDULED: ID " + booking.getId(), booking.getUser().getId());

        // Notify Agent
        notificationService.createNotification(
                booking.getAgent(),
                "Appointment #" + booking.getId() + " rescheduled by user to " + startTime.toString(),
                "INFO");

        return saved;
    }

    public com.insurai.dto.AnalyticsDTO getAnalytics() {
        List<Booking> all = bookingRepo.findAll();
        com.insurai.dto.AnalyticsDTO stats = new com.insurai.dto.AnalyticsDTO();

        // 1. Status Distribution
        java.util.Map<String, Long> statusMap = all.stream()
                .collect(java.util.stream.Collectors.groupingBy(Booking::getStatus,
                        java.util.stream.Collectors.counting()));
        stats.setStatusDistribution(statusMap);

        // 2. Agent Workload
        java.util.Map<String, Long> agentMap = all.stream()
                .collect(java.util.stream.Collectors.groupingBy(b -> b.getAgent().getName(),
                        java.util.stream.Collectors.counting()));
        stats.setAgentWorkload(agentMap);

        // 3. Peak Hours (Hour of day)
        java.util.Map<Integer, Long> hourMap = all.stream()
                .collect(java.util.stream.Collectors.groupingBy(b -> b.getStartTime().getHour(),
                        java.util.stream.Collectors.counting()));
        stats.setPeakHours(hourMap);

        // 4. Weekly Volume
        java.util.Map<String, Long> dateMap = all.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        b -> b.getStartTime().toLocalDate().toString(),
                        java.util.stream.Collectors.counting()));
        stats.setWeeklyVolume(dateMap);

        return stats;
    }
}
