package com.insurai.service;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.insurai.repository.BookingRepository;

@Service
@EnableScheduling
public class AppointmentStatusScheduler {

    private final BookingRepository bookingRepo;
    private final NotificationService notificationService;

    public AppointmentStatusScheduler(BookingRepository bookingRepo, NotificationService notificationService) {
        this.bookingRepo = bookingRepo;
        this.notificationService = notificationService;
    }

    @Scheduled(fixedRate = 60000) // every 1 minute
    public void updateStatuses() {
        LocalDateTime now = LocalDateTime.now();

        // Expire pending
        bookingRepo.expirePending(now);

        // Complete approved
        bookingRepo.completeApproved(now);

        // Reminders (T-24h)
        checkAndSendReminders(now.plusHours(24), "24 Hours");

        // Reminders (T-1h)
        checkAndSendReminders(now.plusHours(1), "1 Hour");
    }

    private void checkAndSendReminders(LocalDateTime targetTime, String label) {
        // Look for bookings starting within the target minute
        LocalDateTime end = targetTime.plusMinutes(1);

        var bookings = bookingRepo.findApprovedBetween(targetTime, end);
        for (var b : bookings) {
            notificationService.createNotification(
                    b.getUser(),
                    "Reminder: Appointment with " + b.getAgent().getName() + " in " + label,
                    "WARNING");
        }
    }
}
