package com.ballpen.mes.dto;

import com.ballpen.mes.entity.Workstation;
import com.ballpen.mes.enums.WorkstationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkstationDto {

    private Long id;
    private String stationCode;
    private String stationName;
    private String stationType;
    private Long assignedEmployeeId;
    private String assignedEmployeeName;
    private String assignedEmployeeCode;
    private Long currentOrderId;
    private String currentOrderNumber;
    private String currentProductName;
    private WorkstationStatus status;
    private LocalDateTime updatedAt;

    public static WorkstationDto fromEntity(Workstation ws) {
        if (ws == null) return null;
        return WorkstationDto.builder()
                .id(ws.getId())
                .stationCode(ws.getStationCode())
                .stationName(ws.getStationName())
                .stationType(ws.getStationType())
                .assignedEmployeeId(ws.getAssignedEmployee() != null ? ws.getAssignedEmployee().getId() : null)
                .assignedEmployeeName(ws.getAssignedEmployee() != null ? ws.getAssignedEmployee().getFullName() : null)
                .assignedEmployeeCode(ws.getAssignedEmployee() != null ? ws.getAssignedEmployee().getEmployeeCode() : null)
                .currentOrderId(ws.getCurrentOrder() != null ? ws.getCurrentOrder().getId() : null)
                .currentOrderNumber(ws.getCurrentOrder() != null ? ws.getCurrentOrder().getOrderNumber() : null)
                .currentProductName(ws.getCurrentOrder() != null && ws.getCurrentOrder().getProduct() != null ? ws.getCurrentOrder().getProduct().getProductName() : null)
                .status(ws.getStatus())
                .updatedAt(ws.getUpdatedAt())
                .build();
    }
}
