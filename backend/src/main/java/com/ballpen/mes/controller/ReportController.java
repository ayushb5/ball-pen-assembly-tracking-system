package com.ballpen.mes.controller;

import com.ballpen.mes.dto.*;
import com.ballpen.mes.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Plant production, quality yield, warehouse valuation, and fulfillment reports")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/executive-summary")
    @Operation(summary = "Executive plant report", description = "Aggregates production, quality, inventory, and shipment summary statistics")
    public ResponseEntity<ApiResponse<ReportSummaryDto>> getExecutiveSummary() {
        ReportSummaryDto summary = reportService.getExecutiveSummary();
        return ResponseEntity.ok(ApiResponse.success("Executive plant report retrieved", summary));
    }

    @GetMapping("/production")
    @Operation(summary = "Production orders report", description = "Detailed production order completion audit")
    public ResponseEntity<ApiResponse<List<ProductionOrderDto>>> getProductionReport() {
        List<ProductionOrderDto> list = reportService.getProductionReport();
        return ResponseEntity.ok(ApiResponse.success("Production report retrieved", list));
    }

    @GetMapping("/quality")
    @Operation(summary = "Quality assurance report", description = "Quality inspection and defect root-cause records")
    public ResponseEntity<ApiResponse<List<QualityCheckDto>>> getQualityReport() {
        List<QualityCheckDto> list = reportService.getQualityReport();
        return ResponseEntity.ok(ApiResponse.success("Quality report retrieved", list));
    }

    @GetMapping("/inventory")
    @Operation(summary = "Warehouse stock report", description = "Finished goods inventory and lot valuations")
    public ResponseEntity<ApiResponse<List<FinishedGoodsDto>>> getInventoryReport() {
        List<FinishedGoodsDto> list = reportService.getInventoryReport();
        return ResponseEntity.ok(ApiResponse.success("Inventory report retrieved", list));
    }

    @GetMapping("/dispatch")
    @Operation(summary = "Logistics fulfillment report", description = "Client shipments and tracking references")
    public ResponseEntity<ApiResponse<List<DispatchDto>>> getDispatchReport() {
        List<DispatchDto> list = reportService.getDispatchReport();
        return ResponseEntity.ok(ApiResponse.success("Dispatch report retrieved", list));
    }
}
