package com.ballpen.mes.service;

import com.ballpen.mes.dto.CreateRawMaterialRequest;
import com.ballpen.mes.dto.RawMaterialDto;

import java.util.List;

public interface RawMaterialService {

    List<RawMaterialDto> getAllMaterials();

    RawMaterialDto getMaterialById(Long id);

    List<RawMaterialDto> getLowStockMaterials();

    RawMaterialDto createMaterial(CreateRawMaterialRequest request);

    RawMaterialDto updateMaterial(Long id, CreateRawMaterialRequest request);

    void deleteMaterial(Long id);

    RawMaterialDto adjustStock(Long id, int quantityDelta);
}
