package com.ballpen.mes.dto;

import com.ballpen.mes.entity.Dispatch;
import com.ballpen.mes.enums.DispatchStatus;
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
public class DispatchDto {

    private Long id;
    private String dispatchNumber;
    private Long customerId;
    private String customerName;
    private String customerCode;
    private Long productionOrderId;
    private String orderNumber;
    private String productName;
    private String productCode;
    private Integer quantity;
    private LocalDate dispatchDate;
    private DispatchStatus status;
    private String carrierName;
    private String trackingReference;
    private String notes;
    private LocalDateTime createdAt;

    public static DispatchDto fromEntity(Dispatch d) {
        if (d == null) return null;
        return DispatchDto.builder()
                .id(d.getId())
                .dispatchNumber(d.getDispatchNumber())
                .customerId(d.getCustomer() != null ? d.getCustomer().getId() : null)
                .customerName(d.getCustomer() != null ? d.getCustomer().getCustomerName() : null)
                .customerCode(d.getCustomer() != null ? d.getCustomer().getCustomerCode() : null)
                .productionOrderId(d.getProductionOrder() != null ? d.getProductionOrder().getId() : null)
                .orderNumber(d.getProductionOrder() != null ? d.getProductionOrder().getOrderNumber() : null)
                .productName(d.getProductionOrder() != null && d.getProductionOrder().getProduct() != null ? d.getProductionOrder().getProduct().getProductName() : null)
                .productCode(d.getProductionOrder() != null && d.getProductionOrder().getProduct() != null ? d.getProductionOrder().getProduct().getProductCode() : null)
                .quantity(d.getQuantity())
                .dispatchDate(d.getDispatchDate())
                .status(d.getStatus())
                .carrierName(d.getCarrierName())
                .trackingReference(d.getTrackingReference())
                .notes(d.getNotes())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
