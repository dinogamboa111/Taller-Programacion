package com.kydira_api.controller;

import com.kydira_api.model.Quiz;
import com.kydira_api.repository.DocumentRepository;
import com.kydira_api.repository.QuizRepository;
import com.kydira_api.service.IGeminiService;
import com.kydira_api.service.IQuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")

public class QuizController {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private IGeminiService geminiService;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private IQuizService quizService;

    /**
     * POST /api/quiz/generate/{documentId}
     * Genera un quiz desde el texto extraído del documento usando Gemini.
     */
    @PostMapping("/generate/{documentId}")
    public ResponseEntity<?> generateQuiz(@PathVariable Integer documentId) {
        try {
            Quiz quiz = quizService.createQuizFromDocument(documentId);
            return ResponseEntity.ok(quiz);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al generar quiz: " + e.getMessage());
        }
    }

    /**
     * GET /api/quiz/{id}
     * Recupera un quiz ya guardado en BD por su ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable Integer id) {
        return quizRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new RuntimeException("Trivia no encontrada"));
    }

    /**
     * GET /api/quiz/document/{documentId}
     * Lista todos los quizzes generados para un documento específico.
     */
    @GetMapping("/document/{documentId}")
    public ResponseEntity<List<Quiz>> getQuizzesByDocument(@PathVariable Integer documentId) {
        return ResponseEntity.ok(quizRepository.findByDocumentId_DocumentId(documentId));
    }

    /**
     * GET /api/quiz/user/{userId}
     * Lista todos los quizzes asociados a un usuario.
     * Navega: quiz → document → user (sin necesitar quiz.user_id directo)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Quiz>> getQuizzesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(quizRepository.findByDocumentId_UserId_UserId(userId));
    }

    /**
     * DELETE /api/quiz/{id}
     * Elimina un quiz y sus preguntas/alternativas en cascada.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable Integer id) {
        if (!quizRepository.existsById(id)) {
            return ResponseEntity.badRequest().body("Quiz no encontrado con ID: " + id);
        }
        quizRepository.deleteById(id);
        return ResponseEntity.ok("Quiz eliminado correctamente.");
    }
}