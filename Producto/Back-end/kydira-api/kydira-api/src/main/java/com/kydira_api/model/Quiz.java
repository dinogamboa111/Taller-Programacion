package com.kydira_api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz")
@Data
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int quizId;

    private String title;

    private LocalDateTime generationDate;

    @ManyToOne
    @JoinColumn(name = "document_id")
    private Document documentId;

    // user_id eliminado — el usuario se obtiene navegando documentId.userId
    // Usar QuizRepository.findByDocumentId_UserId_UserId(Long userId) para filtrar por usuario
}