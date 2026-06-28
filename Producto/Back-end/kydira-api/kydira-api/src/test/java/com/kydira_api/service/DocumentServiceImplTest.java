package com.kydira_api.service;

import com.kydira_api.dto.DocumentStatusDTO;
import com.kydira_api.model.*;
import com.kydira_api.repository.*;
import com.kydira_api.service.impl.DocumentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DocumentServiceImpl - Pruebas Unitarias")
class DocumentServiceImplTest {

    @Mock private DocumentRepository documentRepository;
    @Mock private UserRepository userRepository;
    @Mock private FileTypeRepository fileTypeRepository;
    @Mock private QuizRepository quizRepository;
    @Mock private SummaryRepository summaryRepository;

    @InjectMocks
    private DocumentServiceImpl documentService;

    private User user;
    private FileType pdfType;
    private FileType docxType;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setEmail("test@kydira.com");

        pdfType = new FileType();
        pdfType.setTypeName("PDF");

        docxType = new FileType();
        docxType.setTypeName("DOCX");
    }

    // ===================== uploadDocument =====================

    @Test
    @DisplayName("UT-DS-01: Subir archivo con formato no soportado lanza excepción")
    void uploadDocument_ConFormatoNoSoportado_DebeArrojarExcepcion() {
        MultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "contenido".getBytes());

        assertThatThrownBy(() -> documentService.uploadDocument(file, 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Formato no compatible");
    }

    @Test
    @DisplayName("UT-DS-02: Subir archivo con contentType null lanza excepción")
    void uploadDocument_ConContentTypeNull_DebeArrojarExcepcion() {
        MultipartFile file = new MockMultipartFile("file", "test.pdf", null, "contenido".getBytes());

        assertThatThrownBy(() -> documentService.uploadDocument(file, 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Formato no compatible");
    }

    @Test
    @DisplayName("UT-DS-03: Subir archivo con usuario inexistente lanza excepción")
    void uploadDocument_ConUsuarioInexistente_DebeArrojarExcepcion() {
        MultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", new byte[]{1, 2, 3});
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.uploadDocument(file, 99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Usuario no encontrado");
    }

    @Test
    @DisplayName("UT-DS-04: PDF con bytes malformados lanza IOException de PDFBox")
    void uploadDocument_ConPdfMalformado_DebeArrojarIOException() {
        // PDFBox rechaza cualquier byte array que no tenga cabecera válida (%PDF-).
        // El flujo llega hasta la extracción de texto porque el usuario existe y el contentType es válido.
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        MultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", new byte[]{1, 2, 3});

        assertThatThrownBy(() -> documentService.uploadDocument(file, 1L))
                .isInstanceOf(Exception.class)
                .isNotInstanceOf(RuntimeException.class);
    }

    @Test
    @DisplayName("UT-DS-04b: FileType 'PDF' no registrado en catálogo lanza excepción con mensaje claro")
    void uploadDocument_ConFileTypeNoEncontrado_DebeArrojarExcepcionDetalles() throws Exception {
        // PDF mínimo válido para que PDFBox lo procese sin error
        byte[] minimalPdf = (
            "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
            "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
            "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 3 3]>>endobj\n" +
            "xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n" +
            "0000000058 00000 n\n0000000115 00000 n\n" +
            "trailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF"
        ).getBytes();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(fileTypeRepository.findByTypeName("PDF")).thenReturn(Optional.empty());

        MultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", minimalPdf);

        assertThatThrownBy(() -> documentService.uploadDocument(file, 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("PDF");
    }

    // ===================== getDocumentsByUser =====================

    @Test
    @DisplayName("UT-DS-05: Obtener documentos de usuario sin documentos retorna lista vacía")
    void getDocumentsByUser_SinDocumentos_DebeRetornarListaVacia() {
        when(documentRepository.findByUserId_UserId(1L)).thenReturn(List.of());
        when(quizRepository.findByDocumentId_UserId_UserId(1L)).thenReturn(List.of());
        when(summaryRepository.findByDocumentId_UserId_UserId(1L)).thenReturn(List.of());

        List<DocumentStatusDTO> result = documentService.getDocumentsByUser(1L);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("UT-DS-06: Documentos sin quiz ni resumen tienen flags en false")
    void getDocumentsByUser_SinQuizNiSummary_DebeRetornarFlagsEnFalse() {
        Document doc = crearDocumento(1, "archivo.pdf");
        when(documentRepository.findByUserId_UserId(1L)).thenReturn(List.of(doc));
        when(quizRepository.findByDocumentId_UserId_UserId(1L)).thenReturn(List.of());
        when(summaryRepository.findByDocumentId_UserId_UserId(1L)).thenReturn(List.of());

        List<DocumentStatusDTO> result = documentService.getDocumentsByUser(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isHasQuiz()).isFalse();
        assertThat(result.get(0).isHasSummary()).isFalse();
    }

    @Test
    @DisplayName("UT-DS-07: Documento con quiz asociado tiene flag hasQuiz en true")
    void getDocumentsByUser_ConQuizAsociado_DebeRetornarHasQuizTrue() {
        Document doc = crearDocumento(1, "archivo.pdf");

        Quiz quiz = new Quiz();
        quiz.setDocumentId(doc);

        when(documentRepository.findByUserId_UserId(1L)).thenReturn(List.of(doc));
        when(quizRepository.findByDocumentId_UserId_UserId(1L)).thenReturn(List.of(quiz));
        when(summaryRepository.findByDocumentId_UserId_UserId(1L)).thenReturn(List.of());

        List<DocumentStatusDTO> result = documentService.getDocumentsByUser(1L);

        assertThat(result.get(0).isHasQuiz()).isTrue();
        assertThat(result.get(0).isHasSummary()).isFalse();
    }

    @Test
    @DisplayName("UT-DS-08: Documento con resumen asociado tiene flag hasSummary en true")
    void getDocumentsByUser_ConSummaryAsociado_DebeRetornarHasSummaryTrue() {
        Document doc = crearDocumento(1, "archivo.pdf");

        Summary summary = new Summary();
        summary.setDocumentId(doc);

        when(documentRepository.findByUserId_UserId(1L)).thenReturn(List.of(doc));
        when(quizRepository.findByDocumentId_UserId_UserId(1L)).thenReturn(List.of());
        when(summaryRepository.findByDocumentId_UserId_UserId(1L)).thenReturn(List.of(summary));

        List<DocumentStatusDTO> result = documentService.getDocumentsByUser(1L);

        assertThat(result.get(0).isHasQuiz()).isFalse();
        assertThat(result.get(0).isHasSummary()).isTrue();
    }

    @Test
    @DisplayName("UT-DS-09: Retorna múltiples documentos con sus datos correctos")
    void getDocumentsByUser_ConMultiplesDocumentos_DebeRetornarTodos() {
        Document doc1 = crearDocumento(1, "archivo1.pdf");
        Document doc2 = crearDocumento(2, "archivo2.pdf");

        when(documentRepository.findByUserId_UserId(1L)).thenReturn(List.of(doc1, doc2));
        when(quizRepository.findByDocumentId_UserId_UserId(1L)).thenReturn(List.of());
        when(summaryRepository.findByDocumentId_UserId_UserId(1L)).thenReturn(List.of());

        List<DocumentStatusDTO> result = documentService.getDocumentsByUser(1L);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(DocumentStatusDTO::getFileName)
                .containsExactlyInAnyOrder("archivo1.pdf", "archivo2.pdf");
    }

    // Helper
    private Document crearDocumento(int id, String nombre) {
        Document doc = new Document();
        doc.setDocumentId(id);
        doc.setFileName(nombre);
        doc.setUploadDate(LocalDateTime.now());
        doc.setFileType(pdfType);
        doc.setUserId(user);
        return doc;
    }
}
