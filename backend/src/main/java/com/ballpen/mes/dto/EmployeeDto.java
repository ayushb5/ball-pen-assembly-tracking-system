package com.ballpen.mes.dto;

import com.ballpen.mes.entity.Employee;
import com.ballpen.mes.enums.RoleType;
import com.ballpen.mes.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDto {

    private Long id;
    private String employeeCode;
    private String fullName;
    private String phone;
    private String department;
    private RoleType role;
    private UserStatus status;
    private Long userId;
    private String username;
    private LocalDateTime createdAt;

    public static EmployeeDto fromEntity(Employee emp) {
        if (emp == null) return null;
        return EmployeeDto.builder()
                .id(emp.getId())
                .employeeCode(emp.getEmployeeCode())
                .fullName(emp.getFullName())
                .phone(emp.getPhone())
                .department(emp.getDepartment())
                .role(emp.getRole())
                .status(emp.getStatus())
                .userId(emp.getUser() != null ? emp.getUser().getId() : null)
                .username(emp.getUser() != null ? emp.getUser().getUsername() : null)
                .createdAt(emp.getCreatedAt())
                .build();
    }
}
