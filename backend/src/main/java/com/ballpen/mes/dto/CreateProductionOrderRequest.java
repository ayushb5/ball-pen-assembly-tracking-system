package com.ballpen.mes.dto;

import com.ballpen.mes.enums.OrderPriority;
import com.ballpen.mes.enums.OrderStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductionOrderRequest {

    @NotBlank(message = "Order number is required")
    private String orderNumber;

    @NotNull(message = "Customer is required")
    private Long customerId;

    @NotNull(message = "Product is required")
    private Long productId;

    @NotNull(message = "Ordered quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer orderedQuantity;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Builder.Default
    private OrderPriority priority = OrderPriority.MEDIUM;

    private String notes;
}
