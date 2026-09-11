package com.ballpen.mes.repository;

import com.ballpen.mes.entity.ProductionOrder;
import com.ballpen.mes.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductionOrderRepository extends JpaRepository<ProductionOrder, Long> {

    Optional<ProductionOrder> findByOrderNumber(String orderNumber);

    boolean existsByOrderNumber(String orderNumber);

    List<ProductionOrder> findByStatus(OrderStatus status);

    List<ProductionOrder> findByCustomerId(Long customerId);

    List<ProductionOrder> findByProductId(Long productId);

    long countByStatus(OrderStatus status);

    @Query("SELECT COUNT(po) FROM ProductionOrder po WHERE FUNCTION('DATE', po.createdAt) = CURRENT_DATE")
    long countTodayOrders();

    @Query("SELECT SUM(po.producedQuantity) FROM ProductionOrder po WHERE po.status = 'COMPLETED'")
    Long sumTotalProducedQuantity();
}
