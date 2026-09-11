package com.ballpen.mes.service.impl;

import com.ballpen.mes.dto.CreateRawMaterialRequest;
import com.ballpen.mes.dto.RawMaterialDto;
import com.ballpen.mes.entity.RawMaterial;
import com.ballpen.mes.exception.BadRequestException;
import com.ballpen.mes.exception.ResourceNotFoundException;
import com.ballpen.mes.repository.RawMaterialRepository;
import com.ballpen.mes.service.RawMaterialService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RawMaterialServiceImpl implements RawMaterialService {

    private final RawMaterialRepository rawMaterialRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RawMaterialDto> getAllMaterials() {
        return rawMaterialRepository.findAll().stream()
                .map(RawMaterialDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RawMaterialDto getMaterialById(Long id) {
        RawMaterial rm = rawMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material", "id", id));
        return RawMaterialDto.fromEntity(rm);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RawMaterialDto> getLowStockMaterials() {
        return rawMaterialRepository.findLowStockMaterials().stream()
                .map(RawMaterialDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RawMaterialDto createMaterial(CreateRawMaterialRequest request) {
        if (rawMaterialRepository.existsByMaterialCode(request.getMaterialCode())) {
            throw new BadRequestException("Material code '" + request.getMaterialCode() + "' already exists");
        }

        RawMaterial rm = RawMaterial.builder()
                .materialCode(request.getMaterialCode())
                .materialName(request.getMaterialName())
                .category(request.getCategory())
                .availableQuantity(request.getAvailableQuantity())
                .unit(request.getUnit())
                .minimumStock(request.getMinimumStock())
                .build();

        RawMaterial saved = rawMaterialRepository.save(rm);
        log.info("Created new raw material: {} ({})", saved.getMaterialName(), saved.getMaterialCode());
        return RawMaterialDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public RawMaterialDto updateMaterial(Long id, CreateRawMaterialRequest request) {
        RawMaterial rm = rawMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material", "id", id));

        if (!rm.getMaterialCode().equals(request.getMaterialCode())
                && rawMaterialRepository.existsByMaterialCode(request.getMaterialCode())) {
            throw new BadRequestException("Material code '" + request.getMaterialCode() + "' already exists");
        }

        rm.setMaterialCode(request.getMaterialCode());
        rm.setMaterialName(request.getMaterialName());
        rm.setCategory(request.getCategory());
        rm.setAvailableQuantity(request.getAvailableQuantity());
        rm.setUnit(request.getUnit());
        rm.setMinimumStock(request.getMinimumStock());

        RawMaterial updated = rawMaterialRepository.save(rm);
        log.info("Updated raw material: {} ({})", updated.getMaterialName(), updated.getMaterialCode());
        return RawMaterialDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteMaterial(Long id) {
        RawMaterial rm = rawMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material", "id", id));
        rawMaterialRepository.delete(rm);
        log.info("Deleted raw material with ID: {}", id);
    }

    @Override
    @Transactional
    public RawMaterialDto adjustStock(Long id, int quantityDelta) {
        RawMaterial rm = rawMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material", "id", id));

        int newQty = rm.getAvailableQuantity() + quantityDelta;
        if (newQty < 0) {
            throw new BadRequestException("Stock cannot be reduced below zero. Current stock: " + rm.getAvailableQuantity());
        }

        rm.setAvailableQuantity(newQty);
        RawMaterial updated = rawMaterialRepository.save(rm);
        log.info("Adjusted stock for {} by {}. New total: {}", rm.getMaterialCode(), quantityDelta, newQty);
        return RawMaterialDto.fromEntity(updated);
    }
}
