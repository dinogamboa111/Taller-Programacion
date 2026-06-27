package com.kydira_api.controller;

import com.kydira_api.dto.DocumentStatusDTO;
import com.kydira_api.model.*;
import com.kydira_api.repository.DocumentRepository;
import com.kydira_api.repository.QuizRepository;
import com.kydira_api.service.IDocumentService;
import com.kydira_api.service.IGeminiService;
import com.kydira_api.service.IQuizService;
import com.kydira_api.service.ISummaryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pruebas FUNCIONALES de DocumentController, QuizController y SummaryController.
 */
@WebMvcTest({DocumentController.class, QuizController.class, SummaryController.class})
@DisplayName("Controllers REST - Pruebas Funcionales")
class RestControllersTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private IDocumentService documentService;
    @MockBean private DocumentRepository documentRepository;
    @MockBean private IQuizService quizService;
    @MockBean private QuizRepository quizRepository;
    @MockBean private IGeminiService geminiService;
    @MockBean private ISummaryService summaryService;

    // ==================== DocumentController ====================

    @Test
    @DisplayName("FT-DC-01: Upload de PDF válido retorna HTTP 200 con DocumentStatusDTO")
    @WithMockUser
    void upload_ConPdfValido_DebeRetornar200() throws Exception {
        FileType ft = new FileType(); ft.setTypeName("PDF");
        Document doc = new Document();
        doc.setDocumentId(1);
        doc.setFileName("leccion.pdf");
        doc.setUploadDate(LocalDateTime.now());
        doc.setFileType(ft);

        MockMultipartFile file = new MockMultipartFile(
                "file", "leccion.pdf", "application/pdf", "contenido".getBytes()
        );

        when(documentService.uploadDocument(any(), eq(1L))).thenReturn(doc);

        mockMvc.perform(multipart("/api/documents/upload")
                        .file(file)
                        .param("userId", "1")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileName").value("leccion.pdf"))
                .andExpect(jsonPath("$.hasQuiz").value(false))
                .andExpect(jsonPath("$.hasSummary").value(false));
    }

    @Test
    @DisplayName("FT-DC-02: Upload con formato inválido retorna HTTP 400")
    @WithMockUser
    void upload_ConFormatoInvalido_DebeRetornar400() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "archivo.txt", "text/plain", "contenido".getBytes()
        );

        when(documentService.uploadDocument(any(), eq(1L)))
                .thenThrow(new RuntimeException("Formato no compatible. Solo se permite PDF o Word."));

        mockMvc.perform(multipart("/api/documents/upload")
                        .file(file)
                        .param("userId", "1")
                        .with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("FT-DC-03: GET documentos por usuario retorna lista")
    @WithMockUser
    void getDocumentsByUser_DebeRetornar200ConLista() throws Exception {
        FileType ft = new FileType(); ft.setTypeName("PDF");
        DocumentStatusDTO dto = new DocumentStatusDTO(1, "leccion.pdf", LocalDateTime.now(), ft, false, false);

        when(documentService.getDocumentsByUser(1L)).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/documents/user/1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fileName").value("leccion.pdf"));
    }

    @Test
    @DisplayName("FT-DC-04: DELETE documento existente retorna HTTP 200")
    @WithMockUser
    void deleteDocument_DebeRetornar200() throws Exception {
        doNothing().when(documentRepository).deleteById(1);

        mockMvc.perform(delete("/api/documents/1").with(csrf()))
                .andExpect(status().isOk());

        verify(documentRepository).deleteById(1);
    }

    // ==================== QuizController ====================

    @Test
    @DisplayName("FT-QC-01: Generar quiz desde documento válido retorna HTTP 200")
    @WithMockUser
    void generateQuiz_ConDocumentoValido_DebeRetornar200() throws Exception {
        Quiz quiz = new Quiz();
        quiz.setQuizId(1);
        quiz.setTitle("Trivia del documento");

        when(quizService.createQuizFromDocument(1)).thenReturn(quiz);

        mockMvc.perform(post("/api/quiz/generate/1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Trivia del documento"));
    }

    @Test
    @DisplayName("FT-QC-02: Generar quiz con documento inexistente retorna HTTP 400")
    @WithMockUser
    void generateQuiz_ConDocumentoInexistente_DebeRetornar400() throws Exception {
        when(quizService.createQuizFromDocument(99))
                .thenThrow(new RuntimeException("Documento no encontrado"));

        mockMvc.perform(post("/api/quiz/generate/99").with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("FT-QC-03: GET quiz por ID existente retorna HTTP 200")
    @WithMockUser
    void getQuizById_ConIdExistente_DebeRetornar200() throws Exception {
        Quiz quiz = new Quiz();
        quiz.setQuizId(1);
        quiz.setTitle("Trivia");

        when(quizRepository.findById(1)).thenReturn(Optional.of(quiz));

        mockMvc.perform(get("/api/quiz/1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quizId").value(1));
    }

    @Test
    @DisplayName("FT-QC-04: DELETE quiz existente retorna HTTP 200 con mensaje")
    @WithMockUser
    void deleteQuiz_ConIdExistente_DebeRetornar200() throws Exception {
        when(quizRepository.existsById(1)).thenReturn(true);
        doNothing().when(quizRepository).deleteById(1);

        mockMvc.perform(delete("/api/quiz/1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("Quiz eliminado correctamente."));
    }

    @Test
    @DisplayName("FT-QC-05: DELETE quiz inexistente retorna HTTP 400")
    @WithMockUser
    void deleteQuiz_ConIdInexistente_DebeRetornar400() throws Exception {
        when(quizRepository.existsById(99)).thenReturn(false);

        mockMvc.perform(delete("/api/quiz/99").with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("FT-QC-06: GET quizzes por documento retorna lista")
    @WithMockUser
    void getQuizzesByDocument_DebeRetornar200() throws Exception {
        when(quizRepository.findByDocumentId_DocumentId(1)).thenReturn(List.of());

        mockMvc.perform(get("/api/quiz/document/1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // ==================== SummaryController ====================

    @Test
    @DisplayName("FT-SC-01: GET resumen existente retorna HTTP 200 con contenido")
    @WithMockUser
    void getSummaryByDocument_ConResumenExistente_DebeRetornar200() throws Exception {
        when(summaryService.getSummaryByDocument(1))
                .thenReturn(Map.of("fileName", "leccion.pdf", "summary", "Resumen del texto."));

        mockMvc.perform(get("/api/summary/document/1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileName").value("leccion.pdf"))
                .andExpect(jsonPath("$.summary").value("Resumen del texto."));
    }

    @Test
    @DisplayName("FT-SC-02: GET resumen inexistente retorna HTTP 404")
    @WithMockUser
    void getSummaryByDocument_SinResumen_DebeRetornar404() throws Exception {
        when(summaryService.getSummaryByDocument(1)).thenReturn(null);

        mockMvc.perform(get("/api/summary/document/1").with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("FT-SC-03: GET generate resumen exitosamente retorna HTTP 200")
    @WithMockUser
    void generateSummary_ConDocumentoValido_DebeRetornar200() throws Exception {
        when(summaryService.generateSummary(1))
                .thenReturn(Map.of("fileName", "leccion.pdf", "summary", "Resumen generado."));

        mockMvc.perform(get("/api/summary/generate/1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary").value("Resumen generado."));
    }

    @Test
    @DisplayName("FT-SC-04: GET generate resumen con documento inexistente retorna HTTP 400")
    @WithMockUser
    void generateSummary_ConDocumentoInexistente_DebeRetornar400() throws Exception {
        when(summaryService.generateSummary(99))
                .thenThrow(new RuntimeException("Documento no encontrado"));

        mockMvc.perform(get("/api/summary/generate/99").with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("FT-SC-05: DELETE resumen retorna HTTP 200 con mensaje")
    @WithMockUser
    void deleteSummaryByDocument_DebeRetornar200() throws Exception {
        doNothing().when(summaryService).deleteSummaryByDocument(1);

        mockMvc.perform(delete("/api/summary/document/1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("Resumen eliminado correctamente."));
    }
}
