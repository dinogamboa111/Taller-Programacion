package com.kydira_api.controller;

import com.kydira_api.service.ISummaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/summary")
public class SummaryController {

    @Autowired
    private ISummaryService summaryService;

    @GetMapping("/document/{documentId}")
    public ResponseEntity<?> getSummaryByDocument(@PathVariable Integer documentId) {
        Map<String, String> result = summaryService.getSummaryByDocument(documentId);
        if (result == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/document/{documentId}")
    public ResponseEntity<?> deleteSummaryByDocument(@PathVariable Integer documentId) {
        summaryService.deleteSummaryByDocument(documentId);
        return ResponseEntity.ok("Resumen eliminado correctamente.");
    }

    @GetMapping("/generate/{documentId}")
    public ResponseEntity<?> generateSummary(@PathVariable Integer documentId) {
        try {
            return ResponseEntity.ok(summaryService.generateSummary(documentId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
