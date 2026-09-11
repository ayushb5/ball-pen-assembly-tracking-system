package com.ballpen.mes.service.impl;

import com.ballpen.mes.dto.CreateProductionOrderRequest;
import com.ballpen.mes.dto.ProductionOrderDto;
import com.ballpen.mes.dto.UpdateProductionOrderRequest;
import com.ballpen.mes.entity.AssemblyTracking;
import com.ballpen.mes.entity.Customer;
import com.ballpen.mes.entity.Product;
import com.ballpen.mes.entity.ProductionOrder;
import com.ballpen.mes.enums.AssemblyStage;
import com.ballpen.mes.enums.AssemblyStatus;
import com.ballpen.mes.enums.OrderStatus;
import com.ballpen.mes.exception.BadRequestException;
import com.ballpen.mes.exception.ResourceNotFoundException;
import com.ballpen.mes.repository.AssemblyTrackingRepository;
import com.ballpen.mes.repository.CustomerRepository;
import com.ballpen.mes.repository.ProductRepository;
import com.ballpen.mes.repository.ProductionOrderRepository;
import com.ballpen.mes.service.ProductionOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductionOrderServiceImpl implements ProductionOrderService {

    private final ProductionOrderRepository productionOrderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final AssemblyTrackingRepository assemblyTrackingRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductionOrderDto> getAllOrders() {
        return productionOrderRepository.findAll().stream()
                .map(ProductionOrderDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductionOrderDto getOrderById(Long id) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production Order", "id", id));
        return ProductionOrderDto.fromEntity(order);
    }

    @Override
    @Transactional
    public ProductionOrderDto createOrder(CreateProductionOrderRequest request) {
        if (productionOrderRepository.existsByOrderNumber(request.getOrderNumber())) {
            throw new BadRequestException("Order number '" + request.getOrderNumber() + "' already exists");
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        ProductionOrder order = ProductionOrder.builder()
                .orderNumber(request.getOrderNumber())
                .customer(customer)
                .product(product)
                .orderedQuantity(request.getOrderedQuantity())
                .producedQuantity(0)
                .dueDate(request.getDueDate())
                .status(request.getStatus() != null ? request.getStatus() : OrderStatus.PENDING)
                .priority(request.getPriority() != null ? request.getPriority() : request.getPriority())
                .notes(request.getNotes())
                .build();

        ProductionOrder saved = productionOrderRepository.save(order);

        // Automatically initialize the 8 sequential assembly line stages for this order
        for (AssemblyStage stage : AssemblyStage.values()) {
            AssemblyTracking tracking = AssemblyTracking.builder()
                    .productionOrder(saved)
                    .stage(stage)
                    .status(AssemblyStatus.PENDING)
                    .remarks("Initial queue entry")
                    .build();
            assemblyTrackingRepository.save(tracking);
        }

        log.info("Created production order {} and initialized 8 assembly stages", saved.getOrderNumber());
        return ProductionOrderDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public ProductionOrderDto updateOrder(Long id, UpdateProductionOrderRequest request) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production Order", "id", id));

        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));
            order.setCustomer(customer);
        }

        if (request.getProductId() != null) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));
            order.setProduct(product);
        }

        if (request.getOrderedQuantity() != null) {
            order.setOrderedQuantity(request.getOrderedQuantity());
        }

        if (request.getProducedQuantity() != null) {
            order.setProducedQuantity(request.getProducedQuantity());
        }

        if (request.getDueDate() != null) {
            order.setDueDate(request.getDueDate());
        }

        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
        }

        if (request.getPriority() != null) {
            order.setPriority(request.getPriority());
        }

        if (request.getNotes() != null) {
            order.setNotes(request.getNotes());
        }

        ProductionOrder updated = productionOrderRepository.save(order);
        log.info("Updated production order {}", updated.getOrderNumber());
        return ProductionOrderDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteOrder(Long id) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production Order", "id", id));
        productionOrderRepository.delete(order);
        log.info("Deleted production order with ID: {}", id);
    }

    @Override
    @Transactional
    public ProductionOrderDto updateOrderStatus(Long id, OrderStatus status) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production Order", "id", id));

        order.setStatus(status);
        ProductionOrder updated = productionOrderRepository.save(order);
        log.info("Updated order {} status to {}", order.getOrderNumber(), status);
        return ProductionOrderDto.fromEntity(updated);
    }
}
