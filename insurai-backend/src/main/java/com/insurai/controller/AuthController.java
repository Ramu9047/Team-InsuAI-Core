package com.insurai.controller;

import com.insurai.model.User;
import com.insurai.repository.UserRepository;
import com.insurai.security.JwtTokenProvider;
import com.insurai.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserRepository userRepository;
    private final com.insurai.repository.CompanyRepository companyRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final com.insurai.service.NotificationService notificationService;

    public AuthController(UserRepository userRepository,
            com.insurai.repository.CompanyRepository companyRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            EmailService emailService,
            com.insurai.service.NotificationService notificationService) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user.getEmail() == null || user.getPassword() == null || user.getRole() == null) {
            return ResponseEntity.badRequest().body("Missing required fields");
        }

        // Security: Block SuperAdmin creation
        if ("SUPER_ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(403).body("Registration is restricted for this role.");
        }

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        user.setAvailable(false);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User saved = userRepository.save(user);

        // Notify Admins for real-time dashboard update
        notificationService.broadcastUpdate("admin-updates", "NEW_USER_REGISTERED");

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User request) {
        // 1. Try User Login
        var userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return ResponseEntity.status(401).body("Invalid email or password");
            }

            if (Boolean.FALSE.equals(user.getIsActive())) {
                return ResponseEntity.status(403).body("Account is deactivated. Contact Admin.");
            }

            // Generate Token
            String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole(), user.getId());

            // Auto-set Agent to Online
            if ("AGENT".equals(user.getRole())) {
                user.setAvailable(true);
                userRepository.save(user);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("token", token);

            return ResponseEntity.ok(response);
        }

        // 2. Try Company Login
        var companyOpt = companyRepository.findByEmail(request.getEmail());
        if (companyOpt.isPresent()) {
            com.insurai.model.Company company = companyOpt.get();
            if (!passwordEncoder.matches(request.getPassword(), company.getPassword())) {
                return ResponseEntity.status(401).body("Invalid email or password");
            }

            if (Boolean.FALSE.equals(company.getIsActive())) { // Assuming Company has isActive
                return ResponseEntity.status(403).body("Company account is deactivated. Contact Admin.");
            }

            // Generate Token
            String token = jwtTokenProvider.generateToken(company.getEmail(), "COMPANY", company.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("user", company); // Sends company object with role "COMPANY_ADMIN" via getter
            response.put("token", token);

            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body("Invalid email or password");
    }

    @GetMapping("/forgot")
    public ResponseEntity<?> forgot(@RequestParam String email) {
        User u = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        String token = UUID.randomUUID().toString();
        u.setResetToken(token);
        userRepository.save(u);

        // Send Email
        String link = "http://localhost:3000/reset-password?token=" + token;
        try {
            emailService.send(email, "Reset Your Password", "Click here to reset: " + link);
            return ResponseEntity.ok("Reset link sent to email.");
        } catch (Exception e) {
            System.err.println("Email failed: " + e.getMessage());
            // For dev/demo only: Return link if email fails
            return ResponseEntity.ok("Email failed. Dev Link: " + link);
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<?> reset(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String newPassword = payload.get("newPassword");

        User u = userRepository.findByResetToken(token).orElseThrow(() -> new RuntimeException("Invalid token"));
        u.setPassword(passwordEncoder.encode(newPassword));
        u.setResetToken(null);
        userRepository.save(u);

        return ResponseEntity.ok("Password updated successfully");
    }

    @GetMapping("/verify")
    public String verify(@RequestParam String email) {
        User u = userRepository.findByEmail(email).orElseThrow();
        u.setVerified(true);
        userRepository.save(u);
        return "Account verified successfully!";
    }
}
