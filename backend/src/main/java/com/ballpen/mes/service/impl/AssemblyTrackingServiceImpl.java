package com.ballpen.mes.service.impl;

import com.ballpen.mes.dto.AssemblyTrackingDto;
import com.ballpen.mes.dto.UpdateStageRequest;
import com.ballpen.mes.entity.AssemblyTracking;
import com.ballpen.mes.entity.Employee;
import com.ballpen.mes.entity.Packaging;
import com.ballpen.mes.entity.ProductionOrder;
import com.ballpen.mes.enums.AssemblyStatus;
import com.ballpen.mes.enums.OrderStatus;
import com.ballpen.mes.exception.ResourceNotFoundException;
import com.ballpen.mes.repository.AssemblyTrackingRepository;
import com.ballpen.mes.repository.EmployeeRepository;
import com.ballpen.mes.repository.PackagingRepository;
import com.ballpen.mes.repository.ProductionOrderRepository;
import com.ballpen.mes.service.AssemblyTrackingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AssemblyTrackingServiceImpl implements AssemblyTrackingService {

    private final AssemblyTrackingRepository assemblyTrackingRepository;
    private final ProductionOrderRepository productionOrderRepository;
    private final PackagingRepository packagingRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AssemblyTrackingDto> getAllTracking() {
        return assemblyTrackingRepository.findAll().stream()
                .sorted(Comparator.comparing(
                        (AssemblyTracking t) -> t.getProductionOrder() != null ? t.getProductionOrder().getId() : 0L)
                        .thenComparingInt(t -> t.getStage() != null ? t.getStage().ordinal() : 0))
                .map(AssemblyTrackingDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssemblyTrackingDto> getTrackingByOrderId(Long orderId) {
        return assemblyTrackingRepository.findByProductionOrderIdOrderByIdAsc(orderId).stream()
                .sorted(Comparator.comparingInt(t -> t.getStage() != null ? t.getStage().ordinal() : 0))
                .map(AssemblyTrackingDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AssemblyTrackingDto getTrackingById(Long id) {
        AssemblyTracking track = assemblyTrackingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AssemblyTracking", "id", id));
        return AssemblyTrackingDto.fromEntity(track);
    }

    @Override
    @Transactional
    public AssemblyTrackingDto updateStage(Long id, UpdateStageRequest request) {
        AssemblyTracking track = assemblyTrackingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AssemblyTracking", "id", id));

        if (request.getStatus() != null) {
            track.setStatus(request.getStatus());
            if (request.getStatus() == AssemblyStatus.IN_PROGRESS) {
                if (track.getStartedTime() == null) {
                    track.setStartedTime(LocalDateTime.now());
                }
            } else if (request.getStatus() == AssemblyStatus.COMPLETED) {
                if (track.getCompletedTime() == null) {
                    track.setCompletedTime(LocalDateTime.now());
                }
                if (track.getStartedTime() == null) {
                    track.setStartedTime(track.getCompletedTime().minusMinutes(1));
                } else if (track.getStartedTime().isAfter(track.getCompletedTime())) {
                    track.setStartedTime(track.getCompletedTime().minusMinutes(1));
                }
            }
        }

        if (request.getAssignedEmployeeId() != null) {
            Employee emp = employeeRepository.findById(request.getAssignedEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getAssignedEmployeeId()));
            track.setAssignedEmployee(emp);
        }

        if (request.getStartedTime() != null) {
            track.setStartedTime(request.getStartedTime());
        }

        if (request.getCompletedTime() != null) {
            track.setCompletedTime(request.getCompletedTime());
            if (track.getStartedTime() == null) {
                track.setStartedTime(track.getCompletedTime().minusMinutes(1));
            } else if (track.getStartedTime().isAfter(track.getCompletedTime())) {
                track.setStartedTime(track.getCompletedTime().minusMinutes(1));
            }
        }

        if (request.getRemarks() != null) {
            track.setRemarks(request.getRemarks());
        }

        AssemblyTracking updated = assemblyTrackingRepository.save(track);
        checkAndUpdateOrderStatus(track.getProductionOrder());
        return AssemblyTrackingDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public AssemblyTrackingDto startStage(Long id, Long employeeId, String remarks) {
        AssemblyTracking track = assemblyTrackingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AssemblyTracking", "id", id));

        track.setStatus(AssemblyStatus.IN_PROGRESS);
        if (track.getStartedTime() == null || track.getCompletedTime() != null) {
            track.setStartedTime(LocalDateTime.now());
            track.setCompletedTime(null);
        }

        if (employeeId != null) {
            Employee emp = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
            track.setAssignedEmployee(emp);
        }

        if (remarks != null && !remarks.isBlank()) {
            track.setRemarks(remarks);
        }

        // Also ensure production order is IN_PROGRESS
        ProductionOrder order = track.getProductionOrder();
        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.IN_PROGRESS);
            productionOrderRepository.save(order);
        }

        AssemblyTracking updated = assemblyTrackingRepository.save(track);
        log.info("Started stage {} for order {}", track.getStage(), order.getOrderNumber());
        return AssemblyTrackingDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public AssemblyTrackingDto completeStage(Long id, String remarks) {
        AssemblyTracking track = assemblyTrackingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AssemblyTracking", "id", id));

        track.setStatus(AssemblyStatus.COMPLETED);
        if (track.getCompletedTime() == null) {
            track.setCompletedTime(LocalDateTime.now());
        }

        if (track.getStartedTime() == null) {
            track.setStartedTime(track.getCompletedTime().minusMinutes(1));
        } else if (track.getStartedTime().isAfter(track.getCompletedTime())) {
            track.setStartedTime(track.getCompletedTime().minusMinutes(1));
        }

        if (remarks != null && !remarks.isBlank()) {
            track.setRemarks(remarks);
        }

        AssemblyTracking updated = assemblyTrackingRepository.save(track);
        log.info("Completed stage {} for order {}", track.getStage(), track.getProductionOrder().getOrderNumber());

        checkAndUpdateOrderStatus(track.getProductionOrder());
        return AssemblyTrackingDto.fromEntity(updated);
    }

    private void checkAndUpdateOrderStatus(ProductionOrder order) {
        if (order == null)
            return;

        List<AssemblyTracking> allStages = assemblyTrackingRepository
                .findByProductionOrderIdOrderByIdAsc(order.getId());
        boolean allCompleted = allStages.stream().allMatch(s -> s.getStatus() == AssemblyStatus.COMPLETED);

        if (allCompleted) {
            order.setStatus(OrderStatus.COMPLETED);
            List<Packaging> allPkgs = packagingRepository.findByProductionOrderId(order.getId());
            int totalPackaged = allPkgs.stream().mapToInt(Packaging::getQuantity).sum();
            if (totalPackaged > 0) {
                order.setProducedQuantity(totalPackaged);
            } else if (order.getProducedQuantity() == null || order.getProducedQuantity() == 0) {
                order.setProducedQuantity(order.getOrderedQuantity());
            }
            productionOrderRepository.save(order);
            log.info("All 8 stages finished! Marked order {} as COMPLETED (produced: {})", order.getOrderNumber(),
                    order.getProducedQuantity());
        } else {
            boolean anyStarted = allStages.stream().anyMatch(
                    s -> s.getStatus() == AssemblyStatus.IN_PROGRESS || s.getStatus() == AssemblyStatus.COMPLETED);
            if (anyStarted && order.getStatus() == OrderStatus.PENDING) {
                order.setStatus(OrderStatus.IN_PROGRESS);
                productionOrderRepository.save(order);
            }
        }
    }
}
