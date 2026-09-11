package com.ballpen.mes.dto;

import com.ballpen.mes.enums.OrderPriority;
import com.ballpen.mes.enums.OrderStatus;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductionOrderRequest {

    private Long customerId;

    private Long productId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer orderedQuantity;

    @Min(value = 0, message = "Produced quantity cannot be negative")
    private Integer producedQuantity;

    private LocalDate dueDate;

    private OrderStatus status;

    private OrderPriority priority;

    private String notes;
}
