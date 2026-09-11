package com.ballpen.mes.service.impl;

import com.ballpen.mes.dto.CreateFinishedGoodsRequest;
import com.ballpen.mes.dto.FinishedGoodsDto;
import com.ballpen.mes.entity.FinishedGoods;
import com.ballpen.mes.entity.Product;
import com.ballpen.mes.entity.ProductionOrder;
import com.ballpen.mes.enums.FinishedGoodsStatus;
import com.ballpen.mes.exception.ResourceNotFoundException;
import com.ballpen.mes.repository.FinishedGoodsRepository;
import com.ballpen.mes.repository.ProductRepository;
import com.ballpen.mes.repository.ProductionOrderRepository;
import com.ballpen.mes.service.FinishedGoodsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FinishedGoodsServiceImpl implements FinishedGoodsService {

    private final FinishedGoodsRepository finishedGoodsRepository;
    private final ProductRepository productRepository;
    private final ProductionOrderRepository productionOrderRepository;

    @Override
    @Transactional(readOnly = true)
    public List<FinishedGoodsDto> getAllFinishedGoods() {
        return finishedGoodsRepository.findAll().stream()
                .map(FinishedGoodsDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FinishedGoodsDto getFinishedGoodsById(Long id) {
        FinishedGoods fg = finishedGoodsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FinishedGoods", "id", id));
        return FinishedGoodsDto.fromEntity(fg);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FinishedGoodsDto> getReadyForDispatch() {
        return finishedGoodsRepository.findByReadyForDispatchTrue().stream()
                .map(FinishedGoodsDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FinishedGoodsDto createFinishedGoods(CreateFinishedGoodsRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        ProductionOrder order = productionOrderRepository.findById(request.getProductionOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductionOrder", "id", request.getProductionOrderId()));

        FinishedGoods fg = FinishedGoods.builder()
                .product(product)
                .productionOrder(order)
                .quantity(request.getQuantity())
                .warehouseLocation(request.getWarehouseLocation())
                .readyForDispatch(request.getReadyForDispatch() != null ? request.getReadyForDispatch() : true)
                .status(request.getStatus() != null ? request.getStatus() : FinishedGoodsStatus.IN_STOCK)
                .receivedDate(request.getReceivedDate())
                .build();

        FinishedGoods saved = finishedGoodsRepository.save(fg);
        log.info("Registered finished goods stock: {} units of {}", saved.getQuantity(), product.getProductName());
        return FinishedGoodsDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public FinishedGoodsDto updateFinishedGoods(Long id, CreateFinishedGoodsRequest request) {
        FinishedGoods fg = finishedGoodsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FinishedGoods", "id", id));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        ProductionOrder order = productionOrderRepository.findById(request.getProductionOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductionOrder", "id", request.getProductionOrderId()));

        fg.setProduct(product);
        fg.setProductionOrder(order);
        fg.setQuantity(request.getQuantity());
        fg.setWarehouseLocation(request.getWarehouseLocation());
        if (request.getReadyForDispatch() != null) {
            fg.setReadyForDispatch(request.getReadyForDispatch());
        }
        if (request.getStatus() != null) {
            fg.setStatus(request.getStatus());
        }
        fg.setReceivedDate(request.getReceivedDate());

        FinishedGoods updated = finishedGoodsRepository.save(fg);
        log.info("Updated finished goods ID {}", id);
        return FinishedGoodsDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public FinishedGoodsDto toggleDispatchReady(Long id) {
        FinishedGoods fg = finishedGoodsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FinishedGoods", "id", id));

        fg.setReadyForDispatch(!Boolean.TRUE.equals(fg.getReadyForDispatch()));
        FinishedGoods updated = finishedGoodsRepository.save(fg);
        log.info("Toggled dispatch readiness for finished goods ID {} to {}", id, updated.getReadyForDispatch());
        return FinishedGoodsDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public FinishedGoodsDto updateLocation(Long id, String location) {
        FinishedGoods fg = finishedGoodsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FinishedGoods", "id", id));

        fg.setWarehouseLocation(location);
        FinishedGoods updated = finishedGoodsRepository.save(fg);
        log.info("Updated warehouse location for finished goods ID {} to {}", id, location);
        return FinishedGoodsDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteFinishedGoods(Long id) {
        FinishedGoods fg = finishedGoodsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FinishedGoods", "id", id));
        finishedGoodsRepository.delete(fg);
        log.info("Deleted finished goods entry ID {}", id);
    }
}
