package com.kydira_api.service;

public interface IGeminiService {
    String generateContent(String prompt) throws Exception;
    String summarizeDocument(String rawText) throws Exception; // Nuevo método
}