package com.ballpen.mes.dto;

import com.ballpen.mes.enums.QcStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateQualityCheckRequest {

    @NotBlank(message = "QC check number is required")
    @Size(max = 30, message = "Check number cannot exceed 30 characters")
    private String checkNumber;

    @NotNull(message = "Production order ID is required")
    private Long productionOrderId;

    @NotNull(message = "Checked quantity is required")
    @Min(value = 1, message = "Checked quantity must be at least 1")
    private Integer checkedQuantity;

    @NotNull(message = "Passed quantity is required")
    @Min(value = 0, message = "Passed quantity cannot be negative")
    private Integer passedQuantity;

    @NotNull(message = "Rejected quantity is required")
    @Min(value = 0, message = "Rejected quantity cannot be negative")
    private Integer rejectedQuantity;

    private String rejectionReason;

    @NotNull(message = "Inspector ID is required")
    private Long inspectorId;

    @NotNull(message = "Inspection date is required")
    private LocalDate inspectionDate;

    private QcStatus status;
    private String notes;
}
