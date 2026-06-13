package com.kydira_api.controller;

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
            return ResponseEntity.ok(documentService.uploadDocument(file, userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Document>> getDocumentsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(documentRepository.findByUserId_UserId(userId));
    }

    // Eliminar un documento (y por cascada sus resúmenes y quizzes)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Integer id) {
        documentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}