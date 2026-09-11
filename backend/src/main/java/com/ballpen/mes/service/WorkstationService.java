package com.ballpen.mes.service;

import com.ballpen.mes.dto.AssignWorkstationRequest;
import com.ballpen.mes.dto.CreateWorkstationRequest;
import com.ballpen.mes.dto.WorkstationDto;
import com.ballpen.mes.enums.WorkstationStatus;

import java.util.List;

public interface WorkstationService {

    List<WorkstationDto> getAllWorkstations();

    WorkstationDto getWorkstationById(Long id);

    WorkstationDto createWorkstation(CreateWorkstationRequest request);

    WorkstationDto updateWorkstation(Long id, CreateWorkstationRequest request);

    WorkstationDto updateStatus(Long id, WorkstationStatus status);

    WorkstationDto assignOperatorAndOrder(Long id, AssignWorkstationRequest request);

    void deleteWorkstation(Long id);
}
