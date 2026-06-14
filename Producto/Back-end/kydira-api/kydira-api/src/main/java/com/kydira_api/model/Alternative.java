package com.kydira_api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question;
}
