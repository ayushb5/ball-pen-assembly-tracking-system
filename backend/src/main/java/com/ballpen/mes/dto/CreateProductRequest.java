package com.ballpen.mes.dto;

import com.ballpen.mes.enums.UserStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {

    @NotBlank(message = "Product code is required")
    private String productCode;

    @NotBlank(message = "Product name is required")
    private String productName;

    @NotBlank(message = "Ink color is required")
    private String inkColor;

    @NotBlank(message = "Body color is required")
    private String bodyColor;

    @NotBlank(message = "Pen type is required")
    private String penType;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.01", message = "Selling price must be greater than zero")
    private BigDecimal sellingPrice;

    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;
}
