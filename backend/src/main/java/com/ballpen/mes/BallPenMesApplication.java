package com.ballpen.mes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

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

    public static void main(String[] args) {
        SpringApplication.run(BallPenMesApplication.class, args);
    }
}
