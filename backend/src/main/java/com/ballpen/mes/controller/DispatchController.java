package com.ballpen.mes.controller;

import com.ballpen.mes.dto.ApiResponse;
import com.ballpen.mes.dto.CreateDispatchRequest;
import com.ballpen.mes.dto.DispatchDto;
import com.ballpen.mes.enums.DispatchStatus;
import com.ballpen.mes.service.DispatchService;
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
@RequestMapping("/api/v1/dispatch")
@RequiredArgsConstructor
@Tag(name = "Dispatch", description = "Finished pen shipments, courier tracking, and customer deliveries")
public class DispatchController {

    private final DispatchService dispatchService;

    @GetMapping
    @Operation(summary = "Get all shipments", description = "Retrieves all client outbound dispatches and delivery orders")
    public ResponseEntity<ApiResponse<List<DispatchDto>>> getAllDispatches() {
        List<DispatchDto> list = dispatchService.getAllDispatches();
        return ResponseEntity.ok(ApiResponse.success("Dispatches retrieved successfully", list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get dispatch by ID", description = "Retrieves shipment details, customer, courier and tracking info")
    public ResponseEntity<ApiResponse<DispatchDto>> getDispatchById(@PathVariable Long id) {
        DispatchDto dto = dispatchService.getDispatchById(id);
        return ResponseEntity.ok(ApiResponse.success("Dispatch found", dto));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get shipments for a customer", description = "Retrieves order shipment history for specific client")
    public ResponseEntity<ApiResponse<List<DispatchDto>>> getDispatchesByCustomerId(@PathVariable Long customerId) {
        List<DispatchDto> list = dispatchService.getDispatchesByCustomerId(customerId);
        return ResponseEntity.ok(ApiResponse.success("Customer shipments retrieved", list));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @Operation(summary = "Create client dispatch shipment", description = "Logs pen shipment, assigns courier, and decrements finished inventory")
    public ResponseEntity<ApiResponse<DispatchDto>> createDispatch(@Valid @RequestBody CreateDispatchRequest request) {
        DispatchDto created = dispatchService.createDispatch(request);
        return new ResponseEntity<>(ApiResponse.success("Dispatch logged successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @Operation(summary = "Update dispatch details", description = "Updates courier, tracking code, or shipment quantity")
    public ResponseEntity<ApiResponse<DispatchDto>> updateDispatch(@PathVariable Long id,
                                                                   @Valid @RequestBody CreateDispatchRequest request) {
        DispatchDto updated = dispatchService.updateDispatch(id, request);
        return ResponseEntity.ok(ApiResponse.success("Dispatch updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @Operation(summary = "Update shipment delivery status", description = "Transitions status between PREPARING, SHIPPED, DELIVERED, RETURNED")
    public ResponseEntity<ApiResponse<DispatchDto>> updateStatus(@PathVariable Long id,
                                                                 @RequestParam DispatchStatus status) {
        DispatchDto updated = dispatchService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Dispatch status updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete dispatch record", description = "Removes dispatch entry (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteDispatch(@PathVariable Long id) {
        dispatchService.deleteDispatch(id);
        return ResponseEntity.ok(ApiResponse.success("Dispatch record deleted successfully", null));
    }
}
