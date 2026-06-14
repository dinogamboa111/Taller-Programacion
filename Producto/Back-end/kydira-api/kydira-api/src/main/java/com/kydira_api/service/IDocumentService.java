package com.kydira_api.service;

import com.kydira_api.dto.DocumentStatusDTO;
import com.kydira_api.model.Document;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IDocumentService {
    Document uploadDocument(MultipartFile file, Long userId) throws Exception;
    List<DocumentStatusDTO> getDocumentsByUser(Long userId);
}