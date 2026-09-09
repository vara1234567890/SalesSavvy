package com.example.demo.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entities.CartItems;
import com.example.demo.entities.Product;
import com.example.demo.entities.ProductImage;
import com.example.demo.entities.User;
import com.example.demo.repositories.CartRepository;
import com.example.demo.repositories.ProductImageRepository;
import com.example.demo.repositories.ProductRepository;
import com.example.demo.repositories.UserRepository;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    @Autowired
    public CartService(CartRepository cartRepository, 
                       UserRepository userRepository, 
                       ProductRepository productRepository, 
                       ProductImageRepository productImageRepository) {
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
    }

    @Transactional
    public void addToCart(int userId, int productId, int quantity) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<CartItems> existItem = cartRepository.findByUserAndProduct(userId, productId);

        if (existItem.isPresent()) {
            CartItems cartItem = existItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity); // Increment existing quantity
            cartRepository.save(cartItem);
        } else {
            CartItems newItem = new CartItems(user, product, quantity);
            cartRepository.save(newItem);
        }
    }

    public int getCartItemCount(int userId) {
        return cartRepository.getTotalCount(userId);
    }

    public Map<String, Object> getCartItems(int userId) {
        List<CartItems> cartItems = cartRepository.findCartItemsWithProductDetails(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Does Not Exist"));

        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("role", user.getRole());

        List<Map<String, Object>> products = new ArrayList<>();
        double overAllTotalPrice = 0.0;

        for (CartItems cartItem : cartItems) {
            Map<String, Object> productDetails = new HashMap<>();
            Product product = cartItem.getProduct();

            // Safe lookup for image
            List<ProductImage> productImages = productImageRepository.findByProduct_ProductId(product.getProductId());
            String imageUrl = (!productImages.isEmpty()) ? productImages.get(0).getImageUrl() : null;

            double unitPrice = product.getPrice().doubleValue();
            double totalPrice = cartItem.getQuantity() * unitPrice;

            productDetails.put("productId", product.getProductId());
            productDetails.put("image_url", imageUrl);
            productDetails.put("name", product.getName());
            productDetails.put("price_per_unit", unitPrice);
            productDetails.put("quantity", cartItem.getQuantity());
            productDetails.put("total_price", totalPrice);

            products.add(productDetails);
            overAllTotalPrice += totalPrice;
        }

        Map<String, Object> cart = new HashMap<>();
        cart.put("products", products);
        cart.put("overAll_total_price", overAllTotalPrice);
        response.put("cart", cart);

        return response;
    }

    @Transactional
    public void updateCartitemQuantity(int userId, int productId, int quantity) {
        Optional<CartItems> existingItem = cartRepository.findByUserAndProduct(userId, productId);

        if (existingItem.isPresent()) {
            if (quantity <= 0) {
                deleteItem(userId, productId);
            } else {
                CartItems cartItem = existingItem.get();
                cartItem.setQuantity(quantity);
                cartRepository.save(cartItem);
            }
        }
    }

    @Transactional
    public void deleteItem(int userId, int productId) {
        cartRepository.deleteCartItem(userId, productId);
    }
}