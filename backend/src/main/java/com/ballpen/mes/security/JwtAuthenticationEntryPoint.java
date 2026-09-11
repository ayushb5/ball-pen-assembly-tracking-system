package com.ballpen.mes.security;

import com.ballpen.mes.dto.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Returns a standardized 401 Unauthorized JSON response when unauthenticated requests access secured APIs.
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .success(false)
                .message("Unauthorized: Full authentication is required to access this resource")
                .status(HttpStatus.UNAUTHORIZED.value())
                .errors(List.of(authException.getMessage()))
                .timestamp(LocalDateTime.now())
                .build();

        objectMapper.findAndRegisterModules();
        response.getOutputStream().println(objectMapper.writeValueAsString(errorResponse));
    }
}
