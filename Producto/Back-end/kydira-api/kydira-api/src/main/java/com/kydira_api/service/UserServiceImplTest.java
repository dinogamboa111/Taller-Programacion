package com.kydira_api.service;

import com.kydira_api.dto.UserDTO;
import com.kydira_api.model.Document;
import com.kydira_api.model.Quiz;
import com.kydira_api.model.Summary;
import com.kydira_api.model.User;
import com.kydira_api.repository.DocumentRepository;
import com.kydira_api.repository.QuizRepository;
import com.kydira_api.repository.SummaryRepository;
import com.kydira_api.repository.UserRepository;
import com.kydira_api.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserServiceImpl - Pruebas Unitarias")
class UserServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private DocumentRepository documentRepository;
    @Mock private QuizRepository quizRepository;
    @Mock private SummaryRepository summaryRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private User user;
    private UserDTO userDTO;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setEmail("test@kydira.com");
        user.setFirstName("Juan");
        user.setLastName("Perez");
        user.setPassword("$2a$10$hashedPassword");

        userDTO = new UserDTO();
        userDTO.setEmail("test@kydira.com");
        userDTO.setFirstName("Juan");
        userDTO.setLastName("Perez");
        userDTO.setPassword("password123");
    }

    // ===================== registerUser =====================

    @Test
    @DisplayName("UT-US-01: Registro exitoso de usuario")
    void registerUser_ConDatosValidos_DebeGuardarYRetornarUsuario() {
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        User result = userService.registerUser(userDTO);

        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("test@kydira.com");
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("UT-US-02: La contraseña debe encriptarse al registrar")
    void registerUser_DebeEncriptarPassword() {
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.registerUser(userDTO);

        assertThat(result.getPassword()).isEqualTo("$2a$10$hashed");
        verify(passwordEncoder, times(1)).encode("password123");
    }

    // ===================== findByEmail =====================

    @Test
    @DisplayName("UT-US-03: Buscar usuario por email existente retorna Optional con usuario")
    void findByEmail_ConEmailExistente_DebeRetornarUsuario() {
        when(userRepository.findByEmail("test@kydira.com")).thenReturn(Optional.of(user));

        Optional<User> result = userService.findByEmail("test@kydira.com");

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("test@kydira.com");
    }

    @Test
    @DisplayName("UT-US-04: Buscar usuario por email inexistente retorna Optional vacío")
    void findByEmail_ConEmailInexistente_DebeRetornarVacio() {
        when(userRepository.findByEmail("noexiste@kydira.com")).thenReturn(Optional.empty());

        Optional<User> result = userService.findByEmail("noexiste@kydira.com");

        assertThat(result).isEmpty();
    }

    // ===================== updateProfile =====================

    @Test
    @DisplayName("UT-US-05: Actualización de perfil exitosa sin cambio de contraseña")
    void updateProfile_SinPassword_DebeActualizarDatosBasicos() {
        userDTO.setPassword(null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.updateProfile(1L, userDTO);

        assertThat(result.getFirstName()).isEqualTo("Juan");
        assertThat(result.getEmail()).isEqualTo("test@kydira.com");
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    @DisplayName("UT-US-06: Actualización de perfil con nueva contraseña la encripta")
    void updateProfile_ConPassword_DebeEncriptarNuevaPassword() {
        userDTO.setPassword("nuevaPassword");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("nuevaPassword")).thenReturn("$2a$10$newHash");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.updateProfile(1L, userDTO);

        assertThat(result.getPassword()).isEqualTo("$2a$10$newHash");
        verify(passwordEncoder).encode("nuevaPassword");
    }

    @Test
    @DisplayName("UT-US-07: Actualización de perfil con contraseña en blanco no la cambia")
    void updateProfile_ConPasswordBlanka_NoDebeActualizarPassword() {
        userDTO.setPassword("   ");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        userService.updateProfile(1L, userDTO);

        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    @DisplayName("UT-US-08: Actualización de perfil con ID inexistente lanza excepción")
    void updateProfile_ConIdInexistente_DebeArrojarExcepcion() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateProfile(99L, userDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Usuario no encontrado");
    }

    // ===================== login =====================

    @Test
    @DisplayName("UT-US-09: Login exitoso con credenciales correctas")
    void login_ConCredencialesCorrectas_DebeRetornarUsuario() {
        when(userRepository.findByEmail("test@kydira.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "$2a$10$hashedPassword")).thenReturn(true);

        User result = userService.login("test@kydira.com", "password123");

        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("test@kydira.com");
    }

    @Test
    @DisplayName("UT-US-10: Login con email inexistente lanza excepción")
    void login_ConEmailInexistente_DebeArrojarExcepcion() {
        when(userRepository.findByEmail("noexiste@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.login("noexiste@test.com", "password123"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Correo electrónico no encontrado");
    }

    @Test
    @DisplayName("UT-US-11: Login con contraseña incorrecta lanza excepción")
    void login_ConPasswordIncorrecta_DebeArrojarExcepcion() {
        when(userRepository.findByEmail("test@kydira.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "$2a$10$hashedPassword")).thenReturn(false);

        assertThatThrownBy(() -> userService.login("test@kydira.com", "wrongPassword"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Contraseña incorrecta");
    }

    // ===================== deleteAccount =====================

    @Test
    @DisplayName("UT-US-12: Eliminar cuenta exitosamente con contraseña correcta")
    void deleteAccount_ConPasswordCorrecta_DebeEliminarCascada() {
        Document doc = new Document();
        doc.setDocumentId(1);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "$2a$10$hashedPassword")).thenReturn(true);
        when(documentRepository.findByUserId_UserId(1L)).thenReturn(List.of(doc));
        when(quizRepository.findByDocumentId_DocumentId(1)).thenReturn(List.of());
        when(summaryRepository.findByDocumentId_DocumentId(1)).thenReturn(List.of());

        userService.deleteAccount(1L, "password123");

        verify(documentRepository).deleteAll(anyList());
        verify(userRepository).delete(user);
    }

    @Test
    @DisplayName("UT-US-13: Eliminar cuenta con contraseña incorrecta lanza excepción")
    void deleteAccount_ConPasswordIncorrecta_DebeArrojarExcepcion() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "$2a$10$hashedPassword")).thenReturn(false);

        assertThatThrownBy(() -> userService.deleteAccount(1L, "wrongPassword"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Contraseña incorrecta");

        verify(userRepository, never()).delete(any());
    }

    @Test
    @DisplayName("UT-US-14: Eliminar cuenta con ID inexistente lanza excepción")
    void deleteAccount_ConIdInexistente_DebeArrojarExcepcion() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.deleteAccount(99L, "password123"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Usuario no encontrado");
    }
}
