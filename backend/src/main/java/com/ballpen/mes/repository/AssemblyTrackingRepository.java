package com.ballpen.mes.repository;

import com.ballpen.mes.entity.AssemblyTracking;
import com.ballpen.mes.enums.AssemblyStage;
import com.ballpen.mes.enums.AssemblyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssemblyTrackingRepository extends JpaRepository<AssemblyTracking, Long> {

    List<AssemblyTracking> findByProductionOrderIdOrderByIdAsc(Long productionOrderId);

    List<AssemblyTracking> findByProductionOrderIdOrderByStageAsc(Long productionOrderId);

    Optional<AssemblyTracking> findByProductionOrderIdAndStage(Long productionOrderId, AssemblyStage stage);

    List<AssemblyTracking> findByStatus(AssemblyStatus status);

    List<AssemblyTracking> findByAssignedEmployeeId(Long employeeId);
}
