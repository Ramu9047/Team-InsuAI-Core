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
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;

    public AuthController(UserRepository userRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.emailService = emailService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user.getEmail() == null || user.getPassword() == null || user.getRole() == null) {
            return ResponseEntity.badRequest().body("Missing required fields");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        user.setAvailable(false);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User request) {
        return userRepository.findByEmail(request.getEmail())
                .map(user -> {
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
                })
                .orElse(ResponseEntity.status(401).body("Invalid email or password"));
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
        } catch (Exception e) {
            System.err.println("Email failed: " + e.getMessage());
        }

        return ResponseEntity.ok("Reset link sent to email (Check console if no SMTP)");
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
