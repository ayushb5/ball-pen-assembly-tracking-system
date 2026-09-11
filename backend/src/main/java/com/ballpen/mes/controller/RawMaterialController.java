package com.ballpen.mes.controller;

import com.ballpen.mes.dto.ApiResponse;
import com.ballpen.mes.dto.CreateRawMaterialRequest;
import com.ballpen.mes.dto.RawMaterialDto;
import com.ballpen.mes.service.RawMaterialService;
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
@RequestMapping("/api/v1/raw-materials")
@RequiredArgsConstructor
@Tag(name = "Raw Materials", description = "Factory inventory: barrels, refill tubes, tips, caps, ink, and packaging boxes")
public class RawMaterialController {

    private final RawMaterialService rawMaterialService;

    @GetMapping
    @Operation(summary = "Get all raw materials", description = "Retrieves current inventory stock levels for all component parts")
    public ResponseEntity<ApiResponse<List<RawMaterialDto>>> getAllMaterials() {
        List<RawMaterialDto> materials = rawMaterialService.getAllMaterials();
        return ResponseEntity.ok(ApiResponse.success("Raw materials retrieved successfully", materials));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get raw material by ID", description = "Retrieves stock and reorder thresholds for a specific material")
    public ResponseEntity<ApiResponse<RawMaterialDto>> getMaterialById(@PathVariable Long id) {
        RawMaterialDto material = rawMaterialService.getMaterialById(id);
        return ResponseEntity.ok(ApiResponse.success("Raw material found", material));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Get low stock raw materials", description = "Lists materials that are at or below minimum safety stock")
    public ResponseEntity<ApiResponse<List<RawMaterialDto>>> getLowStockMaterials() {
        List<RawMaterialDto> lowStock = rawMaterialService.getLowStockMaterials();
        return ResponseEntity.ok(ApiResponse.success("Low stock materials retrieved", lowStock));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @Operation(summary = "Create raw material item", description = "Registers a new inventory component SKU")
    public ResponseEntity<ApiResponse<RawMaterialDto>> createMaterial(@Valid @RequestBody CreateRawMaterialRequest request) {
        RawMaterialDto created = rawMaterialService.createMaterial(request);
        return new ResponseEntity<>(ApiResponse.success("Raw material registered successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @Operation(summary = "Update raw material", description = "Updates item name, category, stock thresholds, or units")
    public ResponseEntity<ApiResponse<RawMaterialDto>> updateMaterial(@PathVariable Long id,
                                                                      @Valid @RequestBody CreateRawMaterialRequest request) {
        RawMaterialDto updated = rawMaterialService.updateMaterial(id, request);
        return ResponseEntity.ok(ApiResponse.success("Raw material updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete raw material", description = "Removes raw material item from inventory (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteMaterial(@PathVariable Long id) {
        rawMaterialService.deleteMaterial(id);
        return ResponseEntity.ok(ApiResponse.success("Raw material deleted successfully", null));
    }

    @PatchMapping("/{id}/adjust-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'OPERATOR')")
    @Operation(summary = "Adjust material stock", description = "Increments or decrements current stock quantity (e.g. delta=+500 or -200)")
    public ResponseEntity<ApiResponse<RawMaterialDto>> adjustStock(@PathVariable Long id,
                                                                   @RequestParam int delta) {
        RawMaterialDto updated = rawMaterialService.adjustStock(id, delta);
        return ResponseEntity.ok(ApiResponse.success("Stock quantity adjusted successfully", updated));
    }
}
