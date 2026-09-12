package com.ballpen.mes;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

/**
 * Main Entry Point for Ball Pen Assembly Line Production Tracking System (MES).
 *
 * This Spring Boot application manages:
 * - Production Orders & Assembly Line Tracking (10 Sequential Stages)
 * - Workstation Status & Operator Allocations
 * - Quality Inspection Audits (Pass / Reject tracking)
 * - Finished Goods & Customer Dispatch
 *
 * Accessible on: http://localhost:8080
 * Swagger UI:   http://localhost:8080/swagger-ui/index.html
 */
@SpringBootApplication
public class BallPenMesApplication {

    @PostConstruct
    public void init() {
        // Enforce Indian Standard Time (IST / Asia/Kolkata / UTC+05:30)
        // Ensures cloud containers (e.g. Railway, Docker, AWS) running in UTC
        // execute all business logic, timestamps, and database operations in IST.
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
    }

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
        SpringApplication.run(BallPenMesApplication.class, args);
    }
}
