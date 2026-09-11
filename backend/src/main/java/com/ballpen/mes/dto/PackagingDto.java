package com.ballpen.mes.dto;

import com.ballpen.mes.entity.Packaging;
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
public class PackagingDto {

    private Long id;
    private String packageNumber;
    private Long productionOrderId;
    private String orderNumber;
    private String productName;
    private String productCode;
    private Integer quantity;
    private String packagingType;
    private Long packedById;
    private String packedByName;
    private String packedByCode;
    private LocalDate packingDate;
    private String remarks;
    private LocalDateTime createdAt;

    public static PackagingDto fromEntity(Packaging pkg) {
        if (pkg == null) return null;
        return PackagingDto.builder()
                .id(pkg.getId())
                .packageNumber(pkg.getPackageNumber())
                .productionOrderId(pkg.getProductionOrder() != null ? pkg.getProductionOrder().getId() : null)
                .orderNumber(pkg.getProductionOrder() != null ? pkg.getProductionOrder().getOrderNumber() : null)
                .productName(pkg.getProductionOrder() != null && pkg.getProductionOrder().getProduct() != null ? pkg.getProductionOrder().getProduct().getProductName() : null)
                .productCode(pkg.getProductionOrder() != null && pkg.getProductionOrder().getProduct() != null ? pkg.getProductionOrder().getProduct().getProductCode() : null)
                .quantity(pkg.getQuantity())
                .packagingType(pkg.getPackagingType())
                .packedById(pkg.getPackedBy() != null ? pkg.getPackedBy().getId() : null)
                .packedByName(pkg.getPackedBy() != null ? pkg.getPackedBy().getFullName() : null)
                .packedByCode(pkg.getPackedBy() != null ? pkg.getPackedBy().getEmployeeCode() : null)
                .packingDate(pkg.getPackingDate())
                .remarks(pkg.getRemarks())
                .createdAt(pkg.getCreatedAt())
                .build();
    }
}
