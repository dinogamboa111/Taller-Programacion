package com.kydira_api.service;

import com.kydira_api.model.Document;
import com.kydira_api.model.Question;
import com.kydira_api.model.Quiz;
import com.kydira_api.repository.DocumentRepository;
import com.kydira_api.repository.QuizRepository;
import com.kydira_api.service.impl.QuizServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("QuizServiceImpl - Pruebas Unitarias")
class QuizServiceImplTest {

    @Mock private DocumentRepository documentRepository;
    @Mock private QuizRepository quizRepository;
    @Mock private IGeminiService geminiService;

    @InjectMocks
    private QuizServiceImpl quizService;

    private Document document;
    private Quiz quiz;

    @BeforeEach
    void setUp() {
        document = new Document();
        document.setDocumentId(1);
        document.setFileName("leccion.pdf");
        document.setRawContent("Texto educativo sobre matemáticas.");

        quiz = new Quiz();
        quiz.setTitle("Trivia del documento");
        quiz.setGenerationDate(LocalDateTime.now());

        Question q1 = new Question();
        q1.setStatement("¿Cuánto es 2+2?");
        quiz.setQuestions(List.of(q1));
    }

    @Test
    @DisplayName("UT-QS-01: Generar quiz exitosamente desde documento existente")
    void createQuizFromDocument_ConDocumentoExistente_DebeRetornarQuiz() throws Exception {
        when(documentRepository.findById(1)).thenReturn(Optional.of(document));
        when(geminiService.generateQuizContent(document.getRawContent())).thenReturn(quiz);
        when(quizRepository.save(any(Quiz.class))).thenAnswer(inv -> inv.getArgument(0));

        Quiz result = quizService.createQuizFromDocument(1);

        assertThat(result).isNotNull();
        assertThat(result.getDocumentId()).isEqualTo(document);
        verify(geminiService).generateQuizContent(document.getRawContent());
        verify(quizRepository).save(quiz);
    }

    @Test
    @DisplayName("UT-QS-02: Generar quiz con documento inexistente lanza excepción")
    void createQuizFromDocument_ConDocumentoInexistente_DebeArrojarExcepcion() {
        when(documentRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> quizService.createQuizFromDocument(99))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Documento no encontrado");

        verify(geminiService, never()).generateQuizContent(anyString());
    }

    @Test
    @DisplayName("UT-QS-03: Si Gemini falla, la excepción se propaga")
    void createQuizFromDocument_CuandoGeminiFalla_DebePropagarExcepcion() throws Exception {
        when(documentRepository.findById(1)).thenReturn(Optional.of(document));
        when(geminiService.generateQuizContent(anyString()))
                .thenThrow(new Exception("Error de conexión con Gemini"));

        assertThatThrownBy(() -> quizService.createQuizFromDocument(1))
                .isInstanceOf(Exception.class)
                .hasMessageContaining("Error de conexión con Gemini");

        verify(quizRepository, never()).save(any());
    }

    @Test
    @DisplayName("UT-QS-04: El quiz generado queda vinculado al documento correcto")
    void createQuizFromDocument_DebeAsociarDocumentoAlQuiz() throws Exception {
        when(documentRepository.findById(1)).thenReturn(Optional.of(document));
        when(geminiService.generateQuizContent(anyString())).thenReturn(quiz);
        when(quizRepository.save(any(Quiz.class))).thenAnswer(inv -> inv.getArgument(0));

        Quiz result = quizService.createQuizFromDocument(1);

        assertThat(result.getDocumentId()).isSameAs(document);
    }
}
