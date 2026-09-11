package com.ballpen.mes.repository;

import com.ballpen.mes.entity.QualityCheck;
import com.ballpen.mes.enums.QcStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QualityCheckRepository extends JpaRepository<QualityCheck, Long> {

    Optional<QualityCheck> findByCheckNumber(String checkNumber);

    boolean existsByCheckNumber(String checkNumber);

    List<QualityCheck> findByProductionOrderId(Long productionOrderId);

    List<QualityCheck> findByStatus(QcStatus status);

    @Query("SELECT COALESCE(SUM(qc.rejectedQuantity), 0) FROM QualityCheck qc")
    Long sumTotalRejectedQuantity();

    @Query("SELECT COALESCE(SUM(qc.passedQuantity), 0) FROM QualityCheck qc")
    Long sumTotalPassedQuantity();
}
