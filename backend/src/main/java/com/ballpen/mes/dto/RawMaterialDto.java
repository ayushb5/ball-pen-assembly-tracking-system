package com.ballpen.mes.dto;

import com.ballpen.mes.entity.RawMaterial;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RawMaterialDto {

    private Long id;
    private String materialCode;
    private String materialName;
    private String category;
    private Integer availableQuantity;
    private String unit;
    private Integer minimumStock;
    private boolean lowStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static RawMaterialDto fromEntity(RawMaterial rm) {
        if (rm == null) return null;
        return RawMaterialDto.builder()
                .id(rm.getId())
                .materialCode(rm.getMaterialCode())
                .materialName(rm.getMaterialName())
                .category(rm.getCategory())
                .availableQuantity(rm.getAvailableQuantity())
                .unit(rm.getUnit())
                .minimumStock(rm.getMinimumStock())
                .lowStock(rm.isLowStock())
                .createdAt(rm.getCreatedAt())
                .updatedAt(rm.getUpdatedAt())
                .build();
    }
}
