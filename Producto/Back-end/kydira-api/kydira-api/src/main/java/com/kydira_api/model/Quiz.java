package com.kydira_api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

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

    @OneToMany(mappedBy = "quizId", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Question> questions;
}