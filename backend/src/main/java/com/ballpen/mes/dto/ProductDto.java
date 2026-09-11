package com.ballpen.mes.dto;

import com.ballpen.mes.entity.Product;
import com.ballpen.mes.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {

    private Long id;
    private String productCode;
    private String productName;
    private String inkColor;
    private String bodyColor;
    private String penType;
    private BigDecimal sellingPrice;
    private UserStatus status;
    private LocalDateTime createdAt;

    public static ProductDto fromEntity(Product p) {
        if (p == null) return null;
        return ProductDto.builder()
                .id(p.getId())
                .productCode(p.getProductCode())
                .productName(p.getProductName())
                .inkColor(p.getInkColor())
                .bodyColor(p.getBodyColor())
                .penType(p.getPenType())
                .sellingPrice(p.getSellingPrice())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
