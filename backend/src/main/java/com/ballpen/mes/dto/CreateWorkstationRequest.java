package com.ballpen.mes.dto;

import com.ballpen.mes.enums.WorkstationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateWorkstationRequest {

    @NotBlank(message = "Workstation code is required")
    @Size(max = 20, message = "Code cannot exceed 20 characters")
    private String stationCode;

    @NotBlank(message = "Workstation name is required")
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String stationName;

    @NotBlank(message = "Station type is required")
    @Size(max = 50, message = "Type cannot exceed 50 characters")
    private String stationType;

    private Long assignedEmployeeId;
    private Long currentOrderId;
    private WorkstationStatus status;
}
