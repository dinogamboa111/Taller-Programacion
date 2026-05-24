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
    @Transactional
    public Quiz createQuizFromDocument(Integer documentId) throws Exception {
        Document doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("Documento no encontrado"));

        Quiz newQuiz = geminiService.generateQuizContent(doc.getRawContent());

        newQuiz.setDocumentId(doc);
        // newQuiz.setUserId(...) eliminado — el usuario se infiere vía doc.getUserId()
        // No hay riesgo de inconsistencia: un solo camino hacia el usuario

        return quizRepository.save(newQuiz);
    }
}