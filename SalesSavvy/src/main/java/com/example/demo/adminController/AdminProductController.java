package com.example.demo.adminController;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.adminService.AdminProductService;
import com.example.demo.entities.Product;

@RestController
@RequestMapping("/admin/products")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class AdminProductController {

    private final AdminProductService adminProductService;

    public AdminProductController(AdminProductService adminProductService) {
        this.adminProductService = adminProductService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addProduct(@RequestBody Map<String, Object> productRequest) {
        try {
            String name = (String) productRequest.get("name");
            String description = (String) productRequest.get("description");
            String imageUrl = (String) (productRequest.containsKey("imageUrl") ? productRequest.get("imageUrl") : productRequest.get("image_url"));

            Object rawPrice = productRequest.get("price");
            Object rawStock = productRequest.get("stock");
            Object rawCategoryId = productRequest.containsKey("categoryId") ? productRequest.get("categoryId") : productRequest.get("category_id");

            if (name == null || rawPrice == null || rawStock == null || rawCategoryId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Missing required product fields (name, price, stock, or categoryId).");
            }

            Double price = Double.valueOf(rawPrice.toString().trim());
            Integer stock = Integer.valueOf(rawStock.toString().trim());
            Integer categoryId = Integer.valueOf(rawCategoryId.toString().trim());

            Product addedProduct = adminProductService.addProductWithImage(name, description, price, stock, categoryId, imageUrl);
            return ResponseEntity.status(HttpStatus.CREATED).body(addedProduct);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to add product: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteProduct(@RequestBody Map<String, Object> requestBody) {
        try {
            Object rawId = requestBody.get("productId");
            if (rawId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("productId is required");
            }
            Integer productId = Integer.valueOf(rawId.toString().trim());
            adminProductService.deleteProduct(productId);
            return ResponseEntity.ok("Product deleted successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }
}