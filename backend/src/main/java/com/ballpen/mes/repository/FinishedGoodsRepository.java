package com.ballpen.mes.repository;

import com.ballpen.mes.entity.FinishedGoods;
import com.ballpen.mes.enums.FinishedGoodsStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FinishedGoodsRepository extends JpaRepository<FinishedGoods, Long> {

    List<FinishedGoods> findByProductId(Long productId);

    List<FinishedGoods> findByStatus(FinishedGoodsStatus status);

    List<FinishedGoods> findByReadyForDispatchTrue();

    List<FinishedGoods> findByProductionOrderId(Long productionOrderId);

    @Query("SELECT COALESCE(SUM(fg.quantity), 0) FROM FinishedGoods fg WHERE fg.status = :status")
    Long sumTotalQuantityByStatus(@Param("status") FinishedGoodsStatus status);

    @Query("SELECT COALESCE(SUM(fg.quantity), 0) FROM FinishedGoods fg WHERE fg.status = com.ballpen.mes.enums.FinishedGoodsStatus.IN_STOCK")
    Long sumTotalInStockQuantity();

    @Query("SELECT COALESCE(SUM(fg.quantity), 0) FROM FinishedGoods fg WHERE fg.receivedDate = :date")
    Long sumQuantityByReceivedDate(@Param("date") LocalDate date);
}

