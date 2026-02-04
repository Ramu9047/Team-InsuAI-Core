package com.insurai.repository;

// import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class Appointment {
    @Id @GeneratedValue
    private Long id;
    // private String status;
    // private LocalDate date;
}
