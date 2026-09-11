package com.ballpen.mes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Aggregated KPI metrics and chart datasets for the factory Dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {

    // 6 Core Metrics requested in requirements
    private long todayOrders;
    private long runningOrders;
    private long completedOrders;
    private long rejectedProducts;
    private long finishedGoods;
    private long activeEmployees;

    // Charts datasets
    private List<DailyProductionPoint> dailyProduction;
    private List<StatusCountPoint> orderStatusBreakdown;
    private QcSummaryPoint qcSummary;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyProductionPoint {
        private String day;
        private int pensProduced;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusCountPoint {
        private String status;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QcSummaryPoint {
        private long passed;
        private long rejected;
        private double passRate;
    }
}
