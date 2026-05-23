package com.kydira_api.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "question")
@Data
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int questionId;
    @Column(columnDefinition = "TEXT")
    private String statement;

    @ManyToOne
    @JoinColumn(name = "quiz_id")
    private Quiz quizId;
}
// question_id
// statement
// QUIZ_quiz_id