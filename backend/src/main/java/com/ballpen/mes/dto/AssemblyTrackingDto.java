package com.ballpen.mes.dto;

import com.ballpen.mes.entity.AssemblyTracking;
import com.ballpen.mes.enums.AssemblyStage;
import com.ballpen.mes.enums.AssemblyStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssemblyTrackingDto {

    private Long id;
    private Long productionOrderId;
    private String orderNumber;
    private String productName;
    private String productCode;
    private Integer orderedQuantity;
    private Integer producedQuantity;
    private AssemblyStage stage;
    private Integer stageOrder;
    private String stageDisplayName;
    private AssemblyStatus status;
    private LocalDateTime startedTime;
    private LocalDateTime completedTime;
    private Long assignedEmployeeId;
    private String assignedEmployeeName;
    private String assignedEmployeeCode;
    private String remarks;
    private LocalDateTime createdAt;

    public static AssemblyTrackingDto fromEntity(AssemblyTracking track) {
        if (track == null) return null;
        return AssemblyTrackingDto.builder()
                .id(track.getId())
                .productionOrderId(track.getProductionOrder() != null ? track.getProductionOrder().getId() : null)
                .orderNumber(track.getProductionOrder() != null ? track.getProductionOrder().getOrderNumber() : null)
                .productName(track.getProductionOrder() != null && track.getProductionOrder().getProduct() != null ? track.getProductionOrder().getProduct().getProductName() : null)
                .productCode(track.getProductionOrder() != null && track.getProductionOrder().getProduct() != null ? track.getProductionOrder().getProduct().getProductCode() : null)
                .orderedQuantity(track.getProductionOrder() != null ? track.getProductionOrder().getOrderedQuantity() : null)
                .producedQuantity(track.getProductionOrder() != null ? track.getProductionOrder().getProducedQuantity() : null)
                .stage(track.getStage())
                .stageOrder(track.getStage() != null ? track.getStage().ordinal() + 1 : null)
                .stageDisplayName(track.getStage() != null ? track.getStage().getDisplayName() : null)
                .status(track.getStatus())
                .startedTime(track.getStartedTime())
                .completedTime(track.getCompletedTime())
                .assignedEmployeeId(track.getAssignedEmployee() != null ? track.getAssignedEmployee().getId() : null)
                .assignedEmployeeName(track.getAssignedEmployee() != null ? track.getAssignedEmployee().getFullName() : null)
                .assignedEmployeeCode(track.getAssignedEmployee() != null ? track.getAssignedEmployee().getEmployeeCode() : null)
                .remarks(track.getRemarks())
                .createdAt(track.getCreatedAt())
                .build();
    }
}
