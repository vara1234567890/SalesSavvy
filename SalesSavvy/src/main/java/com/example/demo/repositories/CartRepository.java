package com.example.demo.repositories;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entities.CartItems;

@Repository
public interface CartRepository extends JpaRepository<CartItems, Integer> {

    @Query("SELECT c FROM CartItems c WHERE c.user.userId = :userId AND c.product.productId = :productId")
    Optional<CartItems> findByUserAndProduct(@Param("userId") int userId, @Param("productId") int productId);

    @Query("SELECT COALESCE(SUM(c.quantity), 0) FROM CartItems c WHERE c.user.userId = :userId")
    int getTotalCount(@Param("userId") int userId);

    @Query("SELECT c FROM CartItems c JOIN FETCH c.product WHERE c.user.userId = :userId")
    List<CartItems> findCartItemsWithProductDetails(@Param("userId") int userId);

    @Modifying
    @Transactional
    @Query("UPDATE CartItems c SET c.quantity = :quantity WHERE c.id = :cartItemId")
    void updateCartItemQuantity(@Param("cartItemId") int cartItemId, @Param("quantity") int quantity);

    @Modifying
    @Transactional
    @Query("DELETE FROM CartItems c WHERE c.user.userId = :userId AND c.product.productId = :productId")
    void deleteCartItem(@Param("userId") int userId, @Param("productId") int productId);

    @Modifying
    @Transactional
    @Query("DELETE FROM CartItems c WHERE c.user.userId = :userId")
    void deleteAllCartItemsByUserId(@Param("userId") int userId);
}