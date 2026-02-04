package com.insurai.controller;

import com.insurai.dto.BookingRequest;
import com.insurai.model.Booking;
import com.insurai.service.BookingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public List<Booking> getAll() {
        return bookingService.getAllBookings();
    }

    @PostMapping
    public Booking create(@RequestBody BookingRequest request) {
        Long userId = request.getUserId();
        Long agentId = request.getAgentId();

        if (userId == null || agentId == null) {
            throw new IllegalArgumentException("User ID and Agent ID are required");
        }
        return bookingService.createBooking(
                userId,
                agentId,
                request.getStart(),
                request.getEnd(),
                request.getPolicyId(),
                request.getReason());
    }

    @GetMapping("/user/{id}")
    public List<Booking> userBookings(@PathVariable Long id) {
        return bookingService.getUserBookings(java.util.Objects.requireNonNull(id));
    }

    @GetMapping("/agent/{id}")
    public List<Booking> agentBookings(@PathVariable Long id) {
        return bookingService.getAgentBookings(java.util.Objects.requireNonNull(id));
    }

    @PutMapping("/{id}/status")
    public Booking updateStatus(@PathVariable Long id,
            @RequestParam String status) {
        return bookingService.updateStatus(java.util.Objects.requireNonNull(id), status);
    }

    @PostMapping("/block")
    public void blockSlot(@RequestBody BookingRequest request) {
        Long agentId = request.getAgentId();
        if (agentId == null) {
            throw new IllegalArgumentException("Agent ID is required");
        }
        bookingService.blockSlot(agentId, request.getStart(), request.getEnd());
    }

    @PutMapping("/{id}/reschedule")
    public Booking reschedule(@PathVariable Long id, @RequestBody BookingRequest request) {
        return bookingService.rescheduleBooking(id, request.getStart(), request.getEnd());
    }

    @GetMapping("/availability")
    public List<String> getAvailability(@RequestParam String date, @RequestParam Long agentId) {
        return bookingService.getAvailableSlots(date, agentId);
    }
}
