package com.example.demo.fliter;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.example.demo.entities.User;
import com.example.demo.repositories.UserRepository;
import com.example.demo.services.AuthService;

@Component
public class AuthenticationFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationFilter.class);
    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthenticationFilter(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Set dynamic CORS headers based on the caller's origin
        setCORSHeaders(httpRequest, httpResponse);

        // Handle preflight (OPTIONS) requests immediately
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            httpResponse.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        try {
            executeFilterLogic(httpRequest, httpResponse, chain);
        } catch (Exception e) {
            logger.error("Unexpected error in AuthenticationFilter", e);
            sendErrorResponse(httpResponse, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "{\"error\": \"Internal server error\"}");
        }
    }

    private void executeFilterLogic(HttpServletRequest httpRequest, HttpServletResponse httpResponse, FilterChain chain)
            throws IOException, ServletException {

        String requestURI = httpRequest.getRequestURI();
        logger.info("Request URI: {}", requestURI);

        // Skip filter logic if not targeting protected base paths
        if (!requestURI.startsWith("/api/") && !requestURI.startsWith("/admin/")) {
            chain.doFilter(httpRequest, httpResponse);
            return;
        }

        // Allow public/guest endpoints
        if (isPublicPath(requestURI)) {
            // Optional: attach user to request if token is present during logout
            String token = extractToken(httpRequest);
            if (token != null && authService.validateToken(token)) {
                String username = authService.extractUsername(token);
                userRepository.findByUsername(username).ifPresent(user -> 
                    httpRequest.setAttribute("authenticatedUser", user)
                );
            }
            chain.doFilter(httpRequest, httpResponse);
            return;
        }

        // Extract token from Header (Bearer token) or Cookies (Fallback)
        String token = extractToken(httpRequest);

        if (token == null || !authService.validateToken(token)) {
            sendErrorResponse(httpResponse, HttpServletResponse.SC_UNAUTHORIZED, "{\"error\": \"Unauthorized: Invalid or missing token\"}");
            return;
        }

        // Extract username and verify user
        String username = authService.extractUsername(token);
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            sendErrorResponse(httpResponse, HttpServletResponse.SC_UNAUTHORIZED, "{\"error\": \"Unauthorized: User not found\"}");
            return;
        }

        User authenticatedUser = userOptional.get();
        String role = String.valueOf(authenticatedUser.getRole());

        // Role-based access control
        if (requestURI.startsWith("/admin/") && !"ADMIN".equalsIgnoreCase(role)) {
            sendErrorResponse(httpResponse, HttpServletResponse.SC_FORBIDDEN, "{\"error\": \"Forbidden: Admin access required\"}");
            return;
        }

        // Attach user details to request
        httpRequest.setAttribute("authenticatedUser", authenticatedUser);
        chain.doFilter(httpRequest, httpResponse);
    }

    private boolean isPublicPath(String requestURI) {
        return requestURI.startsWith("/api/products")
                || requestURI.startsWith("/api/categories")
                || requestURI.startsWith("/api/auth/login")
                || requestURI.startsWith("/api/auth/logout")   // <-- Allows logout to proceed without 401
                || requestURI.startsWith("/api/users/register")
                || requestURI.equals("/api/auth/register");
    }

    private void setCORSHeaders(HttpServletRequest request, HttpServletResponse response) {
        String origin = request.getHeader("Origin");
        if (origin != null && (origin.contains("localhost") || origin.endsWith(".vercel.app"))) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        }
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true");
    }

    private void sendErrorResponse(HttpServletResponse response, int statusCode, String jsonMessage) throws IOException {
        response.setStatus(statusCode);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(jsonMessage);
    }

    private String extractToken(HttpServletRequest request) {
        // 1. Check Authorization: Bearer <token>
        String authHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }

        // 2. Fallback to Cookie
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            return Arrays.stream(cookies)
                    .filter(cookie -> "authToken".equals(cookie.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
        }

        return null;
    }
}
