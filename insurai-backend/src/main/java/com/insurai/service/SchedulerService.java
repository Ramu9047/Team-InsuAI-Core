package com.insurai.service;

import com.insurai.repository.BookingRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class SchedulerService {

    private final BookingRepository bookingRepo;

    public SchedulerService(BookingRepository bookingRepo) {
        this.bookingRepo = bookingRepo;
    }

    // Run every minute
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void autoUpdateBookings() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Expire Pending bookings that are past their time
        // If a booking is PENDING and startTime < now, it should be expired/cancelled
        // (or maybe just if endTime < now)
        // Let's say if it hasn't been approved by the time it happens, it's expired.
        bookingRepo.expirePending(now);

        // 2. Expire Approved bookings that have finished without agent action
        // If booking is APPROVED/CONFIRMED and endTime < now, mark as EXPIRED
        bookingRepo.expireUnattended(now);

        System.out.println("Scheduler run: Updated booking statuses at " + now);
    }
}
