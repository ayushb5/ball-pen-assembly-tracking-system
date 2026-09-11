package com.ballpen.mes.dto;

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
public class CreatePackagingRequest {

    @NotBlank(message = "Package number is required")
    @Size(max = 30, message = "Package number cannot exceed 30 characters")
    private String packageNumber;

    @NotNull(message = "Production order ID is required")
    private Long productionOrderId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Packed by employee ID is required")
    private Long packedById;

    @NotNull(message = "Packing date is required")
    private LocalDate packingDate;

    private String packagingType;
    private String remarks;
}
