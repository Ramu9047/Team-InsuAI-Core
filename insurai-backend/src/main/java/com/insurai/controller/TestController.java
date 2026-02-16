package com.insurai.controller;

import com.insurai.service.TestDataGeneratorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    private final TestDataGeneratorService testDataGeneratorService;

    public TestController(TestDataGeneratorService testDataGeneratorService) {
        this.testDataGeneratorService = testDataGeneratorService;
    }

    /**
     * Trigger large-scale test data generation.
     * Accessible publicly for development/testing purposes.
     */
    @PostMapping("/seed")
    public ResponseEntity<?> seedData() {
        try {
            long startTime = System.currentTimeMillis();
            testDataGeneratorService.generateTestData();
            long duration = System.currentTimeMillis() - startTime;

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Test data generated successfully!");
            response.put("duration_ms", duration);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Data generation failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
