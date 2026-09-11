package com.ballpen.mes.service;

import com.ballpen.mes.dto.*;

import java.util.List;

public interface ReportService {

    ReportSummaryDto getExecutiveSummary();

    List<ProductionOrderDto> getProductionReport();

    List<QualityCheckDto> getQualityReport();

    List<FinishedGoodsDto> getInventoryReport();

    List<DispatchDto> getDispatchReport();
}
