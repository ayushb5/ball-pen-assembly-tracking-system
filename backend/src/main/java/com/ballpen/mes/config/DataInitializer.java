package com.ballpen.mes.config;

import com.ballpen.mes.entity.User;
import com.ballpen.mes.enums.RoleType;
import com.ballpen.mes.enums.UserStatus;
import com.ballpen.mes.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Ensures system login accounts exist with zero initial manufacturing predata,
 * allowing users to learn the software step-by-step by entering clean Indian factory data.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Creating default authentication accounts (Zero business pre-data mode)...");

            userRepository.save(User.builder()
                    .username("admin")
                    .email("admin@ballpen.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(RoleType.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .build());

            userRepository.save(User.builder()
                    .username("supervisor")
                    .email("supervisor@ballpen.com")
                    .passwordHash(passwordEncoder.encode("supervisor123"))
                    .role(RoleType.SUPERVISOR)
                    .status(UserStatus.ACTIVE)
                    .build());

            userRepository.save(User.builder()
                    .username("operator")
                    .email("operator@ballpen.com")
                    .passwordHash(passwordEncoder.encode("operator123"))
                    .role(RoleType.OPERATOR)
                    .status(UserStatus.ACTIVE)
                    .build());

            log.info("Default user accounts ready: admin, supervisor, operator.");
        }
    }
}
