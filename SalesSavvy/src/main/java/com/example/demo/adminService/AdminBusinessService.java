package com.example.demo.adminService;

import com.example.demo.entities.Order;
import com.example.demo.entities.OrderItem;
import com.example.demo.entities.OrderStatus;
import com.example.demo.entities.Product;
import com.example.demo.repositories.OrderItemRepository;
import com.example.demo.repositories.OrderRepository;
import com.example.demo.repositories.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class AdminBusinessService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    public AdminBusinessService(OrderRepository orderRepository, 
                                ProductRepository productRepository,
                                OrderItemRepository orderItemRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public Map<String, Object> calculateOverallBusiness() {
        List<Order> orders = orderRepository.findAll().stream()
                .filter(this::isSuccessfulOrder)
                .toList();

        return generateReport(orders);
    }

    public Map<String, Object> calculateMonthlyBusiness(int month, int year) {
        List<Order> orders = orderRepository.findAll().stream()
                .filter(this::isSuccessfulOrder)
                .filter(o -> o.getCreatedAt() != null &&
                        o.getCreatedAt().getMonthValue() == month &&
                        o.getCreatedAt().getYear() == year)
                .toList();

        return generateReport(orders);
    }

    public Map<String, Object> calculateDailyBusiness(LocalDate date) {
        List<Order> orders = orderRepository.findAll().stream()
                .filter(this::isSuccessfulOrder)
                .filter(o -> o.getCreatedAt() != null &&
                        o.getCreatedAt().toLocalDate().isEqual(date))
                .toList();

        return generateReport(orders);
    }

    public Map<String, Object> calculateYearlyBusiness(int year) {
        List<Order> orders = orderRepository.findAll().stream()
                .filter(this::isSuccessfulOrder)
                .filter(o -> o.getCreatedAt() != null &&
                        o.getCreatedAt().getYear() == year)
                .toList();

        return generateReport(orders);
    }

    private boolean isSuccessfulOrder(Order o) {
        if (o == null || o.getStatus() == null) return false;
        return o.getStatus() == OrderStatus.SUCCESS || "SUCCESS".equalsIgnoreCase(o.getStatus().name());
    }

    private Map<String, Object> generateReport(List<Order> orders) {
        double totalRevenue = 0.0;
        Map<String, Integer> categorySales = new HashMap<>();

        for (Order order : orders) {
            if (order.getTotalAmount() != null) {
                totalRevenue += order.getTotalAmount().doubleValue();
            }

            // Fetch items from the order relationship or fallback to direct repository lookup
            List<OrderItem> items = order.getOrderItems();
            if (items == null || items.isEmpty()) {
                items = orderItemRepository.findByOrder(order);
            }

            if (items != null) {
                for (OrderItem item : items) {
                    String categoryName = "General";
                    Product product = productRepository.findById(item.getProductId()).orElse(null);

                    if (product != null && product.getCategory() != null) {
                        categoryName = product.getCategory().getCategoryName();
                    }

                    int quantity = item.getQuantity() > 0 ? item.getQuantity() : 1;
                    categorySales.put(categoryName, categorySales.getOrDefault(categoryName, 0) + quantity);
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalBusiness", totalRevenue);
        response.put("totalRevenue", totalRevenue);
        response.put("categorySales", categorySales);
        return response;
    }
}