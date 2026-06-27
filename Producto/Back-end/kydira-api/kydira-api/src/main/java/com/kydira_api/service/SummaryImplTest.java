package com.kydira_api.service;

import com.kydira_api.model.Document;
import com.kydira_api.model.Summary;
import com.kydira_api.repository.DocumentRepository;
import com.kydira_api.repository.SummaryRepository;
import com.kydira_api.service.impl.SummaryImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SummaryImpl - Pruebas Unitarias")
class SummaryImplTest {

    @Mock private SummaryRepository summaryRepository;
    @Mock private DocumentRepository documentRepository;
    @Mock private IGeminiService geminiService;

    @InjectMocks
    private SummaryImpl summaryService;

    private Document document;
    private Summary summary;

    @BeforeEach
    void setUp() {
        document = new Document();
        document.setDocumentId(1);
        document.setFileName("leccion.pdf");
        document.setRawContent("Texto educativo.");

        summary = new Summary();
        summary.setSummaryId(1);
        summary.setContent("Este es el resumen del texto.");
        summary.setGenerationDate(LocalDateTime.now());
        summary.setDocumentId(document);
    }

    // ===================== getSummaryByDocument =====================

    @Test
    @DisplayName("UT-SU-01: Obtener resumen existente retorna mapa con fileName y summary")
    void getSummaryByDocument_ConResumenExistente_DebeRetornarMapa() {
        when(summaryRepository.findTopByDocumentId_DocumentIdOrderByGenerationDateDesc(1))
                .thenReturn(Optional.of(summary));

        Map<String, String> result = summaryService.getSummaryByDocument(1);

        assertThat(result).isNotNull();
        assertThat(result.get("fileName")).isEqualTo("leccion.pdf");
        assertThat(result.get("summary")).isEqualTo("Este es el resumen del texto.");
    }

    @Test
    @DisplayName("UT-SU-02: Obtener resumen inexistente retorna null")
    void getSummaryByDocument_SinResumen_DebeRetornarNull() {
        when(summaryRepository.findTopByDocumentId_DocumentIdOrderByGenerationDateDesc(1))
                .thenReturn(Optional.empty());

        Map<String, String> result = summaryService.getSummaryByDocument(1);

        assertThat(result).isNull();
    }

    // ===================== deleteSummaryByDocument =====================

    @Test
    @DisplayName("UT-SU-03: Eliminar resumen invoca deleteAll con los resúmenes del documento")
    void deleteSummaryByDocument_ConResumenes_DebeEliminarlos() {
        when(summaryRepository.findByDocumentId_DocumentId(1)).thenReturn(List.of(summary));

        summaryService.deleteSummaryByDocument(1);

        verify(summaryRepository).deleteAll(List.of(summary));
    }

    @Test
    @DisplayName("UT-SU-04: Eliminar resumen sin resúmenes no falla")
    void deleteSummaryByDocument_SinResumenes_NoDebeArrojarExcepcion() {
        when(summaryRepository.findByDocumentId_DocumentId(1)).thenReturn(List.of());

        assertThatNoException().isThrownBy(() -> summaryService.deleteSummaryByDocument(1));
        verify(summaryRepository).deleteAll(List.of());
    }

    // ===================== generateSummary =====================

    @Test
    @DisplayName("UT-SU-05: Generar resumen exitosamente guarda en BD y retorna mapa")
    void generateSummary_ConDocumentoExistente_DebeGuardarYRetornarMapa() throws Exception {
        when(documentRepository.findById(1)).thenReturn(Optional.of(document));
        when(geminiService.summarizeDocument("Texto educativo.")).thenReturn("Resumen generado por IA.");
        when(summaryRepository.save(any(Summary.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, String> result = summaryService.generateSummary(1);

        assertThat(result.get("fileName")).isEqualTo("leccion.pdf");
        assertThat(result.get("summary")).isEqualTo("Resumen generado por IA.");
        verify(summaryRepository).save(any(Summary.class));
    }

    @Test
    @DisplayName("UT-SU-06: Generar resumen con documento inexistente lanza excepción")
    void generateSummary_ConDocumentoInexistente_DebeArrojarExcepcion() {
        when(documentRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> summaryService.generateSummary(99))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Documento no encontrado");

        verify(geminiService, never()).summarizeDocument(anyString());
    }

    @Test
    @DisplayName("UT-SU-07: Si Gemini falla al generar resumen, la excepción se propaga")
    void generateSummary_CuandoGeminiFalla_DebePropagarExcepcion() throws Exception {
        when(documentRepository.findById(1)).thenReturn(Optional.of(document));
        when(geminiService.summarizeDocument(anyString()))
                .thenThrow(new Exception("Error Gemini API"));

        assertThatThrownBy(() -> summaryService.generateSummary(1))
                .isInstanceOf(Exception.class)
                .hasMessageContaining("Error Gemini API");

        verify(summaryRepository, never()).save(any());
    }
}
