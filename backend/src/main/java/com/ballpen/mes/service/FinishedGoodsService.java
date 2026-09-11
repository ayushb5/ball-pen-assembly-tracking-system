package com.ballpen.mes.service;

import com.ballpen.mes.dto.CreateFinishedGoodsRequest;
import com.ballpen.mes.dto.FinishedGoodsDto;

import java.util.List;

public interface FinishedGoodsService {

    List<FinishedGoodsDto> getAllFinishedGoods();

    FinishedGoodsDto getFinishedGoodsById(Long id);

    List<FinishedGoodsDto> getReadyForDispatch();

    FinishedGoodsDto createFinishedGoods(CreateFinishedGoodsRequest request);

    FinishedGoodsDto updateFinishedGoods(Long id, CreateFinishedGoodsRequest request);

    FinishedGoodsDto toggleDispatchReady(Long id);

    FinishedGoodsDto updateLocation(Long id, String location);

    void deleteFinishedGoods(Long id);
}
