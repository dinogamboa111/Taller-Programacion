package com.kydira_api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "summary")
@Data
public class Summary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int summaryId;
    @Column(columnDefinition = "TEXT")
    private String content;
    private LocalDateTime generationDate;

    @ManyToOne
    @JoinColumn(name = "document_id")
    private Document documentId;

}

// summary_id
// content
// generation_date
// DOCUMENT_document_id