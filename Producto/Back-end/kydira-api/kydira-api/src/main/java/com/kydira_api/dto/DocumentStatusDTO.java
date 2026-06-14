package com.kydira_api.dto;

import com.kydira_api.model.FileType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentStatusDTO {
    private int documentId;
    private String fileName;
    private LocalDateTime uploadDate;
    private FileType fileType;
    private boolean hasQuiz;
    private boolean hasSummary;
}
