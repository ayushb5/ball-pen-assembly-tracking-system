package com.ballpen.mes.service.impl;

import com.ballpen.mes.dto.CreateEmployeeRequest;
import com.ballpen.mes.dto.EmployeeDto;
import com.ballpen.mes.entity.Employee;
import com.ballpen.mes.enums.UserStatus;
import com.ballpen.mes.exception.BadRequestException;
import com.ballpen.mes.exception.ResourceNotFoundException;
import com.ballpen.mes.repository.EmployeeRepository;
import com.ballpen.mes.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDto> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(EmployeeDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeDto getEmployeeById(Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return EmployeeDto.fromEntity(emp);
    }

    @Override
    @Transactional
    public EmployeeDto createEmployee(CreateEmployeeRequest request) {
        if (employeeRepository.existsByEmployeeCode(request.getEmployeeCode())) {
            throw new BadRequestException("Employee code '" + request.getEmployeeCode() + "' already exists");
        }

        Employee emp = Employee.builder()
                .employeeCode(request.getEmployeeCode())
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .department(request.getDepartment())
                .role(request.getRole())
                .status(request.getStatus() != null ? request.getStatus() : UserStatus.ACTIVE)
                .build();

        Employee saved = employeeRepository.save(emp);
        log.info("Created new employee: {} ({})", saved.getFullName(), saved.getEmployeeCode());
        return EmployeeDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public EmployeeDto updateEmployee(Long id, CreateEmployeeRequest request) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        if (!emp.getEmployeeCode().equals(request.getEmployeeCode())
                && employeeRepository.existsByEmployeeCode(request.getEmployeeCode())) {
            throw new BadRequestException("Employee code '" + request.getEmployeeCode() + "' already exists");
        }

        emp.setEmployeeCode(request.getEmployeeCode());
        emp.setFullName(request.getFullName());
        emp.setPhone(request.getPhone());
        emp.setDepartment(request.getDepartment());
        emp.setRole(request.getRole());
        if (request.getStatus() != null) {
            emp.setStatus(request.getStatus());
        }

        Employee updated = employeeRepository.save(emp);
        log.info("Updated employee: {} ({})", updated.getFullName(), updated.getEmployeeCode());
        return EmployeeDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        employeeRepository.delete(emp);
        log.info("Deleted employee with ID: {}", id);
    }

    @Override
    @Transactional
    public EmployeeDto toggleStatus(Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        emp.setStatus(emp.getStatus() == UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE);
        Employee updated = employeeRepository.save(emp);
        log.info("Toggled employee {} status to {}", emp.getEmployeeCode(), emp.getStatus());
        return EmployeeDto.fromEntity(updated);
    }
}
