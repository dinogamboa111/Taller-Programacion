package com.kydira_api.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "file_type")
@Data
public class FileType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int fileTypeId;
    private String typeName;

}

// file_type_id
// type_name