package com.ballpen.mes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportSummaryDto {

    private Long totalOrders;
    private Long completedOrders;
    private Long totalProducedPens;
    private BigDecimal totalInventoryValuation;
    private Double averageQcPassRate;
    private Long totalDispatchedPens;

    private List<ProductionOrderDto> productionOrders;
    private List<QualityCheckDto> qualityChecks;
    private List<FinishedGoodsDto> finishedGoods;
    private List<DispatchDto> dispatches;
}
