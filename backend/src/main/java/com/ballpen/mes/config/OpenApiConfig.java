package com.ballpen.mes.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger / OpenAPI 3 Specification Configuration.
 * Configures JWT Bearer authorization header for Swagger UI testing.
 */
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "BearerAuth";

    @Bean
    public OpenAPI ballPenMesOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Ball Pen Assembly Line Production Tracking System (MES) API")
                        .description("REST API documentation for manufacturing orders, workstations, 8-stage assembly line, QC audits, packaging, and dispatch.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Manufacturing Systems Engineering")
                                .email("support@ballpen-mes.com")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
