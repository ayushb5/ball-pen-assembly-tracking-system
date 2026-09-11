package com.ballpen.mes.service.impl;

import com.ballpen.mes.dto.*;
import com.ballpen.mes.enums.OrderStatus;
import com.ballpen.mes.repository.*;
import com.ballpen.mes.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ProductionOrderRepository productionOrderRepository;
    private final QualityCheckRepository qualityCheckRepository;
    private final FinishedGoodsRepository finishedGoodsRepository;
    private final DispatchRepository dispatchRepository;

    @Override
    @Transactional(readOnly = true)
    public ReportSummaryDto getExecutiveSummary() {
        List<ProductionOrderDto> orders = productionOrderRepository.findAll().stream()
                .map(ProductionOrderDto::fromEntity)
                .collect(Collectors.toList());

        List<QualityCheckDto> qcs = qualityCheckRepository.findAll().stream()
                .map(QualityCheckDto::fromEntity)
                .collect(Collectors.toList());

        List<FinishedGoodsDto> fg = finishedGoodsRepository.findAll().stream()
                .map(FinishedGoodsDto::fromEntity)
                .collect(Collectors.toList());

        List<DispatchDto> dispatches = dispatchRepository.findAll().stream()
                .map(DispatchDto::fromEntity)
                .collect(Collectors.toList());

        long completedOrders = orders.stream().filter(o -> o.getStatus() == OrderStatus.COMPLETED).count();
        long totalProduced = orders.stream().mapToLong(o -> o.getProducedQuantity() != null ? o.getProducedQuantity() : 0).sum();
        long totalDispatched = dispatches.stream().mapToLong(d -> d.getQuantity() != null ? d.getQuantity() : 0).sum();

        BigDecimal totalValuation = fg.stream()
                .map(FinishedGoodsDto::getTotalValuation)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double avgQc = qcs.isEmpty() ? 0.0 : qcs.stream()
                .mapToDouble(q -> q.getPassRate() != null ? q.getPassRate() : 0.0)
                .average()
                .orElse(0.0);
        avgQc = Math.round(avgQc * 10.0) / 10.0;

        return ReportSummaryDto.builder()
                .totalOrders((long) orders.size())
                .completedOrders(completedOrders)
                .totalProducedPens(totalProduced)
                .totalInventoryValuation(totalValuation)
                .averageQcPassRate(avgQc)
                .totalDispatchedPens(totalDispatched)
                .productionOrders(orders)
                .qualityChecks(qcs)
                .finishedGoods(fg)
                .dispatches(dispatches)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductionOrderDto> getProductionReport() {
        return productionOrderRepository.findAll().stream()
                .map(ProductionOrderDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityCheckDto> getQualityReport() {
        return qualityCheckRepository.findAll().stream()
                .map(QualityCheckDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FinishedGoodsDto> getInventoryReport() {
        return finishedGoodsRepository.findAll().stream()
                .map(FinishedGoodsDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DispatchDto> getDispatchReport() {
        return dispatchRepository.findAll().stream()
                .map(DispatchDto::fromEntity)
                .collect(Collectors.toList());
    }
}
