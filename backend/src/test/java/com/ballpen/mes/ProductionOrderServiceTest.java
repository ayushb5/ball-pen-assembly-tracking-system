package com.ballpen.mes;

import com.ballpen.mes.dto.CreateProductionOrderRequest;
import com.ballpen.mes.dto.ProductionOrderDto;
import com.ballpen.mes.entity.Customer;
import com.ballpen.mes.entity.Product;
import com.ballpen.mes.entity.ProductionOrder;
import com.ballpen.mes.enums.OrderStatus;
import com.ballpen.mes.repository.AssemblyTrackingRepository;
import com.ballpen.mes.repository.CustomerRepository;
import com.ballpen.mes.repository.ProductRepository;
import com.ballpen.mes.repository.ProductionOrderRepository;
import com.ballpen.mes.service.impl.ProductionOrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductionOrderServiceTest {

    @Mock
    private ProductionOrderRepository productionOrderRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private AssemblyTrackingRepository assemblyTrackingRepository;

    @InjectMocks
    private ProductionOrderServiceImpl productionOrderService;

    private Customer sampleCustomer;
    private Product sampleProduct;
    private ProductionOrder sampleOrder;

    @BeforeEach
    void setUp() {
        sampleCustomer = Customer.builder()
                .id(1L)
                .customerCode("CUST-001")
                .customerName("Apex Stationers")
                .build();

        sampleProduct = Product.builder()
                .id(1L)
                .productCode("PEN-BLU-01")
                .productName("Classic Grip Ball Pen - Blue")
                .sellingPrice(new BigDecimal("10.00"))
                .build();

        sampleOrder = ProductionOrder.builder()
                .id(1L)
                .orderNumber("PO-2026-TEST")
                .customer(sampleCustomer)
                .product(sampleProduct)
                .orderedQuantity(1000)
                .producedQuantity(0)
                .dueDate(LocalDate.now().plusDays(10))
                .status(OrderStatus.PENDING)
                .build();
    }

    @Test
    @DisplayName("Should create production order and initialize 8 sequential assembly stages")
    void testCreateOrderInitializes8Stages() {
        CreateProductionOrderRequest request = CreateProductionOrderRequest.builder()
                .orderNumber("PO-2026-TEST")
                .customerId(1L)
                .productId(1L)
                .orderedQuantity(1000)
                .dueDate(LocalDate.now().plusDays(10))
                .build();

        when(productionOrderRepository.existsByOrderNumber("PO-2026-TEST")).thenReturn(false);
        when(customerRepository.findById(1L)).thenReturn(Optional.of(sampleCustomer));
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(productionOrderRepository.save(any(ProductionOrder.class))).thenReturn(sampleOrder);

        ProductionOrderDto result = productionOrderService.createOrder(request);

        assertNotNull(result);
        assertEquals("PO-2026-TEST", result.getOrderNumber());
        assertEquals(1000, result.getOrderedQuantity());
        assertEquals("Apex Stationers", result.getCustomerName());

        // Verify that 8 assembly stages were saved
        verify(assemblyTrackingRepository, times(8)).save(any());
    }

    @Test
    @DisplayName("Should retrieve order by ID")
    void testGetOrderById() {
        when(productionOrderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));

        ProductionOrderDto result = productionOrderService.getOrderById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("PO-2026-TEST", result.getOrderNumber());
    }
}
