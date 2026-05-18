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
}

// quiz_id
// title
// generation_date
// DOCUMENT_document_id