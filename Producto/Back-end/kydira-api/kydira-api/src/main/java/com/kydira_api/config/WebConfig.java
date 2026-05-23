package com.kydira_api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Aplica a todos los endpoints de tu API
                .allowedOrigins("http://localhost:5173", "http://localhost:3000") // Orígenes permitidos (Vite o Create React App)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Métodos HTTP permitidos
                .allowedHeaders("*") // Permite todos los headers (Content-Type, Authorization, etc.)
                .allowCredentials(true); // Permite el envío de cookies o auth headers si fuera necesario
    }
}