package com.example.demo.repositories;

import com.example.demo.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    List<Product> findByCategory_CategoryId(Integer categoryId);

    List<Product> findByCategory_CategoryNameIgnoreCase(String categoryName);

    // Native query: queries the MySQL tables directly
    @Query(value = "SELECT c.category_name FROM products p JOIN categories c ON p.category_id = c.category_id WHERE p.product_id = :productId", nativeQuery = true)
    String findCategoryNameByProductId(@Param("productId") int productId);
}