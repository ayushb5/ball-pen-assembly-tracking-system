package com.ballpen.mes.repository;

import com.ballpen.mes.entity.Workstation;
import com.ballpen.mes.enums.WorkstationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkstationRepository extends JpaRepository<Workstation, Long> {

    Optional<Workstation> findByStationCode(String stationCode);

    boolean existsByStationCode(String stationCode);

    List<Workstation> findByStatus(WorkstationStatus status);

    List<Workstation> findByStationType(String stationType);

    long countByStatus(WorkstationStatus status);
}
