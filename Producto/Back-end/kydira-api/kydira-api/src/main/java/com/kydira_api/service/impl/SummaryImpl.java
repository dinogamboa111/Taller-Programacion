package com.kydira_api.service.impl;

import com.kydira_api.model.Document;
import com.kydira_api.model.Summary;
import com.kydira_api.repository.DocumentRepository;
import com.kydira_api.repository.SummaryRepository;
import com.kydira_api.service.ISummaryService;
import com.kydira_api.service.IGeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SummaryImpl implements ISummaryService {

    @Autowired
    private SummaryRepository summaryRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private IGeminiService geminiService;

    @Override
    public Map<String, String> getSummaryByDocument(Integer documentId) {
        Optional<Summary> existing = summaryRepository
            .findTopByDocumentId_DocumentIdOrderByGenerationDateDesc(documentId);
        if (existing.isEmpty()) return null;
        Summary s = existing.get();
        return Map.of(
            "fileName", s.getDocumentId().getFileName(),
            "summary",  s.getContent()
        );
    }

    @Override
    public void deleteSummaryByDocument(Integer documentId) {
        List<Summary> summaries = summaryRepository.findByDocumentId_DocumentId(documentId);
        summaryRepository.deleteAll(summaries);
    }

    @Override
    public Map<String, String> generateSummary(Integer documentId) throws Exception {
        Document doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("Documento no encontrado"));

        String summaryText = geminiService.summarizeDocument(doc.getRawContent());

        Summary summary = new Summary();
        summary.setContent(summaryText);
        summary.setGenerationDate(LocalDateTime.now());
        summary.setDocumentId(doc);
        summaryRepository.save(summary);

        return Map.of(
            "fileName", doc.getFileName(),
            "summary",  summaryText
        );
    }
}
