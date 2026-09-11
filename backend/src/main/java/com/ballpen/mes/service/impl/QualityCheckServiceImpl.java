package com.ballpen.mes.service.impl;

import com.ballpen.mes.dto.CreateQualityCheckRequest;
import com.ballpen.mes.dto.QualityCheckDto;
import com.ballpen.mes.entity.AssemblyTracking;
import com.ballpen.mes.entity.Employee;
import com.ballpen.mes.entity.ProductionOrder;
import com.ballpen.mes.entity.QualityCheck;
import com.ballpen.mes.enums.AssemblyStage;
import com.ballpen.mes.enums.AssemblyStatus;
import com.ballpen.mes.enums.QcStatus;
import com.ballpen.mes.exception.BadRequestException;
import com.ballpen.mes.exception.ResourceNotFoundException;
import com.ballpen.mes.repository.AssemblyTrackingRepository;
import com.ballpen.mes.repository.EmployeeRepository;
import com.ballpen.mes.repository.ProductionOrderRepository;
import com.ballpen.mes.repository.QualityCheckRepository;
import com.ballpen.mes.service.QualityCheckService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class QualityCheckServiceImpl implements QualityCheckService {

    private final QualityCheckRepository qualityCheckRepository;
    private final ProductionOrderRepository productionOrderRepository;
    private final EmployeeRepository employeeRepository;
    private final AssemblyTrackingRepository assemblyTrackingRepository;

    @Override
    @Transactional(readOnly = true)
    public List<QualityCheckDto> getAllQualityChecks() {
        return qualityCheckRepository.findAll().stream()
                .map(QualityCheckDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public QualityCheckDto getQualityCheckById(Long id) {
        QualityCheck qc = qualityCheckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QualityCheck", "id", id));
        return QualityCheckDto.fromEntity(qc);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityCheckDto> getQualityChecksByOrderId(Long orderId) {
        return qualityCheckRepository.findByProductionOrderId(orderId).stream()
                .map(QualityCheckDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public QualityCheckDto createQualityCheck(CreateQualityCheckRequest request) {
        if (qualityCheckRepository.existsByCheckNumber(request.getCheckNumber())) {
            throw new BadRequestException("Check number '" + request.getCheckNumber() + "' already exists");
        }

        ProductionOrder order = productionOrderRepository.findById(request.getProductionOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductionOrder", "id", request.getProductionOrderId()));

        Employee inspector = employeeRepository.findById(request.getInspectorId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getInspectorId()));

        QcStatus determinedStatus = request.getStatus();
        if (determinedStatus == null) {
            double passRatio = (double) request.getPassedQuantity() / request.getCheckedQuantity();
            determinedStatus = passRatio >= 0.95 ? QcStatus.PASSED : (passRatio >= 0.85 ? QcStatus.CONDITIONAL_PASS : QcStatus.REJECTED);
        }

        QualityCheck qc = QualityCheck.builder()
                .checkNumber(request.getCheckNumber())
                .productionOrder(order)
                .checkedQuantity(request.getCheckedQuantity())
                .passedQuantity(request.getPassedQuantity())
                .rejectedQuantity(request.getRejectedQuantity())
                .rejectionReason(request.getRejectionReason())
                .inspector(inspector)
                .inspectionDate(request.getInspectionDate())
                .status(determinedStatus)
                .notes(request.getNotes())
                .build();

        QualityCheck saved = qualityCheckRepository.save(qc);

        // Update corresponding assembly tracking stage if exists
        Optional<AssemblyTracking> qcStageOpt = assemblyTrackingRepository
                .findByProductionOrderIdAndStage(order.getId(), AssemblyStage.QUALITY_CHECK);
        if (qcStageOpt.isPresent()) {
            AssemblyTracking qcStage = qcStageOpt.get();
            qcStage.setStatus(AssemblyStatus.COMPLETED);
            if (qcStage.getCompletedTime() == null) {
                qcStage.setCompletedTime(LocalDateTime.now());
            }
            qcStage.setAssignedEmployee(inspector);
            qcStage.setRemarks(String.format("QC Logged: %d passed, %d rejected (%s)",
                    saved.getPassedQuantity(), saved.getRejectedQuantity(), saved.getStatus()));
            assemblyTrackingRepository.save(qcStage);
        }

        log.info("Created quality check {} for order {}", saved.getCheckNumber(), order.getOrderNumber());
        return QualityCheckDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public QualityCheckDto updateQualityCheck(Long id, CreateQualityCheckRequest request) {
        QualityCheck qc = qualityCheckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QualityCheck", "id", id));

        if (!qc.getCheckNumber().equalsIgnoreCase(request.getCheckNumber())
                && qualityCheckRepository.existsByCheckNumber(request.getCheckNumber())) {
            throw new BadRequestException("Check number '" + request.getCheckNumber() + "' already exists");
        }

        ProductionOrder order = productionOrderRepository.findById(request.getProductionOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductionOrder", "id", request.getProductionOrderId()));

        Employee inspector = employeeRepository.findById(request.getInspectorId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getInspectorId()));

        qc.setCheckNumber(request.getCheckNumber());
        qc.setProductionOrder(order);
        qc.setCheckedQuantity(request.getCheckedQuantity());
        qc.setPassedQuantity(request.getPassedQuantity());
        qc.setRejectedQuantity(request.getRejectedQuantity());
        qc.setRejectionReason(request.getRejectionReason());
        qc.setInspector(inspector);
        qc.setInspectionDate(request.getInspectionDate());
        if (request.getStatus() != null) {
            qc.setStatus(request.getStatus());
        }
        qc.setNotes(request.getNotes());

        QualityCheck updated = qualityCheckRepository.save(qc);
        log.info("Updated quality check {}", updated.getCheckNumber());
        return QualityCheckDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteQualityCheck(Long id) {
        QualityCheck qc = qualityCheckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QualityCheck", "id", id));
        qualityCheckRepository.delete(qc);
        log.info("Deleted quality check {}", qc.getCheckNumber());
    }
}
