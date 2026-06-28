package com.kydira_api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kydira_api.model.User;
import com.kydira_api.repository.UserRepository;
import com.kydira_api.security.CustomUserDetailsService;
import com.kydira_api.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pruebas FUNCIONALES del AuthController.
 */
@WebMvcTest(controllers = AuthController.class, excludeAutoConfiguration = {UserDetailsServiceAutoConfiguration.class})
@DisplayName("AuthController - Pruebas Funcionales")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private AuthenticationManager authenticationManager;
    @MockBean private JwtUtil jwtUtil;
    @MockBean private UserRepository userRepository;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    private User user;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setEmail("test@kydira.com");
        user.setFirstName("Juan");
        user.setLastName("Perez");
        user.setPassword("$2a$10$hashedPassword");

        userDetails = new org.springframework.security.core.userdetails.User(
                "test@kydira.com", "$2a$10$hashedPassword", Collections.emptyList()
        );
    }

    @Test
    @DisplayName("FT-AC-01: Login exitoso retorna HTTP 200 con token y datos del usuario")
    @WithMockUser
    void login_ConCredencialesValidas_DebeRetornar200ConToken() throws Exception {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(customUserDetailsService.loadUserByUsername("test@kydira.com")).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn("jwt.token.generado");
        when(userRepository.findByEmail("test@kydira.com")).thenReturn(Optional.of(user));

        Map<String, String> loginRequest = Map.of(
                "email", "test@kydira.com",
                "password", "password123"
        );

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt.token.generado"))
                .andExpect(jsonPath("$.email").value("test@kydira.com"))
                .andExpect(jsonPath("$.firstName").value("Juan"))
                .andExpect(jsonPath("$.lastName").value("Perez"))
                .andExpect(jsonPath("$.userId").value(1));
    }

    @Test
    @DisplayName("FT-AC-02: Login con credenciales inválidas retorna HTTP 401")
    @WithMockUser
    void login_ConCredencialesInvalidas_DebeRetornar401() throws Exception {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Credenciales inválidas"));

        Map<String, String> loginRequest = Map.of(
                "email", "test@kydira.com",
                "password", "wrongPassword"
        );

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Credenciales inválidas"));
    }

    @Test
    @DisplayName("FT-AC-03: Login con email vacío retorna HTTP 401")
    @WithMockUser
    void login_ConEmailVacio_DebeRetornar401() throws Exception {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Credenciales inválidas"));

        Map<String, String> loginRequest = Map.of("email", "", "password", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }
}
