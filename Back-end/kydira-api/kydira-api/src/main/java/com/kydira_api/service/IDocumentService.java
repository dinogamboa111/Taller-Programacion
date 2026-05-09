package com.kydira_api.service;

import com.kydira_api.model.Document;
import org.springframework.web.multipart.MultipartFile;

public interface IDocumentService {
    Document uploadDocument(MultipartFile file, Long userId) throws Exception;
}