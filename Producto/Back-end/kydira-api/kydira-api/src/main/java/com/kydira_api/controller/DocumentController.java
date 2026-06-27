package com.kydira_api.controller;

import com.kydira_api.dto.DocumentStatusDTO;
import com.kydira_api.model.Document;
import com.kydira_api.repository.DocumentRepository;
import com.kydira_api.service.IDocumentService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private IDocumentService documentService;

    @Autowired
    private DocumentRepository documentRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file, @RequestParam("userId") Long userId) {
        try {
            Document doc = documentService.uploadDocument(file, userId);
            // Devolver DTO con hasQuiz y hasSummary en false (recién subido)
            DocumentStatusDTO dto = new DocumentStatusDTO(
                doc.getDocumentId(),
                doc.getFileName(),
                doc.getUploadDate(),
                doc.getFileType(),
                false,
                false
            );
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DocumentStatusDTO>> getDocumentsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(documentService.getDocumentsByUser(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Integer id) {
        documentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}