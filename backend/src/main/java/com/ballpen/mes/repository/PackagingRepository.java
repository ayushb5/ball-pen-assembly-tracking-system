package com.ballpen.mes.repository;

import com.ballpen.mes.entity.Packaging;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PackagingRepository extends JpaRepository<Packaging, Long> {

    Optional<Packaging> findByPackageNumber(String packageNumber);

    boolean existsByPackageNumber(String packageNumber);

    List<Packaging> findByProductionOrderId(Long productionOrderId);

    List<Packaging> findByPackedById(Long employeeId);

    @Query("SELECT COALESCE(SUM(p.quantity), 0) FROM Packaging p WHERE p.packingDate = :date")
    Long sumQuantityByPackingDate(@Param("date") LocalDate date);
}
