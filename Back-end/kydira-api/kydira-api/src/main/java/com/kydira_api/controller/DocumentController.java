package com.kydira_api.controller;

import com.kydira_api.service.IDocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    @Autowired
    private IDocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file, @RequestParam("userId") Long userId) {
        try {
            return ResponseEntity.ok(documentService.uploadDocument(file, userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}