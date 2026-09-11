package com.ballpen.mes.controller;

import com.ballpen.mes.dto.ApiResponse;
import com.ballpen.mes.dto.CreateQualityCheckRequest;
import com.ballpen.mes.dto.QualityCheckDto;
import com.ballpen.mes.service.QualityCheckService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/quality-checks")
@RequiredArgsConstructor
@Tag(name = "Quality Control", description = "Inline inspection, defect tracking, and pass/fail audits")
public class QualityCheckController {

    private final QualityCheckService qualityCheckService;

    @GetMapping
    @Operation(summary = "Get all quality inspections", description = "Retrieves all batch quality inspections and test reports")
    public ResponseEntity<ApiResponse<List<QualityCheckDto>>> getAllQualityChecks() {
        List<QualityCheckDto> list = qualityCheckService.getAllQualityChecks();
        return ResponseEntity.ok(ApiResponse.success("Quality checks retrieved successfully", list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get quality check by ID", description = "Retrieves detailed inspection metrics, pass count, and defect notes")
    public ResponseEntity<ApiResponse<QualityCheckDto>> getQualityCheckById(@PathVariable Long id) {
        QualityCheckDto dto = qualityCheckService.getQualityCheckById(id);
        return ResponseEntity.ok(ApiResponse.success("Quality check found", dto));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get inspections for an order", description = "Retrieves QC reports linked to a specific production order")
    public ResponseEntity<ApiResponse<List<QualityCheckDto>>> getQualityChecksByOrderId(@PathVariable Long orderId) {
        List<QualityCheckDto> list = qualityCheckService.getQualityChecksByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order quality checks retrieved", list));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'OPERATOR')")
    @Operation(summary = "Log new quality inspection", description = "Submits inspection metrics (checked, passed, rejected) and defect analysis")
    public ResponseEntity<ApiResponse<QualityCheckDto>> createQualityCheck(@Valid @RequestBody CreateQualityCheckRequest request) {
        QualityCheckDto created = qualityCheckService.createQualityCheck(request);
        return new ResponseEntity<>(ApiResponse.success("Quality inspection logged successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @Operation(summary = "Update quality check", description = "Modifies inspection numbers, reason, or status")
    public ResponseEntity<ApiResponse<QualityCheckDto>> updateQualityCheck(@PathVariable Long id,
                                                                           @Valid @RequestBody CreateQualityCheckRequest request) {
        QualityCheckDto updated = qualityCheckService.updateQualityCheck(id, request);
        return ResponseEntity.ok(ApiResponse.success("Quality inspection updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete quality check", description = "Removes QC record (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteQualityCheck(@PathVariable Long id) {
        qualityCheckService.deleteQualityCheck(id);
        return ResponseEntity.ok(ApiResponse.success("Quality check deleted successfully", null));
    }
}
