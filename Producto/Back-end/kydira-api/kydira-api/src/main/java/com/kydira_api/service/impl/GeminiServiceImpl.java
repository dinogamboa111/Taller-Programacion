package com.kydira_api.service.impl;

import com.kydira_api.model.Quiz;
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
    
    // Probando Modelos
    
    //private final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=";

    private final String API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=";




    @Override
    public String generateContent(String prompt) throws Exception {
        String url = API_URL + apiKey;

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", prompt)
                ))
            )
        );

        try {
            // Mantenemos tu lógica exacta
            Map<String, Object> response = restTemplate.postForObject(url, requestBody, Map.class);
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

    // Nuevo método que usa tu generateContent sin cambiar nada de lo anterior
    @Override
    public Quiz generateQuizContent(String rawText) throws Exception {
        String prompt = "Genera una trivia de 3 preguntas basada en: " + rawText;
        
        // Simplemente llamamos a tu método que ya funciona
        this.generateContent(prompt); 
        
        // Retornamos un objeto vacío por ahora para que compile el Sprint 2
        return new Quiz(); 
    }
}