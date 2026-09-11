package com.ballpen.mes.service;

import com.ballpen.mes.dto.CreateDispatchRequest;
import com.ballpen.mes.dto.DispatchDto;
import com.ballpen.mes.enums.DispatchStatus;

import java.util.List;

public interface DispatchService {

    List<DispatchDto> getAllDispatches();

    DispatchDto getDispatchById(Long id);

    List<DispatchDto> getDispatchesByCustomerId(Long customerId);

    DispatchDto createDispatch(CreateDispatchRequest request);

    DispatchDto updateDispatch(Long id, CreateDispatchRequest request);

    DispatchDto updateStatus(Long id, DispatchStatus status);

    void deleteDispatch(Long id);
}
