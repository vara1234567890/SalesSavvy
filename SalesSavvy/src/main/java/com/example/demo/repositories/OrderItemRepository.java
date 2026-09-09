package com.example.demo.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.Order;
import com.example.demo.entities.OrderItem;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {

    // Added to resolve findByOrder(Order)
    List<OrderItem> findByOrder(Order order);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.orderId = :orderId")
    List<OrderItem> findByOrderId(@Param("orderId") String orderId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.userId = :userId AND (oi.order.status = 'PAID' OR oi.order.status = 'SUCCESS')")
    List<OrderItem> findSuccessfulOrderItemsByUserId(@Param("userId") int userId);
}