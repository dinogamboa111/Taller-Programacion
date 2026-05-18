package com.kydira_api.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "alternative")
@Data
public class Alternative {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int alternativeId;

    @Column(columnDefinition = "TEXT")
    private String content;
    private boolean isCorrect;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question questionId;
}
