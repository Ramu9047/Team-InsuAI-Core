package com.insurai.controller;

import com.insurai.model.User;
import com.insurai.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserRepository userRepo;

    public UserController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public java.util.List<User> getAllUsers() {
        return userRepo.findAll();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody User updates) {
        return userRepo.findById(java.util.Objects.requireNonNull(id)).map(user -> {
            // Update only allowed fields
            if (updates.getName() != null)
                user.setName(updates.getName());
            if (updates.getPhone() != null)
                user.setPhone(updates.getPhone());
            if (updates.getAge() != null)
                user.setAge(updates.getAge());
            if (updates.getIncome() != null)
                user.setIncome(updates.getIncome());
            if (updates.getDependents() != null)
                user.setDependents(updates.getDependents());
            if (updates.getHealthInfo() != null)
                user.setHealthInfo(updates.getHealthInfo());

            // Agent specific
            if (updates.getSpecialization() != null)
                user.setSpecialization(updates.getSpecialization());
            if (updates.getBio() != null)
                user.setBio(updates.getBio());

            return ResponseEntity.ok(userRepo.save(java.util.Objects.requireNonNull(user)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/admin")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adminUpdateUser(@PathVariable Long id, @RequestBody User updates) {
        return userRepo.findById(java.util.Objects.requireNonNull(id)).map(user -> {
            if (updates.getName() != null)
                user.setName(updates.getName());
            if (updates.getEmail() != null)
                user.setEmail(updates.getEmail());
            if (updates.getRole() != null)
                user.setRole(updates.getRole());
            if (updates.getIsActive() != null)
                user.setIsActive(updates.getIsActive());

            // Also allow updating standard fields
            if (updates.getPhone() != null)
                user.setPhone(updates.getPhone());
            // ... can add others if needed

            return ResponseEntity.ok(userRepo.save(java.util.Objects.requireNonNull(user)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Long id) {
        return userRepo.findById(java.util.Objects.requireNonNull(id))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
