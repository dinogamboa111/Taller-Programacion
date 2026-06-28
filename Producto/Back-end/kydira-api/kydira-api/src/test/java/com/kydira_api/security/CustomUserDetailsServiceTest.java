package com.kydira_api.security;

import com.kydira_api.model.User;
import com.kydira_api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("CustomUserDetailsService - Pruebas Unitarias")
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setEmail("test@kydira.com");
        user.setPassword("$2a$10$hashedPassword");
        user.setFirstName("Juan");
        user.setLastName("Perez");
    }

    @Test
    @DisplayName("Usuario existente retorna UserDetails con email correcto")
    void loadUserByUsername_UsuarioExistente_DebeRetornarUserDetails() {
        when(userRepository.findByEmail("test@kydira.com")).thenReturn(Optional.of(user));

        UserDetails result = customUserDetailsService.loadUserByUsername("test@kydira.com");

        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("test@kydira.com");
        assertThat(result.getPassword()).isEqualTo("$2a$10$hashedPassword");
    }

    @Test
    @DisplayName("Email inexistente lanza UsernameNotFoundException")
    void loadUserByUsername_UsuarioInexistente_DebeArrojarExcepcion() {
        when(userRepository.findByEmail("noexiste@kydira.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customUserDetailsService.loadUserByUsername("noexiste@kydira.com"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("noexiste@kydira.com");
    }
}
