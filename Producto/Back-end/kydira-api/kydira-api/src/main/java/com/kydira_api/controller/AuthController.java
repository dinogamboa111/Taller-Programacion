package com.kydira_api.controller;

import com.kydira_api.model.User;
import com.kydira_api.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private IUserService userService; // Usamos el servicio que ya existe

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        // Llamamos a una función de validación en el service
        User user = userService.login(email, password);
        
        return ResponseEntity.ok(user);
    }
}