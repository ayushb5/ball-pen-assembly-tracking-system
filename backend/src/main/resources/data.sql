-- ==============================================================================
-- Ball Pen Assembly Line Production Tracking System (MES)
-- Default System Users (BCrypt hashed: admin123, supervisor123, operator123)
-- Zero Business Pre-Data: All tables start empty for step-by-step learning
-- ==============================================================================

INSERT INTO users (id, username, email, password_hash, role, status) VALUES
(1, 'admin', 'admin@ballpen.com', '$2a$10$v7Cc0Ulow0VuM660OtRXxemaW3vWcQSxvm9LFKOIZzT5anofNNF/G', 'ADMIN', 'ACTIVE'),
(2, 'supervisor', 'supervisor@ballpen.com', '$2a$10$Iy5JWq48rfTp6DUaUuaYJO5.1dveaRHNbNd1ld7LmRIJhybWZ2qfi', 'SUPERVISOR', 'ACTIVE'),
(3, 'operator', 'operator@ballpen.com', '$2a$10$aby.0oW7SSK3oVef0hOkG.VZiX0WPW4TEWdDuXtItKSw78pquO3MW', 'OPERATOR', 'ACTIVE')
ON DUPLICATE KEY UPDATE username=username;
