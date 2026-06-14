package com.kydira_api.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kydira_api.model.Alternative;
import com.kydira_api.model.Question;
import com.kydira_api.model.Quiz;
import com.kydira_api.service.IGeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GeminiServiceImpl implements IGeminiService {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${gemini.api.key}")
    private String apiKey;
    
    // Probando Modelos
    
    //private final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=";

    // Se mantiene la versión de la rama CamilaDev
    private final String API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=";

    @SuppressWarnings("unchecked")
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
            Map<String, Object> response = restTemplate.postForObject(url, requestBody, Map.class);
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            throw new Exception("Error al conectar con Google Gemini: " + e.getMessage());
        }
    }

    @Override
    public String summarizeDocument(String rawText) throws Exception {
        String prompt = "Actúa como un profesor de primaria. " +
                        "Resume el siguiente texto educativo de forma breve y clara, " +
                        "usando palabras fáciles de entender para un niño de 7 años. " +
                        "No uses emojis ni emoticones. Solo texto limpio. Texto: " + rawText;

        return this.generateContent(prompt);
    }

    @SuppressWarnings("unchecked")
    @Override
    public Quiz generateQuizContent(String rawText) throws Exception {
        String prompt = "Genera exactamente 3 preguntas de trivia sobre el siguiente texto educativo para ninos de primaria. " +
                        "No uses emojis. Responde SOLO con un array JSON valido, sin explicaciones ni texto adicional, " +
                        "con este formato exacto:\n" +
                        "[{\"pregunta\":\"texto de la pregunta\",\"opciones\":[\"opcion A\",\"opcion B\",\"opcion C\",\"opcion D\"],\"correcta\":0}]\n" +
                        "El campo 'correcta' es el indice (0, 1, 2 o 3) de la opcion correcta. " +
                        "Texto: " + rawText;

        String jsonResponse = this.generateContent(prompt);

        // Eliminar markdown code block si Gemini lo incluye
        jsonResponse = jsonResponse.trim();
        if (jsonResponse.startsWith("```")) {
            jsonResponse = jsonResponse.replaceAll("(?s)```json\\s*|```\\s*", "").trim();
        }
        // Extraer solo el array JSON en caso de texto extra antes/después
        int start = jsonResponse.indexOf('[');
        int end   = jsonResponse.lastIndexOf(']');
        if (start >= 0 && end > start) {
            jsonResponse = jsonResponse.substring(start, end + 1);
        }

        ObjectMapper mapper = new ObjectMapper();
        List<Map<String, Object>> preguntas = mapper.readValue(jsonResponse, List.class);

        Quiz quiz = new Quiz();
        quiz.setTitle("Trivia del documento");
        quiz.setGenerationDate(LocalDateTime.now());

        List<Question> questions = new ArrayList<>();
        for (int i = 0; i < preguntas.size(); i++) {
            Map<String, Object> p = preguntas.get(i);

            Question question = new Question();
            question.setStatement((String) p.get("pregunta"));
            question.setSortOrder(i + 1);
            question.setQuizId(quiz);

            List<String> opciones = (List<String>) p.get("opciones");
            int correctaIdx = ((Number) p.get("correcta")).intValue();

            List<Alternative> alternatives = new ArrayList<>();
            for (int j = 0; j < opciones.size(); j++) {
                Alternative alt = new Alternative();
                alt.setContent(opciones.get(j));
                alt.setCorrect(j == correctaIdx);
                alt.setQuestion(question);
                alternatives.add(alt);
            }
            question.setAlternatives(alternatives);
            questions.add(question);
        }

        quiz.setQuestions(questions);
        return quiz;
    }
}