package com.ballpen.mes.controller;

import com.ballpen.mes.dto.ApiResponse;
import com.ballpen.mes.dto.CreatePackagingRequest;
import com.ballpen.mes.dto.PackagingDto;
import com.ballpen.mes.service.PackagingService;
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
@RequestMapping("/api/v1/packaging")
@RequiredArgsConstructor
@Tag(name = "Packaging", description = "Boxing, blistering, and carton packaging of finished ball pens")
public class PackagingController {

    private final PackagingService packagingService;

    @GetMapping
    @Operation(summary = "Get all packaging records", description = "Retrieves all cartons, blister packs, and boxed batches")
    public ResponseEntity<ApiResponse<List<PackagingDto>>> getAllPackaging() {
        List<PackagingDto> list = packagingService.getAllPackaging();
        return ResponseEntity.ok(ApiResponse.success("Packaging records retrieved successfully", list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get packaging batch by ID", description = "Retrieves packaging record details, quantities and carton specs")
    public ResponseEntity<ApiResponse<PackagingDto>> getPackagingById(@PathVariable Long id) {
        PackagingDto pkg = packagingService.getPackagingById(id);
        return ResponseEntity.ok(ApiResponse.success("Packaging batch found", pkg));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get packaging for an order", description = "Retrieves all boxes/cartons created for a production order")
    public ResponseEntity<ApiResponse<List<PackagingDto>>> getPackagingByOrderId(@PathVariable Long orderId) {
        List<PackagingDto> list = packagingService.getPackagingByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order packaging batches retrieved", list));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'OPERATOR')")
    @Operation(summary = "Log new packaging batch", description = "Registers boxed pen cartons, links order, updates inventory")
    public ResponseEntity<ApiResponse<PackagingDto>> createPackaging(@Valid @RequestBody CreatePackagingRequest request) {
        PackagingDto created = packagingService.createPackaging(request);
        return new ResponseEntity<>(ApiResponse.success("Packaging batch registered successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @Operation(summary = "Update packaging record", description = "Updates quantity, packaging type, or remarks")
    public ResponseEntity<ApiResponse<PackagingDto>> updatePackaging(@PathVariable Long id,
                                                                     @Valid @RequestBody CreatePackagingRequest request) {
        PackagingDto updated = packagingService.updatePackaging(id, request);
        return ResponseEntity.ok(ApiResponse.success("Packaging updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete packaging record", description = "Removes packaging record (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deletePackaging(@PathVariable Long id) {
        packagingService.deletePackaging(id);
        return ResponseEntity.ok(ApiResponse.success("Packaging record deleted successfully", null));
    }
}
