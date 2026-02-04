package com.insurai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class InsuraiBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(InsuraiBackendApplication.class, args);
	}

}
