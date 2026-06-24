package com.attendance.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT utility for token generation and validation.
 */
public class JWTUtil {

    private static String secret;
    private static final long EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours

    public static void init(String jwtSecret) {
        secret = jwtSecret;
    }

    private static SecretKey getSigningKey() {
        // Ensure key is at least 256 bits for HS256
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generate a JWT token for the given admin ID and username
     */
    public static String generateToken(int adminId, String username) {
        return Jwts.builder()
                .subject(String.valueOf(adminId))
                .claim("username", username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Validate and parse a JWT token, returns claims or null if invalid
     */
    public static Claims validateToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            return null;
        }
    }
}
