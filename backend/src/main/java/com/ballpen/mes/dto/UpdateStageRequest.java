package com.ballpen.mes.dto;

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
public class UpdateStageRequest {

    private AssemblyStatus status;
    private Long assignedEmployeeId;
    private LocalDateTime startedTime;
    private LocalDateTime completedTime;
    private String remarks;
}
