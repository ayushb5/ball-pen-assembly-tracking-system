package com.ballpen.mes.dto;

import com.ballpen.mes.entity.ProductionOrder;
import com.ballpen.mes.enums.OrderPriority;
import com.ballpen.mes.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductionOrderDto {

    private Long id;
    private String orderNumber;
    private Long customerId;
    private String customerName;
    private Long productId;
    private String productName;
    private String productCode;
    private Integer orderedQuantity;
    private Integer producedQuantity;
    private LocalDate dueDate;
    private OrderStatus status;
    private OrderPriority priority;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProductionOrderDto fromEntity(ProductionOrder order) {
        if (order == null) return null;
        return ProductionOrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
                .customerName(order.getCustomer() != null ? order.getCustomer().getCustomerName() : null)
                .productId(order.getProduct() != null ? order.getProduct().getId() : null)
                .productName(order.getProduct() != null ? order.getProduct().getProductName() : null)
                .productCode(order.getProduct() != null ? order.getProduct().getProductCode() : null)
                .orderedQuantity(order.getOrderedQuantity())
                .producedQuantity(order.getProducedQuantity())
                .dueDate(order.getDueDate())
                .status(order.getStatus())
                .priority(order.getPriority())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
