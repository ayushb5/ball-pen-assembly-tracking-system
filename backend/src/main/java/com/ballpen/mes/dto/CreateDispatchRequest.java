package com.ballpen.mes.dto;

import com.ballpen.mes.enums.DispatchStatus;
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
public class CreateDispatchRequest {

    @NotBlank(message = "Dispatch number is required")
    @Size(max = 30, message = "Dispatch number cannot exceed 30 characters")
    private String dispatchNumber;

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Production order ID is required")
    private Long productionOrderId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1 pen")
    private Integer quantity;

    @NotNull(message = "Dispatch date is required")
    private LocalDate dispatchDate;

    private DispatchStatus status;
    private String carrierName;
    private String trackingReference;
    private String notes;
}
