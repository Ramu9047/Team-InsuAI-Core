package com.insurai.controller;

import com.insurai.model.Notification;

import com.insurai.repository.UserRepository;
import com.insurai.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private com.insurai.repository.CompanyRepository companyRepo;

    @GetMapping
    public List<Notification> getUnreadNotifications(Authentication auth) {
        String email = auth.getName();
        return userRepo.findByEmail(email)
                .map(user -> notificationService.getUnreadNotifications(user.getId()))
                .or(() -> companyRepo.findFirstByEmailIgnoreCase(email)
                        .map(company -> notificationService.getUnreadNotificationsForCompany(company.getId())))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User/Company not found"));
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable long id) {
        notificationService.markAsRead(id);
    }

    @PutMapping("/read-all")
    public void markAllAsRead(Authentication auth) {
        String email = auth.getName();
        userRepo.findByEmail(email).ifPresent(u -> notificationService.markAllAsRead(u.getId()));
        companyRepo.findFirstByEmailIgnoreCase(email)
                .ifPresent(c -> notificationService.markAllAsReadForCompany(c.getId()));
    }
}
