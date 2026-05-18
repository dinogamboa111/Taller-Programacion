package com.kydira_api.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.kydira_api.model.User;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

public class DocumentDTO {

    private int documentId;

    private String fileName;
    private String rawContent; // Aquí guardaremos el texto extraído

    private LocalDateTime uploadDate;

    private User userId;
    //revisar esto 
    private List<QuestionDTO> questions;
    private FileTypeDTO fileType;

}
