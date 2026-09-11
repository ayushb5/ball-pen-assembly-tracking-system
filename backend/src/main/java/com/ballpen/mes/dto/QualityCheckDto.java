package com.ballpen.mes.dto;

import com.ballpen.mes.entity.QualityCheck;
import com.ballpen.mes.enums.QcStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QualityCheckDto {

    private Long id;
    private String checkNumber;
    private Long productionOrderId;
    private String orderNumber;
    private String productName;
    private String productCode;
    private Integer checkedQuantity;
    private Integer passedQuantity;
    private Integer rejectedQuantity;
    private Double passRate;
    private String rejectionReason;
    private Long inspectorId;
    private String inspectorName;
    private String inspectorCode;
    private LocalDate inspectionDate;
    private QcStatus status;
    private String notes;
    private LocalDateTime createdAt;

    public static QualityCheckDto fromEntity(QualityCheck qc) {
        if (qc == null) return null;

        Double passRateCalc = 0.0;
        if (qc.getCheckedQuantity() != null && qc.getCheckedQuantity() > 0 && qc.getPassedQuantity() != null) {
            passRateCalc = Math.round(((double) qc.getPassedQuantity() / qc.getCheckedQuantity()) * 1000.0) / 10.0;
        }

        return QualityCheckDto.builder()
                .id(qc.getId())
                .checkNumber(qc.getCheckNumber())
                .productionOrderId(qc.getProductionOrder() != null ? qc.getProductionOrder().getId() : null)
                .orderNumber(qc.getProductionOrder() != null ? qc.getProductionOrder().getOrderNumber() : null)
                .productName(qc.getProductionOrder() != null && qc.getProductionOrder().getProduct() != null ? qc.getProductionOrder().getProduct().getProductName() : null)
                .productCode(qc.getProductionOrder() != null && qc.getProductionOrder().getProduct() != null ? qc.getProductionOrder().getProduct().getProductCode() : null)
                .checkedQuantity(qc.getCheckedQuantity())
                .passedQuantity(qc.getPassedQuantity())
                .rejectedQuantity(qc.getRejectedQuantity())
                .passRate(passRateCalc)
                .rejectionReason(qc.getRejectionReason())
                .inspectorId(qc.getInspector() != null ? qc.getInspector().getId() : null)
                .inspectorName(qc.getInspector() != null ? qc.getInspector().getFullName() : null)
                .inspectorCode(qc.getInspector() != null ? qc.getInspector().getEmployeeCode() : null)
                .inspectionDate(qc.getInspectionDate())
                .status(qc.getStatus())
                .notes(qc.getNotes())
                .createdAt(qc.getCreatedAt())
                .build();
    }
}
