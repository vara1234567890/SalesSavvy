package com.example.demo.controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entities.User;
import com.example.demo.repositories.UserRepository;
import com.example.demo.services.CartService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    @Autowired
    public CartController(CartService cartService, UserRepository userRepository) {
        this.cartService = cartService;
        this.userRepository = userRepository;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> request, HttpServletRequest httpRequest) {
        User user = (User) httpRequest.getAttribute("authenticatedUser");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Please login into add items to your cart"));
        }

        Object productVal = request.get("productId") != null ? request.get("productId") : request.get("product_id");
        if (productVal == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Product ID is required"));
        }

        int productId = Integer.parseInt(productVal.toString());
        int quantity = request.containsKey("quantity") && request.get("quantity") != null 
                ? Integer.parseInt(request.get("quantity").toString()) 
                : 1;

        cartService.addToCart(user.getUserId(), productId, quantity);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Item added to cart"));
    }

    @GetMapping("/items/count")
    public ResponseEntity<Integer> getCartCount(HttpServletRequest httpRequest) {
        User user = (User) httpRequest.getAttribute("authenticatedUser");
        if (user == null) {
            return ResponseEntity.ok(0);
        }
        int count = cartService.getCartItemCount(user.getUserId());
        return ResponseEntity.ok(count);
    }

    @GetMapping("/items")
    public ResponseEntity<?> getCartItems(HttpServletRequest httpRequest) {
        User user = (User) httpRequest.getAttribute("authenticatedUser");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }
        Map<String, Object> response = cartService.getCartItems(user.getUserId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateCartItemQuantity(@RequestBody Map<String, Object> request, HttpServletRequest httpRequest) {
        User user = (User) httpRequest.getAttribute("authenticatedUser");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }

        Object productVal = request.get("productId") != null ? request.get("productId") : request.get("product_id");
        if (productVal == null || request.get("quantity") == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Product ID and Quantity are required"));
        }

        int productId = Integer.parseInt(productVal.toString());
        int quantity = Integer.parseInt(request.get("quantity").toString());

        cartService.updateCartitemQuantity(user.getUserId(), productId, quantity);
        return ResponseEntity.ok(Map.of("message", "Cart updated"));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteCartItem(@RequestBody Map<String, Object> request, HttpServletRequest httpRequest) {
        User user = (User) httpRequest.getAttribute("authenticatedUser");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }

        Object productVal = request.get("productId") != null ? request.get("productId") : request.get("product_id");
        if (productVal == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Product ID is required"));
        }

        int productId = Integer.parseInt(productVal.toString());
        cartService.deleteItem(user.getUserId(), productId);
        return ResponseEntity.noContent().build();
    }
}