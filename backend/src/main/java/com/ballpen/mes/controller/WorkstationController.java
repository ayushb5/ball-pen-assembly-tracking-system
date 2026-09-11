package com.ballpen.mes.controller;

import com.ballpen.mes.dto.ApiResponse;
import com.ballpen.mes.dto.AssignWorkstationRequest;
import com.ballpen.mes.dto.CreateWorkstationRequest;
import com.ballpen.mes.dto.WorkstationDto;
import com.ballpen.mes.enums.WorkstationStatus;
import com.ballpen.mes.service.WorkstationService;
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
@RequestMapping("/api/v1/workstations")
@RequiredArgsConstructor
@Tag(name = "Workstations", description = "Physical assembly cells and machine stations management")
public class WorkstationController {

    private final WorkstationService workstationService;

    @GetMapping
    @Operation(summary = "Get all workstations", description = "Retrieves factory floor workstation list with live statuses")
    public ResponseEntity<ApiResponse<List<WorkstationDto>>> getAllWorkstations() {
        List<WorkstationDto> workstations = workstationService.getAllWorkstations();
        return ResponseEntity.ok(ApiResponse.success("Workstations retrieved successfully", workstations));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get workstation by ID", description = "Retrieves workstation details, assigned employee and order")
    public ResponseEntity<ApiResponse<WorkstationDto>> getWorkstationById(@PathVariable Long id) {
        WorkstationDto workstation = workstationService.getWorkstationById(id);
        return ResponseEntity.ok(ApiResponse.success("Workstation found", workstation));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @Operation(summary = "Register a new workstation", description = "Creates a new assembly floor station/machine")
    public ResponseEntity<ApiResponse<WorkstationDto>> createWorkstation(@Valid @RequestBody CreateWorkstationRequest request) {
        WorkstationDto created = workstationService.createWorkstation(request);
        return new ResponseEntity<>(ApiResponse.success("Workstation registered successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @Operation(summary = "Update workstation", description = "Updates code, name, type, assigned employee or current order")
    public ResponseEntity<ApiResponse<WorkstationDto>> updateWorkstation(@PathVariable Long id,
                                                                         @Valid @RequestBody CreateWorkstationRequest request) {
        WorkstationDto updated = workstationService.updateWorkstation(id, request);
        return ResponseEntity.ok(ApiResponse.success("Workstation updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update workstation status", description = "Changes station state: IDLE, RUNNING, MAINTENANCE, OFFLINE")
    public ResponseEntity<ApiResponse<WorkstationDto>> updateStatus(@PathVariable Long id,
                                                                    @RequestParam WorkstationStatus status) {
        WorkstationDto updated = workstationService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Workstation status updated", updated));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @Operation(summary = "Assign operator and order to workstation", description = "Directly allocates active production order and operator to workstation")
    public ResponseEntity<ApiResponse<WorkstationDto>> assignWorkstation(@PathVariable Long id,
                                                                         @RequestBody AssignWorkstationRequest request) {
        WorkstationDto updated = workstationService.assignOperatorAndOrder(id, request);
        return ResponseEntity.ok(ApiResponse.success("Workstation assignment updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete workstation", description = "Deletes workstation record from floor (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteWorkstation(@PathVariable Long id) {
        workstationService.deleteWorkstation(id);
        return ResponseEntity.ok(ApiResponse.success("Workstation deleted successfully", null));
    }
}
