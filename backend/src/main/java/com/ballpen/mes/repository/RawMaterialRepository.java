package com.ballpen.mes.repository;

import com.ballpen.mes.entity.RawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RawMaterialRepository extends JpaRepository<RawMaterial, Long> {

    Optional<RawMaterial> findByMaterialCode(String materialCode);

    boolean existsByMaterialCode(String materialCode);

    List<RawMaterial> findByCategory(String category);

    @Query("SELECT rm FROM RawMaterial rm WHERE rm.availableQuantity <= rm.minimumStock")
    List<RawMaterial> findLowStockMaterials();
}
