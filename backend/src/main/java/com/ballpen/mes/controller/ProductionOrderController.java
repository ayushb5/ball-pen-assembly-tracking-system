package com.ballpen.mes.controller;

import com.ballpen.mes.dto.ApiResponse;
import com.ballpen.mes.dto.CreateProductionOrderRequest;
import com.ballpen.mes.dto.ProductionOrderDto;
import com.ballpen.mes.dto.UpdateProductionOrderRequest;
import com.ballpen.mes.enums.OrderStatus;
import com.ballpen.mes.service.ProductionOrderService;
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
@RequestMapping("/api/v1/production-orders")
@RequiredArgsConstructor
@Tag(name = "Production Orders", description = "Manufacturing work orders, product assignment, quotas, and lifecycle transitions")
public class ProductionOrderController {

    private final ProductionOrderService productionOrderService;

    @GetMapping
    @Operation(summary = "Get all production orders", description = "Retrieves all manufacturing orders with live progress tallies")
    public ResponseEntity<ApiResponse<List<ProductionOrderDto>>> getAllOrders() {
        List<ProductionOrderDto> orders = productionOrderService.getAllOrders();
        return ResponseEntity.ok(ApiResponse.success("Production orders retrieved successfully", orders));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get production order by ID", description = "Retrieves details for a specific manufacturing work order")
    public ResponseEntity<ApiResponse<ProductionOrderDto>> getOrderById(@PathVariable Long id) {
        ProductionOrderDto order = productionOrderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success("Production order found", order));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @Operation(summary = "Create production order", description = "Creates a new pen manufacturing batch and initializes 8 assembly stages")
    public ResponseEntity<ApiResponse<ProductionOrderDto>> createOrder(@Valid @RequestBody CreateProductionOrderRequest request) {
        ProductionOrderDto created = productionOrderService.createOrder(request);
        return new ResponseEntity<>(ApiResponse.success("Production order created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @Operation(summary = "Update production order", description = "Modifies quotas, due date, status, or priority")
    public ResponseEntity<ApiResponse<ProductionOrderDto>> updateOrder(@PathVariable Long id,
                                                                       @Valid @RequestBody UpdateProductionOrderRequest request) {
        ProductionOrderDto updated = productionOrderService.updateOrder(id, request);
        return ResponseEntity.ok(ApiResponse.success("Production order updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete production order", description = "Removes a production order (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Long id) {
        productionOrderService.deleteOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Production order deleted successfully", null));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @Operation(summary = "Update order status", description = "Advances or updates order status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)")
    public ResponseEntity<ApiResponse<ProductionOrderDto>> updateOrderStatus(@PathVariable Long id,
                                                                             @RequestParam OrderStatus status) {
        ProductionOrderDto updated = productionOrderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", updated));
    }
}
