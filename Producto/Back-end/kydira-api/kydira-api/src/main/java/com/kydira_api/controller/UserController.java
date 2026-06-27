package com.kydira_api.controller;

import com.kydira_api.service.IUserService;
import com.kydira_api.dto.UserDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")

public class UserController {

    @Autowired
    private IUserService userService; // Inyectamos la interfaz

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.registerUser(userDTO));
    }
    
    // Endpoint para la US-14 (Gestión de perfil)
    @PutMapping("/profile/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.updateProfile(id, userDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAccount(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        try {
            userService.deleteAccount(id, body.get("password"));
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}