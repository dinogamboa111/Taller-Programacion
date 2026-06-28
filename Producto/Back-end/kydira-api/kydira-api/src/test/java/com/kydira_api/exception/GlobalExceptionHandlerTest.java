package com.kydira_api.exception;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("GlobalExceptionHandler - Pruebas Unitarias")
class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    @DisplayName("RuntimeException retorna HTTP 400 con mensaje de error de ejecución")
    void handleRuntimeException_DebeRetornarHttp400ConMensaje() {
        RuntimeException ex = new RuntimeException("Usuario no encontrado");

        ResponseEntity<Map<String, String>> response = handler.handleRuntimeException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("error", "Error de ejecución");
        assertThat(response.getBody()).containsEntry("message", "Usuario no encontrado");
    }

    @Test
    @DisplayName("Exception genérica retorna HTTP 500 con mensaje de error interno")
    void handleAllExceptions_DebeRetornarHttp500ConMensaje() throws Exception {
        Exception ex = new Exception("Fallo inesperado del sistema");

        ResponseEntity<Map<String, String>> response = handler.handleAllExceptions(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).containsEntry("error", "Ocurrió un error interno");
        assertThat(response.getBody()).containsEntry("message", "Fallo inesperado del sistema");
    }
}
