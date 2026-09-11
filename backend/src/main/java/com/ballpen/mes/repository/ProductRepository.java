package com.ballpen.mes.repository;

import com.ballpen.mes.entity.Product;
import com.ballpen.mes.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByProductCode(String productCode);

    boolean existsByProductCode(String productCode);

    List<Product> findByStatus(UserStatus status);

    List<Product> findByPenType(String penType);

    List<Product> findByInkColor(String inkColor);
}
