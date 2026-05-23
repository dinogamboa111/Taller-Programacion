package com.kydira_api.model;

import java.util.List;

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

    private Integer sortOrder;

    @ManyToOne
    @JoinColumn(name = "quiz_id")
    private Quiz quizId;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL)
    private List<Alternative> alternatives;
}
// question_id
// statement
// QUIZ_quiz_id