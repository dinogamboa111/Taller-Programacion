package com.kydira_api.controller;

import com.kydira_api.model.Document;
import com.kydira_api.model.Quiz;
import com.kydira_api.repository.DocumentRepository;
import com.kydira_api.repository.QuizRepository;
import com.kydira_api.service.IGeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "*")
public class QuizController {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private IGeminiService geminiService;

    @Autowired
    private QuizRepository quizRepository;

    @GetMapping("/generate/{documentId}")
    public ResponseEntity<?> generateQuiz(@PathVariable Integer documentId) throws Exception {
        // Buscamos el documento (JPA lanzará la excepción capturada por el GlobalHandler)
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Documento no encontrado para generar trivia"));

        // US-17: Llamamos al método exacto definido en IGeminiService
        // Cambiamos 'generateQuiz' por 'generateQuizContent'
        var quizData = geminiService.generateQuizContent(doc.getRawContent());

        return ResponseEntity.ok(Map.of(
            "documentId", documentId,
            "quiz", quizData
        ));
    }

    @GetMapping("/{id}") // Recuperar trivia ya existente en la BD
    public ResponseEntity<Quiz> getQuizById(@PathVariable Integer id) {
        return quizRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new RuntimeException("Trivia no encontrada"));
    }

   

    // Listar todas las trivias de un documento para que el niño elija cuál jugar
    @GetMapping("/document/{documentId}")
    public ResponseEntity<List<Quiz>> getQuizzesByDocument(@PathVariable Integer documentId) {
        return ResponseEntity.ok(quizRepository.findByDocumentId_DocumentId(documentId));
    }
}