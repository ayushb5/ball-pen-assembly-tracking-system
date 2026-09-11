package com.ballpen.mes.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRawMaterialRequest {

    @NotBlank(message = "Material code is required")
    private String materialCode;

    @NotBlank(message = "Material name is required")
    private String materialName;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Available quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer availableQuantity;

    @NotBlank(message = "Unit is required")
    private String unit;

    @NotNull(message = "Minimum stock threshold is required")
    @Min(value = 0, message = "Minimum stock cannot be negative")
    private Integer minimumStock;
}
