package com.kydira_api.service.impl;

import com.kydira_api.model.Document;
import com.kydira_api.model.Quiz;
import com.kydira_api.repository.DocumentRepository;
import com.kydira_api.repository.QuizRepository;
import com.kydira_api.service.IGeminiService;
import com.kydira_api.service.IQuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuizServiceImpl implements IQuizService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private IGeminiService geminiService;

    @Override
    @Transactional // Importante para asegurar que se guarde todo o nada
    public Quiz createQuizFromDocument(Integer documentId) throws Exception {
        // 1. Buscar el documento
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Documento no encontrado"));

        // 2. Obtener el JSON de la trivia desde Gemini usando el rawContent
        // Aquí asumimos que geminiService ya devuelve la estructura mapeada
        Quiz newQuiz = geminiService.generateQuizContent(doc.getRawContent());

        // 3. Vincular el Quiz con el documento y el usuario (tutor)
        newQuiz.setDocumentId(doc);
        newQuiz.setUserId(doc.getUserId()); // O doc.getUserId() según tu entidad

        // 4. Guardar en cascada (Gracias al CascadeType.ALL que pusimos antes)
        // Esto guardará el Quiz, sus Questions y sus Alternatives de una vez
        return quizRepository.save(newQuiz);
    }
}