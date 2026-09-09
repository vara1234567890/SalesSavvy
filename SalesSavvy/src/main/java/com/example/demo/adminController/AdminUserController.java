package com.example.demo.adminController;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.adminService.AdminUserService;
import com.example.demo.entities.User;

@RestController
@RequestMapping("/admin/user")
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173"}, allowCredentials = "true")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @PutMapping("/modify")
    public ResponseEntity<?> modifyUser(@RequestBody Map<String, Object> userRequest) {
        try {
            Object rawUserId = userRequest.get("userId");
            if (rawUserId == null || rawUserId.toString().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("userId is required");
            }

            Integer userId = Integer.valueOf(rawUserId.toString().trim());
            String username = (String) userRequest.get("username");
            String email = (String) userRequest.get("email");
            String role = (String) userRequest.get("role");

            User updatedUser = adminUserService.modifyUser(userId, username, email, role);

            Map<String, Object> response = buildUserResponseMap(updatedUser);
            return ResponseEntity.status(HttpStatus.OK).body(response);

        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid numeric format for userId");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }

    @PostMapping("/getbyid")
    public ResponseEntity<?> getUserById(@RequestBody Map<String, Object> userRequest) {
        try {
            Object rawUserId = userRequest.get("userId");
            if (rawUserId == null || rawUserId.toString().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("userId is required");
            }

            Integer userId = Integer.valueOf(rawUserId.toString().trim());
            User user = adminUserService.getUserById(userId);

            // Return sanitized response map without exposing password hashes
            Map<String, Object> response = buildUserResponseMap(user);
            return ResponseEntity.status(HttpStatus.OK).body(response);

        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid numeric format for userId");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }

    private Map<String, Object> buildUserResponseMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("userId", user.getUserId());
        map.put("username", user.getUsername());
        map.put("email", user.getEmail());
        map.put("role", user.getRole() != null ? user.getRole().name() : null);
        map.put("createdAt", user.getCreatedAt());
        map.put("updatedAt", user.getUpdatedAt());
        return map;
    }
}