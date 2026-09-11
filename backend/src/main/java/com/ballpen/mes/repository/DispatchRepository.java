package com.ballpen.mes.repository;

import com.ballpen.mes.entity.Dispatch;
import com.ballpen.mes.enums.DispatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DispatchRepository extends JpaRepository<Dispatch, Long> {

    Optional<Dispatch> findByDispatchNumber(String dispatchNumber);

    boolean existsByDispatchNumber(String dispatchNumber);

    List<Dispatch> findByCustomerId(Long customerId);

    List<Dispatch> findByStatus(DispatchStatus status);
}
