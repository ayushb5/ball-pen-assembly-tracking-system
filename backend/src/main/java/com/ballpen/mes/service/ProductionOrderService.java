package com.ballpen.mes.service;

import com.ballpen.mes.dto.CreateProductionOrderRequest;
import com.ballpen.mes.dto.ProductionOrderDto;
import com.ballpen.mes.dto.UpdateProductionOrderRequest;
import com.ballpen.mes.enums.OrderStatus;

import java.util.List;

public interface ProductionOrderService {

    List<ProductionOrderDto> getAllOrders();

    ProductionOrderDto getOrderById(Long id);

    ProductionOrderDto createOrder(CreateProductionOrderRequest request);

    ProductionOrderDto updateOrder(Long id, UpdateProductionOrderRequest request);

    void deleteOrder(Long id);

    ProductionOrderDto updateOrderStatus(Long id, OrderStatus status);
}
