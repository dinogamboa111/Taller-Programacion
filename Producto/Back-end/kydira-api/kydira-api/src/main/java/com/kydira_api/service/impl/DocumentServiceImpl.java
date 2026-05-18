package com.kydira_api.service.impl;

import com.kydira_api.model.Document;
import com.kydira_api.model.User;
import com.kydira_api.repository.DocumentRepository;
import com.kydira_api.repository.UserRepository;
import com.kydira_api.service.IDocumentService;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;

@Service
public class DocumentServiceImpl implements IDocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Document uploadDocument(MultipartFile file, Long userId) throws Exception {
        String contentType = file.getContentType();

        // Validación de formato
        if (contentType == null || (!contentType.equals("application/pdf") &&
                !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
            throw new RuntimeException("Formato no compatible. Solo se permite PDF o Word.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String extractedText = "";

        // Lógica de extracción de texto [cite: 805]
        try (InputStream is = file.getInputStream()) {
            if (contentType.equals("application/pdf")) {
                try (PDDocument pdf = Loader.loadPDF(file.getBytes())) {
                    extractedText = new PDFTextStripper().getText(pdf);
                }
            } else {
                try (XWPFDocument docx = new XWPFDocument(is)) {
                    XWPFWordExtractor extractor = new XWPFWordExtractor(docx);
                    extractedText = extractor.getText();
                }
            }
        }

        Document doc = new Document();
        doc.setFileName(file.getOriginalFilename());
        doc.setFileType(contentType);
        doc.setRawContent(extractedText); // Guardamos el texto extraído
        doc.setUploadDate(LocalDateTime.now());
        doc.setUserId(user);

        return documentRepository.save(doc);
    }
}