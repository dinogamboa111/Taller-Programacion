package com.kydira_api.service;

import com.kydira_api.model.Quiz;


public interface IQuizService {
    // Genera el quiz usando la IA y lo guarda en la BD
    Quiz createQuizFromDocument(Integer documentId) throws Exception;
}