package com.kydira_api.service.impl;

import com.kydira_api.service.IGeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.List;

@Service
public class GeminiServiceImpl implements IGeminiService {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${gemini.api.key}")
    private String apiKey;

    private final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    @Override
    public String generateContent(String prompt) throws Exception {
        String url = API_URL + apiKey;

        // Estructura simplificada del cuerpo de la petición para Gemini
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", prompt)
                ))
            )
        );

        try {
            // Aquí se realiza la llamada POST a Google
            Map<String, Object> response = restTemplate.postForObject(url, requestBody, Map.class);
            // Nota: En el Sprint 3 mapearemos la respuesta JSON completa a un DTO
            return response.toString(); 
        } catch (Exception e) {
            throw new Exception("Error al conectar con Google Gemini: " + e.getMessage());
        }
    }

    @Override
    public String summarizeDocument(String rawText) throws Exception {
        String prompt = "Actúa como un profesor de primaria muy divertido. " +
                        "Resume el siguiente texto educativo de forma breve, " +
                        "usando palabras fáciles de entender para un niño de 7 años. " +
                        "Usa emojis y hazlo muy motivador. Texto: " + rawText;
        
        return this.generateContent(prompt);
    }
}