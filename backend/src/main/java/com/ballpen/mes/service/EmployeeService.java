package com.ballpen.mes.service;

import com.ballpen.mes.dto.CreateEmployeeRequest;
import com.ballpen.mes.dto.EmployeeDto;

import java.util.List;

public interface EmployeeService {

    List<EmployeeDto> getAllEmployees();

    EmployeeDto getEmployeeById(Long id);

    EmployeeDto createEmployee(CreateEmployeeRequest request);

    EmployeeDto updateEmployee(Long id, CreateEmployeeRequest request);

    void deleteEmployee(Long id);

    EmployeeDto toggleStatus(Long id);
}
