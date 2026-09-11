package com.ballpen.mes;

import com.ballpen.mes.dto.CreateQualityCheckRequest;
import com.ballpen.mes.dto.QualityCheckDto;
import com.ballpen.mes.entity.Employee;
import com.ballpen.mes.entity.ProductionOrder;
import com.ballpen.mes.entity.QualityCheck;
import com.ballpen.mes.enums.QcStatus;
import com.ballpen.mes.repository.AssemblyTrackingRepository;
import com.ballpen.mes.repository.EmployeeRepository;
import com.ballpen.mes.repository.ProductionOrderRepository;
import com.ballpen.mes.repository.QualityCheckRepository;
import com.ballpen.mes.service.impl.QualityCheckServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class QualityCheckServiceTest {

    @Mock
    private QualityCheckRepository qualityCheckRepository;

    @Mock
    private ProductionOrderRepository productionOrderRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private AssemblyTrackingRepository assemblyTrackingRepository;

    @InjectMocks
    private QualityCheckServiceImpl qualityCheckService;

    private ProductionOrder sampleOrder;
    private Employee sampleInspector;
    private QualityCheck sampleQC;

    @BeforeEach
    void setUp() {
        sampleOrder = ProductionOrder.builder()
                .id(1L)
                .orderNumber("PO-2026-TEST")
                .orderedQuantity(1000)
                .build();

        sampleInspector = Employee.builder()
                .id(4L)
                .employeeCode("EMP-004")
                .fullName("Neha Verma")
                .build();

        sampleQC = QualityCheck.builder()
                .id(1L)
                .checkNumber("QC-2026-TEST")
                .productionOrder(sampleOrder)
                .checkedQuantity(1000)
                .passedQuantity(990)
                .rejectedQuantity(10)
                .rejectionReason("Minor tip scratch")
                .inspector(sampleInspector)
                .inspectionDate(LocalDate.now())
                .status(QcStatus.PASSED)
                .build();
    }

    @Test
    @DisplayName("Should create quality check and calculate pass rate accurately")
    void testCreateQualityCheck() {
        CreateQualityCheckRequest request = CreateQualityCheckRequest.builder()
                .checkNumber("QC-2026-TEST")
                .productionOrderId(1L)
                .checkedQuantity(1000)
                .passedQuantity(990)
                .rejectedQuantity(10)
                .rejectionReason("Minor tip scratch")
                .inspectorId(4L)
                .inspectionDate(LocalDate.now())
                .build();

        when(qualityCheckRepository.existsByCheckNumber("QC-2026-TEST")).thenReturn(false);
        when(productionOrderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
        when(employeeRepository.findById(4L)).thenReturn(Optional.of(sampleInspector));
        when(qualityCheckRepository.save(any(QualityCheck.class))).thenReturn(sampleQC);
        when(assemblyTrackingRepository.findByProductionOrderIdAndStage(any(), any())).thenReturn(Optional.empty());

        QualityCheckDto result = qualityCheckService.createQualityCheck(request);

        assertNotNull(result);
        assertEquals("QC-2026-TEST", result.getCheckNumber());
        assertEquals(990, result.getPassedQuantity());
        assertEquals(10, result.getRejectedQuantity());
        assertEquals(99.0, result.getPassRate());
        assertEquals(QcStatus.PASSED, result.getStatus());
    }
}
