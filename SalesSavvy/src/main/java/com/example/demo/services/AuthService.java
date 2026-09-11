package com.example.demo.services;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entities.JWTToken;
import com.example.demo.entities.User;
import com.example.demo.repositories.JWTTokenRepository;
import com.example.demo.repositories.UserRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final Key signingKey;
    private final UserRepository userRepository;
    private final JWTTokenRepository jwtTokenRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    private static final long EXPIRATION_TIME_MS = 24 * 3600 * 1000; // 24 Hours for stable sessions

    @Autowired
    public AuthService(UserRepository userRepository, 
                       JWTTokenRepository jwtTokenRepository,
                       @Value("${jwt.secret}") String jwtSecret) {
        this.userRepository = userRepository;
        this.jwtTokenRepository = jwtTokenRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();

        byte[] secretBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 64) {
            throw new IllegalArgumentException("JWT_SECRET must be at least 64 bytes long for HS512.");
        }
        this.signingKey = Keys.hmacShaKeyFor(secretBytes);
    }

    public User authenticate(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invalid username"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        return user;
    }

    @Transactional
    public String generateToken(User user) {
        // Clean up any old tokens for this user first
        try {
            JWTToken existingToken = jwtTokenRepository.findByUserId(user.getUserId());
            if (existingToken != null) {
                jwtTokenRepository.delete(existingToken);
                jwtTokenRepository.flush();
            }
        } catch (Exception e) {
            logger.warn("Could not clean old token: {}", e.getMessage());
        }

        String token = generateNewToken(user);
        saveToken(user, token);
        return token;
    }

    private String generateNewToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME_MS);

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("role", user.getRole())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(signingKey, SignatureAlgorithm.HS512)
                .compact();
    }

    public void saveToken(User user, String token) {
        // 24-hour expiration mapped to DB record
        JWTToken jwtToken = new JWTToken(user, token, LocalDateTime.now().plusHours(24));
        jwtTokenRepository.save(jwtToken);
    }

    public boolean validateToken(String token) {
        try {
            // 1. Verify cryptographic signature and expiration via JJWT
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

            // 2. Check if token exists in DB (ensures it wasn't logged out / revoked)
            Optional<JWTToken> jwtToken = jwtTokenRepository.findByToken(token);
            return jwtToken.isPresent();
        } catch (ExpiredJwtException e) {
            logger.warn("JWT token has expired: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            logger.error("Token validation error: {}", e.getMessage());
            return false;
        }
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    @Transactional
    public void logout(User authenticatedUser) {
        try {
            JWTToken token = jwtTokenRepository.findByUserId(authenticatedUser.getUserId());
            if (token != null) {
                jwtTokenRepository.delete(token);
            }
        } catch (Exception e) {
            logger.error("Error during logout token deletion: {}", e.getMessage());
        }
    }
}
