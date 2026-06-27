package com.kydira_api.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.assertj.core.api.Assertions.*;

@DisplayName("JwtUtil - Pruebas Unitarias")
class JwtUtilTest {

    private JwtUtil jwtUtil;
    private UserDetails userDetails;

    // Clave Base64 de 256 bits (mínimo para HS256)
    private static final String TEST_SECRET =
            "dGVzdFNlY3JldEtleUZvckp3dFRlc3RpbmdQdXJwb3NlczkwMTIz";
    private static final long EXPIRATION_MS = 3_600_000L; // 1 hora

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secretKey", TEST_SECRET);
        ReflectionTestUtils.setField(jwtUtil, "jwtExpiration", EXPIRATION_MS);

        userDetails = new User("test@kydira.com", "password", Collections.emptyList());
    }

    @Test
    @DisplayName("UT-JWT-01: Generar token no retorna null ni vacío")
    void generateToken_DebeRetornarTokenNoVacio() {
        String token = jwtUtil.generateToken(userDetails);

        assertThat(token).isNotNull().isNotBlank();
    }

    @Test
    @DisplayName("UT-JWT-02: El token contiene el username correcto")
    void extractUsername_DebeRetornarEmailDelUsuario() {
        String token = jwtUtil.generateToken(userDetails);

        String username = jwtUtil.extractUsername(token);

        assertThat(username).isEqualTo("test@kydira.com");
    }

    @Test
    @DisplayName("UT-JWT-03: Token válido es reconocido como válido")
    void isTokenValid_ConTokenValido_DebeRetornarTrue() {
        String token = jwtUtil.generateToken(userDetails);

        boolean valid = jwtUtil.isTokenValid(token, userDetails);

        assertThat(valid).isTrue();
    }

    @Test
    @DisplayName("UT-JWT-04: Token de otro usuario no es válido para este usuario")
    void isTokenValid_ConTokenDeOtroUsuario_DebeRetornarFalse() {
        UserDetails otroUsuario = new User("otro@kydira.com", "password", Collections.emptyList());
        String tokenDeOtro = jwtUtil.generateToken(otroUsuario);

        boolean valid = jwtUtil.isTokenValid(tokenDeOtro, userDetails);

        assertThat(valid).isFalse();
    }

    @Test
    @DisplayName("UT-JWT-05: Token expirado no es válido")
    void isTokenValid_ConTokenExpirado_DebeRetornarFalse() {
        // Generar token con expiración negativa (ya expiró)
        ReflectionTestUtils.setField(jwtUtil, "jwtExpiration", -1000L);
        String expiredToken = jwtUtil.generateToken(userDetails);

        boolean valid = jwtUtil.isTokenValid(expiredToken, userDetails);

        assertThat(valid).isFalse();
    }

    @Test
    @DisplayName("UT-JWT-06: Token generado con claims extra mantiene el subject")
    void generateToken_ConClaimsExtra_DebeManetenerUsername() {
        java.util.Map<String, Object> claims = new java.util.HashMap<>();
        claims.put("role", "USER");

        String token = jwtUtil.generateToken(claims, userDetails);
        String username = jwtUtil.extractUsername(token);

        assertThat(username).isEqualTo("test@kydira.com");
    }

    @Test
    @DisplayName("UT-JWT-07: Token manipulado lanza excepción al extraer claims")
    void extractUsername_ConTokenManipulado_DebeArrojarExcepcion() {
        String tokenManipulado = "eyJhbGciOiJIUzI1NiJ9.MANIPULADO.firma_invalida";

        assertThatThrownBy(() -> jwtUtil.extractUsername(tokenManipulado))
                .isInstanceOf(Exception.class);
    }
}
