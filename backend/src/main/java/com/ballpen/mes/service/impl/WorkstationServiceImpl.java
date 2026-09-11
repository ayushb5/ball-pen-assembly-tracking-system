package com.ballpen.mes.service.impl;

import com.ballpen.mes.dto.AssignWorkstationRequest;
import com.ballpen.mes.dto.CreateWorkstationRequest;
import com.ballpen.mes.dto.WorkstationDto;
import com.ballpen.mes.entity.Employee;
import com.ballpen.mes.entity.ProductionOrder;
import com.ballpen.mes.entity.Workstation;
import com.ballpen.mes.enums.WorkstationStatus;
import com.ballpen.mes.exception.BadRequestException;
import com.ballpen.mes.exception.ResourceNotFoundException;
import com.ballpen.mes.repository.EmployeeRepository;
import com.ballpen.mes.repository.ProductionOrderRepository;
import com.ballpen.mes.repository.WorkstationRepository;
import com.ballpen.mes.service.WorkstationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkstationServiceImpl implements WorkstationService {

    private final WorkstationRepository workstationRepository;
    private final EmployeeRepository employeeRepository;
    private final ProductionOrderRepository productionOrderRepository;

    @Override
    @Transactional(readOnly = true)
    public List<WorkstationDto> getAllWorkstations() {
        return workstationRepository.findAll().stream()
                .map(WorkstationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public WorkstationDto getWorkstationById(Long id) {
        Workstation ws = workstationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workstation", "id", id));
        return WorkstationDto.fromEntity(ws);
    }

    @Override
    @Transactional
    public WorkstationDto createWorkstation(CreateWorkstationRequest request) {
        if (workstationRepository.existsByStationCode(request.getStationCode())) {
            throw new BadRequestException("Workstation code '" + request.getStationCode() + "' already exists");
        }

        Employee employee = null;
        if (request.getAssignedEmployeeId() != null) {
            employee = employeeRepository.findById(request.getAssignedEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getAssignedEmployeeId()));
        }

        ProductionOrder order = null;
        if (request.getCurrentOrderId() != null) {
            order = productionOrderRepository.findById(request.getCurrentOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductionOrder", "id", request.getCurrentOrderId()));
        }

        Workstation ws = Workstation.builder()
                .stationCode(request.getStationCode())
                .stationName(request.getStationName())
                .stationType(request.getStationType())
                .assignedEmployee(employee)
                .currentOrder(order)
                .status(request.getStatus() != null ? request.getStatus() : WorkstationStatus.IDLE)
                .build();

        Workstation saved = workstationRepository.save(ws);
        log.info("Created workstation: {} - {}", saved.getStationCode(), saved.getStationName());
        return WorkstationDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public WorkstationDto updateWorkstation(Long id, CreateWorkstationRequest request) {
        Workstation ws = workstationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workstation", "id", id));

        if (!ws.getStationCode().equalsIgnoreCase(request.getStationCode())
                && workstationRepository.existsByStationCode(request.getStationCode())) {
            throw new BadRequestException("Workstation code '" + request.getStationCode() + "' already exists");
        }

        ws.setStationCode(request.getStationCode());
        ws.setStationName(request.getStationName());
        ws.setStationType(request.getStationType());

        if (request.getAssignedEmployeeId() != null) {
            Employee employee = employeeRepository.findById(request.getAssignedEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getAssignedEmployeeId()));
            ws.setAssignedEmployee(employee);
        } else {
            ws.setAssignedEmployee(null);
        }

        if (request.getCurrentOrderId() != null) {
            ProductionOrder order = productionOrderRepository.findById(request.getCurrentOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductionOrder", "id", request.getCurrentOrderId()));
            ws.setCurrentOrder(order);
        } else {
            ws.setCurrentOrder(null);
        }

        if (request.getStatus() != null) {
            ws.setStatus(request.getStatus());
        }

        Workstation updated = workstationRepository.save(ws);
        log.info("Updated workstation: {}", updated.getStationCode());
        return WorkstationDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public WorkstationDto updateStatus(Long id, WorkstationStatus status) {
        Workstation ws = workstationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workstation", "id", id));

        ws.setStatus(status);
        Workstation updated = workstationRepository.save(ws);
        log.info("Updated status for workstation {} to {}", ws.getStationCode(), status);
        return WorkstationDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public WorkstationDto assignOperatorAndOrder(Long id, AssignWorkstationRequest request) {
        Workstation ws = workstationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workstation", "id", id));

        if (request.getEmployeeId() != null) {
            Employee emp = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));
            ws.setAssignedEmployee(emp);
        } else {
            ws.setAssignedEmployee(null);
        }

        if (request.getOrderId() != null) {
            ProductionOrder order = productionOrderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductionOrder", "id", request.getOrderId()));
            ws.setCurrentOrder(order);
            ws.setStatus(WorkstationStatus.RUNNING);
        } else {
            ws.setCurrentOrder(null);
            if (ws.getStatus() == WorkstationStatus.RUNNING) {
                ws.setStatus(WorkstationStatus.IDLE);
            }
        }

        Workstation updated = workstationRepository.save(ws);
        log.info("Assigned operator and order to workstation {}", ws.getStationCode());
        return WorkstationDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteWorkstation(Long id) {
        Workstation ws = workstationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workstation", "id", id));
        workstationRepository.delete(ws);
        log.info("Deleted workstation: {}", ws.getStationCode());
    }
}
