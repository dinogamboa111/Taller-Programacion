package com.kydira_api.controller;

import com.kydira_api.model.Document;
import com.kydira_api.repository.DocumentRepository;
import com.kydira_api.service.IGeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/summary")
@CrossOrigin(origins = "*")
public class SummaryController {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private IGeminiService geminiService;

    @GetMapping("/generate/{documentId}")
    public ResponseEntity<?> generateSummary(@PathVariable Integer documentId) {
        try {
            Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Documento no encontrado"));

            String summary = geminiService.summarizeDocument(doc.getRawContent());
            
            return ResponseEntity.ok(Map.of(
                "fileName", doc.getFileName(),
                "summary", summary
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}