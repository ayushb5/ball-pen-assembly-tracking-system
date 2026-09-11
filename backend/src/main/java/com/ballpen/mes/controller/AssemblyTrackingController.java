package com.ballpen.mes.controller;

import com.ballpen.mes.dto.ApiResponse;
import com.ballpen.mes.dto.AssemblyTrackingDto;
import com.ballpen.mes.dto.UpdateStageRequest;
import com.ballpen.mes.service.AssemblyTrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assembly-tracking")
@RequiredArgsConstructor
@Tag(name = "Assembly Tracking", description = "8-stage ball pen manufacturing workflow and progress pipeline")
public class AssemblyTrackingController {

    private final AssemblyTrackingService assemblyTrackingService;

    @GetMapping
    @Operation(summary = "Get all assembly tracking records", description = "Retrieves workflow stage tracking records across all production orders")
    public ResponseEntity<ApiResponse<List<AssemblyTrackingDto>>> getAllTracking() {
        List<AssemblyTrackingDto> list = assemblyTrackingService.getAllTracking();
        return ResponseEntity.ok(ApiResponse.success("Assembly tracking records retrieved", list));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get 8 assembly stages for an order", description = "Retrieves the sequential 8 stages (Material Collection -> Finished Goods) for an order")
    public ResponseEntity<ApiResponse<List<AssemblyTrackingDto>>> getTrackingByOrderId(@PathVariable Long orderId) {
        List<AssemblyTrackingDto> stages = assemblyTrackingService.getTrackingByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order assembly stages retrieved", stages));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get stage tracking by ID", description = "Retrieves status, timing, and operator for an individual stage")
    public ResponseEntity<ApiResponse<AssemblyTrackingDto>> getTrackingById(@PathVariable Long id) {
        AssemblyTrackingDto track = assemblyTrackingService.getTrackingById(id);
        return ResponseEntity.ok(ApiResponse.success("Stage record found", track));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update stage details", description = "Updates status, timestamps, assigned operator, or notes for a stage")
    public ResponseEntity<ApiResponse<AssemblyTrackingDto>> updateStage(@PathVariable Long id,
                                                                        @RequestBody UpdateStageRequest request) {
        AssemblyTrackingDto updated = assemblyTrackingService.updateStage(id, request);
        return ResponseEntity.ok(ApiResponse.success("Stage updated successfully", updated));
    }

    @PostMapping("/{id}/start")
    @Operation(summary = "Start stage", description = "Marks stage IN_PROGRESS, sets start time, and assigns operator")
    public ResponseEntity<ApiResponse<AssemblyTrackingDto>> startStage(
            @PathVariable Long id,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String remarks) {
        AssemblyTrackingDto started = assemblyTrackingService.startStage(id, employeeId, remarks);
        return ResponseEntity.ok(ApiResponse.success("Stage started successfully", started));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete stage", description = "Marks stage COMPLETED, sets completion time, and auto-checks order status")
    public ResponseEntity<ApiResponse<AssemblyTrackingDto>> completeStage(
            @PathVariable Long id,
            @RequestParam(required = false) String remarks) {
        AssemblyTrackingDto completed = assemblyTrackingService.completeStage(id, remarks);
        return ResponseEntity.ok(ApiResponse.success("Stage completed successfully", completed));
    }
}
