package com.ballpen.mes.dto;

import com.ballpen.mes.enums.FinishedGoodsStatus;
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
public class CreateFinishedGoodsRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Production order ID is required")
    private Long productionOrderId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1 pen")
    private Integer quantity;

    @NotBlank(message = "Warehouse location is required")
    @Size(max = 100, message = "Location cannot exceed 100 characters")
    private String warehouseLocation;

    @Builder.Default
    private Boolean readyForDispatch = true;

    private FinishedGoodsStatus status;

    @NotNull(message = "Received date is required")
    private LocalDate receivedDate;
}
