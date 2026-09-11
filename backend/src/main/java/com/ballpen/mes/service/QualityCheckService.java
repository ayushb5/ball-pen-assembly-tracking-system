package com.ballpen.mes.service;

import com.ballpen.mes.dto.CreateQualityCheckRequest;
import com.ballpen.mes.dto.QualityCheckDto;

import java.util.List;

public interface QualityCheckService {

    List<QualityCheckDto> getAllQualityChecks();

    QualityCheckDto getQualityCheckById(Long id);

    List<QualityCheckDto> getQualityChecksByOrderId(Long orderId);

    QualityCheckDto createQualityCheck(CreateQualityCheckRequest request);

    QualityCheckDto updateQualityCheck(Long id, CreateQualityCheckRequest request);

    void deleteQualityCheck(Long id);
}
