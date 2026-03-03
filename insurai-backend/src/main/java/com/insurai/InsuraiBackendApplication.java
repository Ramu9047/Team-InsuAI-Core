package com.insurai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@org.springframework.boot.context.properties.EnableConfigurationProperties({
		com.insurai.config.JwtProperties.class,
		com.insurai.config.GroqProperties.class
})
public class InsuraiBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(InsuraiBackendApplication.class, args);
	}

}
