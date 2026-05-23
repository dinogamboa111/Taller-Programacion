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

        // RF-01: Validación de formato 
        if (contentType == null || (!contentType.equals("application/pdf") &&
                !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
            throw new RuntimeException("Formato no compatible. Solo se permite PDF o Word. [cite: 107]");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String extractedText = "";

        // RF-02: Extracción de texto eficiente 
        try (InputStream is = file.getInputStream()) {
            if (contentType.equals("application/pdf")) {
                // Loader.loadPDF(is) es más eficiente que file.getBytes()
                try (PDDocument pdf = Loader.loadPDF(file.getResource().getFile())) { 
                    extractedText = new PDFTextStripper().getText(pdf);
                }
            } else {
                try (XWPFDocument docx = new XWPFDocument(is)) {
                    XWPFWordExtractor extractor = new XWPFWordExtractor(docx);
                    extractedText = extractor.getText();
                }
            }
        }

        // Creación del objeto Document siguiendo el MER 
        Document doc = new Document();
        doc.setFileName(file.getOriginalFilename());
        // El fileType debería guardarse si tienes la tabla FILE_TYPE o un campo dedicado
        doc.setRawContent(extractedText); // Contenido para Gemini [cite: 118]
        doc.setUploadDate(LocalDateTime.now());
        doc.setUserId(user); // Mapeo del objeto User completo

        return documentRepository.save(doc);
    }
}