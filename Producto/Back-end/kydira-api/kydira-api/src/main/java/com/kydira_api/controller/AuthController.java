package com.kydira_api.controller;

import com.kydira_api.model.User;
import com.kydira_api.repository.UserRepository;
import com.kydira_api.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository; // Inyectamos el repositorio para obtener los datos completos del usuario

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        try {
            // 1. Spring Security se encarga de autenticar y comparar las contraseñas encriptadas
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
        } catch (Exception e) {
            // Si las credenciales fallan, devolvemos un estado 401 (No autorizado)
            return ResponseEntity.status(401).body(Map.of("message", "Credenciales inválidas"));
        }

        // 2. Si la autenticación es exitosa, cargamos los detalles y generamos el Token JWT
        final UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        final String token = jwtUtil.generateToken(userDetails);

        // 3. Buscamos al usuario en la base de datos para extraer su información completa
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado tras la autenticación"));

        // 4. Construimos un mapa con la respuesta unificada (Token + Perfil)
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("userId", user.getUserId()); // Mapeado directo al ID único del usuario
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());

        return ResponseEntity.ok(response);
    }
}