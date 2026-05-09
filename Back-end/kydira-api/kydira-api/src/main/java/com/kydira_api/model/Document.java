package com.kydira_api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String fileType; // PDF o DOCX
    
    @Column(columnDefinition = "TEXT")
    private String rawContent; // Aquí guardaremos el texto extraído

    private LocalDateTime uploadDate;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User owner; // Quién subió el archivo
}