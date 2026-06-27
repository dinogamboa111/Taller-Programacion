package com.kydira_api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kydira_api.dto.UserDTO;
import com.kydira_api.model.User;
import com.kydira_api.service.IUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pruebas FUNCIONALES del UserController.
 * Verifican el comportamiento del endpoint HTTP completo (entrada/salida/status code).
 */
@WebMvcTest(UserController.class)
@DisplayName("UserController - Pruebas Funcionales")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IUserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    private User user;
    private UserDTO userDTO;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setEmail("test@kydira.com");
        user.setFirstName("Juan");
        user.setLastName("Perez");

        userDTO = new UserDTO();
        userDTO.setEmail("test@kydira.com");
        userDTO.setFirstName("Juan");
        userDTO.setLastName("Perez");
        userDTO.setPassword("password123");
    }

    // ===================== POST /api/users/register =====================

    @Test
    @DisplayName("FT-UC-01: Registro de usuario retorna HTTP 200 y el usuario creado")
    @WithMockUser
    void register_ConDatosValidos_DebeRetornar200() throws Exception {
        when(userService.registerUser(any(UserDTO.class))).thenReturn(user);

        mockMvc.perform(post("/api/users/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@kydira.com"))
                .andExpect(jsonPath("$.firstName").value("Juan"));
    }

    // ===================== PUT /api/users/profile/{id} =====================

    @Test
    @DisplayName("FT-UC-02: Actualizar perfil exitosamente retorna HTTP 200")
    @WithMockUser
    void updateProfile_ConDatosValidos_DebeRetornar200() throws Exception {
        when(userService.updateProfile(eq(1L), any(UserDTO.class))).thenReturn(user);

        mockMvc.perform(put("/api/users/profile/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1));
    }

    @Test
    @DisplayName("FT-UC-03: Actualizar perfil con ID inexistente retorna error")
    @WithMockUser
    void updateProfile_ConIdInexistente_DebeRetornarError() throws Exception {
        when(userService.updateProfile(eq(99L), any(UserDTO.class)))
                .thenThrow(new RuntimeException("Usuario no encontrado"));

        mockMvc.perform(put("/api/users/profile/99")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDTO)))
                .andExpect(status().isBadRequest());
    }

    // ===================== DELETE /api/users/{id} =====================

    @Test
    @DisplayName("FT-UC-04: Eliminar cuenta exitosamente retorna HTTP 200")
    @WithMockUser
    void deleteAccount_ConPasswordCorrecta_DebeRetornar200() throws Exception {
        doNothing().when(userService).deleteAccount(eq(1L), eq("password123"));

        mockMvc.perform(delete("/api/users/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"password123\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("FT-UC-05: Eliminar cuenta con contraseña incorrecta retorna HTTP 400")
    @WithMockUser
    void deleteAccount_ConPasswordIncorrecta_DebeRetornar400() throws Exception {
        doThrow(new RuntimeException("Contraseña incorrecta"))
                .when(userService).deleteAccount(eq(1L), eq("wrongPass"));

        mockMvc.perform(delete("/api/users/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"wrongPass\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Contraseña incorrecta"));
    }
}
