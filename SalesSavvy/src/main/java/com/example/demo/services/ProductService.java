package com.example.demo.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.entities.Product;
import com.example.demo.repositories.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // Get all products
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Get products by Category ID (Accepts Integer)
    public List<Product> getProductsByCategoryId(Integer categoryId) {
        return productRepository.findByCategory_CategoryId(categoryId);
    }

    // Get products by Category Name (Accepts String)
    public List<Product> getProductsByCategoryName(String categoryName) {
        return productRepository.findByCategory_CategoryNameIgnoreCase(categoryName);
    }

    // Get a single product by its ID
    public Optional<Product> getProductById(Integer id) {
        return productRepository.findById(id);
    }

    // Save or update product
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    // Delete a product by its ID
    public void deleteProduct(Integer id) {
        productRepository.deleteById(id);
    }
}