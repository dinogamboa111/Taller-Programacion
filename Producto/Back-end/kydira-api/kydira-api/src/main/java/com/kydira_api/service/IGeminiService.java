package com.kydira_api.service;

import com.kydira_api.model.Quiz;

public interface IGeminiService {
    String generateContent(String prompt) throws Exception;
    String summarizeDocument(String rawText) throws Exception;
    Quiz generateQuizContent(String rawText) throws Exception; 
}