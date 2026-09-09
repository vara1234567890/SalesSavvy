package com.example.demo.controllers;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entities.Order;
import com.example.demo.entities.OrderItem;
import com.example.demo.entities.OrderStatus;
import com.example.demo.entities.User;
import com.example.demo.repositories.OrderItemRepository;
import com.example.demo.repositories.OrderRepository;
import com.example.demo.repositories.UserRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class PaymentController {

    private static final String KEY_ID = "rzp_test_TTgAnEZaXxYfXZ";
    private static final String KEY_SECRET = "U65QUQT92Cip7SatWy1vDzMe";

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        try {
            double totalAmount = Double.parseDouble(data.get("totalAmount").toString());
            int amountInPaise = (int) Math.round(totalAmount * 100);

            RazorpayClient client = new RazorpayClient(KEY_ID, KEY_SECRET);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            com.razorpay.Order order = client.orders.create(orderRequest);

            return ResponseEntity.ok(order.get("id").toString());

        } catch (RazorpayException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Razorpay error: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid request: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, Object> data) {
        try {
            String razorpayOrderId = (String) data.get("razorpayOrderId");
            String razorpayPaymentId = (String) data.get("razorpayPaymentId");
            String razorpaySignature = (String) data.get("razorpaySignature");

            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(options, KEY_SECRET);

            if (isValid) {
                String username = (String) data.getOrDefault("username", "raju");
                User user = userRepository.findByUsername(username).orElse(null);
                int userId = (user != null) ? user.getUserId() : 1;

                BigDecimal amount = data.get("totalAmount") != null 
                        ? new BigDecimal(data.get("totalAmount").toString()) 
                        : new BigDecimal("499.99");

                // 1. Persist Order with String orderId and OrderStatus enum
                Order order = new Order();
                order.setOrderId(razorpayOrderId);
                order.setUserId(userId);
                order.setTotalAmount(amount);
                order.setStatus(OrderStatus.SUCCESS);
                order.setCreatedAt(LocalDateTime.now());
                order.setUpdatedAt(LocalDateTime.now());

                Order savedOrder = orderRepository.save(order);

                // 2. Persist OrderItem linked to order and product
                OrderItem item = new OrderItem();
                item.setOrder(savedOrder);
                item.setProductId(1); // Default product ID for test order
                item.setQuantity(1);
                item.setPricePerUnit(amount);
                item.setTotalPrice(amount);

                orderItemRepository.save(item);

                return ResponseEntity.ok("Payment verified successfully");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Verification error: " + e.getMessage());
        }
    }
}