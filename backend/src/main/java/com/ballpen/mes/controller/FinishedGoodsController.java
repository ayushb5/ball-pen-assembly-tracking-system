package com.ballpen.mes.controller;

import com.ballpen.mes.dto.ApiResponse;
import com.ballpen.mes.dto.CreateFinishedGoodsRequest;
import com.ballpen.mes.dto.FinishedGoodsDto;
import com.ballpen.mes.service.FinishedGoodsService;
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
@RequestMapping("/api/v1/finished-goods")
@RequiredArgsConstructor
@Tag(name = "Finished Goods", description = "Warehouse finished pen inventory, bay locations, and dispatch readiness")
public class FinishedGoodsController {

    private final FinishedGoodsService finishedGoodsService;

    @GetMapping
    @Operation(summary = "Get all finished goods stock", description = "Retrieves all completed pen batches stored in warehouse inventory")
    public ResponseEntity<ApiResponse<List<FinishedGoodsDto>>> getAllFinishedGoods() {
        List<FinishedGoodsDto> list = finishedGoodsService.getAllFinishedGoods();
        return ResponseEntity.ok(ApiResponse.success("Finished goods retrieved successfully", list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get finished goods record by ID", description = "Retrieves stock quantity, warehouse bay, and dispatch flag")
    public ResponseEntity<ApiResponse<FinishedGoodsDto>> getFinishedGoodsById(@PathVariable Long id) {
        FinishedGoodsDto dto = finishedGoodsService.getFinishedGoodsById(id);
        return ResponseEntity.ok(ApiResponse.success("Finished goods record found", dto));
    }

    @GetMapping("/ready")
    @Operation(summary = "Get stock ready for dispatch", description = "Retrieves inventory items tagged as ready for client shipment")
    public ResponseEntity<ApiResponse<List<FinishedGoodsDto>>> getReadyForDispatch() {
        List<FinishedGoodsDto> list = finishedGoodsService.getReadyForDispatch();
        return ResponseEntity.ok(ApiResponse.success("Ready for dispatch stock retrieved", list));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @Operation(summary = "Register finished goods stock", description = "Manually logs finished pens into warehouse inventory")
    public ResponseEntity<ApiResponse<FinishedGoodsDto>> createFinishedGoods(@Valid @RequestBody CreateFinishedGoodsRequest request) {
        FinishedGoodsDto created = finishedGoodsService.createFinishedGoods(request);
        return new ResponseEntity<>(ApiResponse.success("Finished goods recorded successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @Operation(summary = "Update finished goods record", description = "Updates quantity, bay location, or status")
    public ResponseEntity<ApiResponse<FinishedGoodsDto>> updateFinishedGoods(@PathVariable Long id,
                                                                             @Valid @RequestBody CreateFinishedGoodsRequest request) {
        FinishedGoodsDto updated = finishedGoodsService.updateFinishedGoods(id, request);
        return ResponseEntity.ok(ApiResponse.success("Finished goods updated successfully", updated));
    }

    @PatchMapping("/{id}/ready")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'OPERATOR')")
    @Operation(summary = "Toggle dispatch readiness", description = "Toggles readyForDispatch boolean flag")
    public ResponseEntity<ApiResponse<FinishedGoodsDto>> toggleDispatchReady(@PathVariable Long id) {
        FinishedGoodsDto updated = finishedGoodsService.toggleDispatchReady(id);
        return ResponseEntity.ok(ApiResponse.success("Dispatch readiness toggled", updated));
    }

    @PatchMapping("/{id}/location")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'OPERATOR')")
    @Operation(summary = "Update warehouse bay location", description = "Assigns pallet/shelf location in warehouse")
    public ResponseEntity<ApiResponse<FinishedGoodsDto>> updateLocation(@PathVariable Long id,
                                                                        @RequestParam String location) {
        FinishedGoodsDto updated = finishedGoodsService.updateLocation(id, location);
        return ResponseEntity.ok(ApiResponse.success("Warehouse location updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete finished goods entry", description = "Removes inventory record (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteFinishedGoods(@PathVariable Long id) {
        finishedGoodsService.deleteFinishedGoods(id);
        return ResponseEntity.ok(ApiResponse.success("Finished goods entry deleted successfully", null));
    }
}
