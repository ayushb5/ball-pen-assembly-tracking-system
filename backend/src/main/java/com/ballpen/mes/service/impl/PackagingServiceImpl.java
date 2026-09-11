package com.ballpen.mes.service.impl;

import com.ballpen.mes.dto.CreatePackagingRequest;
import com.ballpen.mes.dto.PackagingDto;
import com.ballpen.mes.entity.AssemblyTracking;
import com.ballpen.mes.entity.Employee;
import com.ballpen.mes.entity.FinishedGoods;
import com.ballpen.mes.entity.Packaging;
import com.ballpen.mes.entity.ProductionOrder;
import com.ballpen.mes.enums.AssemblyStage;
import com.ballpen.mes.enums.AssemblyStatus;
import com.ballpen.mes.enums.FinishedGoodsStatus;
import com.ballpen.mes.enums.OrderStatus;
import com.ballpen.mes.exception.BadRequestException;
import com.ballpen.mes.exception.ResourceNotFoundException;
import com.ballpen.mes.repository.*;
import com.ballpen.mes.service.PackagingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PackagingServiceImpl implements PackagingService {

    private final PackagingRepository packagingRepository;
    private final ProductionOrderRepository productionOrderRepository;
    private final EmployeeRepository employeeRepository;
    private final AssemblyTrackingRepository assemblyTrackingRepository;
    private final FinishedGoodsRepository finishedGoodsRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PackagingDto> getAllPackaging() {
        return packagingRepository.findAll().stream()
                .map(PackagingDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PackagingDto getPackagingById(Long id) {
        Packaging pkg = packagingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Packaging", "id", id));
        return PackagingDto.fromEntity(pkg);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PackagingDto> getPackagingByOrderId(Long orderId) {
        return packagingRepository.findByProductionOrderId(orderId).stream()
                .map(PackagingDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PackagingDto createPackaging(CreatePackagingRequest request) {
        if (packagingRepository.existsByPackageNumber(request.getPackageNumber())) {
            throw new BadRequestException("Package number '" + request.getPackageNumber() + "' already exists");
        }

        ProductionOrder order = productionOrderRepository.findById(request.getProductionOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductionOrder", "id", request.getProductionOrderId()));

        Employee packedBy = employeeRepository.findById(request.getPackedById())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getPackedById()));

        Packaging packaging = Packaging.builder()
                .packageNumber(request.getPackageNumber())
                .productionOrder(order)
                .quantity(request.getQuantity())
                .packedBy(packedBy)
                .packingDate(request.getPackingDate())
                .packagingType(request.getPackagingType() != null && !request.getPackagingType().isBlank()
                        ? request.getPackagingType() : "Standard Carton (100 pens)")
                .remarks(request.getRemarks())
                .build();

        Packaging saved = packagingRepository.save(packaging);

        // Advance PACKAGING stage in AssemblyTracking
        Optional<AssemblyTracking> packStageOpt = assemblyTrackingRepository
                .findByProductionOrderIdAndStage(order.getId(), AssemblyStage.PACKAGING);
        if (packStageOpt.isPresent()) {
            AssemblyTracking packStage = packStageOpt.get();
            packStage.setStatus(AssemblyStatus.COMPLETED);
            if (packStage.getCompletedTime() == null) {
                packStage.setCompletedTime(LocalDateTime.now());
            }
            packStage.setAssignedEmployee(packedBy);
            packStage.setRemarks("Packed: " + saved.getQuantity() + " pens (" + saved.getPackagingType() + ")");
            assemblyTrackingRepository.save(packStage);
        }

        // Check/create FinishedGoods record
        List<FinishedGoods> existingFG = finishedGoodsRepository.findByProductionOrderId(order.getId());
        if (existingFG.isEmpty()) {
            FinishedGoods fg = FinishedGoods.builder()
                    .product(order.getProduct())
                    .productionOrder(order)
                    .quantity(saved.getQuantity())
                    .warehouseLocation("Bay-A / Shelf-01")
                    .readyForDispatch(true)
                    .status(FinishedGoodsStatus.IN_STOCK)
                    .receivedDate(saved.getPackingDate())
                    .build();
            finishedGoodsRepository.save(fg);
        } else {
            FinishedGoods fg = existingFG.get(0);
            fg.setQuantity(fg.getQuantity() + saved.getQuantity());
            finishedGoodsRepository.save(fg);
        }

        // Advance FINISHED_GOODS stage in AssemblyTracking
        Optional<AssemblyTracking> fgStageOpt = assemblyTrackingRepository
                .findByProductionOrderIdAndStage(order.getId(), AssemblyStage.FINISHED_GOODS);
        if (fgStageOpt.isPresent()) {
            AssemblyTracking fgStage = fgStageOpt.get();
            fgStage.setStatus(AssemblyStatus.COMPLETED);
            if (fgStage.getCompletedTime() == null) {
                fgStage.setCompletedTime(LocalDateTime.now());
            }
            fgStage.setAssignedEmployee(packedBy);
            fgStage.setRemarks("Received in warehouse inventory ready for dispatch");
            assemblyTrackingRepository.save(fgStage);
        }

        // Update order produced quantity to actual packaged good units (prevents double counting)
        List<Packaging> allPkgs = packagingRepository.findByProductionOrderId(order.getId());
        int totalPackaged = allPkgs.stream().mapToInt(Packaging::getQuantity).sum();
        order.setProducedQuantity(totalPackaged);
        if (order.getProducedQuantity() >= order.getOrderedQuantity()) {
            order.setStatus(OrderStatus.COMPLETED);
        }
        productionOrderRepository.save(order);

        log.info("Logged packaging {} for order {}", saved.getPackageNumber(), order.getOrderNumber());
        return PackagingDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public PackagingDto updatePackaging(Long id, CreatePackagingRequest request) {
        Packaging pkg = packagingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Packaging", "id", id));

        if (!pkg.getPackageNumber().equalsIgnoreCase(request.getPackageNumber())
                && packagingRepository.existsByPackageNumber(request.getPackageNumber())) {
            throw new BadRequestException("Package number '" + request.getPackageNumber() + "' already exists");
        }

        ProductionOrder order = productionOrderRepository.findById(request.getProductionOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductionOrder", "id", request.getProductionOrderId()));

        Employee packedBy = employeeRepository.findById(request.getPackedById())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getPackedById()));

        pkg.setPackageNumber(request.getPackageNumber());
        pkg.setProductionOrder(order);
        pkg.setQuantity(request.getQuantity());
        pkg.setPackedBy(packedBy);
        pkg.setPackingDate(request.getPackingDate());
        if (request.getPackagingType() != null) {
            pkg.setPackagingType(request.getPackagingType());
        }
        pkg.setRemarks(request.getRemarks());

        Packaging updated = packagingRepository.save(pkg);
        log.info("Updated packaging {}", updated.getPackageNumber());
        return PackagingDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deletePackaging(Long id) {
        Packaging pkg = packagingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Packaging", "id", id));
        packagingRepository.delete(pkg);
        log.info("Deleted packaging {}", pkg.getPackageNumber());
    }
}
