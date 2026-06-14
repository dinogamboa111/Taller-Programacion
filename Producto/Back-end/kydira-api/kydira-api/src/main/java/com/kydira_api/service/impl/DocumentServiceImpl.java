package com.kydira_api.service.impl;

import com.kydira_api.dto.DocumentStatusDTO;
import com.kydira_api.model.Document;
import com.kydira_api.model.FileType;
import com.kydira_api.model.User;
import com.kydira_api.repository.DocumentRepository;
import com.kydira_api.repository.FileTypeRepository;
import com.kydira_api.repository.QuizRepository;
import com.kydira_api.repository.SummaryRepository;
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
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DocumentServiceImpl implements IDocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileTypeRepository fileTypeRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private SummaryRepository summaryRepository;

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

        // RF-02: Extracción de texto (Versión Camila)
        if (contentType.equals("application/pdf")) {
            try (PDDocument pdf = Loader.loadPDF(file.getBytes())) {
                extractedText = new PDFTextStripper().getText(pdf);
            }
        } else {
            try (InputStream is = file.getInputStream();
                 XWPFDocument docx = new XWPFDocument(is)) {
                extractedText = new XWPFWordExtractor(docx).getText();
            }
        }

        // Creación del objeto Document siguiendo el MER 
        Document doc = new Document();
        doc.setFileName(file.getOriginalFilename());

        // Línea que falta — deriva el nombre del tipo desde el contentType que ya validaste arriba
        String typeName = contentType.equals("application/pdf") ? "PDF" : "DOCX";

        FileType fileType = fileTypeRepository.findByTypeName(typeName)
            .orElseThrow(() -> new RuntimeException("Tipo '" + typeName + "' no encontrado en el catálogo."));
        doc.setFileType(fileType);

        doc.setRawContent(extractedText);
        doc.setUploadDate(LocalDateTime.now());
        doc.setUserId(user);
        return documentRepository.save(doc);
    }

    @Override
    public List<DocumentStatusDTO> getDocumentsByUser(Long userId) {
        List<Document> docs = documentRepository.findByUserId_UserId(userId);

        Set<Integer> docsWithQuiz = quizRepository.findByDocumentId_UserId_UserId(userId)
                .stream()
                .map(q -> q.getDocumentId().getDocumentId())
                .collect(Collectors.toSet());

        Set<Integer> docsWithSummary = summaryRepository.findByDocumentId_UserId_UserId(userId)
                .stream()
                .map(s -> s.getDocumentId().getDocumentId())
                .collect(Collectors.toSet());

        return docs.stream()
                .map(doc -> new DocumentStatusDTO(
                        doc.getDocumentId(),
                        doc.getFileName(),
                        doc.getUploadDate(),
                        doc.getFileType(),
                        docsWithQuiz.contains(doc.getDocumentId()),
                        docsWithSummary.contains(doc.getDocumentId())
                ))
                .collect(Collectors.toList());
    }
}