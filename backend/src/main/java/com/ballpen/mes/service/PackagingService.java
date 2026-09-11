package com.ballpen.mes.service;

import com.ballpen.mes.dto.CreatePackagingRequest;
import com.ballpen.mes.dto.PackagingDto;

import java.util.List;

public interface PackagingService {

    List<PackagingDto> getAllPackaging();

    PackagingDto getPackagingById(Long id);

    List<PackagingDto> getPackagingByOrderId(Long orderId);

    PackagingDto createPackaging(CreatePackagingRequest request);

    PackagingDto updatePackaging(Long id, CreatePackagingRequest request);

    void deletePackaging(Long id);
}
