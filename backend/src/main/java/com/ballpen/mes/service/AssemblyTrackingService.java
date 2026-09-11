package com.ballpen.mes.service;

import com.ballpen.mes.dto.AssemblyTrackingDto;
import com.ballpen.mes.dto.UpdateStageRequest;

import java.util.List;

public interface AssemblyTrackingService {

    List<AssemblyTrackingDto> getAllTracking();

    List<AssemblyTrackingDto> getTrackingByOrderId(Long orderId);

    AssemblyTrackingDto getTrackingById(Long id);

    AssemblyTrackingDto updateStage(Long id, UpdateStageRequest request);

    AssemblyTrackingDto startStage(Long id, Long employeeId, String remarks);

    AssemblyTrackingDto completeStage(Long id, String remarks);
}
