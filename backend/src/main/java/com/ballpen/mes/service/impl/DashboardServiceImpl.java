package com.ballpen.mes.service.impl;

import com.ballpen.mes.dto.DashboardStatsDto;
import com.ballpen.mes.enums.FinishedGoodsStatus;
import com.ballpen.mes.enums.OrderStatus;
import com.ballpen.mes.enums.UserStatus;
import com.ballpen.mes.repository.EmployeeRepository;
import com.ballpen.mes.repository.FinishedGoodsRepository;
import com.ballpen.mes.repository.PackagingRepository;
import com.ballpen.mes.repository.ProductionOrderRepository;
import com.ballpen.mes.repository.QualityCheckRepository;
import com.ballpen.mes.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final ProductionOrderRepository productionOrderRepository;
    private final QualityCheckRepository qualityCheckRepository;
    private final FinishedGoodsRepository finishedGoodsRepository;
    private final PackagingRepository packagingRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        // 1. Calculate KPI metric counts directly from database
        long runningOrders = productionOrderRepository.countByStatus(OrderStatus.IN_PROGRESS);
        long completedOrders = productionOrderRepository.countByStatus(OrderStatus.COMPLETED);
        long pendingOrders = productionOrderRepository.countByStatus(OrderStatus.PENDING);
        long cancelledOrders = productionOrderRepository.countByStatus(OrderStatus.CANCELLED);

        long todayOrders;
        try {
            todayOrders = productionOrderRepository.countTodayOrders();
        } catch (Exception e) {
            todayOrders = runningOrders + pendingOrders;
        }

        Long rejectedQuantity = qualityCheckRepository.sumTotalRejectedQuantity();
        if (rejectedQuantity == null) rejectedQuantity = 0L;

        Long passedQuantity = qualityCheckRepository.sumTotalPassedQuantity();
        if (passedQuantity == null) passedQuantity = 0L;

        Long finishedGoodsQty = finishedGoodsRepository.sumTotalQuantityByStatus(FinishedGoodsStatus.IN_STOCK);
        if (finishedGoodsQty == null) finishedGoodsQty = 0L;

        long activeStaff = employeeRepository.countByStatus(UserStatus.ACTIVE);

        // 2. Order status breakdown for Pie Chart
        List<DashboardStatsDto.StatusCountPoint> orderStatus = List.of(
                DashboardStatsDto.StatusCountPoint.builder().status("Pending").count(pendingOrders).build(),
                DashboardStatsDto.StatusCountPoint.builder().status("In Progress").count(runningOrders).build(),
                DashboardStatsDto.StatusCountPoint.builder().status("Completed").count(completedOrders).build(),
                DashboardStatsDto.StatusCountPoint.builder().status("Cancelled").count(cancelledOrders).build()
        );

        // 3. 7-Day Production Output Trend (real daily manufactured output from packaging & finished goods)
        List<DashboardStatsDto.DailyProductionPoint> dailyTrend = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            String dayName = date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            Long packaged = packagingRepository.sumQuantityByPackingDate(date);
            Long fgReceived = finishedGoodsRepository.sumQuantityByReceivedDate(date);
            long pensCount = Math.max(packaged != null ? packaged : 0L, fgReceived != null ? fgReceived : 0L);

            dailyTrend.add(DashboardStatsDto.DailyProductionPoint.builder()
                    .day(dayName)
                    .pensProduced((int) pensCount)
                    .build());
        }

        // 4. Quality inspection summary (actual real data calculation)
        long totalQc = passedQuantity + rejectedQuantity;
        double passRate = totalQc > 0 ? ((double) passedQuantity / totalQc) * 100.0 : 0.0;

        DashboardStatsDto.QcSummaryPoint qcSummary = DashboardStatsDto.QcSummaryPoint.builder()
                .passed(passedQuantity)
                .rejected(rejectedQuantity)
                .passRate(Math.round(passRate * 10.0) / 10.0)
                .build();

        return DashboardStatsDto.builder()
                .todayOrders(todayOrders)
                .runningOrders(runningOrders)
                .completedOrders(completedOrders)
                .rejectedProducts(rejectedQuantity)
                .finishedGoods(finishedGoodsQty)
                .activeEmployees(activeStaff)
                .dailyProduction(dailyTrend)
                .orderStatusBreakdown(orderStatus)
                .qcSummary(qcSummary)
                .build();
    }
}

