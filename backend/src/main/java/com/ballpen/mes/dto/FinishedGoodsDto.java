package com.ballpen.mes.dto;

import com.ballpen.mes.entity.FinishedGoods;
import com.ballpen.mes.enums.FinishedGoodsStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinishedGoodsDto {

    private Long id;
    private Long productId;
    private String productCode;
    private String productName;
    private String inkColor;
    private String penType;
    private BigDecimal unitPrice;
    private BigDecimal totalValuation;
    private Long productionOrderId;
    private String orderNumber;
    private Integer quantity;
    private String warehouseLocation;
    private Boolean readyForDispatch;
    private FinishedGoodsStatus status;
    private LocalDate receivedDate;
    private LocalDateTime createdAt;

    public static FinishedGoodsDto fromEntity(FinishedGoods fg) {
        if (fg == null) return null;

        BigDecimal price = fg.getProduct() != null && fg.getProduct().getSellingPrice() != null
                ? fg.getProduct().getSellingPrice()
                : BigDecimal.ZERO;
        BigDecimal valuation = price.multiply(BigDecimal.valueOf(fg.getQuantity() != null ? fg.getQuantity() : 0));

        return FinishedGoodsDto.builder()
                .id(fg.getId())
                .productId(fg.getProduct() != null ? fg.getProduct().getId() : null)
                .productCode(fg.getProduct() != null ? fg.getProduct().getProductCode() : null)
                .productName(fg.getProduct() != null ? fg.getProduct().getProductName() : null)
                .inkColor(fg.getProduct() != null ? fg.getProduct().getInkColor() : null)
                .penType(fg.getProduct() != null ? fg.getProduct().getPenType() : null)
                .unitPrice(price)
                .totalValuation(valuation)
                .productionOrderId(fg.getProductionOrder() != null ? fg.getProductionOrder().getId() : null)
                .orderNumber(fg.getProductionOrder() != null ? fg.getProductionOrder().getOrderNumber() : null)
                .quantity(fg.getQuantity())
                .warehouseLocation(fg.getWarehouseLocation())
                .readyForDispatch(fg.getReadyForDispatch())
                .status(fg.getStatus())
                .receivedDate(fg.getReceivedDate())
                .createdAt(fg.getCreatedAt())
                .build();
    }
}
