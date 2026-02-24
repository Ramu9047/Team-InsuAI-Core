package com.insurai.controller;

import com.insurai.model.SmartReminder;
import com.insurai.service.SmartReminderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Smart Reminder Controller
 * Provides endpoints for managing intelligent reminders
 */
@RestController
@RequestMapping("/api/reminders")
@CrossOrigin(origins = "*")
public class SmartReminderController {

    @Autowired
    private SmartReminderService smartReminderService;

    /**
     * Get all pending reminders for current user
     */
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('USER', 'AGENT', 'SUPER_ADMIN', 'COMPANY_ADMIN')")
    public ResponseEntity<List<SmartReminder>> getPendingReminders(@RequestParam Long userId) {
        List<SmartReminder> reminders = smartReminderService.getPendingReminders(userId);
        return ResponseEntity.ok(reminders);
    }

    /**
     * Get all reminders for current user
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('USER', 'AGENT', 'SUPER_ADMIN', 'COMPANY_ADMIN')")
    public ResponseEntity<List<SmartReminder>> getAllReminders(@RequestParam Long userId) {
        List<SmartReminder> reminders = smartReminderService.getAllReminders(userId);
        return ResponseEntity.ok(reminders);
    }

    /**
     * Mark reminder as sent/read
     */
    @PutMapping("/{reminderId}/mark-sent")
    @PreAuthorize("hasAnyRole('USER', 'AGENT', 'SUPER_ADMIN', 'COMPANY_ADMIN')")
    public ResponseEntity<String> markAsSent(@PathVariable Long reminderId) {
        smartReminderService.markAsSent(reminderId);
        return ResponseEntity.ok("Reminder marked as sent");
    }

    /**
     * Delete reminder
     */
    @DeleteMapping("/{reminderId}")
    @PreAuthorize("hasAnyRole('USER', 'AGENT', 'SUPER_ADMIN', 'COMPANY_ADMIN')")
    public ResponseEntity<String> deleteReminder(@PathVariable Long reminderId) {
        smartReminderService.deleteReminder(reminderId);
        return ResponseEntity.ok("Reminder deleted");
    }
}
