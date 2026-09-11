package com.ballpen.mes.dto;

import com.ballpen.mes.enums.RoleType;
import com.ballpen.mes.enums.UserStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEmployeeRequest {

    @NotBlank(message = "Employee code is required")
    private String employeeCode;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phone;

    @NotBlank(message = "Department is required")
    private String department;

    @NotNull(message = "Role is required")
    private RoleType role;

    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;
}
