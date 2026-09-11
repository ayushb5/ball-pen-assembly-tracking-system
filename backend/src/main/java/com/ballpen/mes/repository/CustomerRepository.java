package com.ballpen.mes.repository;

import com.ballpen.mes.entity.Customer;
import com.ballpen.mes.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByCustomerCode(String customerCode);

    boolean existsByCustomerCode(String customerCode);

    List<Customer> findByStatus(UserStatus status);

    List<Customer> findByCustomerNameContainingIgnoreCase(String name);
}
